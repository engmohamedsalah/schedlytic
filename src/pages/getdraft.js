import { useEffect, useState } from "react";
import Head from "next/head";
import svg from "@/components/svg";
import { NoDataWrapper, common, Pagination, setMyState, } from "@/components/Common";
import { getNameInitials } from "@/components/utils/utility";
import { toast } from "react-toastify";
import { appStore } from "@/zu_store/appStore";
import { useRouter } from "next/router";
import { encode as base64_encode } from "base-64";
import MyModal from "@/components/common/MyModal";
import moment from "moment";
import ConfirmationPopup from "@/components/common/ConfirmationPopup";

let demo = {
  drafts: [],
  page: 1,
  keyword: "",
};

export default function Draft() {
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState([]);
  const [currentDraft, setCurrentDraft] = useState(null);
  const [isRemoveAction, setIsRemoveAction] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null); 


  const [previewAsset, setPreviewAsset] = useState(null);
  const router = useRouter();

  let myStore = appStore((state) => state);
  let userData = appStore((state) => state.userData);

  const [state, setQuery] = useState({
    userLoading: false,
    modalShown: false,
    ...demo,
    isRemoveAction: false,
    templateId: "",
  });

  useEffect(() => {
    loadMore("search");
  }, [state.keyword]);



  const reuseDraft = (draft) => {
    const updateDraft = { ...draft, title: `${draft.title}` };
    setCurrentDraft(updateDraft);
    console.log(updateDraft);
  };

  const reuse = (val) => {
    myStore.updateStoreData("postData", {});
    drafts.forEach((draft) => reuseDraft(draft));
    router.push({
      pathname: "/create_post",
      query: { id: base64_encode(val) },
    });
  };

  const deleteDraft = () => {
    if (!draftToDelete) return;

    setIsLoading(true);
    common.getAPI(
      {
        method: "DELETE",
        url: `deletedraft?id=${draftToDelete}`,
        data: {},
      },
      (resp) => {
        if (resp.status) {
          console.log(resp.data);
          setQuery({
            ...state,
            drafts: state.drafts.filter((d) => d._id !== draftToDelete),
            draftsCount: state.draftsCount - 1,
          });
          setDraftToDelete(null); // Reset the draftToDelete
        } else {
          toast.error("Failed to delete draft");
        }
        setIsLoading(false);
      },
      (error) => {
        toast.error("An error occurred while deleting the draft", error);
        setIsLoading(false);
      }
    );
  };

  let loadMore = (type = null) => {
    if (state.draftsLoading) {
      return;
    }
    setQuery({ ...state, draftsLoading: true });
    let currentPage = type == "loadMore" ? state.page + 1 : type == "search" ? 1 : state.page;

    let data = {
      page: currentPage,
      limit: 10,
      keyword: state.keyword,
    };
    common.getAPI(
      {
        method: "GET",
        url: "getdraft",
        data: data,
      },
      (resp) => {
        console.log(resp);
        setQuery({
          ...state,
          drafts: type == "loadMore" ? [...state.drafts, ...resp.data] : resp.data,
          draftsLoading: false,
          draftsCount: resp.totalRecords,
          page: currentPage,
        });
      }
    );
  };

  const handleDeleteClick = (draftId) => {
    setDraftToDelete(draftId);
    setIsRemoveAction(true); // Show confirmation popup
  };


  const viewAssets = (data) => {
    setPreviewAsset(data);
    setMyState(setQuery, {
      isPreviewModel: true,
    });
  };
  console.log({ userData })
  return (
    <>
      <>
        <div className="rz_dashboardWrapper">
          <div className="ps_conatiner ">
            <div className="row py-5">
              <div className="dash_header_box">
                <div className="dash_header">
                  {/* <h2>Welcome To {process.env.SITE_TITLE}</h2> */}
                </div>
              </div>

              <div className="ps_images_edit_scroll_box">
                <div className="row">
                  <div className="template_box">
                    {state?.drafts?.map((template, i) => {
                      console.log({ template });
                      let url = template.url;
                      return (
                        <div key={i} className="template_inner">
                          <div className="template_inner_img">
                            {template.url == "" && (
                              <div className="ps_tem_box_text">
                                <p>{template.text}</p>
                              </div>
                            )}
                            {url ? (
                              <img
                                src={
                                  template.posttype == "video"
                                    ? template.thumb
                                    : template.url
                                }
                                alt={template.title}
                              />
                            ) : (
                              <img src={"../nothumb.png"} alt="No Thumbnail" />
                            )}
                            <div className="spv-stockImage">
                              {/* {
                                <a className="spv-btn spv-viewBtn" onClick={() => deleteDraft(template._id)}>
                                  {svg.app.deleteIcon}
                                </a>
                              } */}
                              <a className="spv-btn spv-viewBtn" onClick={() => handleDeleteClick(template._id)} >
                                {svg.app.deleteIcon}
                              </a>

                              <a className="spv-btn spv-viewBtn"onClick={() => viewAssets(template)}>
                                {svg.app.eyeIcon}
                              </a>
                              {/* <div className="py-md-3 py-1 ms-auto">
                                                            <a className='rz_addAccBtn' onClick={() => reuse(template._id)}> Update  </a>
                                                        </div> */}
                            </div>
                          </div>

                         

                          <div
                            className="rz_editIcon"
                            onClick={() => reuse(template._id)}
                          >
                            {svg.app.image_editor}
                          </div>

                          <div className="ps_template_text">
                            <h6>{template.title}</h6>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {state.draftsLoading && (
                  <NoDataWrapper
                    isLoading={state.draftsLoading}
                    blockCount="5"
                    height="200"
                    width="150"
                    className="ps_skelton_div px-1 py-2"
                    section="blocks"
                    dataCount={state.drafts.length}
                    title={"Templates not found."}
                  />
                )}

                {state.drafts.length < state.draftsCount ? (
                  <div className="rz_col_12">
                    <a
                      className="ps_image_creator_blk_btn"
                      style={{ margin: "20px auto" }}
                      onClick={() => {
                        loadMore("loadMore");
                      }}
                    >
                      {state.draftsLoading ? "Loading..." : "Load More"}
                      {svg.app.loadmore}
                    </a>
                  </div>
                ) : (
                  <></>
                )}
                {!state.draftsLoading && state.drafts.length === 0 && (
                  <div className="ps_skelton_div m-auto ">
                    <NoDataWrapper
                      isLoading={state.draftsLoading}
                      blockCount="5"
                      height="200"
                      width="150"
                      className="ps_skelton_div px-1 py-2"
                      section="blocks"
                      dataCount={state.drafts.length}
                      title={" Draft Post not found."}
                    />

                    {/* Draft Post not found. */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>

      <MyModal
        shown={state.isPreviewModel}
        close={() => {
          setMyState(setQuery, {
            isPreviewModel: false,
          });
        }}
      >
        <div className="modal-body">
          <div className="modal-header">
            <h3>Preview Frame</h3>
          </div>

          <div className="ps_preview_profile_box">
            <div className="ps_Preview_profile_img">
              {userData?.profile && (
                <img src={userData?.profile} />
              )}
            </div>
            <div className="ps_Preview_profile_text">
              {userData?.name && (
                <h6>{getNameInitials(userData?.name)}</h6>
              )}
              <p className="d-flex align-items-center gap-4">
                <span> {svg.app.myReels} Just Now</span>
                <span>
                  {" "}
                  {svg.app.time_clock}
                  {moment().format("hh:mm A")}{" "}
                </span>
              </p>
              {/* <p><span> {svg.app.myReels} {moment().format("YYYY-MM-DD")}</span><span> {svg.app.time_clock}{moment().format("hh:mm A")} </span></p> */}
            </div>
          </div>

          <div className="ps_p_text">
            <p>{previewAsset?.text}</p>
          </div>
          {previewAsset?.url && (
            <>
              {previewAsset?.posttype == "image" && (
                <div className="preview_Image w-100">
                  <img src={previewAsset?.url} />
                </div>
              )}

              {previewAsset?.posttype == "video" && (
                <div className="ps_assets_icon_videobox ps_assets_height_v m-auto">
                  <video src={previewAsset?.url} controls />
                  {/* <div
                    className="ps_assets_icon_close_btn"
                    onClick={() => removeSelectedImage()}
                  >
                    {svg.app.closeIcon}
                  </div> */}
                </div>
              )}
            </>
          )}


        </div>
      </MyModal>

      <ConfirmationPopup
        shownPopup={isRemoveAction}
        closePopup={() => {
          setIsRemoveAction(false);
          setDraftToDelete(null);
        }}
        type={"Draft"}
        removeAction={() => {
          deleteDraft(); // Call deleteDraft on confirmation
          setIsRemoveAction(false);
        }}
      />
    </>
  );
}

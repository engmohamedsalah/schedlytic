// pages/billing.js
import { useState } from "react";
import Head from "next/dist/shared/lib/head";
import Link from "next/link";
import { common } from "@/components/Common";
import { data } from "jquery";
import svg from "@/components/svg";
import Select from 'react-select';
import Router, { useRouter } from 'next/router';
import { toast } from 'react-toastify';
const BillingPage = () => {
  const [planId, setPlanId] = useState(null);
  const [state, setstate] = useState({
    name: "",
    time_period: "MONTH",
    price: "1",
    description: "",
    trial_period: "1",
    ai_text_generate: false,
    ai_image_generate: false,
    post_per_month: "1",
    editor_access: false,
    post_type: "single",
  });

  const options = [
    { value: 'MONTH', label: 'Monthly' },
    { value: 'YEAR', label: 'Yearly' },
  ];
  const router = useRouter();



  const createPlan = (plandata) => {
    let data = Object.keys(state);
    for (let i = 0; i < data.length; i++) {
      if (typeof state[data[i]] !="boolean"  && state[data[i]].trim() == "" && data[i]!="trial_period") {
        let sr= data[i].split("_").join(" ")
        let s3=sr.charAt(0).toUpperCase() + sr.slice(1);
        toast.error( s3 + " is Required")
        return;
      }
    }

    if(state.post_type=="multiple" && parseInt(state.post_per_month)<2)
    {
      toast.error("Post count should greater then 1")
      return;
    }
    let data1={...state}
    if(state.trial_period=="")
    {
      data1.trial_period="0"
    }

  if(plandata=="stripe")
  {
    common.getAPI(
      {
        method: "POST",
        url: "stripe",
        data: {
        ...data1,
        action : "createPlan"
      },
        isLoader: true,
      },
      (resp) => { 
        router.push("/admin/setting")
      }
    );
  }else{
    common.getAPI(
      {
        method: "POST",
        url: "paypal",
        data: data1,
        isLoader: true,
      },
      (resp) => { 
        router.push("/admin/setting")
      }
    );
  }
   
  };

  const handleBillingFlow = async () => {
    try {
      common.getAPI(
        {
          method: "GET",
          url: "subscription-plan",
          data: {
            action:"checkactive"
          },
          isLoader: true,
        },
        (resp) => { 
          if(resp.data)
          {
              createPlan(resp.data.type);
          }
       
        }
      );
     
    } catch (error) {
      console.error("Billing flow error:", error);
    }
  };

  const changevalue = async (e) => {
    setstate({
      ...state,
      [e.target.id]: e.target.value,
    });
  };


  const changetimevalue = async (e) => {
    setstate({
      ...state,
      time_period: e.value,
    });
  };
  return (
    <div>
      <Head>
        <title>{process.env.SITE_TITLE}- Create Plan</title>
      </Head>
      <div className="">
        <div className="rz_dashboardWrapper">
          <div className="ps_integ_conatiner">
            <div className="welcomeWrapper">

              <div className='d-flex align-items-center mb-2'>
                <div className='ps_header_back position-absolute'><Link href='/admin/setting'>{svg.app.backIcon} <span>Back</span> <p>Back</p></Link> </div>
                <div className="dash_header m-auto"><h2>Create Plan</h2></div>
              </div>
              <div className='rz_socail_platform_bg '>
                <div className='ps_schedule_box '>

                  <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12">

                      <div className="container">
                        <input
                          type="hidden"
                          name="serviceId"
                          value="<?= (!empty($serviceData) && ($serviceData[0]['id'] !='')?$serviceData[0]['id']:'');?>"
                        />
                        <div id="servicesModal">
                          <Link className="addSerCategory" href={""}></Link>

                          <form
                            id="ServiceFormData"
                            name="services"
                            method="post"
                            data-modal="1"
                            table-reload="myAjaxDataTable"
                            data-reset="true"
                          >
                            <div className="">
                              <div className="row">

                                <div className="col-lg-6">
                                  <div className="rz_custom_form ap_require">
                                    <label className="form-label" htmlFor="">Plan Name</label>
                                    <input
                                      value={state.name}
                                      onChange={(e) => {
                                        changevalue(e);
                                      }}
                                      type="text"
                                      name="title"
                                      id="name"
                                      className="rz_customInput ap_input require"
                                      placeholder="Enter plan name"
                                    />
                                  </div>
                                </div>


                               
                                <div className="col-lg-6 paymentPeriod ">
                                  <div className="rz_custom_form">
                                    <label className="form-label" htmlFor="">Plan Period</label>

                                    <div className='rz_creatReels mb-0'>
                                      <div className='rz_custom_form rz_customSelect'>
                                        <Select
                                        id="time_period"
                                          placeholder={'Set 0 if no trial period'}
                                          value={options.filter((d1)=>d1.value==state.time_period)}
                                          options={options}
                                          onChange={(e) => {
                                            changetimevalue(e);
                                          }}
                                          theme={(theme) => ({
                                            ...theme,
                                            colors: {
                                            ...theme.colors,
                                              primary: 'var(--primaryColor)',
                                            },
                                          })}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-lg-6 amount">
                                  <div className="rz_custom_form ap_require">
                                    <label className="form-label" for="">Plan Pricing (According to Plan Period)</label>
                                    <input
                                      value={state.price}
                                      type="text"
                                      id="price"
                                      onChange={(e) => {
                                        e.target.value = e.target.value.replace(/\D/g, '')
                                        changevalue(e)
                                      }}
                                      className="rz_customInput ap_input require"
                                      placeholder="Enter plan pricing"
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-6 freeDays">
                                  <div className="rz_custom_form ap_require">
                                    <label className="form-label" htmlFor="editor_access">
                                      Post per month
                                    </label>
                                    <input
                                      value={state.post_per_month}
                                      onChange={(e) => {
                                        e.target.value = e.target.value.replace(/\D/g, '')
                                        setstate({
                                          ...state,
                                          [e.target.id]: e.target.value,
                                        });
                                      }}
                                      type="text"
                                      placeholder="Enter post number"
                                      id="post_per_month"
                                      className="rz_customInput ap_input ap_numberInput"
                                    />
                                    <span className="checkmark"></span>
                                  </div>
                                </div>




                                <div className="col-lg-6 freeDays <?= ((isset($serviceData) && ($serviceData[0]['is_free'] == 1))?'':'d-none');?>">
                                  <div className="rz_custom_form ap_require">
                                    <label className="form-label" htmlFor="">Free Trial Period (In days)</label>
                                    <input
                                      value={state.trial_period}
                                      onChange={(e) => {
                                        e.target.value = e.target.value.replace(/\D/g, '')
                                        changevalue(e);
                                      }}
                                      type="number"
                                      min="1"
                                      id="trial_period"
                                      className="rz_customInput ap_input ap_numberInput"
                                      placeholder="Enter trial period duration in digits eg. 7"
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-6 freeDays">
                                  <div className="rz_custom_form ap_require ps_create_plan_check">
                                    <label className="form-label" htmlFor="editor_access">
                                      Post Type
                                    </label>
                                    <div className="d-flex gap-5 align-items-center mt-2">
                                      <div className="radio">
                                        <label className="d-flex gap-2 ps_cursor">
                                          <input
                                            type="radio"
                                            value="single"
                                            checked={
                                              state.post_type === "single"
                                            }
                                            onChange={(e) => {
                                              setstate({
                                                ...state,
                                                post_type: e.target.value,
                                              });
                                            }}
                                          />
                                          Single
                                        </label>
                                      </div>
                                      <div className="radio ">
                                        <label className="d-flex gap-2 ps_cursor">
                                          <input
                                            type="radio"
                                            value="multiple"
                                            checked={
                                              state.post_type === "multiple"
                                            }
                                            onChange={(e) => {
                                              setstate({
                                                ...state,
                                                post_type: e.target.value,
                                              });
                                            }}
                                          />
                                          Multiple</label>

                                      </div>
                                    </div>
                                    <span className="checkmark"></span>
                                  </div>
                                </div>

                                <div className="col-lg-6">
                                  <div className="rz_custom_form ap_require">
                                    <label className="form-label" htmlFor="">Description</label>
                                    <textarea
                                      value={state.description}
                                      onChange={(e) => {
                                        changevalue(e);
                                      }}
                                      rows="5"
                                      data-target="service-description"
                                      id="description"
                                      name="description"
                                      className="rz_customInput rz_customTextArea ap_textarea require ckEditor"
                                      placeholder="Enter  description"
                                    ></textarea>
                                  </div>
                                </div>

                                <div className="col-lg-6 freeDays">
                                  <div className="rz_custom_form ap_require ">
                                  <label className="form-label ps_lab_none" htmlFor=""></label>
                                    <div className="ps_create_plan_check">
                                      <label className="form-label d-flex gap-2 ps_cursor" htmlFor="ai_text_generate">
                                        <input
                                          checked={state.ai_text_generate}
                                          onChange={(e) => {
                                            setstate({
                                              ...state,
                                              [e.target.id]:
                                                !state.ai_text_generate,
                                            });
                                          }}
                                          type="checkbox"
                                          id="ai_text_generate"
                                        
                                        />
                                        AI text Generation 
                                      </label>
                                     
                                    </div>

                                    <div className="ps_create_plan_check">
                                      <label className="form-label d-flex gap-2 ps_cursor" htmlFor="ai_image_generate">

                                        <input
                                          checked={state.ai_image_generate}
                                          onChange={(e) => {
                                            setstate({
                                              ...state,
                                              [e.target.id]:
                                                !state.ai_image_generate,
                                            });
                                          }}
                                          type="checkbox"
                                          id="ai_image_generate"
                                        
                                        />
                                        AI Image Generation
                                      </label>
                                     
                                    </div>

                                    
                                    <div className="ps_create_plan_check">
                                      <label className="form-label d-flex gap-2 ps_cursor" htmlFor="editor_access">

                                        <input
                                          checked={state.editor_access}
                                          onChange={(e) => {
                                            setstate({
                                              ...state,
                                              [e.target.id]: !state.editor_access,
                                            });
                                          }}
                                          type="checkbox"
                                          id="editor_access"
                                       
                                        />
                                        Editor Acesss
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-lg-12">
                                  <div className="justify-content-start mt-md-1 mt-3">
                                    <input type="hidden" id="subsPayAcc" value="<?= (isset($pay_account) ? $pay_account : ''); ?>" />
                                    <button onClick={handleBillingFlow} type="button" className="rz_addAccBtn addServiceData" > Create Plan</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;

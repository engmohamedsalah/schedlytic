import svg from '@/components/svg';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Head from 'next/head'
import { NoDataWrapper, common, Pagination, setMyState } from '@/components/Common';
import MyModal from '../../components/common/MyModal';
import { toast } from "react-toastify";
import ConfirmationPopup from '@/components/common/ConfirmationPopup';
import { capitalizeFirstLowercaseRest } from '@/components/utils/utility';
import Link from 'next/link';


export default function Catagory_page() {


    let createCategory = {
        name: '',
        status: true,
    };

    let [state, setQuery] = useState({
        isLoading: false,
        categoriesData: [],
        totalRecords: 0,
        page: 1,
        limit: 10,
        keyword: '',

        statusOption: [
            { label: 'Active', value: 1 },
            { label: 'In-Active', value: 0 }
        ],

        processAction: false,
        isEdit: false,
        modalShown: false,
        ...createCategory,
        isRemoveAction: false
    });

    useEffect(() => {
        filterCategory();
    }, [state.page, state.keyword, state.limit]);


    let filterCategory = (type = null, updState = {}) => {
        if (state.isLoading) {
            return false;
        }

        setMyState(setQuery, {
            isLoading: true,
            ...updState
        });

        common.getAPI({
            method: 'GET',
            url: 'category',
            data: {
                page: state.page,
                limit: state.limit,
                keyword: state.keyword,
            },
        }, (resp) => {

            setMyState(setQuery, {
                isLoading: false,
                categoriesData: resp.data,
                totalRecords: resp.totalRecords
            });
        }, (d) => {
            setMyState(setQuery, {
                isLoading: false,
            });
        });
    }

    let toggleModal = (updState = {}) => {
        setMyState(setQuery, {
            modalShown: false,
            isEdit: false,
            processAction: false,
            ...createCategory,
            ...updState
        });
    }

    let manageCategory = (e) => {
        e.preventDefault();
        if (state.processAction) {
            return;
        }
        if (process.env.TYPE == "demo") {
            return
        }
        let cData = {
            name: state.name,
            status: state.status,
        };

        if (!state.name) {
            toast.error('Category title is required.');
            return;
        }

        setMyState(setQuery, {
            processAction: true,
        });

        if (state.isEdit) {
            cData.target = state.isEdit;
        }

        common.getAPI({
            method: state.isEdit ? 'PUT' : 'POST',
            url: 'category',
            data: state.isEdit && {
                data: {
                    name: state.name,
                    status: state.status,
                },
                target: state.isEdit
            } || cData,
            isLoader: false
        }, (resp) => {
            toggleModal();
            filterCategory();
        }, (d) => {
            setMyState(setQuery, {
                processAction: false,
            });
        });
    }

    const updateStatus = (category) => {
        category.status = !category.status
        let data = { ...category }
        data.action = "status"
        data.target = data._id
        delete data._id
        common.getAPI({
            method: 'PUT',
            url: 'category',
            data: data,
            isLoader: false
        }, (resp) => {
            state.categoriesData.map(categoryData => {
                if (categoryData._id === data.target) {
                    categoryData.state = !categoryData.status
                }
            })
            setMyState(setQuery, {
                ...categoriesData
            });
        }, (d) => {
            setMyState(setQuery, {
                processAction: false,
            });
        });
    }

    let cntStart = ((state.page - 1) * state.limit) + 1, cnt = cntStart;

    return (
        <>
            <Head>
                <title>{process.env.SITE_TITLE}- Category</title>
            </Head>
            <div className='w-100' >
                <div className='ps_conatiner'>
                    <div className=' welcomeWrapper'>

                        <div className='rz_strackDv'>
                            <div className="py-md-3 py-1 width100">
                                <div className='rz_searchBox'>
                                    <div className='rz_custom_form'>
                                        <input type='search' placeholder='Search' className='rz_customInput' value={state.keyword}
                                            onChange={(e) => setMyState(setQuery, { keyword: e.target.value.trimStart() })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
                                                    setMyState(setQuery, { categoriesData: [], totalRecords: 0, page: 1 });
                                                    filterCategory('search');
                                                }
                                            }}
                                        />
                                        <span className='rz_inputIcon'>{svg.app.searchIcon}</span>
                                    </div>
                                </div>
                            </div>
                            <div className='ps_user_rowperpage'>
                                <span>Rows per page</span>
                                <select defaultValue={10} onChange={(e) => {
                                    setMyState(setQuery, {
                                        limit: e.target.value,
                                        page: 1
                                    })
                                }
                                }>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                            <div className="py-3  ms-auto">
                                <a className='rz_addAccBtn' onClick={() => {
                                    setMyState(setQuery, { modalShown: true })
                                }}><span className=' d_phon_none'>Add New</span> <span className=' d_lap_none'>{svg.app.addIcon}</span> Category</a>
                            </div>

                        </div>
                        <div className='ps_catagory_table'>
                            <div className='rz_responsiveTable'>

                                <table className='rz_table Dash_user_chart'>
                                    <thead>
                                        <tr>
                                            <th>S.No.</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!state.isLoading && state.categoriesData.length ?
                                            state.categoriesData.map((category, index) => {
                                                return <tr key={index} >
                                                    <td>{cnt++}</td>
                                                    <td>{category.name}</td>
                                                    <td>
                                                        <div className='d-flex align-items-center justify-content-center'>
                                                            <div className='pe-2 '>
                                                                <label htmlFor={category._id} className="switch ">

                                                                    <input type="checkbox" title="Status" className="tooltiped" id={category._id}
                                                                        checked={category.status}
                                                                        onChange={() => updateStatus(category)} />
                                                                    <span className="switch-status"></span>
                                                                </label>
                                                            </div>
                                                            <p className={category.status ? 'status_active' : "status_inactive"}>Active</p>
                                                        </div>

                                                    </td>
                                                    <td>
                                                        <div className='d-flex justify-content-center align-items-center'>
                                                            <span className="social_box_edit me-2" onClick={() => {
                                                                setMyState(setQuery, {
                                                                    modalShown: true,
                                                                    isEdit: category._id,
                                                                    name: category.name,
                                                                    status: category.status,
                                                                });
                                                            }}>
                                                                {svg.app.editIcon}
                                                                <span className='rz_tooltipSpan'>Edit</span>
                                                            </span>
                                                            <span className="social_box_delete" onClick={() => {

                                                                setMyState(setQuery, {
                                                                    isRemoveAction: category._id,
                                                                });
                                                            }}>
                                                                {svg.app.deleteIcon}
                                                                <span className='rz_tooltipSpan'>Delete</span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            }) :
                                            <NoDataWrapper
                                                isLoading={state.isLoading}
                                                colspan="7"
                                                section="table"
                                            />}

                                    </tbody>
                                </table>
                                <div className='ps_pagination_sticky'>
                                    <Pagination
                                        type="User"
                                        dataRange={{
                                            start: cntStart,
                                            end: cntStart + state.categoriesData.length - 1,
                                        }}
                                        currentPage={state.page}
                                        totalRecords={state.totalRecords}
                                        perPage={state.limit}
                                        isLoading={state.isLoading}
                                        onClick={(pageNum) => {
                                            setMyState(setQuery, {
                                                page: pageNum,
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MyModal
                shown={state.modalShown}
                close={() => {
                    toggleModal();
                }}
            >
                <form onSubmit={e => {
                    manageCategory(e)
                }}>
                    <div className="modal-body">
                        <div className="modal-header">
                            <h3>{state.isEdit ? 'Update Category' : 'Add New Category'}</h3>
                        </div>
                        <div className='rz_row rz_creatReels'>
                            <div className='rz_creatReels'>
                                <div className='rz_custom_form'>
                                    <label className="form-label">Title <span className="text-danger">*</span></label>
                                    <input type='text' className='rz_customInput' placeholder='Enter title' value={state.name} onChange={e => {
                                        setMyState(setQuery, {
                                            name: capitalizeFirstLowercaseRest(e.target.value.trimStart())
                                        });
                                    }} />
                                </div>
                            </div>
                            <div className='rz_creatReels'>

                                <div className='rz_custom_form rz_customSelect'>
                                    <label className="form-label">Status <span className="text-danger">*</span></label>
                                    <Select
                                        placeholder={'Choose Status'}
                                        options={state.statusOption}
                                        value={state.statusOption.filter(option => option.value == state.status)}
                                        onChange={e => {
                                            setMyState(setQuery, {
                                                status: e.value,
                                            });
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
                        {!state.isEdit ? <div className='d-flex justify-content-center'><button className='rz_btn' onClick={() => { }}>{state.processAction ? 'processing...' : 'Continue'}</button></div>
                            : <div className='d-flex justify-content-center'><button className='rz_btn' onClick={() => { }}>{state.processAction ? 'processing...' : 'Update'}</button></div>}
                    </div>

                </form>

            </MyModal>


            <ConfirmationPopup
                shownPopup={state.isRemoveAction}
                closePopup={() => {
                    setMyState(setQuery, {
                        isRemoveAction: false
                    })
                }}
                type={"Category"}
                removeAction={() => {
                    if (process.env.TYPE == "demo") {
                        return;
                    }
                    common.getAPI({
                        method: 'DELETE',
                        url: 'category',
                        data: {
                            target: state.isRemoveAction
                        },
                    }, (resp) => {
                        setMyState(setQuery, {
                            isRemoveAction: false,
                            dropdownMenu: false
                        })
                        filterCategory('search');
                    });
                }}
            />

        </>
    )
}

import React, { useState, useEffect } from 'react';
import svg from '@/components/svg';
import Select from 'react-select';
import Head from 'next/head';
import { NoDataWrapper, common, Pagination, setMyState } from '@/components/Common';
import MyModal from '@/components/common/MyModal';
import ConfirmationPopup from '@/components/common/ConfirmationPopup';
import { toast } from 'react-toastify';
import { checkPassword } from '@/components/utils/utility';
import Router, { useRouter } from 'next/router';


const options = [
    { value: 'Defualt', label: 'Defualt' },
    { value: '10', label: '10' },
    { value: '50', label: '50' },
    { value: '100', label: '100' },
];

let createUsr = {
    name: '',
    email: '',
    password: '',
    status: 1,
    subscriptions: [],
    role: 'User',
    lastname: "",
};

export default function User() {
    const [plan,setPlan]=useState([])
    let [state, setQuery] = useState({
        selectedCategory: [],
        userLoading: false,
        userData: [],
        totalRecords: 0,
        page: 1,
        limit: 10,
        keyword: '',
        statusOption: [
            { label: 'Active', value: 1 },
            { label: 'In-Active', value: 0 }
        ],
        UserOption: [
            { label: 'User', value: "User" },
            { label: 'Template Creator', value: 'Template Creator' }
        ],

        processAction: false,
        subscriptonList: [],
        isEdit: false,
        isEditIndex: null,
        modalShown: false,
        ...createUsr,
        plan :"",
        paymenttype : "",
        activepaymenttype : "",
        isRemoveAction: false
    });

    const [userLoading,setuserLoading]=useState(false)
    const [activepaymenttype,setactivepaymenttype]=useState("")

    let filterUsers = (type = null, updState = {}) => {
        // if (state.userLoading) {
        //     return false;
        // }
        setuserLoading(true)


        common.getAPI({
            method: 'GET',
            url: 'user',
            data: {
                page: state.page,
                limit: state.limit,
                keyword: state.keyword,
                keys: '_id,name,email,status,isCreated,role,lastname,planId,paymenttype',
                subscriptions: state.selectedCategory
            },
        }, (resp) => {
            setuserLoading(false)
            setMyState(setQuery, {
                userData: resp.data,
                totalRecords: resp.totalRecords
            });
        });
    }

    useEffect(() => {
        filterUsers();
    }, [state.page, state.selectedCategory,state.limit]);

    useEffect(() => {
        getPlanList();
        checkactiveAccount()
    }, []);

    const checkactiveAccount = async () => {
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
                setactivepaymenttype(resp.data.type)
               
              }
           
            }
          );
         
        } catch (error) {
          console.error("Billing flow error:", error);
        }
      };

    const getPlanList=()=>{
        common.getAPI({
            method: 'GET',
            url: 'subscription-plan',
            data: {},
            isLoader: true
        }, (resp) => {
            if(resp.data){
                let d1=resp.data
                let data =[]
                for(let i=0; i<d1.length;i++){
                    data.push({
                        label : d1[i].name,
                        value : d1[i].id,
                    })
                }
                setPlan(data)
            }
        })
    }

    const CheckPassword = (inputtxt) => {
        const checkPassword = `^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]{8,}$`;
        if (inputtxt.match(checkPassword)) {
            return true;
        }
        else {
            return false;
        }
    }

    let toggleModal = (updState = {}) => {
        setMyState(setQuery, {
            modalShown: false,
            isEdit: false,
            isEditIndex: null,
            processAction: false,
            paymenttype : "",
            ...createUsr,
            ...updState
        });
    }

    let manageUsers = (e) => {
        if (state.processAction) {
            return;
        }

        e.preventDefault();
        if (process.env.TYPE == "demo") {
            return;
        }
        let userData = {
            name: state.name,
            email: state.email,
            password: state.password,
            lastname: state.lastname,
            status: state.status,
            role: state.role,
            plan : state.plan
        };
        if (state.name.trim() == "") {
            toast.error("First name is required.")
            return;
        }
        if (state.lastname.trim() == "") {
            toast.error("Last name is required.")
            return;
        }
        if (state.email.trim() == "") {
            toast.error("Email is required.")
            return
        }
        let em=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

        if(!em.test(state.email.trim()))
        {
            toast.error("Email should be valid.")
            return
        }
        if (state.plan.trim() == "") {
            toast.error("plan is required.")
            return
        }

        if (state?.password.trimStart().length > 0) {
            if (!state.password.match(checkPassword)) {
                toast.error("Password must be minimum 8 character long and contain at least one number, one capital letter and one special character.")
                return
            }
        }

        setMyState(setQuery, {
            processAction: true,
        });

        if (!state.isEdit) {
            userData.email = state.email;
        } else {
            userData.target = state.isEdit;
        }

        common.getAPI({
            method: state.isEdit ? 'PUT' : 'POST',
            url: 'user',
            data: userData,
            isLoader: false
        }, (resp) => {
            if (state.isEdit == "PUT") {
                let usrData = [...state.userData];
                usrData[state.isEditIndex] = {
                    ...usrData[state.isEditIndex],
                    name: state.name,
                    status: state.status,
                    role: state.role,
                };
                toggleModal({
                    userData: usrData,
                });
            } else {
                toggleModal()
                filterUsers()
            }

        }, (d) => {
            setMyState(setQuery, {
                processAction: false,
            });
        });
    }

    let cntStart = ((state.page - 1) * state.limit) + 1, cnt = cntStart;
    let filterPlanOpt = [
        { label: 'All', value: 'all' },
        ...state.subscriptonList
    ];

    const updateStatus = (userData) => {
        userData.status = !userData.status
        let data = { ...userData }
        data.action = "status"
        data.target = data._id,
        data.plan=data.planId
        delete data._id
        common.getAPI({
            method: 'PUT',
            url: 'user',
            data: data,
            isLoader: false
        }, (resp) => {
            state.userData.map(user => {
                if (user._id === userData.target) {
                    user.state = !user.status
                }
            })
            setMyState(setQuery, {
                ...userData
            });
        });
    }
    const router = useRouter();
    const handlePreviewUser = (val) => {
        router.push({ pathname: "/admin/userDetails", query: { id: val } });
    }

    return (
        <>
            <Head>
                <title>{process.env.SITE_TITLE}- Users </title>
            </Head>
            <div className='rz_dashboardWrapper' >
                <div className='ps_conatiner'>
                    <div className=' welcomeWrapper'>

                        <div className='rz_strackDv'>
                            <div className="py-3 width100">
                                <div className='rz_searchBox'>
                                    <div className='rz_custom_form'>
                                        <input type='search' placeholder='Search' className='rz_customInput' value={state.keyword}
                                            onChange={(e) => setMyState(setQuery, { keyword: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
                                                    setMyState(setQuery, { userData: [], totalRecords: 0, page: 1 });
                                                    filterUsers()
                                                }
                                            }}
                                        />
                                        <span onClick={() => {
                                            if (state.keyword.trim() != "") {
                                                filterUsers()
                                            }

                                        }} className='rz_inputIcon'>{svg.app.searchIcon}</span>
                                    </div>
                                </div>
                                
                            </div>
                            <div className='ps_user_rowperpage'>
                            <span>Rows per page</span>
                                <select  defaultValue={10} onChange={(e)=> {
                                 setMyState(setQuery, {
                                  limit: e.target.value,
                                  page : 1
                                })
                            }
                                }>
                                    <option value={5}>5</option>
                                    <option defaultValue value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                           
                           
                            <div className="py-3 ms-auto">
                               

                                <a className='rz_btn' onClick={() => {
                                    setMyState(setQuery, { modalShown: true })
                                }}>Add New User</a>
                            </div>
                           
                        </div>
                        <div className='ps_user_table'>
                            <div className='rz_responsiveTable'>
                                <table className='rz_table Dash_user_chart'>
                                    <thead>
                                        <tr>
                                            <th>S.No.</th>
                                            <th>User Name </th>
                                            <th>Email</th>
                                        
                                            <th>Account Status </th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            !userLoading && state.userData.length ?
                                                state.userData.map((user, index) => {
                                                    let sbs = state.subscriptonList.filter(d => user.subscriptions.includes(d.value))
                                                    return <tr key={index}>
                                                        <td>{cnt++}</td>
                                                        <td>{user.name}</td>
                                                        <td>{user.email}</td>
                                                    
                                                        <td>
                                                         
                                                            <div className='d-flex align-items-center '>
                                                                <div className='pe-2 '>
                                                                    <label htmlFor={user._id} className="switch ">
                                                                        <input disabled={process.env.TYPE=="demo" ? true : false} type="checkbox" title="Status" className="tooltiped" id={user._id}
                                                                            checked={user.status}
                                                                            onChange={() => updateStatus(user)} />
                                                                        <span className="switch-status"></span>
                                                                    </label>
                                                                </div>
                                                                <p className={user.status ? 'status_active' : "status_inactive"}> {user.status ? "Active" : "In-Active"}</p>
                                                            </div>

                                                        </td>
                                                        <td>
                                                            <div className='d-flex align-items-center'>

                                                                <span className="social_box_edit" onClick={() => {
                                                                    handlePreviewUser(user._id)
                                                                }}>
                                                                    {svg.app.eyeIcon}
                                                                    <span className='rz_tooltipSpan'>Preview</span>
                                                                </span>
                                                                <span className="social_box_edit " onClick={() => {

                                                                    setMyState(setQuery, {
                                                                        modalShown: true,
                                                                        isEdit: user._id,
                                                                        isEditIndex: index,
                                                                        name: user.name,
                                                                        email: user.email,
                                                                        subscriptions: user.subscriptions,
                                                                        status: +user.status,
                                                                        role: user.role,
                                                                        lastname: user.lastname,
                                                                        plan : user.planId,
                                                                        paymenttype : user.paymenttype
                                                                    });
                                                                }}>
                                                                    {svg.app.editIcon}
                                                                    <span className='rz_tooltipSpan'>Edit</span>
                                                                </span>
                                                                { process.env.TYPE != "demo" ?
                                                                <span className="social_box_delete" onClick={() => {
                                                                    setMyState(setQuery, {
                                                                        isRemoveAction: user._id
                                                                    })
                                                                }}>
                                                                    {svg.app.deleteIcon}
                                                                    <span className='rz_tooltipSpan'>Delete</span>
                                                                </span>
                                                                : ""}

                                                            </div>

                                                        </td>

                                                    </tr>
                                                })
                                                : <NoDataWrapper
                                                    isLoading={userLoading}
                                                    colspan="7"
                                                    section="table"
                                                />
                                        }
                                    </tbody>
                                </table>

                                <div className='ps_pagination_sticky'>
                                    <Pagination
                                        type="User"
                                        dataRange={{
                                            start: cntStart,
                                            end: cntStart + state.userData.length - 1,
                                        }}
                                        currentPage={state.page}
                                        totalRecords={state.totalRecords}
                                        perPage={state.limit}
                                        isLoading={userLoading}
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
                <form autoComplete="off" onSubmit={e => {
                    manageUsers(e)
                }}>
                    <div className="modal-body">
                        <div className='modal_body_scroll'>
                            <div className="modal-header">
                                <h3>{state.isEdit ? 'Update User' : 'Add New User'}</h3>
                            </div>
                            <div className='row'>

                                <div className='col-md-6'>
                                    <div className='rz_custom_form mt-0'>
                                        <label className="form-label"> First Name <span className="text-danger">*</span></label>
                                        <input type='text' className='rz_customInput' placeholder='Enter first name' value={state.name} onChange={e => {
                                            setMyState(setQuery, {
                                                name: e.target.value,
                                            });
                                        }} />
                                    </div>
                                </div>

                                <div className='col-md-6 pt-md-0 pt-3'>
                                    <div className='rz_custom_form mt-0'>
                                        <label className="form-label"> Last Name <span className="text-danger">*</span></label>
                                        <input type='text' className='rz_customInput' placeholder='Enter last name' value={state.lastname} onChange={e => {
                                            setMyState(setQuery, {
                                                lastname: e.target.value,
                                            });
                                        }} />
                                    </div>
                                </div>


                                <div className='rz_custom_form'>
                                    <label className="form-label"> Enter Email <span className="text-danger">*</span></label>
                                    <input type='email' readOnly={state.isEdit ? true : false} className='rz_customInput' placeholder='Enter email' value={state.email} onChange={e => {
                                        setMyState(setQuery, {
                                            email: e.target.value,
                                        });
                                    }} />
                                </div>

                                <div className='rz_custom_form'>
                                    <div className='d-flex'><label className="form-label"> Enter Password </label> <div className='ps_admin_password_tooltip'>{svg.app.i_icon}  <span className='rz_tooltipSpan'>Password should contain atleast 1 number, 1 capital letter and 1 special character.</span></div></div>
                                    <input autoComplete="off" type='password' className='rz_customInput' placeholder='Enter password' value={state.password} onChange={e => {
                                        setMyState(setQuery, {
                                            password: e.target.value,
                                        });
                                    }} />
                                </div>

                                <div className='col-md-6'>
                                    <div className='rz_custom_form'>
                                        <div className='rz_custom_form rz_customSelect'>
                                            <label className="form-label">Select User Status <span className="text-danger">*</span></label>
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

                                <div className='col-md-6'>
                                    <div className='rz_custom_form'>
                                        <div className='rz_custom_form rz_customSelect'>
                                            <label className="form-label">Select User Type <span className="text-danger">*</span></label>
                                            <Select autoComplete="off"
                                                placeholder={'User Type'}
                                                options={state.UserOption}
                                                value={state.UserOption.filter(option => option.value == state.role)}
                                                onChange={(e) => {
                                                    setMyState(setQuery, {
                                                        role: e.value,
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

                                <div className='col-md-6'>
                                    <div className='rz_custom_form'>
                                        <div className='rz_custom_form rz_customSelect'>
                                            <label className="form-label">Select Plan <span className="text-danger">*</span></label>
                                            <Select autoComplete="off"
                                                placeholder={'User Type'}
                                                isDisabled={(state.isEdit && activepaymenttype==state.paymenttype) ? false : state.isEdit==false ? false :  true}
                                                options={plan}
                                               value={plan.filter(option => option.value == state.plan)}
                                                onChange={(e) => {
                                                    setMyState(setQuery, {
                                                        plan: e.value,
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
                            </div>

                            <div className='d-flex justify-content-center mt-4'><button className='rz_btn'>{state.processAction ? 'processing...' : 'Continue'}</button></div>
                        </div>
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
                type={"User"}
                removeAction={() => {
                    if (process.env.TYPE == "demo") {
                        return;
                    }
                    common.getAPI({
                        method: 'DELETE',
                        url: 'user',
                        data: {
                            target: state.isRemoveAction
                        },
                    }, (resp) => {
                        setMyState(setQuery, {
                            isRemoveAction: false,
                            dropdownMenu: false
                        })
                        filterUsers('search');
                    });
                }}
            />

        </>
    )
}

import React, { useState, useEffect } from 'react';
import svg from '@/components/svg';
import Select from 'react-select';
import Head from 'next/head'
import { NoDataWrapper, common, Pagination, setMyState } from '@/components/Common';
import MyModal from '@/components/common/MyModal';
import ConfirmationPopup from '@/components/common/ConfirmationPopup';
import { toast } from 'react-toastify';
import { checkPassword } from '@/components/utils/utility';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';

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
    lastname: ""
};

export default function User() {

    let [state, setQuery] = useState({
        selectedCategory: [],
        subscriptionLoading: false,
        subscriptionData: [],
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

        isRemoveAction: false
    });

    let filterSubscription = (type = null, updState = {}) => {
        if (state.subscriptionLoading) {
            return false;
        }

        setMyState(setQuery, {
            subscriptionLoading: true,
            ...updState
        });

        common.getAPI({
            method: 'GET',
            url: 'subscription-plan',
            data: {
                page: state.page,
                limit: state.limit,
                keyword: state.keyword,
                keys: '_id,name,email,status,isCreated,role,lastname',
                subscriptions: state.selectedCategory,
                action: "getall"
            },
        }, (resp) => {
            setMyState(setQuery, {

                subscriptionLoading: false,
                subscriptionData: resp.data,
                totalRecords: resp.totalRecords
            });

        }, (d) => {
            setMyState(setQuery, {
                subscriptionLoading: false,
            });
        });
    }

    useEffect(() => {
        filterSubscription();
    }, []);


    let toggleModal = (updState = {}) => {
        setMyState(setQuery, {
            modalShown: false,
            isEdit: false,
            isEditIndex: null,
            processAction: false,
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
        let subscriptionData = {
            planName: state.planName,
            pricePricing: state.pricePricing,
            freePeriod: state.freePeriod,
            planPeriod: state.planPeriod,
            discription: state.discription,

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
            subscriptionData.email = state.email;
        } else {
            subscriptionData.target = state.isEdit;
        }

        common.getAPI({
            method: state.isEdit ? 'PUT' : 'POST',
            url: 'user',
            data: subscriptionData,
            isLoader: false
        }, (resp) => {
            if (state.isEdit == "PUT") {
                let usrData = [...state.subscriptionData];
                usrData[state.isEditIndex] = {
                    ...usrData[state.isEditIndex],
                    name: state.name,
                    status: state.status,
                    role: state.role,
                };
                toggleModal({
                    subscriptionData: usrData,
                });
            } else {
                toggleModal()
                filterSubscription()
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

    const updateStatus = (subscriptionData) => {
        let data = {}
        data.status = !subscriptionData.active_status
        data.target = subscriptionData._id
        common.getAPI({
            method: 'PUT',
            url: 'subscription-plan',
            data: data,
            isLoader: false
        }, (resp) => {
            state.subscriptionData.map(user => {
                if (user._id === subscriptionData._id) {
                    user.active_status = !user.active_status
                }
            })
            setMyState(setQuery, {
                ...subscriptionData
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

                            <div className="py-3 ms-auto ">
                                <Link href="/admin/paypal/createPlan" className='rz_btn me-2'>Create Plan</Link>
                                <Link href="/admin/tranctionList" className='rz_btn'>Transaction List</Link>
                            </div>

                        </div>
                        <div className='ps_user_table'>
                            <div className='rz_responsiveTable'>
                                <table className='rz_table Dash_user_chart'>
                                    <thead>
                                        <tr>
                                            <th>S.No.</th>
                                            <th>Plan Name </th>
                                            <th>Description </th>
                                            <th>Price Pricing</th>
                                            <th>Free Trail Period</th>
                                            <th>Plan Status</th>
                                            <th>Plan Period </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            !state.subscriptionLoading && state.subscriptionData.length ?
                                                state.subscriptionData.map((user, index) => {
                                                    let sbs = state.subscriptonList.filter(d => user.subscriptions.includes(d.value))
                                                    return <tr key={index}>
                                                        <td>{cnt++}</td>
                                                        <td>{user.name}</td>

                                                        <td><div>{user.description?.length > 70 ?
                                                            `${user.description.slice(0, 70)}...` : user.description
                                                        }</div></td>
                                                        <td>{user.price}</td>
                                                        <td>{user.trial_period}</td>
                                                        <td><div className='d-flex align-items-center justify-content-center'>
                                                            <div className='pe-2 '>
                                                                <label htmlFor={user._id} className="switch ">
                                                                    <input type="checkbox" title="Status" className="tooltiped" id={user._id}
                                                                        checked={user.active_status}
                                                                        onChange={() => updateStatus(user)} />
                                                                    <span className="switch-status"></span>
                                                                </label>
                                                            </div>
                                                            <p className={user.active_status ? 'status_active' : "status_inactive"}> {user.active_status ? "Active" : "In-Active"}</p>
                                                        </div>
                                                        </td>
                                                        <td>
                                                            <div className='ps_plan_period'>{user.time_period}</div>
                                                        </td>
                                                        
                                                    </tr>
                                                })
                                                : <NoDataWrapper
                                                    isLoading={state.subscriptionLoading}
                                                    colspan="7"
                                                    section="table"
                                                />
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <ConfirmationPopup
                shownPopup={state.isRemoveAction}
                closePopup={() => {
                    setMyState(setQuery, {
                        isRemoveAction: false
                    })
                }}
                type={"Subscription Plan"}
                removeAction={() => {
                    if (process.env.TYPE == "demo") {
                        return;
                    }
                    common.getAPI({
                        method: 'DELETE',
                        url: 'subscription-plan',
                        data: {
                            target: state.isRemoveAction
                        },
                    }, (resp) => {
                        setMyState(setQuery, {
                            isRemoveAction: false,
                            dropdownMenu: false
                        })
                        filterSubscription('search');
                    });
                }}
            />

        </>
    )
}

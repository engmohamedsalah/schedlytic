import { useState, useEffect } from "react";
import Head from "next/dist/shared/lib/head";
import Link from "next/link";
import { common, setMyState } from "@/components/Common";
import { useRouter } from 'next/router';
import { data } from "jquery";
import svg from "@/components/svg";
import Select from "react-select";
import { toast } from "react-toastify";
import MyModal from "@/components/common/MyModal";
import { stripUnit } from "polished";
import { appStore } from '@/zu_store/appStore';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

import {
    PaymentElement,
    Elements,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

const Myplans = () => {
    const style = { "layout": "vertical" };
    const router = useRouter();
    const [shows, setshows] = useState(false);
    const [paymenttype, setpaymenttype] = useState("");
    const [stripePromise, setstripePromise] = useState(null);
    const [client_id, setClientId] = useState("");
    const [modal, setmodel] = useState(false);
    const [plan, selectPlan] = useState([]);
    const [plans, setPlans] = useState();
    const [cpaypal, setCpaypal] = useState();
    const [state, setstate] = useState({
        oid: "",
        id: "",
        type: "",
        price: 0
    });

    let myStore = appStore(state => state);
    let userData = myStore.userData;
    console.log({ userData })
    useEffect(() => {
        getAllPlans();
        checkactiveAccount();
        // userData['plan_id'] ="plan_P2BAtdxFiDH3qR";
        myStore.updateStoreData("userData", userData)
    }, [])



    const getAllPlans = async () => {
        try {
            const response = await fetch(`/api/subscription-plan`);
            const result = await response.json();

            const filteredPlans = result?.data?.filter(plan => plan.type !== "free");
            setPlans(filteredPlans);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    const checkactiveAccount = async () => {
        try {
            common.getAPI({
                method: "GET",
                url: "subscription-plan",
                data: { action: "checkactive" },
                isLoader: true,
            }, (resp) => {
                setpaymenttype(resp.data.type);
                if (resp.data) {
                    if (resp.data.type === "paypal") {
                        setClientId(resp.data.client_id);
                    } else if (resp.data.type === "razorpay") {
                        setClientId(resp.data.client_id);
                    } else {
                        const stripePromise = loadStripe(resp.data.client_id);
                        setstripePromise(stripePromise);
                    }
                }
            });
        } catch (error) {
            console.error("Billing flow error:", error);
        }
    };


    const handlePaymentRoz = async () => {
        common.getAPI(
            {
                method: 'put',
                url: 'createuser',
                data: {
                    planId: state.id,

                },
                isLoader: true
            },
            (resp) => {
                if (resp.data) {
                    window.location.href = resp.data.short_url
                }
            }
        );
    }



    const onApprove = (data1, actions) => {
        common.getAPI({
            method: 'PUT',
            url: "paypal",
            data: {
                price: state.price,
                planId: state.id,
                id: data1.subscriptionID,
                orderId: data1.orderID,
            },
            isLoader: true
        }, (resp) => {
            if (resp) {
                setTimeout(() => {
                    router.push("/thankyou")
                }, 3000);
                return actions.order.capture();
            }

        })

    };

    const paypalForm = () => {
        console.log("dflaijf", { paymenttype })
        if (paymenttype === "paypal") {
            console.log("dflaijf", { paymenttype })

            return (
                <div className="ps_paypal_box">

                    {client_id && <PayPalScriptProvider options={{ clientId: client_id, vault: true }}>
                        <ButtonWrapper showSpinner={false} />
                    </PayPalScriptProvider>}
                </div>
            );
        }
        else if (paymenttype === 'razoropay') {

            return (<button className='rz_addAccBtn' onClick={handlePaymentRoz}> Pay with Razorpay {svg.app.nextIcon} </button>)
        } else {
            return (
                <Elements stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            );
        }
    };




    const ButtonWrapper = ({ showSpinner }) => {
        console.log({ state }, "1111111111111111111111111111111")
        const [{ isPending }] = usePayPalScriptReducer();
        return (
            <>
                {(showSpinner && isPending) && <div className="spinner" />}
                <PayPalButtons
                    style={style}
                    disabled={false}
                    forceReRender={[style]}
                    fundingSource={undefined}
                    vault={true}
                    onApprove={onApprove}
                    onCancel={(data, actions) => {
                    }}
                    createSubscription={(data, actions) => {
                        console.log({ state }, 9090)
                        return actions.subscription.create({
                            plan_id: state.id,
                        })
                            .then((orderId) => {
                                return orderId;
                            });
                    }}
                />
            </>
        );
    }

    const changePlan = () => {
        setstate({
            ...state,
            id: state.oid
        })
    }

    const CheckoutForm = () => {
        const stripe = useStripe();
        const elements = useElements();

        const [errorMessage, setErrorMessage] = useState(null);

        useEffect(() => {
            handleSubmit()
        }, [])

        const handleSubmit = async (event) => {
            event?.preventDefault();

            if (elements == null) {
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const myParam = state.id;
            console.log({ myParam })
            common.getAPI(
                {
                    method: "PUT",
                    url: "stripe",
                    data: {
                        planId: myParam,

                    },
                    isLoader: true,
                },
                async (resp) => {
                    let sess = await stripe.redirectToCheckout({ sessionId: resp.data });
                }
            );
        };
        handleSubmit()
        return (
            <form >
            </form>
        );
    };
    return (

        <>

            <Head>
                <title>{process.env.SITE_TITLE}- Payment Settings</title>
            </Head>

            {
                // state.id=="" ?
                <div className='w-100' >
                    <div className='ps_conatiner '>
                        <div className="dash_header mt-4">
                            <h2>Plan Settings</h2>
                        </div>
                        <div className='  '  >
                            <div className=' pt-5'>
                                <div className="row " >

                                    {plans?.map((data, i) =>

                                        <div key={i+1} className={(userData?.plan_id == data.id) ? 'col-lg-3 ps_activePlan ps-standard-plan m-auto' : 'col-lg-3 col-md-2 ps-standard-plan m-auto'}  >
                                            <div className="ps-plans-holder" key={i}>
                                                {
                                                    console.log("get plan", data)
                                                }
                                                <h4>{data.name}</h4>
                                                <span className="ps-plan-price"><a href="">$<span>{data?.price}</span><sbu>{data?.time_period}</sbu></a></span>
                                                <div className="ps-price-list mt-3">
                                                    <p><img src="assets/images/landing/check.png" alt="" /> {data?.description}</p>
                                                    <p><img src="assets/images/landing/check.png" alt="" /><span> Post Per Month : </span> {data?.post_per_month}	</p>
                                                    <p><img src="assets/images/landing/check.png" alt="" /><span> Post Type :</span> {data?.post_type}	</p>
                                                    <p><img src="assets/images/landing/check.png" alt="" /><span> trial Period : </span>{data?.trial_period} 	</p>
                                                    <p><img src="assets/images/landing/check.png" alt="" /><span> AI Image Generate: </span> {data?.ai_text_generate}</p>
                                                    <p><img src="assets/images/landing/check.png" alt="" /><span> AI Text Generate: </span>{data?.ai_text_generate}</p>
                                                    <p><img src="assets/images/landing/check.png" alt="" /><span> Editor Access </span>{data?.editor_access}</p>
                                                </div>
                                                {(userData?.plan?.id != data.id) && <div className="mt-3"><button onClick={() => {
                                                    console.log({ data }, data)
                                                    setstate({
                                                        id: data?.id,
                                                        type: data?.type
                                                    })
                                                    setmodel(true)
                                                }} className="rz_btn"><span>Change Plan</span></button></div>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            }


            <MyModal
                shown={modal}
                close={() => {
                    setmodel(false)

                }}
            >
                <div className="modal-body">
                    {!shows &&
                        <>
                            <div className="rz_confirmModal">
                                <h4>Do you really want to change your plan ?</h4>
                                <p className="text-center pb-2">If you change the plan  you will not be able  <br />  to modify the existing plan.  </p>
                            </div>
                            <div className="d-flex gap-3 justify-content-center pt-2">
                                <div className="d-flex justify-content-center">
                                    <button onClick={() => {
                                        setstate({
                                            ...state,
                                            id: ""
                                        })

                                    }} className="rz_btn rz_addAccBtn_blk">No</button>
                                </div>
                                <div className="d-flex justify-content-center">
                                    <button onClick={(e) => {
                                        setshows(true)
                                    }} className="rz_btn">Yes, Change </button>
                                    <>

                                    </>
                                </div>

                            </div>
                        </>
                    }




                    {shows && paymenttype === "razorpay" &&
                        <button className='rz_addAccBtn' onClick={handlePaymentRoz}> Pay with Razorpay {svg.app.nextIcon} </button>
                    }
                    {/* { shows && 
                                paymenttype === "stripe" &&
                                 <button className='rz_addAccBtn'  onClick={CheckoutForm}> Pay with Stripe{svg.app.nextIcon}</button>
                             } */}
                    {shows &&
                        (paymenttype === "paypal" || paymenttype === "stripe") &&
                        paypalForm()
                    }
                    {/* {shows &&
                                paymenttype === "paypal" &&
                                <PayPalScriptProvider options={{clientId:client_id}}>
                                    <PayPalButtons style={style}
                                    onApprove={onApprove}
                                    />
                                </PayPalScriptProvider>
                             } */}
                </div>
            </MyModal>
        </>
    );
};

export default Myplans;

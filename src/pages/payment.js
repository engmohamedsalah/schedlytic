
import {PayPalScriptProvider,PayPalButtons, usePayPalScriptReducer} from "@paypal/react-paypal-js";
import { useEffect, useState } from "react";
import { common } from "@/components/Common";
import { useRouter } from 'next/router';
import Link from "next/link";
import { toast } from 'react-toastify';
import svg from "@/components/svg";
import MyModal from '@/components/common/MyModal';
import { NoDataWrapper, Pagination, setMyState } from '@/components/Common';
import {loadStripe} from '@stripe/stripe-js';

import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { checkPassword } from "@/components/utils/utility";

const style = { "layout": "vertical" };


let createUsr = {
    name: '',
    email: '',
    password: '',
    subscriptions: [],
    lastname: ""
};

export default function App() {

    const router = useRouter()
    const [paymenttype,setpaymenttype] =useState("")
    const [trialperiod,settrialperiod] =useState("")
    const [stripePromise,setstripePromise]=useState(null)
    const [planList, setPlanList] = useState([])
    const [isShowPayment, setIsShowPayment] = useState(false)
    const [client_id,setClientId] =useState("");
    const [state, setState] = useState({
        name: "",
        email: "",
        password: "",
        ...createUsr,
    })
    const [userDetail, setUserDetail] = useState({
        name: "",
        lastname: "",
        email: "",
        password: ""
    });


    const inputHandler = (val, name) => {
        userDetail[name] = val
        setUserDetail({ ...userDetail })
    }

    const [selectPlan, setSelectPlan] = useState(null)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get('id');
        getPlanList(myParam)
        checkactiveAccount()
    }, [])

    const getPlanList = (myParam) => {
        common.getAPI({
            method: 'GET',
            url: 'subscription-plan',
            data: {
                target: myParam
            },
            isLoader: true
        }, (resp) => {
            setSelectPlan(resp.data)
        })
    }

    const onApprove = (data1, actions) => {
        let data = { ...userDetail }
        common.getAPI({
            method: 'POST',
            url: 'paypal',
            data: {
                action: "Subscribe",
                price: selectPlan.price,
                planId: selectPlan.id,
                id: data1.subscriptionID,
                orderId: data1.orderID,
                ...data,
            },
            isLoader: true
        }, (resp) => {
            if(resp){
                setTimeout(() => {
                    router.push("/thankyou")
                }, 3000);
                return actions.order.capture();
            }
           
        })

    };

   

 
    const onSubmitBtn = (e) => {
        e.preventDefault()
        if ( userDetail.name.length == 0 ){
       
            toast.error("First name is required.")
            return
        }
        if (userDetail.lastname.length == 0) {
            toast.error("Last name is required.")
            return
        }
        if (userDetail.email.length == 0) {
            toast.error("Email is required.")
            return
        }
        
        if (userDetail.password.trimStart().length > 0) {
            if (!userDetail.password.match(checkPassword)) {
                toast.error("Password must be minimum 8 character long and contain at least one number, one capital letter and one special character.")
                return
            }
        }
        
        setIsShowPayment(true)

    };



    const ButtonWrapper = ({ showSpinner }) => {
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
                    onCancel= {(data,actions)=>{
                    }}
                    createSubscription={(data, actions) => {
                        return actions.subscription.create({
                                plan_id: selectPlan.id,
                            })
                            .then((orderId) => {
                                return orderId;
                            });
                    }}
                />
            </>
        );
    }

    const paypalForm = () => {
        if(paymenttype=="paypal")
        {
            return (
              <>
                <div className="d-flex align-items-center mb-4">
                  <div className="ps_header_back position-absolute">
                    <a onClick={() => setIsShowPayment(false)}>
                      {svg.app.backIcon} <span>Back</span>{" "}
                    </a>{" "}
                  </div>
                  <div className="dash_header m-auto">
                    <h2>
                      {" "}
                      <span>Add Payment Details</span>
                    </h2>
                  </div>
                </div>
                <div className="ps_paypal_box">
                  {client_id && (
                    <PayPalScriptProvider
                      options={{
                        clientId: client_id,
                        components: "buttons",
                        currency: "USD",
                        vault: true,
                      }}
                    >
                      <ButtonWrapper showSpinner={false} />
                    </PayPalScriptProvider>
                  )}
                </div>
              </>
            );
        }else{

            const options = {
                mode: 'payment',
                amount: 1099,
                currency: 'usd',
                // Fully customizable with appearance API.
                appearance: {
                  /*...*/
                },
              };
              
            return (
                <>
        <Elements stripe={stripePromise} options={options}>
    <CheckoutForm />
     </Elements>
    
                </>
            );
        }
       
    }
    const userDetailForm = () => {

        return (
            <>
                <div>
                    <div className='d-flex align-items-center mb-4'>

                        <div className="dash_header m-auto"><h2> <span>Add User Details</span></h2></div>
                    </div>
                    <div className='row'>

                        <div className='col-md-6'>
                            <div className='rz_custom_form mt-0'>
                                <label className="form-label"> First Name <span className="text-danger">*</span></label>
                                <input type='text' className='rz_customInput' placeholder='Enter first name' value={userDetail.name} onChange={(e) => inputHandler(e.target.value, "name")} />
                            </div>
                        </div>

                        <div className='col-md-6 pt-md-0 pt-3'>
                            <div className='rz_custom_form mt-0'>
                                <label className="form-label"> Last Name <span className="text-danger">*</span></label>
                                <input type='text' className='rz_customInput' placeholder='Enter last name' value={userDetail.lastname} onChange={(e) => inputHandler(e.target.value, "lastname")} />
                            </div>
                        </div>


                        <div className='rz_custom_form'>
                            <label className="form-label"> Enter Email <span className="text-danger">*</span></label>
                            <input type='email' className='rz_customInput' placeholder='Enter email' value={userDetail.email} onChange={(e) => inputHandler(e.target.value, "email")} />
                        </div>

                        <div className='rz_custom_form'>
                            <div className='d-flex'><label className="form-label"> Enter Password </label> <div className='ps_admin_password_tooltip'>{svg.app.i_icon}  <span className='rz_tooltipSpan'>Password must be minimum 8 character long and contain at least one number, one capital letter and one special character.</span></div></div>
                            <input autoComplete="off" type='password' className='rz_customInput' placeholder='Enter password' value={userDetail.password} onChange={(e) => inputHandler(e.target.value, "password")} />
                        </div>


                    </div>

                    <div className='d-flex justify-content-center mt-4'><button className='rz_btn' onClick={(e) => onSubmitBtn(e)}>Next {svg.app.nextIcon}</button></div>
                </div>
            </>
        );
    }

    const ChangeValue = (e) => {
        setState({
            ...state,
            [e.target.id]: e.target.value
        })
    }

    let toggleModal = (updState = {}) => {
        setMyState(setState, { modalShown: false })
        setIsShowPayment(false)
    }

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
              setpaymenttype(resp.data.type)
              if(resp.data)
              {
                if(resp.data.type=="paypal")
                {
                  setClientId(resp.data.client_id)
                }else{
                  const stripePromise = loadStripe(resp.data.client_id);
                  setstripePromise(stripePromise)
                }
              }
            }
          );

        } catch (error) {
          console.error("Billing flow error:", error);
        }
      };



      const CheckoutForm = () => {
        const stripe = useStripe();
        const elements = useElements();
      
        const [errorMessage, setErrorMessage] = useState(null);

        useEffect(()=>{
            handleSubmit()
        },[])
      
        const handleSubmit = async (event) => {
          event?.preventDefault();
   
          if (elements == null) {
            return;
          }
      
          const urlParams = new URLSearchParams(window.location.search);
          const myParam = urlParams.get('id');
          
          common.getAPI(
            {
              method: "POST",
              url: "stripe",
              data: {
                priceId:myParam,
                ...userDetail,
                trial_period : selectPlan.trial_period
              },
              isLoader: true,
            },
            async(resp) => { 
               let sess= await stripe.redirectToCheckout({sessionId: resp.data});
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
            <div className="">
                <div className="rz_dashboardWrapper">
                    <div className="ps_integ_conatiner">
                        <div className="welcomeWrapper">

                            <div className='d-flex align-items-center mb-4'>
                                <div className='ps_header_back position-absolute'><Link href='/landing'>{svg.app.backIcon} <span>Back</span> <p>Back</p></Link> </div>
                                <div className="dash_header m-auto"><h2>Subscription Plan</h2></div>
                            </div>
                            <div className='rz_socail_platform_bg '>
                                <div className='ps_schedule_box '>

                                    <div className="row">
                                        <div className="col-xl-12 col-lg-12 col-md-12">
                                            <div className="container">
                                                 {isShowPayment ? paypalForm() : userDetailForm()}
                                            </div>
                                        </div>
                                    </div>
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
                <form autoComplete="off" >
                    <div className="modal-body">
                        <div className='modal_body_scroll'>

                            {isShowPayment ? paypalForm() : userDetailForm()}
                        </div>
                    </div>
                </form>
            </MyModal>

        </>
    );
}
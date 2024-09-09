
import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import { useEffect, useState } from "react";
import { common } from "@/components/Common";

const style = {"layout":"vertical"};

export default function App() {

    const [planList,setPlanList]=useState([])
    const [client_id,setClientId] =useState("");
    const [state,setState]=useState({
        name : "",
        email : "",
        password : "",
    })
    const [selectPlan, setSelectPlan] =useState(null)
    useEffect(()=>{
        getPlanList()
        checkactiveAccount()
    },[])

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
                setClientId(resp.data.client_id)
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
            setPlanList(resp.data)
        })
    }


    const createOrder = (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: selectPlan.price, 
              },
            },
          ],
        });
      };
    
      const onApprove = (data1, actions) => {
        let data ={...state}
        common.getAPI({
            method: 'POST',
            url: 'paypal',
            data: {
                action : "Subscribe",
                price : selectPlan.price,
                planId :  selectPlan.id,
                id : data1.subscriptionID,
                orderId :  data1.orderID,
                ...data,
            },
            isLoader: true
        }, (resp) => {
            return actions.order.capture();
        })
       
      };
    
      const onError = (err) => {
        // Handle errors
        console.error(err);
      };
    
      const createBill=()=>{

      }
      const ButtonWrapper = ({ showSpinner }) => {
        const [{ isPending }] = usePayPalScriptReducer();
    
        return (
            <>
                { (showSpinner && isPending) && <div className="spinner" /> }
                <PayPalButtons
                    style={style}
                    disabled={false}
                    forceReRender={[style]}
                    fundingSource={undefined}
                    vault={true}
                    onApprove={onApprove}
                    createSubscription={(data, actions) => {
                        return actions.subscription
                            .create({
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

    const ChangeValue =(e)=>{
        setState({
            ...state,
            [e.target.id] : e.target.value
        })
    }
    return (

        <div className='rz_dashboardWrapper' >
        <div className='ps_conatiner'>
            <label>Nmae</label>
            <input type="text" id ="name" value={state.name} onChange={(e)=>{
                ChangeValue(e)
            }}/>

        <label>email</label>
        <input type="text" id ="email" value={state.email} onChange={(e)=>{
                ChangeValue(e)
            }}/>

        <label>password</label>
        <input type="text" id ="password" value={state.password} onChange={(e)=>{
                ChangeValue(e)
            }}/>
        <div>
            {planList.map((d1)=>{
                return(<>
               <table>
                <tr onClick={()=>{
                    setSelectPlan(d1)
                }} style={{border : "1px solid"}}>
                    <td>{d1.name}</td>
                    <td>{d1.id}</td>
                </tr>
               </table>
                </>)
            })}
        </div>
    {selectPlan && 
        <>
        <h1>Name : {selectPlan.name}</h1>
        <h1>Price : {selectPlan.price}</h1>
        <div style={{ maxWidth: "750px", minHeight: "200px" }}>
            {client_id && 
            <PayPalScriptProvider options={{ clientId:client_id, components: "buttons", currency: "USD",  vault: true }}>
                <ButtonWrapper showSpinner={false} />
            </PayPalScriptProvider>
}
        </div>
        </>
    }
        </div>
        </div>
    );
}
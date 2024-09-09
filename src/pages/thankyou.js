
import Link from "next/link";
import svg from "@/components/svg";
import {useEffect} from "react"
import { useRouter } from 'next/router';


export default function Thankyou() {
    const router = useRouter()
  
    return (
      <>
        <div className="">
          <div className="rz_dashboardWrapper">
            <div className="ps_integ_conatiner">
              <div className="welcomeWrapper">
                <div className="rz_socail_platform_bg ">
                  <div
                    className="ps_schedule_box "
                    style={{ background: "#fcfcfe" }}
                  >
                    <div className="animation-ctn">
                      <img
                        src="assets/images/auth/payment_done.gif"
                        alt="payment done"
                      ></img>
                    </div>
                    <div className="ps_thankyou_details">
                      <h2>Thank You!</h2>
                      <h3>Your order has been placed !</h3>
                      <div className="d-flex justify-content-center mt-4">
                        <Link href="/login" className="rz_addAccBtn">
                          {" "}
                          Go to Home Page {svg.app.nextIcon}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
}
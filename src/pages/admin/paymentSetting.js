import { useEffect, useState } from "react";
import PaySetting from "@/components/payment/paySetting";
import SmtpSetting from "@/components/payment/smtpSetting";

export default function PaymentSetting() {
	const [selectedAcc, setSelectedAcc] = useState("Payment Settings")
	

	const selectAccount = (name) => {
		setSelectedAcc(name)
	}

	const showAccDetails = () => {
	
		if (selectedAcc === "Payment Settings") {
			return <PaySetting/>
		} else if (selectedAcc === "SMTP Settings") {
			return <SmtpSetting/>
          
        }
	}

	return (
		<>
			

			<div className='rz_dashboardWrapper' >
				<div className="ps_conatiner">
					<div className=' welcomeWrapper'>


						<div className="dash_header pb-md-5 pb-2">
							<h2>Integrations</h2>
						</div>

						<div className="row">
							<div className='col-lg-3 col-md-4 '>
								<div className="rz_socail_platform_bg ">
									<div className="rz_socail_platform">
										<div className={`ps_adminSetting_box  ${selectedAcc === "Payment Settings" ? 'active_adminSetting_box' : ""}`} style={{ background: "var(--div_bgColor2)" }} onClick={() => selectAccount("Payment Settings")}>
											
											<h6 className='mr-auto'>Payment Settings</h6>
										</div>
									</div>
									<div className="rz_socail_platform">
										<div className={`ps_adminSetting_box  ${selectedAcc === "SMTP Settings" ? 'active_adminSetting_box' : ""}`} style={{ background: "var(--div_bgColor2)" }} onClick={() => selectAccount("SMTP Settings")}>
											
											<h6 className='mr-auto'>SMTP Settings</h6>
										</div>
									</div>
									
								</div>
							</div>
							{selectedAcc ? <div className="col-lg-9 col-md-8 mt-md-0 mt-3 ">
								<div className="rz_socail_platform_bg  ">
									<div className="text-center ">
										<h4>{` ${selectedAcc} `}</h4>
									</div>
									<div className="">
										{showAccDetails()}
									</div>
									
								</div>
							</div> : ""}
						</div>
					</div>
				</div>

			</div >

			

		</>
	)
}

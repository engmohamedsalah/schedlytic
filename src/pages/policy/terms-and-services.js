import Head from "next/dist/shared/lib/head";
import Link from "next/link";
import svg from '@/components/svg';

let TermsAndCondition = function () {

    return (
        <>
              <Head>
                    <title>{process.env.SITE_TITLE}- Terms And Services</title>
                </Head>
            <div className="">
                <div className="ps_mainHeader_wrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-6">
                                <div className="logo-wrapper">
                                    <Link className="admin-logo" href="/admin/dashboard"><div className='rz_logo'>
                                        <span className="ms-0">{svg.app.logo}</span>
                                    </div></Link>
                                </div>
                            </div>
                            <div className=" col-6 d-flex justify-content-end align-items-center">
                                <Link className="rz_btn" href="/">Go To Login</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ps_mainPage_wrapper">
                    <div className="ps_main_content">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-12 col-lg-12 col-md-12">
                                    <div className="ps_whiteBg spv-textContent_box">
                                        <div className="ps_page_inner">
                                            <h1>Terms And Services</h1>
                                            <p>Please read these terms of service 	&#40; {`"terms of service", "terms"`} &#41; carefully before using <Link href="">{process.env.LIVE_URL}</Link> website &#40; {`“website”, "service"`} &#41; operated by <b>{process.env.LIVE_URL}</b>  &#40; {`"us", 'we", "our"`} &#41;.</p>
                                            <h3 >Conditions of use</h3>
                                            <p>By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to leave the website accordingly. <b>{process.env.LIVE_URL}</b> only grants use and access of this website, its products, and its services to those who have accepted its terms.</p>
                                            <h3 >Privacy policy</h3>
                                            <p>Before you continue using our website, we advise you to read our <Link className="ps-auth_info" href="">Privacy Policy</Link> regarding our user data collection. It will help you better understand our practices.</p><h3 >Age restriction</h3>
                                            <p>You must be at least 18 (eighteen) years of age before you can use this website. By using this website, you warrant that you are at least 18 years of age and you may legally adhere to this Agreement. <b>{process.env.LIVE_URL}</b> assumes no responsibility for liabilities related to age misrepresentation.</p>
                                            <h3 >Intellectual property</h3>
                                            <p>You agree that all materials, products, and services provided on this website are the property of <b>{process.env.LIVE_URL}</b>, its affiliates, directors, officers, employees, agents, suppliers, or licensors including all copyrights, trade secrets, trademarks, patents, and other intellectual property. You also agree that you will not reproduce or redistribute the <b>{process.env.LIVE_URL}</b>{`'`}s intellectual property in any way, including electronic, digital, or new trademark registrations. You grant <b>{process.env.LIVE_URL}</b> a royalty-free and non-exclusive license to display, use, copy, transmit, and broadcast the content you upload and publish. For issues regarding intellectual property claims, you should contact the company in order to come to an agreement.</p>
                                            <h3 >User accounts</h3>
                                            <p>As a user of this website, you may be asked to register with us and provide private information. You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information. You are also responsible for all activities that occur under your account or password. If you think there are any possible issues regarding the security of your account on the website, inform us immediately so we may address it accordingly. We reserve all rights to terminate accounts, edit or remove content and cancel orders in their sole discretion.</p>
                                            <h3 >Applicable law</h3>
                                            <p>By visiting this website, you agree that the laws of the {`[location]`}, without regard to principles of conflict laws, will govern these terms and conditions, or any dispute of any sort that might come between <b>{process.env.LIVE_URL}</b> and you, or its business partners and associates.</p>
                                            <h3 >Disputes</h3>
                                            <p>Any dispute related in any way to your visit to this website or to products you purchase from us shall be arbitrated by state or federal court {`[location]`} and you consent to exclusive jurisdiction and venue of such courts.</p><h3 >Indemnification</h3>
                                            <p>You agree to indemnify <b>{process.env.LIVE_URL}</b> and its affiliates and hold <b>{process.env.LIVE_URL}</b> harmless against legal claims and demands that may arise from your use or misuse of our services. We reserve the right to select our own legal counsel.</p>
                                            <h3 >Limitation on liability</h3>
                                            <p><b>{process.env.LIVE_URL}</b> is not liable for any damages that may occur to you as a result of your misuse of our website. <b>{process.env.LIVE_URL}</b> reserves the right to edit, modify, and change this Agreement any time. We shall let our users know of these changes through electronic mail. This Agreement is an understanding between <b>{process.env.LIVE_URL}</b> and the user, and this supersedes and replaces all prior agreements regarding the use of this website.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12"><ul className="ps_page_links">
                                    <li><Link href={"/policy/privacy-policy"}>Privacy Policy</Link> </li>
                                </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

};

export default TermsAndCondition;

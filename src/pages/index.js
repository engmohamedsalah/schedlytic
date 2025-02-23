import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Image from 'next/image';
import { appStore } from "@/zu_store/appStore";
import Link from 'next/link';

const Home = () => {
    let storeData = appStore(state => state);
    let userData = storeData.userData;

    useEffect(() => {
        callApi(); // Call the API when the component mounts
    }, []);

    const callApi = async () => {
        try {
            const response = await fetch(`/api/subscription-plan`);
            const data = await response.json();
            updatePlans(data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const [isVisible, setIsVisible] = useState(false);

    // Show button when scrolling down 300px
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            // Cleanup the event listener
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    const updatePlans = (data) => {
        const plansContainer = document.getElementById('showPlans');
        data.forEach((plan) => {
            const parent = document.createElement('div');
            parent.className = 'col-lg-4 col-md-6 ps-standard-plan';
            const planDiv = document.createElement('div');
            planDiv.className = 'ps-plans-holder';

            const heading = document.createElement('h4');
            heading.textContent = plan.name;

            const price = document.createElement('span');
            price.className = 'ps-plan-price';
            price.innerHTML = `<a href="javascript:void(0);">$<span>${plan?.price || 0}</span><sub>/${plan?.time_period || ""}</sub></a>`;

            const des = document.createElement("div");
            des.className = "ps-price-list";

            const descriptions = [
                `<img src="../assets/images/landing/check.png" alt=""> ${plan?.description || ''}`,
                `<img src="../assets/images/landing/check.png" alt=""><span> Post Per Month : </span> ${plan?.post_per_month || ''}`,
                `<img src="../assets/images/landing/check.png" alt=""><span> Post Type : </span>${plan?.post_type?.charAt(0).toUpperCase() + plan?.post_type?.slice(1) || ''}`,
                `<img src="../assets/images/landing/check.png" alt=""><span> Trial Period : </span>${plan?.trial_period ? `${plan.trial_period} Day` : ''}`,
                plan?.ai_image_generate ? `<img src="../assets/images/landing/check.png" alt="">  <span> AI Image Generate </span>` : "",
                plan?.ai_text_generate ? `<img src="../assets/images/landing/check.png" alt="">  <span> AI Text Generate </span>` : "",
                plan?.editor_access ? `<img src="../assets/images/landing/check.png" alt="">  <span> Editor Access </span>` : ""
            ];

            descriptions.forEach(desc => {
                if (desc) {
                    const p = document.createElement('p');
                    p.innerHTML = desc;
                    des.appendChild(p);
                }
            });

            const choosePlanBtn = document.createElement('a');
            choosePlanBtn.href = `payment?id=${plan?.id}`;
            choosePlanBtn.className = 'ps-btn';
            choosePlanBtn.textContent = 'Choose Plan';
            planDiv.appendChild(heading);
            planDiv.appendChild(price);
            planDiv.appendChild(des);
            planDiv.appendChild(choosePlanBtn);
            parent.appendChild(planDiv);
            plansContainer.appendChild(parent);
        });
    };

    return (
        <>
            <Head>
                <title>PixaSocial</title>
                
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" />
                <link rel="shortcut icon" href={(userData.adminfaviconUrl)?userData.adminfaviconUrl:"../assets/images/favicon.png"} />
                {/* Add any other stylesheets as needed */}
            </Head>
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js" />
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.0.1/js/bootstrap.min.js" />
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js" />
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/smooth-scroll/16.1.3/smooth-scroll.min.js" />
            <Script src="assets/js/custom.js" />

            <div className="ps-top-icon" style={{ display: isVisible ? 'block' : 'none' }}>
                <Link href="" id="button" onClick={handleScrollToTop}>
                    <svg width="23" height="18" viewBox="0 0 23 18">
                        <path
                            d="M13.825,18.000 C10.772,18.000 7.928,16.517 6.217,14.033 C5.870,13.530 6.006,12.845 6.519,12.505 C7.032,12.165 7.729,12.297 8.076,12.801 C9.369,14.678 11.518,15.799 13.825,15.799 C17.647,15.799 20.757,12.749 20.757,9.000 C20.757,5.251 17.647,2.200 13.825,2.200 C11.512,2.200 9.359,3.326 8.067,5.212 C7.721,5.717 7.024,5.851 6.510,5.512 C5.996,5.173 5.859,4.489 6.205,3.985 C7.915,1.490 10.763,-0.000 13.825,-0.000 C18.884,-0.000 23.000,4.037 23.000,9.000 C23.000,13.963 18.884,18.000 13.825,18.000 ZM11.293,6.704 C10.902,6.313 10.902,5.679 11.293,5.287 C11.683,4.896 12.316,4.896 12.707,5.287 L15.706,8.291 C15.730,8.315 15.752,8.339 15.772,8.365 C15.777,8.371 15.782,8.377 15.787,8.384 C15.802,8.403 15.817,8.423 15.831,8.443 C15.835,8.449 15.838,8.455 15.842,8.462 C15.856,8.483 15.869,8.505 15.881,8.527 C15.883,8.532 15.886,8.537 15.888,8.541 C15.901,8.566 15.913,8.590 15.923,8.616 C15.925,8.619 15.925,8.622 15.927,8.626 C15.938,8.653 15.948,8.680 15.956,8.708 C15.957,8.712 15.958,8.715 15.959,8.719 C15.967,8.747 15.974,8.774 15.980,8.803 C15.982,8.812 15.982,8.820 15.984,8.829 C15.988,8.852 15.992,8.876 15.995,8.900 C15.998,8.933 16.000,8.966 16.000,9.000 C16.000,9.033 15.998,9.067 15.995,9.100 C15.992,9.124 15.988,9.148 15.984,9.172 C15.982,9.180 15.982,9.189 15.980,9.197 C15.974,9.226 15.967,9.254 15.959,9.282 C15.958,9.285 15.957,9.288 15.956,9.292 C15.948,9.320 15.938,9.348 15.927,9.375 C15.925,9.378 15.925,9.381 15.923,9.384 C15.913,9.410 15.901,9.435 15.888,9.459 C15.886,9.464 15.883,9.468 15.881,9.473 C15.869,9.495 15.856,9.517 15.842,9.539 C15.838,9.545 15.835,9.551 15.831,9.557 C15.817,9.577 15.802,9.597 15.787,9.616 C15.782,9.623 15.777,9.629 15.772,9.636 C15.752,9.661 15.730,9.685 15.707,9.708 L12.707,12.712 C12.511,12.908 12.256,13.006 12.000,13.006 C11.744,13.006 11.488,12.908 11.293,12.712 C10.902,12.321 10.902,11.688 11.293,11.296 L12.586,10.001 L1.000,10.001 C0.448,10.001 -0.000,9.553 -0.000,9.000 C-0.000,8.447 0.448,7.998 1.000,7.998 L12.586,7.998 L11.293,6.704 Z"
                        />
                    </svg>
                </Link>
            </div>

            <header className="ps-header-wrapper">
                <div className="container">
                    <div className="ps-header-flex">
                        {/* <div className="ps-logo">
                            <a href="/">
                                <Image src="/assets/images/White-Logo.png" alt="" width={150} height={50} />
                            </a>
                        </div> */}
                        <div className='rz_logo'>                             
                                    <span className='ps_logo_header'> <img src={(userData.adminprofileUrl)?userData.adminprofileUrl:process.env.APP_LOGO} alt="" /></span>
                            </div>
                        <div className="ps-menu">
                            <ul>
                                <li><a href="#feature">features</a></li>
                                <li><a href="#plans">plans</a></li>
                                <li><a href="javascript:;">contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <div className="ps-header-btn">
                                <Link href="/login" className="ps-btn">login</Link>
                                <Link href="#plans" className="ps-btn">buy now</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="ps-banner-wrapper">
                <div className="container">
                    <div className="ps-banner-flex">
                        <div className="ps-banner-left">
                            <div className="ps-banner-left-inner">
                                <img src="../assets/images/landing/banner-vec1.png" alt="" className="ps-banner-vec1" />
                                <img src="../assets/images/landing/banner-img1.png" alt="" className="ps-banner-img" />
                                <img src="../assets/images/landing/banner-vec2.png" alt="" className="ps-banner-vec2" />
                                <img src="../assets/images/landing/banner-vec3.png" alt="" className="ps-banner-vec3" />
                            </div>
                        </div>
                        <div className="ps-banner-main">
                            <div className="ps-banner-heading">
                                <h2>Design, Plan, Schedule <br /> Elevate Your Social Media Presence with</h2>
                                <h1>Effortless Content Design</h1>
                            </div>
                            <div className="ps-banner-image">
                                <img src="../assets/images/landing/banner-main-img.png" alt="" data-tilt data-tilt-max="10"
                                    data-tilt-speed="20" data-tilt-perspective="2000" />
                            </div>
                        </div>
                        <div className="ps-banner-left">
                            <div className="ps-banner-left-inner">
                                <img src="../assets/images/landing/banner-vec4.png" alt="" className="ps-banner-vec4" />
                                <img src="../assets/images/landing/banner-img2.png" alt="" className="ps-banner-img" />
                                <img src="../assets/images/landing/banner-vec5.png" alt="" className="ps-banner-vec5" />
                                <img src="../assets/images/landing/banner-vec6.png" alt="" className="ps-banner-vec6" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ps-feature-wrapper">
                <div className="container">
                    <div className="ps-feature-heading">
                        <h4>Most premium and exclusive</h4>
                        <h1>features</h1>
                    </div>
                    <div className="ps-feature-main-parent">
                        <div className="ps-feature-left">
                            <div className="ps-feature-img">
                                <img src="../assets/images/landing/f1.png" alt="" />
                            </div>
                            <div className="ps-feature-img">
                                <div className="ps-feature-cstm-box">
                                    <img src="../assets/images/landing/user-img.png" alt="" />
                                    <h1>The User Dashboard Makes Your Journey As Smooth As Possible</h1>
                                </div>
                            </div>
                        </div>
                        <div className="ps-feature-right">
                            <div className="ps-feature-right-flex">
                                <div className="ps-feature-right-inner">
                                    <div className="ps-feature-img ps-feat-2">
                                        <img src="../assets/images/landing/f2.png" alt="" />
                                    </div>
                                </div>
                                <div className="ps-feature-right-inner2">
                                    <div className="ps-feature-img">
                                        <img src="../assets/images/landing/f3.png" alt="" />
                                    </div>
                                    <div className="ps-feature-img">
                                        <img src="../assets/images/landing/f4.png" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="ps-editor-wrapper">
                <div className="container">
                    <div className="ps-admin-heading ps-editor-heading">
                        <div className="ps-admin-grednt">
                            <h4>Awesome Editor</h4>
                        </div>
                        <h1>Create stunning social media visuals effortlessly with our premium editor</h1>
                    </div>
                    <div className="ps-editor-main-img">
                        <img src="../assets/images/landing/editor-main-img.png" alt="" />
                        <img src="../assets/images/landing/banner-vec1.png" alt="" className="ps-edit-vec ps-edit-vec1" />
                        <img src="../assets/images/landing/banner-vec2.png" alt="" className="ps-edit-vec ps-edit-vec2" />
                        <img src="../assets/images/landing/banner-vec3.png" alt="" className="ps-edit-vec ps-edit-vec3" />
                        <img src="../assets/images/landing/banner-vec4.png" alt="" className="ps-edit-vec ps-edit-vec4" />
                        <img src="../assets/images/landing/banner-vec6.png" alt="" className="ps-edit-vec ps-edit-vec6" />
                        <img src="../assets/images/landing/banner-vec5.png" alt="" className="ps-edit-vec ps-edit-vec5" />
                    </div>
                    <div className="ps-editr-info-main">
                        <div className="row gy-4 align-items-center">
                            <div className="col-lg-6">
                                <div className="ps-editr-content">
                                    <h4>Sketch up your ideas with Pencil</h4>
                                    <p>Bring your creative concepts to life with Pencil, a versatile tool that allows you to
                                        sketch and visualize your ideas with ease. Unleash your imagination and turn your
                                        visions into reality. Transform abstract ideas into captivating visuals as you sketch
                                        and outline your post concepts.</p>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="ps-editr-img">
                                    <img src="../assets/images/landing/e1.png" alt="" />
                                </div>
                            </div>
                        </div>
                        <div className="row gy-4 align-items-center">
                            <div className="col-lg-6">
                                <div className="ps-editr-img">
                                    <img src="../assets/images/landing/e2.png" alt="" />
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="ps-editr-content">
                                    <h4>Transform Your Content with Typography Options</h4>
                                    <p>PixaSocial Editor offers a variety of typography options to customize headings,
                                        paragraphs, and other elements with font style, color, size, and line height. You can
                                        also bold, underline, and strikethrough to make your text stand out and captivate
                                        readers. With typography, you can create engaging and impactful content.</p>
                                </div>
                            </div>
                        </div>
                        <div className="row gy-4 align-items-center">
                            <div className="col-lg-6">
                                <div className="ps-editr-content">
                                    <h4>Upload Edit & filters Images</h4>
                                    <p>Say hello to Image Upload, Editing, and Filters - your one-stop solution for creating
                                        eye-catching posts. Seamlessly upload images directly to your posts. Crop, resize, and
                                        rotate your images to fit your desired layout. Apply stunning filters to enhance your
                                        photos and create a cohesive aesthetic.</p>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="ps-editr-img">
                                    <img src="../assets/images/landing/e3.png" alt="" />
                                </div>
                            </div>
                        </div>
                        <div className="row gy-4 align-items-center">
                            <div className="col-lg-6">
                                <div className="ps-editr-img">
                                    <img src="../assets/images/landing/e4.png" alt="" />
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="ps-editr-content">
                                    <h4>Use Unlimited Shapes</h4>
                                    <p>Bring your creative ideas to life with a versatile set of shapes. With this feature, the
                                        possibilities are endless, and your posts will be more dynamic and eye-catching than
                                        ever. Stand out from the crowd and craft engaging content that resonates with your
                                        audience. </p>
                                </div>
                            </div>
                        </div>
                        <div className="row gy-4 align-items-center">
                            <div className="col-lg-6">
                                <div className="ps-editr-content">
                                    <h4>Filters Images</h4>
                                    <p>
                                    Elevate your visual game and give your photos a fresh, exciting look. With a wide range
                                    of filters to choose from, you can transform your images into stunning works of art. Get
                                    started today and create eye-catching, shareable content that your audience will love.
                                    It&apos;s time to let your creativity shine!
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="ps-editr-img">
                                    <img src="../assets/images/landing/e5.png" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="ps-feature-box-wrapper" id="feature">
                <div className="container">
                    <div className="ps-feature-box-heading">
                        <h1>our countless key features</h1>
                    </div>
                    <div className="ps-feature-box-parent">
                        <div className="row gy-4 justify-content-center">
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="ps-feature-box-inner">
                                    <img src="../assets/images/landing/fb1.png" alt="" />
                                    <p>User Dashboard</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="ps-feature-box-inner">
                                    <img src="../assets/images/landing/fb4.png" alt="" />
                                    <p>Assets Management</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="ps-feature-box-inner">
                                    <img src="../assets/images/landing/fb5.png" alt="" />
                                    <p>Create & Customize post</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="ps-feature-box-inner">
                                    <img src="../assets/images/landing/fb6.png" alt="" />
                                    <p>Post Analytics</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="ps-feature-box-inner">
                                    <img src="../assets/images/landing/fb7.png" alt="" />
                                    <p>Social Media Integration</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="ps-feature-box-inner">
                                    <img src="../assets/images/landing/fb8.png" alt="" />
                                    <p>Schedule Post</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="ps-feature-box-inner">
                                    <img src="../assets/images/landing/fb9.png" alt="" />
                                    <p>Post Calendar</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="ps-feature-box-inner">
                                    <img src="../assets/images/landing/fb10.png" alt="" />
                                    <p>Image Creator</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="ps-feature-box-inner">
                                    <img src="../assets/images/landing/fb11.png" alt="" />
                                    <p>User Friendly Design</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ps-pricing-wrapper" id="plans">
                <div className="container">
                    <div className="ps-feature-box-heading">
                        <h1>select the perfect plan for you</h1>
                    </div>
                    <div id="monthlyPlan" className="ps-plans-table">
                        <div className="row gy-4" id="showPlans">
                            {/* dynamically populated plans will go here */}
                        </div>
                    </div>
                </div>
            </section>

            <section className="ps-temnl-wrapper">
            <div className="container">
    <div className="ps-tsmnl-heading">
        <img src="../assets/images/landing/rating.png" alt="Customer Ratings" />
        <h1>Don&apos;t take our word for it. Trust our Customers&apos; Feedback</h1>
    </div>
    <div className="row gy-4">
        {/* First Client */}
        <div className="col-lg-4 col-md-6">
            <div className="ps-tesmnl-box">
                <div className="ps-tesmnl-inner">
                    <div className="ps-tesmnl-head-flex">
                        <img src="../assets/images/landing/client1.jpg" alt="Esther Howard" />
                        <div className="ps-tesmnl-clnt-info">
                            <h4>Esther Howard</h4>
                            <p>UI / UX Design</p>
                        </div>
                    </div>
                    <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage.</p>
                </div>
            </div>
        </div>
        {/* Second Client */}
        <div className="col-lg-4 col-md-6">
            <div className="ps-tesmnl-box">
                <div className="ps-tesmnl-inner">
                    <div className="ps-tesmnl-head-flex">
                        <img src="../assets/images/landing/client2.jpg" alt="Darell Steward" />
                        <div className="ps-tesmnl-clnt-info">
                            <h4>Darell Steward</h4>
                            <p>UI / UX Design</p>
                        </div>
                    </div>
                    <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage.</p>
                </div>
            </div>
        </div>
        {/* Third Client */}
        <div className="col-lg-4 col-md-6">
            <div className="ps-tesmnl-box">
                <div className="ps-tesmnl-inner">
                    <div className="ps-tesmnl-head-flex">
                        <img src="../assets/images/landing/client5.png" alt="Cody Fisher" />
                        <div className="ps-tesmnl-clnt-info">
                            <h4>Cody Fisher</h4>
                            <p>UI / UX Design</p>
                        </div>
                    </div>
                    <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage.</p>
                </div>
            </div>
        </div>
        {/* Fourth Client */}
        <div className="col-lg-4 col-md-6">
            <div className="ps-tesmnl-box">
                <div className="ps-tesmnl-inner">
                    <div className="ps-tesmnl-head-flex">
                        <img src="../assets/images/landing/client4.png" alt="Wade Warren" />
                        <div className="ps-tesmnl-clnt-info">
                            <h4>Wade Warren</h4>
                            <p>UI / UX Design</p>
                        </div>
                    </div>
                    <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage.</p>
                </div>
            </div>
        </div>
        {/* Fifth Client */}
        <div className="col-lg-4 col-md-6">
            <div className="ps-tesmnl-box">
                <div className="ps-tesmnl-inner">
                    <div className="ps-tesmnl-head-flex">
                        <img src="../assets/images/landing/client5.png" alt="Darren Joe" />
                        <div className="ps-tesmnl-clnt-info">
                            <h4>Darren Joe</h4>
                            <p>UI / UX Design</p>
                        </div>
                    </div>
                    <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage.</p>
                </div>
            </div>
        </div>
        {/* Sixth Client */}
        <div className="col-lg-4 col-md-6">
            <div className="ps-tesmnl-box">
                <div className="ps-tesmnl-inner">
                    <div className="ps-tesmnl-head-flex">
                        <img src="../assets/images/landing/client1.jpg" alt="Annette Black" />
                        <div className="ps-tesmnl-clnt-info">
                            <h4>Annette Black</h4>
                            <p>UI / UX Design</p>
                        </div>
                    </div>
                    <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage.</p>
                </div>
            </div>
        </div>
    </div>
</div>

            </section>

            <footer className="ps-footer-wrapper">
                <div className="container">
                    <div className="ps-footer-inner">
                        <div className="ps-footer-logo ps-logo m-auto">
                            <a href="index.html"> <img src={(userData.adminprofileUrl)?userData.adminprofileUrl:process.env.APP_LOGO} alt="" /></a>
                        </div>
                      
                        <div className="ps-footer-heading">
                            <h1>What are you waiting for?</h1>
                            <p>Easily Schedule Your Social Media Posts With PixaSocial.</p>
                        </div>
                        <div className="ps-footer-btn">
                            <a href="#plans" className="ps-btn">buy now <img src="../assets/images/landing/btn-arrow.png" alt="" /> </a>
                        </div>
                        <div className="ps-copyright">
                            <p>© Copyright 2023. All Rights Reserved</p>
                        </div>
                    </div>
                </div>
            </footer>


        </>
    );
};

export default Home;
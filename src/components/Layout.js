import Router, { useRouter } from "next/router";
import Header from "./Header";
import { ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import Head from "next/dist/shared/lib/head";  
import '../../node_modules/react-toastify/dist/ReactToastify.css';
import { appStore } from "@/zu_store/appStore";


let Layout = function ({ children }) {
	
    let myStore = appStore(state => state);
	if(process.env.PRIMARY_COLOR!="")
	{
		document.documentElement.style.setProperty('--primaryColor',process.env.PRIMARY_COLOR)
	}
	if(process.env.SECONDARY_COLOR!="")
	{
		document.documentElement.style.setProperty('--div_bgColor',process.env.SECONDARY_COLOR)
	}
	if(process.env.BODY_COLOR!="")
	{
		document.documentElement.style.setProperty('--div_bgColor2',process.env.BODY_COLOR)
	}
	if(process.env.PRIMARY_LIGHT_COLOR!="")
	{
		document.documentElement.style.setProperty('--div_bgColor2',process.env.PRIMARY_LIGHT_COLOR)
	}
	if(process.env.PARAGRAPH_COLOR!="")
	{
		document.documentElement.style.setProperty('--pColor',process.env.PARAGRAPH_COLOR)
	}
	if(process.env.HEADING_COLOR!="")
	{
		document.documentElement.style.setProperty('--headdingColor',process.env.HEADING_COLOR)
	}
	
	
	const {token , role } = myStore.userData || {},
	userAccessList = [
		'/dashboard',
		'/create_post',
		'/calendar',
		'/image_editor/image_edit',
		'/Integrations'
					],
	userTemplateAccessList = [
						'/admin/templates',
						'/admin/assets',
					],
	signOut = () => {
		
		Router.push("/login");
	};

	const router = useRouter(); 
	let adminUrl = router.pathname.split("/admin/").length >= 2 ? 1 : 0;
	let userUrl = userAccessList.includes(router.pathname);
	let userTemplateUrl = userTemplateAccessList.includes(router.pathname);

	let adminDashboard = "/admin/dashboard";
	let userDashboard = "/dashboard";
	let userTemplate = "/admin/templates";
	let isAuthPage = ["/", "/auth/[auth]","/login","/payment"].includes(router.pathname);
	let tokenCookie = Cookies.get("authToken") ? Cookies.get("authToken") : false,
	withoutAuthList = [
		"/policy/terms-and-services",
		"/policy/privacy-policy",
		"/create_image/[id]",
		"/landing",
		"/thankyou"
	]; 
      
	if (withoutAuthList.includes(router.pathname) ) {

		return (
      <>
        <Head>
          <link rel="shortcut icon" href="../assets/images/favicon.png" />
        </Head>
        {children}
      </>
    );
	} else {
		if ((!tokenCookie || !token) && !isAuthPage) {

			signOut();
		} else if ( token && tokenCookie && token != tokenCookie ) {
			signOut();
		} else {
			if (tokenCookie && token && isAuthPage) {
				
				Router.push( role == 'Admin' ? adminDashboard : userDashboard );
			} else {
				if(role == 'Template Creator' && userUrl)
				{
					Router.push(userTemplate);
				}else{
				 if (role == 'User' && adminUrl ) {
					Router.push(userDashboard);
				} else if (role == 'Admin' && userUrl) {
					Router.push(adminDashboard);
				}
			}
			}
		}
		return (
			<>
				<Head>
					<link
						rel="shortcut icon"
						href="../assets/images/favicon.png"
					/>
				</Head>	
				<div id="siteLoader"></div>
					{router.pathname.split("/auth/").length > 1 ||
					router.pathname.split("/render/").length > 1 ||
					router.pathname.split("/campaign-thumb/").length > 1 ||
					router.pathname.split("/template-preview/").length > 1 ||
					router.pathname.split("api/").length > 1 ||
					isAuthPage ||
					[
						"/404",
						"/privacy-policy",
						"/knowledge-base",
						"/terms-and-services",
						"/about",
						"/_error",
						"/imageCreator"
					].includes(router.pathname) ? ( "" ) : (
						<>
						{(router.pathname.includes("/editor")  || router.pathname.includes("/create_image")) ? "" : 
						<Header/>
						}
						</>
					)}
					
					<ToastContainer 
					position="top-right"
					autoClose={2000}
					theme="dark"
					closeOnClick
					
					/>
					{children}
				
			</>
		);
	}
};

export default Layout;

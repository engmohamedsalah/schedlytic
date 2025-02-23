import Router, { useRouter } from "next/router";
import Header from "./Header";
import { ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import Head from "next/dist/shared/lib/head";
import '../../node_modules/react-toastify/dist/ReactToastify.css';
import { appStore } from "@/zu_store/appStore";
import { useEffect } from "react";
import { common } from "./Common";


let Layout = function ({ children }) {
	const router = useRouter();
	let myStore = appStore(state => state);
	let userData = myStore.userData;
	let withoutAuthList = [
		"/policy/terms-and-services",
		"/policy/privacy-policy",
		"/create_image/[id]",
		"/landing",
		"/thankyou",
		"/"
	];
	let isAuthPage = ["/", "/auth/[auth]", "/login", "/payment"].includes(router.pathname);
	useEffect(() => {
		getWebSettingsData();
		if (!withoutAuthList.includes(router.pathname) && !isAuthPage) {
			getdatabytoken()
		}

	}, [router.pathname]);


	const getdatabytoken = async () => {
		common.getAPI({
			method: 'GET',
			url: 'user',
			data: {
				action: "getdata"
			},
		}, (resp) => {
			console.log("resp", resp)

			let userData = myStore.userData;
			userData = {
				...userData,
				...resp.data
			}
			myStore.updateStoreData('userData', userData);
		});
	}
	const getWebSettingsData = async (e) => {
		await common.getAPI({
			method: 'GET',
			url: 'web-setting?action=getweb',
			data: {},
		}, (resp) => {
			console.log("resp", resp)
			if (resp.data) {
				const customizationData = {
					siteTitle: resp.data.siteTitle,
					primaryColor: resp?.data?.primaryColor,
					secondaryColor: resp?.data?.secondaryColor,
					bodyColor: resp?.data?.bodyColor,
					primaryLightColor: resp?.data?.primaryLightColor,
					paragraphColor: resp?.data?.paragraphColor,
					headingColor: resp?.data?.headingColor,
					googleScript: resp?.data?.googleScript
				}
				userData['adminprofileUrl'] = resp?.data?.logo
				userData['adminfaviconUrl'] = resp?.data?.favIcon
				userData['Color'] = customizationData
				myStore.updateStoreData("userData", userData)
			} else {
				const customizationData = {
					siteTitle: "Pixasocial",
					primaryColor: process.env.PRIMARY_COLOR,
					secondaryColor: process.env.SECONDARY_COLOR,
					bodyColor: process.env.BODY_COLOR,
					primaryLightColor: process.env.PRIMARY_LIGHT_COLOR,
					paragraphColor: process.env.PARAGRAPH_COLOR,
					headingColor: process.env.HEADING_COLOR,

				}
				userData['adminprofileUrl'] = ""
				userData['adminfaviconUrl'] = ""
				userData['Color'] = customizationData
				myStore.updateStoreData("userData", userData)
			}

		});

	}

	useEffect(() => {
		if (process.env.PRIMARY_COLOR || myStore?.userData?.Color?.primaryColor) {
			document.documentElement.style.setProperty('--primaryColor', (myStore?.userData?.Color?.primaryColor) ? myStore?.userData?.Color?.primaryColor : process.env.PRIMARY_COLOR)
		}
		if (process.env.SECONDARY_COLOR || myStore?.userData?.Color?.secondaryColor) {
			document.documentElement.style.setProperty('--div_bgColor', (myStore?.userData?.Color.secondaryColor) ? myStore?.userData?.Color?.secondaryColor : process.env.SECONDARY_COLOR)
		}
		if (process.env.BODY_COLOR || myStore?.userData?.Color?.bodyColor) {
			document.documentElement.style.setProperty('--div_bgColor2', (myStore?.userData?.Color?.bodyColor) ? myStore?.userData?.Color?.bodyColor : process.env.BODY_COLOR)
		}
		if (process.env.PRIMARY_LIGHT_COLOR || myStore?.userData?.Color?.primaryLightColor) {
			document.documentElement.style.setProperty('--div_bgColor2', (myStore?.userData?.Color?.primaryLightColor) ? myStore?.userData?.Color?.primaryLightColor : process.env.PRIMARY_LIGHT_COLOR)
		}
		if (process.env.PARAGRAPH_COLOR || myStore?.userData?.Color?.paragraphColor) {
			document.documentElement.style.setProperty('--pColor', (myStore?.userData?.Color?.paragraphColor) ? myStore?.userData?.Color?.paragraphColor : process.env.PARAGRAPH_COLOR)
		}
		if (process.env.HEADING_COLOR || myStore?.userData?.Color?.headingColor) {
			document.documentElement.style.setProperty('--headdingColor', (myStore?.userData?.Color?.headingColor) ? myStore?.userData?.Color?.headingColor : process.env.HEADING_COLOR)
		}
	}, [router?.pathname, myStore])


	const { token, role } = myStore.userData || {},
		userAccessList = [
			'/dashboard',
			'/create_post',
			'/calendar',
			'/image_editor/image_edit',
			'/Integrations',

		],
		userTemplateAccessList = [
			'/admin/templates',
			'/admin/assets',
		],
		signOut = () => {

			Router.push("/login");
		};


	let adminUrl = router.pathname.split("/admin/").length >= 2 ? 1 : 0;
	let userUrl = userAccessList.includes(router.pathname);
	let userTemplateUrl = userTemplateAccessList.includes(router.pathname);

	let adminDashboard = "/admin/dashboard";
	let userDashboard = "/dashboard";
	let userTemplate = "/admin/templates";

	let tokenCookie = Cookies.get("authToken") ? Cookies.get("authToken") : false


	if (withoutAuthList.includes(router.pathname)) {

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
		} else if (token && tokenCookie && token != tokenCookie) {
			signOut();
		} else {
			if (tokenCookie && token && isAuthPage) {

				Router.push(role == 'Admin' ? adminDashboard : userDashboard);
			} else {
				if (role == 'Template Creator' && userUrl) {
					Router.push(userTemplate);
				} else {
					if (role == 'User' && adminUrl) {
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
					<link rel="shortcut icon" href={(myStore.userData.adminfaviconUrl) ? myStore.userData.adminfaviconUrl : "../assets/images/favicon.png"} />
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
					].includes(router.pathname) ? ("") : (
					<>
						{(router.pathname.includes("/editor") || router.pathname.includes("/create_image")) ? "" :
							<Header />
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

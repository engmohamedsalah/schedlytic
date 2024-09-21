import svg from "@/components/svg";
import { useEffect, useState } from "react";
import { NoDataWrapper, common } from '@/components/Common';
import { useLinkedIn } from "react-linkedin-login-oauth2";
import ConfirmationPopup from "../common/ConfirmationPopup";
import {getNameInitials} from "@/components/utils/utility"

export default function AddSocailAccount() {
	const [selectedAcc, setSelectedAcc] = useState("Facebook")
	const [facebookDetails, setFacebookDetails] = useState([])
	const [linkedInDetails, setLinkedInDetails] = useState([])
	const [instagramDetails, setInstagramDetails] = useState([])
	const [twitterDetails, setTwitterDetails] = useState([])
	const [pinterestDetails, setPinterestDetails] = useState([])
	const [isRemoveAction, setIsRemoveAction] = useState(false);
	const [isRemoveActionIndex, setIsRemoveActionIndex] = useState(false);
	const [deleteAcc, setDeleteAcc] = useState();
	const [isLoading, setIsLoading] = useState(false)

	const selectAccount = (name) => {
		setSelectedAcc(name)
	}

	const openLoginPAge = (accName) => {
		if (accName === "Facebook") {
			facebookLogin();
		} else if (accName === "Instagram") {
			instagramLogin();
		}
		else if (accName === "LinkedIn") {
			linkedInLogin();
		}
		else if (accName === "Pinterest") {
			pinterestLogin();
		}
	}

	useEffect(() => {
		getSocialAccounts()
	}, [])

	useEffect(() => {
		window.fbAsyncInit = function () {
			FB.init({
				appId: process.env.FACEBOOK_APP_ID,
				cookie: true, 
				xfbml: true,
				version: "v17.0", 
			})
			FB.getLoginStatus(function (response) {
			
			});
		};
		(function (d, s, id) {
			var js,
				fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {
				return;
			}
			js = d.createElement(s);
			js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		})(document, "script", "facebook-jssdk");
	}, []);


	const getSocialAccounts = () => {
		setIsLoading(true)
            common.getAPI({
				method: 'GET',
				url: 'auth',
				data: {
					action: "getSocial"
				},
	
			}, (resp) => {
				setIsLoading(false)
				if (resp.status) {
					Object.keys(resp.data).map(val => {
						if (val === "facebook") {
							setFacebookDetails(resp.data[val])
						} else if (val === "linkedin") {
							setLinkedInDetails(resp.data[val])
						} else if (val === "pinterest") {
							setPinterestDetails(resp.data[val])
						} else if (val === "twitter") {
							setPinterestDetails(resp.data[val])
						} else if (val === "instagram") {
							setInstagramDetails(resp.data[val])
						}
					})
				}
			})
	}


	function getFacebookPages(accessToken) {
		return new Promise((resolve, reject) => {
			FB.api(
				"/me/accounts",
				"GET",
				{
					fields: "id,name,access_token,connected_instagram_account,pages_show_list,profile_pic ",
					limit: "1000",
					access_token: accessToken,
				},
				function (response) {
					resolve(response);
				}
			);
		});
	}
	function getFacebookUserDetails(accessToken) {
		return new Promise((resolve, reject) => {
			FB.api(
				"/me?fields=id,name,email",
				"GET",
				{ access_token: accessToken },
				function (response) {
					resolve(response);
				}
			);
		});
	}

	function getProfileImage(accessToken,id){
	   return new Promise((resolve, reject) => {
		FB.api(
			`/${id}/picture?redirect=0`,"GET",	{ access_token: accessToken },
			function (response) {
			  if (response && !response.error) {
				resolve(response);
			  }
			}
		);
	})
}

	const facebookLogin = () => {

		window.FB.login(function (response) {
			if (response.status == "connected") {
				let authresponse = response.authResponse;
				let path = "oauth/access_token";
				let method = "GET";
				let params = {
					grant_type: "fb_exchange_token",
					client_id: process.env.FACEBOOK_APP_ID,
					client_secret: process.env.FACEBOOK_SECRET_KEY,
					fb_exchange_token: authresponse.accessToken,
				};
				let callback = async (result) => {
					let accessToken = result.access_token;
					let facebookUserDetails = await getFacebookUserDetails(
						accessToken
					);
					let profiledata =await getProfileImage(accessToken,facebookUserDetails.id)
					let facebookPages = await getFacebookPages(accessToken);
					if (facebookUserDetails && facebookPages) {
						let facebook = {
							...facebookUserDetails,
							profile_image : profiledata.data.is_silhouette == false ? profiledata.data.url :"",
							access_token: accessToken,
							facebookPages: facebookPages.data,
						};
						common.getAPI(
							{
								method: "POST",
								url: "social",
								isLoader: true,
								data: {
									type: "facebook",
									data: facebook,

								},
							},
							(resp) => {
								getSocialAccounts()
							}
						);
					}
				};
				window.FB.api(path, method, params, callback);
			}
		}, {
			scope: "email,manage_fundraisers,read_insights,publish_video,catalog_management,pages_manage_cta,pages_manage_instant_articles,pages_show_list,read_page_mailboxes,ads_management,ads_read,business_management,pages_messaging,pages_messaging_subscriptions,instagram_basic,instagram_manage_comments,instagram_manage_insights,instagram_content_publish,leads_retrieval,whatsapp_business_management,instagram_manage_messages,page_events,pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_manage_ads,pages_manage_posts,pages_manage_engagement,whatsapp_business_messaging,instagram_shopping_tag_products",
		});
		getSocialAccounts()
	}


	function instagramLogin() {
		window.FB.login(
			function (response) {
				if (response.status == "connected") {
					let authresponse = response.authResponse;
					let path = "oauth/access_token";
					let method = "GET";
					let params = {
						grant_type: "fb_exchange_token",
						client_id: process.env.FACEBOOK_APP_ID,
						client_secret: process.env.FACEBOOK_SECRET_KEY,
						fb_exchange_token: authresponse.accessToken,
					};
					let callback = async (result) => {
						let accessToken = result.access_token;
						let facebookUserDetails = await getFacebookUserDetails(
							accessToken
						);
				
						let facebookPages = await getFacebookPages(accessToken);
						let profiledata =await getProfileImage(accessToken,facebookUserDetails.id)
						if (facebookUserDetails && facebookPages) {
							let instagrampage = {};
							facebookPages.data.forEach((p) => {
								if (p.connected_instagram_account) {
									instagrampage = {
										pageID: p.id,
										instagramID:p.connected_instagram_account.id,
										pageToken: p.access_token,
										name: p.name,
									};
								}
							});

							if (instagrampage.instagramID) {
								let instagram = {
									...facebookUserDetails,
									profile : profiledata.data,
									access_token: accessToken,
									instagrampage: instagrampage,
								};
								common.getAPI(
									{
										method: "POST",
										url: "social",
										isLoader: true,
										data: {
											type: "instagram",
											data: instagram,
										},
									},
									(resp) => {
										getSocialAccounts()
									}
								);
							} else {

							}
						}
					};
					window.FB.api(path, method, params, callback);
				}
			},
			{
				scope: "email,pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish",
			}
		);
	}

	const { linkedInLogin } = useLinkedIn({
		clientId: process.env.LINKEDIN_CLIENT_ID,
		redirectUri: `${window.location.origin}/social/linkedin`, 
		scope: "openid,profile,w_member_social,email",
		onSuccess: (code) => {
			common.getAPI(
				{
					method: "POST",
					url: "social",
					isLoader: true,
					data: {
						type: "linkedin",
						code: code,
						redirect_uri: `${window.location.origin}/social/linkedin`,
					},
				},
				(resp) => {
					getSocialAccounts()
				}
			);
		},
		onError: (error) => {
		},
	});

	let getWindowTopLeft = (w, h) => {
		const dualScreenLeft =
			window.screenLeft !== undefined
				? window.screenLeft
				: window.screenX;
		const dualScreenTop =
			window.screenTop !== undefined ? window.screenTop : window.screenY;

		const width = window.innerWidth
			? window.innerWidth
			: document.documentElement.clientWidth
				? document.documentElement.clientWidth
				: screen.width;
		const height = window.innerHeight
			? window.innerHeight
			: document.documentElement.clientHeight
				? document.documentElement.clientHeight
				: screen.height;

		const systemZoom = width / window.screen.availWidth;
		const left = (width - w) / 2 / systemZoom + dualScreenLeft;
		const top = (height - h) / 2 / systemZoom + dualScreenTop;
		return { top, left };
	};

	

	function getPinterestBoardList(access_token) {
		return new Promise((resolve, reject) => {
			common.getAPI(
				{
					method: "GET",
					url: "social-pintrest",
					isLoader: false,
					data: {
						access_token: access_token,
						type: "pinterest"
					},
				},
				(resp) => {
					if (resp.data.items && resp.data.items.length) {
						let pageList = [];
						resp.data.items.forEach((p) => {
							pageList.push({
								label: p.name,
								value: p,
							});
						});
						resolve(resp.data.items);
						getSocialAccounts()
					} else {
						resolve([]);
					}
				}
			);
		});
	}

	let pinterestLogin = async () => {
		let { top, left } = getWindowTopLeft(500, 1080);
		try {
			let redirect_url = process.env.LIVE_URL+`/api/social-pintrest`;

			let scope = `boards:write,boards:write_secret,boards:read,boards:read_secret,pins:read,pins:read_secret,pins:write,pins:write_secret,user_accounts:read`;

			let redirect = `https://www.pinterest.com/oauth/?client_id=${process.env.PINTEREST_APP_ID}&redirect_uri=${redirect_url}&response_type=code&scope=${scope}`;

			let win = window.open(
				redirect,
				"",
				`width=500,height=1080,top=${top},left=${left}`
			);

			let onwinclose = setInterval(async () => {
				if (win.closed) {
					let authresponse = localStorage.getItem("authresponse");
					if (authresponse) {
						let json = JSON.parse(authresponse);
						let d1 = localStorage.removeItem("authresponse");
						let boardList = await getPinterestBoardList(
							json.access_token
						);

						if (boardList) {
							json.boardList = boardList;
							common.getAPI(
								{
									method: "POST",
									url: "social",
									isLoader: true,
									data: {
										type: "pinterest",
										data: json,
									},
								},
								(resp) => {
									getSocialAccounts()
								}
							);
						}

					}
					clearInterval(onwinclose);
				}
			}, 1000);
		} catch (e) {
	
		}
	}

	const handleDeleteEvent = (acc, index) => {
		setDeleteAcc(acc._id)
		setIsRemoveAction(acc._id)
		setIsRemoveActionIndex(index)
	}

	const handleUpdateEvent = (acc, i) => {
		if (acc.type === "facebook") {
			facebookLogin();
		} else if (acc.type === "linkedin") {
			linkedInLogin();
		} else if (acc.type === "pinterest") {
			pinterestLogin();
		} else if (acc.type === "instagram") {
			instagramLogin();
		} else if (acc.type === "Twitter") {

		}
	} 


	const showAccDetails = () => {
		let data = [];
		if (selectedAcc === "Facebook") {
			data = facebookDetails
		} else if (selectedAcc === "LinkedIn") {
			data = linkedInDetails
		} else if (selectedAcc === "Pinterest") {
			data = pinterestDetails
		} else if (selectedAcc === "Instagram") {
			data = instagramDetails
		} else if (selectedAcc === "Twitter") {
			data = twitterDetails
		}

		if (data.length > 0) {
			return <>
				{data.length > 0 && data.map((acc, i) => {
					return <div key={i} className="rz_acc_card">
						<div className="rz_acc_card_div">
						{acc?.data?.profile_image ? <div className='rz_acc_card_pro_box'>
								<img src={acc.data.profile_image} />
							</div> :  <div className='ps_acc_card_pro_box' style={{ "background": "#1877F2" }}> {getNameInitials(acc.data?.name)}</div>}
							<h6 className="">{acc.data.name}</h6>
						</div>
						<div className="ps_droptoggle">
						<div className="rz_acc_card_del" onClick={() => handleDeleteEvent(acc, i)}>{svg.app.deleteIcon} <span className="rz_tooltipEle">Delete</span></div>
						<div className="rz_acc_card_edit" onClick={() => handleUpdateEvent(acc,i)}>{svg.app.reload}<span className="rz_tooltipEle">Reconnect</span></div>
						</div>
						
					</div>
				})}
			</>
		}else {
			if(!isLoading){
				return <div className="rz_acc_card ps_margin_box">
				<div className="rz_acc_empty_acc">
					{svg.app.empty_box} <span>No Accounts Added</span>
				</div>

			</div>
			} else {
				return <NoDataWrapper
				isLoading={isLoading}
				blockCount="2"
				height={"30"}
				width="200"
				className="col-12"
				section="media"
			/>
			}
		 	
		}


	}

	const handleRemoveAcc = (selectedAcc, isRemoveAction) => {
		if (selectedAcc === "Facebook") {
			facebookDetails.splice(isRemoveActionIndex, 1)
			setFacebookDetails([...facebookDetails])
			setIsRemoveActionIndex(false)
		} else if (selectedAcc === "LinkedIn") {
			linkedInDetails.splice(isRemoveActionIndex, 1)
			setLinkedInDetails([...linkedInDetails])
			setIsRemoveActionIndex(false)
		} else if (selectedAcc === "Pinterest") {
			pinterestDetails.splice(isRemoveActionIndex, 1)
			setPinterestDetails([...pinterestDetails])
			setIsRemoveActionIndex(false)
		} else if (selectedAcc === "Instagram") {
			instagramDetails.splice(isRemoveActionIndex, 1)
			setInstagramDetails([...instagramDetails])
			setIsRemoveActionIndex(false)
		} else if (selectedAcc === "Twitter") {
			twitterDetails.splice(isRemoveActionIndex, 1)
			setTwitterDetails([...twitterDetails])
			setIsRemoveActionIndex(false)
		}
	}


	return (
		<>
			

			<div className='rz_dashboardWrapper' >
				<div className="ps_integ_conatiner">
					<div className=' welcomeWrapper'>


						<div className="dash_header pb-md-5 pb-2">
							<h2>Connect Your Social Accounts</h2>
						</div>

						<div className="row">
							<div className='col-lg-3 col-md-4 '>
								<div className="rz_socail_platform_bg ">
									<div className="rz_socail_platform">
										<div className={`rz_platform_box  ${selectedAcc === "Facebook" ? 'active_social_account' : ""}`} style={{ background: "#DBE3FF" }} onClick={() => selectAccount("Facebook")}>
											<div className="dash_icon_box" style={{ "background": "#1877F2" }}>
												{svg.app.facebook}
											</div>
											<h6 className='mr-auto'>Facebook</h6>
										</div>
									</div>
									<div className="rz_socail_platform">
										<div className={`rz_platform_box  ${selectedAcc === "Instagram" ? 'active_social_account' : ""}`} style={{ background: "#FFE3F5" }} onClick={() => selectAccount("Instagram")}>
											<div className="dash_icon_box" style={{ "background": "#E4405F" }}>
												{svg.app.instagram}
											</div>
											<h6 className='mr-auto'>Instagram</h6>
										</div>
									</div>
									<div className="rz_socail_platform">
										<div className={`rz_platform_box  ${selectedAcc === "LinkedIn" ? 'active_social_account' : ""}`} style={{ background: "#D2E9FF" }} onClick={() => selectAccount("LinkedIn")}>
											<div className="dash_icon_box" style={{ "background": "#0A66C2" }}>
												{svg.app.linkedin}
											</div>
											<h6 className='mr-auto'>LinkedIn</h6>
										</div>
									</div>
									<div className="rz_socail_platform">
										<div className={`rz_platform_box  ${selectedAcc === "Pinterest" ? 'active_social_account' : ""}`} style={{ background: "#FFE2E4" }} onClick={() => selectAccount("Pinterest")}>
											<div className="dash_icon_box" style={{ "background": "#BD081C" }}>
												{svg.app.pinterst}
											</div>
											<h6 className='mr-auto'>Pinterest</h6>
										</div>
									</div>
								</div>
							</div>
							{selectedAcc ? <div className="col-lg-9 col-md-8 mt-md-0 mt-3 ">
								<div className="rz_socail_platform_bg  ">
									<div className="text-center ">
										<h4>{` ${selectedAcc} Accounts`}</h4>
									</div>
									<div className="rz_socail_platform_box">
										{showAccDetails()}
									</div>
									<div className="mt-3 d-flex justify-content-center">
										<div><a className='rz_addAccBtn'  onClick={() => { 
											if(process.env.TYPE=="demo")
											{
												return
											}
											openLoginPAge(selectedAcc) 
											}} >Add New Account +</a></div>
									</div>
								</div>
							</div> : ""}
						</div>
					</div>
				</div>

			</div >

			<ConfirmationPopup
				shownPopup={isRemoveAction}
				closePopup={() => setIsRemoveAction(false)}
				type={"Social Account"}
				removeAction={() => {
					common.getAPI({
						method: 'DELETE',
						url: 'social',
						data: {
							target: isRemoveAction
						},
					}, (resp) => {
						handleRemoveAcc(selectedAcc, isRemoveAction)
						getSocialAccounts()
						setIsRemoveAction(false)
					});
				}}
			/>

		</>
	)
}
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import moment from "moment";
import Router from 'next/router'
import { appStore } from "@/zu_store/appStore";
import ContentLoader, {
	BulletList,
	
} from "react-content-loader";


export let common = {
	convertBytes: (bytes) => {
		const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

		if (bytes == 0) {
			return `0 ${sizes[2]}`;
		}

		const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

		if (i == 0) {
			return bytes + " " + sizes[i];
		}

		return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
	}, 
	getAPI: async (params, cb, cb2 = null) => {
		if(!params.url){
			return;
		}
		let nav = navigator || null;
		if(nav && !nav.onLine){
			toast.error('Please check your internet connection or try again later.');
			if(cb2){
				cb2();
			}
			return;
		} 
		
		var detail = {
			method: params.method,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"Cache-Control": "no-cache",
				mode: "no-cors", 
			},
		};

		if (params.isFormData) {
			detail.headers = {};
			detail["body"] = params.data;
		} else if (
			params.method === "post" ||
			params.method === "POST" ||
			params.method === "patch" ||
			params.method === "PATCH" ||
			params.method === "put" ||
			params.method === "PUT"
		) {
			detail["headers"] = {
				"Content-Type": "application/json",
				"Cache-Control": "no-cache",
			};
			detail["body"] = JSON.stringify(params.data);
		} else {
			if (Object.keys(params.data).length) {
				var str = [];
				for (var p in params.data) {
					if (params.data.hasOwnProperty(p)) {
						str.push( encodeURIComponent(p) + "=" + encodeURIComponent(params.data[p]) );
					}
				}

				if (params.url.indexOf("?") !== -1) {
					params.url += "&" + str.join("&");
				} else {
					params.url += "?" + str.join("&");
				}
			}
		}

		if (!params.url.includes("stripe") && !params.url.includes("paypal") && !params.url.includes("subscription-plan") && 
			params.url.split("auth").length <= 1 &&
			params.url.split("get-user-template-for-thumb").length <= 1 &&
			typeof Cookies.get("authToken") == "undefined" &&
			params.requireAuth != false
		) {
			Router.push("/");
			return false;
		}

		detail["headers"]["Authorization"] = "Bearer " + Cookies.get("authToken");

		let urlRegex = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)?/;
		params.url = urlRegex.test(params.url) ? params.url : process.env.API_URL + params.url;
		common.manageLoader(params, true);
		try {
			await fetch(params.url, detail)
				.then((res2) => res2.json())
				.then((resp) => {
					common.manageLoader(params, false);
					if (resp.status) {
						if (resp.message && resp.message != "") {
							toast.success(resp.message);
						}
						cb(resp);
						return resp;
					} else {
						if (resp.message && resp.message != "") {
							toast.error(resp.message);
							if(resp.message=="jwt expired"){
								appStore.getState().logout()
								router.push('/login');
							}
						}

						if (cb2 != null) {
							cb2(resp);
						}
					}
				});
		} catch (error) {
			common.manageLoader(params, false);

			if (cb2 != null) {
				cb2(error);
			}
		}
	},

	manageLoader: (params, status) => {
		if ( typeof params == "object" && "isLoader" in params && params.isLoader == false ) {
			return;
		}

		if ( !["GET", "get"].includes(params.method) || (params.hasOwnProperty("isLoader") && params.isLoader == true) ) {
			let t = document.querySelector("#siteLoader");
			if (t) {
				status ? t.classList.add("overlayLoader") : t.classList.remove("overlayLoader");
			}
		}
	},

	loadTableData: (params, cb) => {
		common.getAPI(
			{
				method: "GET",
				url: params.url,
				data: params.data,
			},
			(resp) => {
				cb({
					data: resp.data,
					fetchCount: resp.data.length,
					totalRecord: resp.totalRecord,
				});
			}
		);
	},
	tableNumCnt: (currentPage, dataPerPage) => {
		return currentPage == 1
			? 1
			: currentPage * dataPerPage - dataPerPage + 1;
	},
	dateFormatter: (date, formate = "D MMM YYYY h:mm A") => {
		return moment(date).format(formate);
	},
	copyData: (data) => {
		copy(data.target);
		toast.success(data.type + " copied successfully.");
	},
};

export let NoDataWrapper = (props) => {
	let myLoader = {
		cateListInAdmin: <BulletList />,

		blocks: (
			< >
				{props.blockCount
					? Array.from(Array(parseInt(props.blockCount)).keys()).map(
							(i) => {
								let manageSml = 65,
								height = props.height ? props.height-manageSml : 360,
								width = props.width ? props.width : 360;
								return (
									<ContentLoader
										viewBox={`0 0 ${width} ${parseInt(height)+parseInt(manageSml)}`}
										speed="2"
										backgroundColor={"#fff"}
										className={props.className}
										key={i}
									>
										<rect x="0" y="0" rx="5" ry="5" width={width} height={height} className="bg-light" />
									</ContentLoader>
								);
							}
					  )
					: ""}
			</>
		),
		media: (
			< >
				{props.blockCount
					? Array.from(Array(parseInt(props.blockCount)).keys()).map(
							(i) => {
								let manageSml = 65,
								height = props.height ? props.height-manageSml : 360,
								width = props.width ? props.width : 360;
								return (
									<ContentLoader
										viewBox={`0 0 ${width} ${parseInt(height)+parseInt(manageSml)}`}
										speed="2"
										backgroundColor={"#dedede"}
										className={props.className}
										key={i}
									>
										<rect x="0" y="0" rx="5" ry="5" width={props.width} height={props.height} className=" bg-light" />
									</ContentLoader>
								);
							}
					  )
					: ""}
			</>
		),
		editor: (
			< >
				<ContentLoader
					viewBox={`0 0 ${props.width} ${parseInt(props.height)}`}
					speed="2"
					backgroundColor={"#dedede"}
					className={props.className}
				>
					<rect x="0" y="0" rx="5" ry="5" width={'1200px'} height={'70px'} className=" bg-light" />
					<rect x="0" y="95" rx="150" ry="0" width={'150px'} height={'650px'} className=" bg-light" />
					<rect x="170" y="95" rx="750" ry="0" width={'650px'} height={'650px'} className=" bg-light" />
					<rect x="850" y="95" rx="350" ry="0" width={'350px'} height={'650px'} className=" bg-light" />
				</ContentLoader>
			</>
		),
		table: (
			<tr>
				<td colSpan={props.colspan}>
					<ContentLoader
						viewBox="0 0 1100 70"
						backgroundColor={"#dedede"}
					>
						<rect
							x="0"
							y="15"
							rx="5"
							ry="5"
							width="100%"
							height="25px"
						/>
						<rect
							x="0"
							y="45"
							rx="5"
							ry="5"
							width="100%"
							height="25px"
						/>
						<rect
							x="0"
							y="95"
							rx="5"
							ry="5"
							width="100%"
							height="25px"
						/>
					</ContentLoader>
				</td>
			</tr>
		),
	};

	return (
		<>
			{props.isLoading ? (
				myLoader[props.section]
			): props.dataCount ? <></>
			
			: props.section == "table" ? (
				<tr>
					<td colSpan={props.colspan}> Data not found.</td>
				</tr>
			) : props.section == "cateListInAdmin" ? (
				<p className="spv-dataNotFound_dv"> Data not found.</p>
			) : (
				<div className="spv-no-ticket-wrapper pt-5 pb-5 ">
					<div className="spv-blnk-ticket-info text-center">
						<img src="/assets/images/Noresults.png" alt="" />
						<h4>{props.title ? props.title : "Data not found."}</h4>
						<p>{props.subTitle ? props.subTitle : ""}</p>
					</div>
				</div>
			)}
		</>
	);
};

export let LoadMoreBtn = (props) => {
	return (
		<>
			{props.status || props.isLoading ? (
				<div className="spv-load-more-tickets text-center">
					<a className="spv-btn spv-load-btn" onClick={props.onClick}>
						{props.isLoading ? "Loading..." : "Load More"}
					</a>
				</div>
			) : (
				""
			)}
		</>
	);
};
 

export let getRandomChar = () => {
	return Math.random().toString(36).slice(-8);
};

export let getStrongPassword = (minLength = 5) => {
	let passList = [
		"!@#$%^&*()_+{}:\"<>?|[];',./`~", 
		"abcdefghijklmnopqrstuvwxyz", 
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ", 
		"0123456789", 
	];
	var password = "";
	let j = 0;
	for (let i = 0; i <= minLength; i++) {
		let t = passList[j];
		password += t[Math.floor(Math.random() * t.length)];
		j = j >= passList.length - 1 ? 0 : j + 1;
	}

	return password;
};

export const convertToCSV = (objArray) => {
	var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
	var str = "";
	for (var i = 0; i < array.length; i++) {
		var line = "";
		for (var index in array[i]) {
			if (line != "") line += ",";
			line += '"' + array[i][index] + '"';
		}
		str += line + "\r\n";
	}
	return str;
};

export const exportCSVFile = (headers, items, fileTitle) => {
	var jsonObject = JSON.stringify(items);
	var csv = convertToCSV(jsonObject);

	var exportedFilenmae = fileTitle + ".csv" || "export.csv";
	var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	if (navigator.msSaveBlob) {
		
		navigator.msSaveBlob(blob, exportedFilenmae);
	} else {
		var link = document.createElement("a");
		if (link.download !== undefined) {
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", exportedFilenmae);
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
};

export const convertQueryStringToObj = (path) => {
	let querySt = {};
	let qString = path.split("?") || [];
	if (qString.length > 1) {
		let p = qString[1].split("&");
		p.map((d, i) => {
			let t = d.split("=");
			querySt[t[0]] = t[1];
		});
	}

	return querySt;
};
 

export const loadFont = (fontAry = []) => {
	if (fontAry.length) {
		let fontList = "";
		fontAry.map((f) => {
			fontList += `${encodeURIComponent(
				fontList != "" ? "|" : ""
			)}${f.replace(" ", "+")}`;
		}); 
		var stylesheet = document.createElement("link");
		stylesheet.rel = "stylesheet";
		stylesheet.class = "myFonts";
		stylesheet.href = "https://fonts.googleapis.com/css?family=" + fontList;
		stylesheet.crossOrigin = "anonymous";
		document.head.appendChild(stylesheet);
	}
}; 

export let manageScroll = (e , cb)  => {
    let targetScrollHeight = e.target.scrollHeight - e.target.clientHeight;
    if(e.target.scrollTop >= targetScrollHeight){
        cb();
    }
};

export function Pagination(props){
    let prePostCnt = 2; 
	let {totalRecords , perPage , isLoading, currentPage, type, dataRange , onClick} = props;
    let paginationButton = []
    let pageCnt = 1;
    for(let i = 1; i <= parseInt(totalRecords) ; i = i+parseInt(perPage)){
        paginationButton.push(pageCnt++);
    }
    
    return (
        <>
            {
                !isLoading?
					<div className="rz_pagination">
						<div className="rz_headPagination">
							<p>{'Showing ' + dataRange.start + ' To '+dataRange.end+' Of '+ totalRecords}</p>
						</div>
						<div className="rz_pageBox">
							{
								paginationButton.length?
									<a key="0" onClick={(e) => {
										onClick(1);
									}} className={'rz_next '+(currentPage == 1?'disabled':'')} disabled>First</a>:''

							}


							{
								paginationButton.map((pageNum) => {

									if(pageNum > parseInt(currentPage)+prePostCnt || parseInt(pageNum)+prePostCnt < parseInt(currentPage)){
										if(pageNum == 1 || pageNum == paginationButton.length){
											return <span key={pageNum} className={''}>...</span>;
										}else{
											return;
										}
									}
									return (
										<a key={pageNum} className={currentPage == pageNum?'active':''} onClick={(e) => {
											onClick(pageNum);
										}}>{pageNum}</a>
									)
								})
							}

							{
								paginationButton.length?
									<a key={paginationButton.length+1} onClick={(e) => {
										onClick(paginationButton.length);
									}} className={'rz_next '+(currentPage == paginationButton.length?'disabled':'')}>Last</a> 
								:<></>
							} 
						</div> 
					</div>
                :<></>
            }
            

        </>
    )
}


export function setMyState(setQuery, params ) {
	for (const key in params) {
		setQuery((prevState) => ({
			...prevState,
			[key]: params[key],
		}));
	}
}



export async function authAction(type , data , cb) {

    if(type == 'Login' || type == 'loginAdminAsUser' || type == 'loginAdminAsAdmin'){
        let targetUrl = {
        Login : 'auth',
        loginAdminAsUser : 'auth/login_admin_as_user',
        loginAdminAsAdmin : 'auth/login_admin_as_admin',
        } 
        
        await common.getAPI({
            isLoader : true,
            url : targetUrl[type],
            method : 'GET',
            data : data
        }, (resp) => {
			let respData = resp.data
			cb(respData);
			Cookies.set('authToken', respData.token , { expires: 1 })
			Router.push(respData.role == 'Admin'?"/admin/dashboard": respData.role == 'User' ? "/dashboard" : "/admin/templates");
        } , (resp) => {
        	cb(resp);
        });
    

    }else if(type == 'forgot-password'){
        await common.getAPI({
            isLoader : true,
            url : 'auth',
            method : 'GET',
            data : {
                email : data.email,
				action : type,
            }
        }, (resp) => {
			cb(resp);
        } , () => {
        	cb();
        });
    }else if(type == 'reset-password'){
        await common.getAPI({
            isLoader : true,
            url : 'auth/reset-password',
            method : 'post',
            data : {
                confirmPassword : data.confirmPassword,
                password : data.password,
                resetId : data.resetId,
                token : data.token,
            }
        }, (resp) => {
			cb();
			Router.push("/auth/login");
        } , () => {
        	cb();
        });
    } 
}


export function resetLoginDataRedux(respData){
   Cookies.set('authToken', respData.token , { expires: 1 });
   myStore.updateStoreData('userData' , {});
}

export function logout(cb){
   Cookies.remove('authToken')
   Router.push("/login");  
   cb();
}

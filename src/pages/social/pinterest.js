import { useRouter } from "next/router";
import { useEffect } from "react";

const Pinterest = () => {
	const router = useRouter();
	useEffect(() => {
		if (Object.keys(router.query).length) {
			localStorage.setItem("authresponse", JSON.stringify(router.query));
			window.close();
		}
	}, [router.query]);

	return <div>Enter</div>;
};

export default Pinterest;

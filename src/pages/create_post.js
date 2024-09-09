import CreatePost from "@/components/post/CreatePost";
import SelectSocailAccount from "@/components/post/SelectSocailAccount";
import { useState } from "react";
import { appStore } from '@/zu_store/appStore';
import Head from "next/head";


export default function AddPost() {

    let myStore = appStore(state => state);
    let storePostData = myStore.postData;


    const showPostFormStep = () => {
        if (!storePostData?.step) {
            return <CreatePost />
        } else {
            return <SelectSocailAccount />
        }
    }

    return (
        <>
            <Head>
                <title>{process.env.SITE_TITLE}- Create Post</title>
            </Head>
            {showPostFormStep()}
        </>
    )
}


import Head from 'next/head'
import React from 'react'
import AddSocailAccount from '@/components/post/AddSocailAccount';


export default function settings() {
    return (
        <>
            <Head>
                <title>{process.env.SITE_TITLE}- Integrations</title>
            </Head>

            <AddSocailAccount />
        </>
    )
}

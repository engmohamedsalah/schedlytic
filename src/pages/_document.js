import { Html, Head, Main, NextScript } from 'next/document' 

export default function Document() {

    return (
        <Html lang="en">
        <Head >
            <meta httpEquiv="cache-control" content="max-age=0" />
            <meta httpEquiv="cache-control" content="no-cache" />
            <meta httpEquiv="expires" content="0" />
            <meta httpEquiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
            <meta httpEquiv="pragma" content="no-cache" />
        </Head>
        <body>
            <Main />
            <NextScript />
        </body>
        </Html>
    )
}

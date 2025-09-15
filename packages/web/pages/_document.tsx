// pages/_document.js
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-theme="synthwave">
      <Head>
        {/* Font Awesome CDN */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

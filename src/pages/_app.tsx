import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import Theme from "../styles/ChakraTheme";
import Head from "next/head";
import "../styles/Globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Itixo parking</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ChakraProvider theme={Theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}

import type { AppProps } from "next/app";
import { DarkModeProvider } from "../contexts/DarkModeContext";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import "../../app/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;

import type { AppProps } from "next/app";
import { DarkModeProvider } from "../contexts/DarkModeContext";
import "../../app/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DarkModeProvider>
      <Component {...pageProps} />
    </DarkModeProvider>
  );
}

export default MyApp;

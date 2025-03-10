import type { NextPage } from "next";
import Home from "./pages/Home";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const HomePage: NextPage = () => {
  return <Home />;
};

export default HomePage;

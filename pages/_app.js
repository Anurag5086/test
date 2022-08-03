import { MoralisProvider } from "react-moralis";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components/Login.css";
import "../components/NftForm.css";
import "../styles/home.css";

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider
      appId={process.env.NEXT_PUBLIC_APP_ID}
      serverUrl={process.env.NEXT_PUBLIC_SERVER_URL}
    >
      <Component {...pageProps} />
    </MoralisProvider>
  );
}
export default MyApp;

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";

// if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
//   const { worker } = require("../mocks/browser");
//   worker.start({
//     onUnhandledRequest: "warn",
//   });
// }

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;

import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
// import { getToken } from "./utils/pkce";

const root = ReactDOM.createRoot(document.getElementById("root"));

// if (window.location.pathname == "/callback/") {
//   const urlParams = new URLSearchParams(window.location.search);
//   const code = urlParams.get("code");
//   const code_verifier = localStorage.getItem("code_verifier");
//   localStorage.removeItem("code_verifier");
//   if (code && code_verifier) {
//     getToken(code, code_verifier);
//   } else {
//     console.error("Missing code or code verifier");
//     window.location.href = "/#/login";
//   }
// }

root.render(
  <HashRouter>
    <App />
  </HashRouter>
);

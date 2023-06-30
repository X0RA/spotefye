import React, { useEffect, useState } from "react";
import { getSpotifyAuthorizeUrl } from "../utils/pkce"; // You should implement these functions
import { getToken } from "../management/browserStorage";
import "./Login.css";

const Login = () => {
  useEffect(() => {
    // if we have a token then go to home
    if (getToken() !== null) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #380036, #0CBABA)",
        backgroundSize: "200% 200%",
        animation: "gradient 15s ease infinite",
      }}>
      <h1 style={{ fontSize: "2.5em", color: "#fff" }}>Login</h1>
      <p style={{ color: "#fff", textAlign: "center", maxWidth: "60%" }}>
        This app allows Spotify users to order their playlists in a new interesting way
      </p>
      <button
        onClick={async () => {
          const url = await getSpotifyAuthorizeUrl();
          window.location.href = url;
        }}
        style={{
          marginTop: "2em",
          padding: "1em 2em",
          fontSize: "1em",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          background: "#44B09E",
          cursor: "pointer",
        }}>
        Get Started
      </button>
    </div>
  );
};

export default Login;

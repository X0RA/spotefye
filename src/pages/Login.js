import React, { useEffect, useState } from "react";
import { getSpotifyAuthorizeUrl } from "../utils/pkce"; // You should implement these functions
import { getToken } from "../management/browserStorage";
import "./Login.css";
import { getAuth, signInWithRedirect, OAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDaSNO3lpnP-SiV7wrGFSejccUZMrWhetE",
  authDomain: "tenny-spotify-app.firebaseapp.com",
  projectId: "tenny-spotify-app",
  storageBucket: "tenny-spotify-app.appspot.com",
  messagingSenderId: "47963575225",
  appId: "1:47963575225:web:2c55b00da86743527d1c68",
};

const app = initializeApp(firebaseConfig);

const Login = () => {
  const auth = getAuth(app);
  const provider = new OAuthProvider("oidc.spotify");

  // Redirect to Spotify for authentication
  const signInWithSpotify = () => {
    signInWithRedirect(auth, provider);
  };

  // Check if user is redirected back from Spotify
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in!
        console.log("User signed in:", user);
      } else {
        console.log("No user signed in");
      }
    });
  }, [auth]);

  return (
    <div>
      <button onClick={signInWithSpotify}>Sign in with Spotify</button>
    </div>
  );
};

export default Login;

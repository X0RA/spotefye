// https://tenny-spotify-app.firebaseapp.com/__/auth/handler

// https://accounts.spotify.com/.well-known/openid-configuration

import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, OAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { signInWithRedirect, getRedirectResult, signInWithPopup, signInWithCredential } from "firebase/auth";
import { getToken } from "./browserStorage";

const firebaseConfig = {
  apiKey: "AIzaSyDaSNO3lpnP-SiV7wrGFSejccUZMrWhetE",
  authDomain: "tenny-spotify-app.firebaseapp.com",
  projectId: "tenny-spotify-app",
  storageBucket: "tenny-spotify-app.appspot.com",
  messagingSenderId: "47963575225",
  appId: "1:47963575225:web:2c55b00da86743527d1c68",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create an instance of the OAuth provider
const provider = new OAuthProvider("oidc.spotify");
// provider.addScope("user-read-email"); // For example, request the user's email
const credential = provider.credential({
  idToken: getToken("token"),
});

const FirebaseContext = createContext();

export function useAuth() {
  return useContext(FirebaseContext);
}

export function FirebaseProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);
  const [spotifyToken, setSpotifyToken] = useState(getToken("token"));

  useEffect(() => {
    signInWithCredential(getAuth(), credential)
      .then((result) => {
        // User is signed in.
        // IdP data available in result.additionalUserInfo.profile.
        console.log(result);

        // Get the OAuth access token and ID Token
        const credential = OAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("user", user);
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    auth,
    provider,
  };

  return <FirebaseContext.Provider value={value}>{!loading && children}</FirebaseContext.Provider>;
}

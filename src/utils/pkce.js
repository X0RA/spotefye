import axios from "axios";
import { storeData } from "../management/browserStorage";

const CLIENT_ID = "bfabf29efb754bd2a1a2ec899e2188fc";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URI = "http://localhost:3000/callback/";
// const REDIRECT_URI = "https://spotefye.web.app/callback/";
const RESPONSE_TYPE = "code";
const SCOPE =
  "streaming user-read-currently-playing user-read-playback-position user-library-modify user-top-read user-library-read user-read-email playlist-read-private user-read-private";
// const SCOPE = "user-read-private user-read-email";

export const generateRandomString = (length) => {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const generateCodeChallenge = async (codeVerifier) => {
  function base64encode(string) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return base64encode(digest);
};

export const getSpotifyAuthorizeUrl = async () => {
  return new Promise((resolve, reject) => {
    let state = generateRandomString(16);
    let codeVerifier = generateRandomString(128);
    localStorage.setItem("code_verifier", codeVerifier);
    generateCodeChallenge(codeVerifier)
      .then((codeChallenge) => {
        const params = new URLSearchParams({
          response_type: RESPONSE_TYPE,
          client_id: CLIENT_ID,
          scope: SCOPE,
          redirect_uri: REDIRECT_URI,
          state,
          code_challenge_method: "S256",
          code_challenge: codeChallenge,
        });
        const url = `${AUTH_ENDPOINT}?${params.toString()}`;
        resolve(url);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getToken = async (code, code_verifier) => {
  const data = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: code_verifier,
    client_id: "bfabf29efb754bd2a1a2ec899e2188fc",
  };

  axios
    .post("https://accounts.spotify.com/api/token", new URLSearchParams(data), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then(async (res) => {
      console.log("token data", res.data);
      await storeData("token", res.data.access_token);
      window.location.href = "/#/home";
    })
    .catch((err) => {
      console.log("Get token err", err);
      console.log("Error response data", err.response.data);
      window.location.href = "/#/login";
    });
};

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { storeData, getData } from "../management/browserStorage";
import { getToken } from "../management/browserStorage";

import moment from "moment/moment";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playlists, setPlaylists] = useState(null);
  const [token, setToken] = useState(getToken("token"));
  const [nowPlaying, setNowPlaying] = useState(null);
  const [likedSongs, setLikedSongs] = useState(null);

  const setKey = async (key, data, ttl = { ttl: 2, timeframe: "minutes" }) => {
    let store = {};
    store.data = data;
    store.time = moment.now("x");
    store.ttl = ttl;
    await key(store);
    return true;
  };

  const getKey = async (key) => {
    let data = key;
    if (data === null) {
      return null;
    }
    if (data.data == null) return null;
    if (moment(data.time, "x").isBefore(moment().subtract(data.ttl.ttl, data.ttl.timeframe))) {
      return null;
    }
    return data.data;
  };

  function logOut() {
    setToken(null);
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("code");
    window.location.href = "/#/login";
    return true;
  }

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        logOut();
        return error;
      }
      return error;
    }
  );

  //search for song
  const search = async (query, type = "track", limit = 10) => {
    console.count("Spotify Song Search");
    const { data } = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  };

  const getAudioAnal = async (id) => {
    console.count("Spotify Audio Analysis");
    const { data } = await axios.get(`https://api.spotify.com/v1/audio-analysis/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  };

  const getNowPlaying = async () => {
    const local_data = await getKey(nowPlaying);
    if (local_data == null) {
      const { data } = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKey(setNowPlaying, data, { ttl: 5, timeframe: "seconds" });
      return data;
    } else {
      return local_data;
    }
  };

  ///this is the function that gets the playlist data from the spotify api and returns it as a json object to the caller function
  //(getPlaylist) which is in the useEffect hook in the Playlist.js file in the pages folder of the src folder of the project directory (src/pages/Playlist.js)
  const getPlaylist = async (id) => {
    const data = await getData(id);
    if (data == null || data == undefined || data == []) {
      const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let totalTracks = data.tracks.total;
      if (totalTracks > 100) {
        let offset = 100;
        while (offset < totalTracks) {
          const { data: data2 } = await axios.get(
            `https://api.spotify.com/v1/playlists/${id}/tracks?offset=${offset}&limit=100`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          data.tracks.items = await data.tracks.items.concat(data2.items);
          offset += 100;
        }
      }
      storeData(id, data);
      return data;
    } else {
      return data;
    }
  };

  //change now playing song
  const changeSong = async (player_id, song_id) => {
    const { data } = await axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${player_id}`,
      {
        uris: [`spotify:track:${song_id}`],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  };

  const getAudioFeatures = async (id) => {
    const playlistData = await getPlaylist(id);
    if (playlistData.processed != true) {
      let tracks = playlistData.tracks.items;
      let trackIds = [];
      tracks.forEach((track) => {
        trackIds.push(track.track.id);
      });
      let audioFeatures = [];
      let offset = 0;
      while (offset < trackIds.length) {
        let ids = trackIds.slice(offset, offset + 100);
        const { data } = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${ids.join(",")}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        audioFeatures = audioFeatures.concat(data.audio_features);
        offset += 100;
      }
      //append audio features to playlist
      playlistData.tracks.items.forEach((track, index) => {
        track.audio_features = audioFeatures[index];
      });
      playlistData.processed = true;
      storeData(id, playlistData);
      return playlistData;
    } else {
      return playlistData;
    }
  };

  //api.spotify.com/v1/users/31hg6bbnb2mrncppk65774wpeexa/playlists
  const getPlaylists = async () => {
    const local_data = await getKey(playlists);
    console.log("Local playlist data: ", local_data);
    if (local_data == null) {
      const { data } = await axios.get("https://api.spotify.com/v1/me/playlists?limit=50", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      while (data.next != null) {
        const { data: data2 } = await axios.get(data.next, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        data.items = data.items.concat(data2.items);
        data.next = data2.next;
      }
      setKey(setPlaylists, data);
      return data.items;
    } else {
      return local_data.items;
    }
  };

  const validateToken = async () => {
    await axios
      .get("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setNowPlaying(res.data);
        return true;
      })
      .catch((err) => {
        return false;
      });
  };

  const getUserdata = async () => {
    await axios
      .get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCurrentUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
  }

  //get users saved songs
  // TODO: add grabbing of new songs from the api
  //byteCount(JSON.stringify(likedSongs)) / 1e6  >5mb then store in react storage
  const getSavedSongs = async () => {
    // const saved_data = await getData('savedSongs');
    const saved_data = await getKey(likedSongs);
    if (saved_data == null || saved_data == undefined || saved_data == []) {
      const offset = 0;
      const { data } = await axios.get(`https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      while (data.next != null) {
        const { data: data2 } = await axios.get(data.next, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        data.items = data.items.concat(data2.items);
        data.next = data2.next;
      }
      setKey(setLikedSongs, data, { ttl: 30, timeframe: "minutes" });
      return data;
    } else {
      return saved_data;
    }
  };

  useEffect(() => {
    // window.addEventListener('storage', (event) => {
    // 	console.log(event);
    // 	// if (event.key == 'token') {
    // 	// 	console.log(event.oldValue.substring(0, 10));
    // 	// 	console.log(event.newValue.substring(0, 10));
    // 	// }
    // });
    // if (token) {
    // 	getUserdata();
    // 	validateToken();
    // 	setLoading(false);
    // }
    // console.log('SPOTIFY TOKEN ' + token);
    if (token) {
      getUserdata();
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    token,
    nowPlaying,
    logOut,
    getNowPlaying,
    getPlaylists,
    getPlaylist,
    getAudioFeatures,
    validateToken,
    getSavedSongs,
    search,
    getAudioAnal,
    changeSong,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

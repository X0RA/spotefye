import { useState, useEffect } from "react";
import { useAuth } from "../management/spotify";
import Grid from "@mui/material/Grid";
import MusicPlayerSlider from "./MusicPlayer";

export default function NowPlaying() {
  const { getNowPlaying } = useAuth();
  const { nowPlaying } = useAuth();

  const [localNowPlaying, setlocalNowPlaying] = useState("");

  useEffect(() => {
    if (nowPlaying == null) {
      return;
    } else {
      setlocalNowPlaying(nowPlaying.data);
    }
  }, [nowPlaying]);

  useEffect(() => {
    getNowPlaying();
    const interval = setInterval(() => {
      getNowPlaying();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadingText = "Loading...";

  return (
    <Grid item xs={12}>
      {localNowPlaying && (
        <MusicPlayerSlider
          songTitle={localNowPlaying.item.name}
          artist={localNowPlaying.item.artists.map((artists) => artists.name + ",")}
          album={localNowPlaying.item.album.name}
          cover={localNowPlaying.item.album.images[0].url}
          id={localNowPlaying.item.id}
        />
      )}
      {!localNowPlaying && <h3>Currently not listening to anything</h3>}
    </Grid>
  );
}

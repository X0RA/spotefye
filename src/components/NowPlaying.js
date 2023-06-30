import { useState, useEffect } from "react";
import { useAuth } from "../management/spotify";
import Grid from "@mui/material/Grid";
import MusicPlayerSlider from "./MusicPlayer";

export default function NowPlaying() {
  const { getNowPlaying, nowPlaying } = useAuth();

  const [localNowPlaying, setLocalNowPlaying] = useState(null);

  useEffect(() => {
    if (nowPlaying) {
      setLocalNowPlaying(nowPlaying.data);
    }
  }, [nowPlaying]);

  useEffect(() => {
    getNowPlaying();
    const interval = setInterval(() => {
      getNowPlaying();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const renderNowPlaying = () => {
    if (localNowPlaying) {
      const { item } = localNowPlaying;
      return (
        <MusicPlayerSlider
          songTitle={item.name}
          artist={item.artists.map((artist) => artist.name).join(", ")}
          album={item.album.name}
          cover={item.album.images[0].url}
          id={item.id}
        />
      );
    } else {
      return <h3>Currently not listening to anything</h3>;
    }
  };

  return (
    <Grid item xs={12}>
      {renderNowPlaying()}
    </Grid>
  );
}

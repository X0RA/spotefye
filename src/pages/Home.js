import React, { useEffect, useState } from "react";
import NowPlaying from "../components/NowPlaying";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { experimentalStyled as styled } from "@mui/material/styles";
import { useAuth } from "../management/spotify";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function Home() {
  const { getPlaylists } = useAuth();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const playlistData = await getPlaylists();
        const updatedPlaylists = [];

        for (const playlist of playlistData) {
          if (playlist.images && playlist.images.length > 0) {
            try {
              const image = playlist.images.length === 1 ? playlist.images[0].url : playlist.images[1].url;
              playlist.image = image; // Append the image URL to the playlist object
            } catch (error) {
              console.error("Error fetching playlist image:", error);
            }
          }

          updatedPlaylists.push(playlist); // Save the modified playlist to updatedPlaylists array
        }

        setPlaylists(updatedPlaylists); // Update the state with the modified playlist data
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchData();
  }, []);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: "100%",
    overflow: "auto", // Enable scroll if the content overflows
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #380036, #0CBABA)",
        backgroundSize: "200% 200%",
        animation: "gradient 15s ease infinite",
      }}>
      <Grid container item spacing={2} sx={{ pt: 2, width: "90%", margin: "0 auto" }}>
        <NowPlaying />

        {/* Centered Heading */}
        <Grid item xs={12}>
          <h2 style={{ textAlign: "center", color: "#fff" }}>Choose a Playlist</h2>
        </Grid>

        {/* User Playlists */}
        <Grid container rowSpacing={8} spacing={2}>
          {playlists.map((playlist, index) => (
            <Grid item key={index} xs={12} sm={6} lg={3} sx={{ pt: 100 }}>
              <Item
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                  transition: "transform 0.2s ease-in-out",

                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                  // "&:before": {
                  //   content: '""',
                  //   position: "absolute",
                  //   top: 0,
                  //   right: 0,
                  //   bottom: 0,
                  //   left: 0,
                  //
                  //   backgroundSize: "cover",
                  //   backgroundRepeat: "no-repeat",
                  //   opacity: playlist.image ? 1 : 1,
                  //   zIndex: -1,
                  // },
                }}>
                <div
                  style={{
                    backgroundColor: playlist.image ? "transparent" : "white",
                    backgroundImage: `url(${playlist.image})`,
                    padding: "1em",
                    borderRadius: "8px",
                  }}>
                  <h3>{playlist.name}</h3>
                  <p style={{ textAlign: "left" }}>{playlist.description}</p>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <Button
                    variant="contained"
                    component={Link}
                    to={`/playlist/${playlist.id}`}
                    sx={{ borderRadius: "50px" }}>
                    View Playlist
                  </Button>
                </div>
              </Item>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </div>
  );
}

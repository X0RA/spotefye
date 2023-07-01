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
    position: "relative", // Add this line
    // backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: "100%",
    overflow: "auto", // Enable scroll if the content overflows
    // limit text
    display: "-webkit-box",
    "-webkit-line-clamp": 3,
    "-webkit-box-orient": "vertical",
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
                  // backgroundColor: "rgba(0,0,0, 0.2)",
                  // background: "rgba(0,0,0, 0.2)",
                  background: "linear-gradient(120deg, rgba(56, 0, 54, 0.3), rgba(12, 186, 186, 0.3))",
                  backdropFilter: "blur(10px)",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}>
                <div
                  style={{
                    zIndex: 2,
                    // backgroundColor: playlist.image ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.6)", // Apply background color with alpha channel
                    padding: "1em",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0)",
                    color: "white",
                  }}>
                  <h3 style={{ fontSize: "1.5em" }}>{playlist.name}</h3>
                  <p style={{ textAlign: "left" }}>{playlist.description}</p>
                </div>

                <Box
                  sx={{
                    position: "absolute", // Add this line
                    height: "100%",
                    width: "100%", // Add this line
                    zIndex: -1,
                    background: "rgba(0,0,0, 0.2)",
                    backgroundImage: `url(${playlist.image})`,
                    backgroundSize: "cover",
                    opacity: 0.3,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    backgroundRepeat: "no-repeat",
                  }}
                />

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

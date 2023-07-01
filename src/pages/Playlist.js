import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../management/spotify";
import MusicPlayerSlider from "../components/MusicPlayer";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import { Grid } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import Checkbox from "@mui/material/Checkbox";
import { useNavigate } from "react-router-dom";
import { whiteImageBase64, features_arr, sortTracks } from "../utils/PlaylistFunctions";

export default function Playlist() {
  let navigate = useNavigate();
  const { getAudioFeatures, sortedPlaylist, setSortedPlaylist } = useAuth();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [features, setFeatures] = useState(features_arr);

  //columns of the table
  const [columns, setColumns] = useState([
    { field: "popularity", headerName: "popularity", width: 80 },
    { field: "name", headerName: "name", width: 200 },
    { field: "artist", headerName: "artist", width: 250 },
  ]);

  //Checks that the playlist id is valid
  const id = pathname.split("/")[2];
  if (!/^[A-Za-z0-9]*$/.test(id)) {
    navigate("/");
  }

  // handleCheckboxChange updates columns state and calls
  const handleCheckboxChange = (featureName) => (event) => {
    if (event.target.checked) {
      setColumns((prevColumns) => [...prevColumns, { field: featureName, headerName: featureName, width: 100 }]);
    } else {
      setColumns((prevColumns) => prevColumns.filter((column) => column.field !== featureName));
    }
  };

  //Function that intakes the data from the API and processes it into a table readable format
  //Returns nothing but sets the rows variable to the processed data
  const processTracks = (data) => {
    let temp = [];
    let additionalFeatures = [];
    columns.forEach((column) => {
      if (column.field !== "popularity" && column.field !== "name" && column.field !== "artist") {
        additionalFeatures.push(column.field);
      }
    });
    data.tracks.items.forEach((track, index) => {
      if (track.audio_features == null) {
        return;
      }
      temp.push({
        id: track.track.id,
        name: track.track.name,
        artist: track.track.artists[0].name,
        popularity: track.track.popularity,
        uri: track.track.uri,
        preview_url: track.track.preview_url,
      });
    });
    additionalFeatures.forEach((feature) => {
      temp.forEach((track, index) => {
        temp[index][feature] = data.tracks.items[index].audio_features[feature];
      });
    });
    setRows(temp);
  };

  const handleSliderChange = (index) => (event, newValue) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], value: newValue };
    setFeatures(newFeatures);
  };

  //initial page load function
  useEffect(() => {
    // Initial function that's called on page load, gets the data from the API and calls processTracks to show them in the table and then saves the playlist data
    const savePlaylistData = async () => {
      const data = await getAudioFeatures(id);
      processTracks(data);
      setSortedPlaylist(data);
      setLoading(false);
    };
    savePlaylistData();
  }, []);

  useEffect(() => {
    if (sortedPlaylist) {
      console.log("Columns updated");
      processTracks(sortedPlaylist);
    }
  }, [columns]);

  useEffect(() => {
    if (sortedPlaylist) {
      console.log("Features updated");
      sortTracks(sortedPlaylist, setSortedPlaylist, sortedPlaylist, processTracks, columns, features);
    }
  }, [features]);

  const renderPlaylistSongs = () => {
    if (!loading) {
      return (
        <div>
          <MusicPlayerSlider
            songTitle={sortedPlaylist.name}
            artist={sortedPlaylist.owner.display_name}
            album={sortedPlaylist.description}
            cover={sortedPlaylist.images[0] ? sortedPlaylist.images[0].url : whiteImageBase64}
            extra={"Total Tracks: " + sortedPlaylist.tracks.total}
          />

          {/* Feature Sliders */}
          <Grid container spacing={2} sx={{ maxWidth: "80vw" }}>
            {features.map((feature, index) => (
              <Grid item key={feature.name} xs={12} sm={6} md={4}>
                {/* slider details */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <h3>{feature.name}</h3>
                  <Checkbox color="default" onChange={(event) => handleCheckboxChange(feature.name)(event)} />
                  <Tooltip title={feature.description} placement="top">
                    <InfoIcon style={{ cursor: "pointer" }} />
                  </Tooltip>
                </Box>
                {/* slider */}
                <Slider
                  sx={{ width: "100%" }}
                  value={feature.value}
                  onChange={handleSliderChange(index)}
                  defaultValue={0}
                  min={-100}
                  max={100}
                  step={1}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                />
              </Grid>
            ))}
          </Grid>

          {/* save button */}
          <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
            {/* save button */}
            <Link to={{ pathname: "/save" }}>
              <Button variant="contained">Save Playlist</Button>
            </Link>
          </div>
          {/* playlist */}
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            pageSize={8}
            rowsPerPageOptions={[5]}
            // checkboxSelection
            style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
            disableColumnMenu
          />
          {/* end of playlist */}
        </div>
      );
    } else return <div>Loading</div>;
  };

  return (
    <Grid
      container
      spacing={0}
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        paddingTop: "10vh",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #380036, #0CBABA)",
        backgroundSize: "200% 200%",
        animation: "gradient 15s ease infinite",
      }}>
      <div style={{ height: "90%", width: "90%" }}>{renderPlaylistSongs()}</div>
    </Grid>
  );
}

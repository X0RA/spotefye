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
import IconButton from "@mui/material/IconButton";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import { useNavigate } from "react-router-dom";

export default function Playlist() {
  let navigate = useNavigate();
  const { getAudioFeatures, sortedPlaylist, setSortedPlaylist } = useAuth();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  //slider debounce
  const whiteImageBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAIAAADJ24JAAAAF0lEQVR42u3BAQEAAAABIP6PzgpvzUAAAAASUVORK5CYII=";

  //data relating to the features of the songs
  const [features, setFeatures] = useState([
    { name: "danceability", value: 0, description: "Danceability describes how suitable a track is for dancing." },
    {
      name: "energy",
      value: 0,
      description: "Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity.",
    },
    { name: "loudness", value: 0, description: "The overall loudness of a track in decibels (dB)." },
    { name: "speechiness", value: 0, description: "Speechiness detects the presence of spoken words in a track." },
    {
      name: "acousticness",
      value: 0,
      description: "A confidence measure from 0.0 to 1.0 of whether the track is acoustic.",
    },
    { name: "instrumentalness", value: 0, description: "Predicts whether a track contains no vocals." },
    { name: "liveness", value: 0, description: "Detects the presence of an audience in the recording." },
    {
      name: "valence",
      value: 0,
      description: "A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track.",
    },
    { name: "tempo", value: 0, description: "The overall estimated tempo of a track in beats per minute (BPM)." },
  ]);

  //columns of the table
  const [columns, setColumns] = useState([
    {
      field: "play",
      headerName: "Play",
      width: 100,
      renderCell: (params) => <PlayButton params={params} audioRef={audioRef} />,
    },
    { field: "popularity", headerName: "popularity", width: 80 },
    { field: "name", headerName: "name", width: 200 },
    { field: "artist", headerName: "artist", width: 250 },
  ]);

  //Checks that the playlist id is valid
  const id = pathname.split("/")[2];
  if (!/^[A-Za-z0-9]*$/.test(id)) {
    navigate("/");
  }
  // Update the columns based on the isPlaying and currentPlayingId values
  useEffect(() => {
    setColumns((prevColumns) => {
      // Clone the previous columns array to avoid mutating the state directly
      const updatedColumns = [...prevColumns];

      // Find the index of the column that contains the PlayButton
      const playButtonColumnIndex = updatedColumns.findIndex((column) => column.field === "play");

      // Check if isPlaying is true and currentPlayingId matches the row's id
      const isPlayingRow = (row) => isPlaying && row.id === currentPlayingId;

      // Update the renderCell function of the PlayButton column to conditionally render
      // a PlayButton or a PauseButton based on the isPlaying and currentPlayingId values
      updatedColumns[playButtonColumnIndex].renderCell = (params) => {
        const row = params.row;

        // Render the PlayButton if it's not the currently playing row
        if (!isPlayingRow(row)) {
          return <PlayButton params={params} audioRef={audioRef} />;
        }

        // Render the PauseButton if it's the currently playing row
        return <PauseCircleOutlineIcon />;
      };

      return updatedColumns;
    });
  }, [isPlaying, currentPlayingId]);

  // Play button that is added to every row in the table
  const PlayButton = ({ audioRef, params }) => {
    const handleClick = () => {
      console.log(isPlaying, currentPlayingId, params.row.id);
      if (!isPlaying || currentPlayingId !== params.row.id) {
        // Changed from uri to id
        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audio = new Audio(params.row.preview_url);
        audio.play();
        audioRef.current = audio;
        setIsPlaying(true);
        setCurrentPlayingId(params.row.id); // Save id instead of uri
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
        setCurrentPlayingId(null);
      }
    };

    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.addEventListener("ended", () => {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        });
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("ended", () => {
            setIsPlaying(false);
            setCurrentPlayingId(null);
          });
        }
      };
    }, [audioRef, setIsPlaying, setCurrentPlayingId]);

    return (
      <IconButton onClick={handleClick}>
        {isPlaying && currentPlayingId === params.row.id ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
      </IconButton>
    );
  };

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

  // Initial function that's called on page load, gets the data from the API and calls processTracks to show them in the table and then saves the playlist data
  const savePlaylistData = async () => {
    const data = await getAudioFeatures(id);
    processTracks(data);
    setSortedPlaylist(data);
    setLoading(false);
  };

  // handles when the slider is changed
  // updates the features state
  const handleSliderChange = (featureName) => (event, newValue) => {
    const updatedFeatures = features.map((feature) => {
      if (feature.name === featureName) {
        return { ...feature, value: newValue };
      }
      return feature;
    });
    setFeatures(updatedFeatures);
  };

  // sorts the songs based on the slider weights and the feature ranges
  const featureRanges = {
    danceability: { min: 0, max: 1 },
    energy: { min: 0, max: 1 },
    loudness: { min: -60, max: 0 },
    speechiness: { min: 0, max: 1 },
    acousticness: { min: 0, max: 1 },
    instrumentalness: { min: 0, max: 1 },
    liveness: { min: 0, max: 1 },
    valence: { min: 0, max: 1 },
    tempo: { min: 50, max: 200 },
  };

  const getConsideredFeatures = (columns) => {
    return columns
      .filter((column) => column.field !== "popularity" && column.field !== "name" && column.field !== "artist")
      .map((column) => column.field);
  };

  const normalizeFeatures = (features, consideredFeatures) => {
    let normalizedFeatures = {};
    for (const feature in features) {
      if (consideredFeatures.includes(feature)) {
        const value = features[feature];
        const min = featureRanges[feature].min;
        const max = featureRanges[feature].max;
        const normalizedValue = (value - min) / (max - min);
        normalizedFeatures[feature] = normalizedValue;
      }
    }
    return normalizedFeatures;
  };

  const getNormalizedWeightedFeatures = (normalizedFeatures, consideredFeatures) => {
    let normalizedWeightedFeatures = {};
    for (const feature in normalizedFeatures) {
      if (consideredFeatures.includes(feature)) {
        normalizedWeightedFeatures[feature] =
          normalizedFeatures[feature] * features.find((f) => f.name === feature)?.value;
      }
    }
    return normalizedWeightedFeatures;
  };

  const getFeatureScore = (normalizedWeightedFeatures) => {
    return Object.values(normalizedWeightedFeatures).reduce((acc, value) => acc + value, 0);
  };

  const sortTracks = async (data) => {
    const sortedData = [...data.tracks.items];
    const consideredFeatures = getConsideredFeatures(columns);

    sortedData.sort((a, b) => {
      const aFeatures = a.audio_features;
      const bFeatures = b.audio_features;

      const normalizedAFeatures = normalizeFeatures(aFeatures, consideredFeatures);
      const normalizedBFeatures = normalizeFeatures(bFeatures, consideredFeatures);

      const normalisedWeightedAFeatures = getNormalizedWeightedFeatures(normalizedAFeatures, consideredFeatures);
      const normalisedWeightedBFeatures = getNormalizedWeightedFeatures(normalizedBFeatures, consideredFeatures);

      let aScore = getFeatureScore(normalisedWeightedAFeatures);
      let bScore = getFeatureScore(normalisedWeightedBFeatures);

      return bScore - aScore;
    });

    await setSortedPlaylist((prevData) => ({
      ...prevData,
      tracks: {
        ...prevData.tracks,
        items: sortedData,
      },
    }));

    processTracks({
      ...sortedPlaylist,
      tracks: {
        ...sortedPlaylist.tracks,
        items: sortedData,
      },
    });
  };

  //initial page load function
  useEffect(() => {
    savePlaylistData();
  }, []);

  useEffect(() => {
    if (sortedPlaylist) {
      processTracks(sortedPlaylist);
    }
  }, [columns]);

  useEffect(() => {
    console.log("changed");
    if (sortedPlaylist) {
      // sortTracks(sortedPlaylist);
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

          {/* <Link to={{ pathname: "/another", state: largeJSONObject }}>Go to Another Page</Link> */}
          <Link to={{ pathname: "/save" }}>
            <Button> Go to another page </Button>
          </Link>

          {/* Feature Sliders */}
          <Grid container spacing={2}>
            {features.map((feature) => (
              <Grid item key={feature.name} xs={12} sm={6} md={4}>
                <div>
                  <h3>{feature.name}</h3>
                  <Checkbox color="default" onChange={handleCheckboxChange(feature.name)} />
                  <Tooltip title={feature.description} placement="top">
                    <InfoIcon style={{ cursor: "pointer" }} />
                  </Tooltip>
                  <Slider
                    value={feature.value}
                    min={-100}
                    max={100}
                    step={1}
                    onChange={handleSliderChange(feature.name)}
                  />
                </div>
              </Grid>
            ))}
          </Grid>
          <div
            style={{
              width: "90%",
              margin: "0 auto",
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}>
            <Box sx={{ width: "90vw", height: "60vh" }}>
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
            </Box>
          </div>
        </div>
      );
    } else return <div>Loading</div>;
  };

  return (
    <div
      style={{
        minHeight: "110vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #380036, #0CBABA)",
        backgroundSize: "200% 200%",
        animation: "gradient 15s ease infinite",
      }}>
      <div>{renderPlaylistSongs()}</div>
    </div>
  );
}

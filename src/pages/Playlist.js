import React, { useEffect, useState, useRef } from "react";
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

export default function Playlist() {
  const { getAudioFeatures } = useAuth();
  const { pathname } = useLocation();
  const [playlistData, setPlaylistData] = useState();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [dynamicColumns, setDynamicColumns] = useState([]);

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

  useEffect(() => {
    setDynamicColumns((prevDynamicColumns) => {
      return [
        {
          field: "play",
          headerName: "Play",
          width: 100,
          renderCell: (params) => (
            <IconButton onClick={() => handleButtonClick(params)}>
              {currentPlayingId === params.row.id && isPlaying ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
            </IconButton>
          ),
        },
        ...prevDynamicColumns,
      ];
    });
  }, [isPlaying, currentPlayingId]);

  const handleButtonClick = (params) => () => {
    setIsPlaying(true);
    if (!isPlaying || currentPlayingId !== params.row.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(params.row.preview_url);
      audio.play();
      audioRef.current = audio;
      setIsPlaying(true);
      setCurrentPlayingId(params.row.id);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current.ended) {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", () => {
          if (audioRef.current.ended) {
            setIsPlaying(false);
            setCurrentPlayingId(null);
          }
        });
      }
    };
  }, [audioRef, setIsPlaying, setCurrentPlayingId]);

  const columns = [
    {
      field: "play",
      headerName: "Play",
      width: 100,
      renderCell: (params) => (
        <IconButton onClick={handleButtonClick(params)}>
          {currentPlayingId === params.row.id && isPlaying ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
        </IconButton>
      ),
    },
    { field: "popularity", headerName: "popularity", width: 80 },
    { field: "name", headerName: "name", width: 200 },
    { field: "artist", headerName: "artist", width: 250 },
  ];

  //Checks that the playlist id is valid
  const id = pathname.split("/")[2];
  if (!/^[A-Za-z0-9]*$/.test(id)) {
    window.location.href = "/#/";
  }

  const handleCheckboxChange = (featureName) => (event) => {
    if (event.target.checked) {
      setDynamicColumns((prevColumns) => [...prevColumns, { field: featureName, headerName: featureName, width: 100 }]);
    } else {
      setDynamicColumns((prevColumns) => prevColumns.filter((column) => column.field !== featureName));
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
    setPlaylistData(data);
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

    await setPlaylistData((prevData) => ({
      ...prevData,
      tracks: {
        ...prevData.tracks,
        items: sortedData,
      },
    }));

    processTracks({
      ...playlistData,
      tracks: {
        ...playlistData.tracks,
        items: sortedData,
      },
    });
  };

  //initial page load function
  useEffect(() => {
    savePlaylistData();
  }, []);

  useEffect(() => {
    if (playlistData) {
      processTracks(playlistData);
    }
  }, [columns]);

  useEffect(() => {
    if (playlistData) {
      sortTracks(playlistData);
    }
  }, [features]);

  const renderPlaylistSongs = () => {
    if (!loading) {
      return (
        <div>
          <MusicPlayerSlider
            songTitle={playlistData.name}
            artist={playlistData.owner.display_name}
            album={playlistData.description}
            cover={playlistData.images[0].url}
            extra={"Total Tracks: " + playlistData.tracks.total}
          />
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

export const whiteImageBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAIAAADJ24JAAAAF0lEQVR42u3BAQEAAAABIP6PzgpvzUAAAAASUVORK5CYII=";

export const features_arr = [
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
];

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

const getNormalizedWeightedFeatures = (normalizedFeatures, consideredFeatures, features) => {
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

export const sortTracks = async (data, setSortedPlaylist, sortedPlaylist, processTracks, columns, features) => {
  const sortedData = [...data.tracks.items];
  const consideredFeatures = getConsideredFeatures(columns);

  sortedData.sort((a, b) => {
    const aFeatures = a.audio_features;
    const bFeatures = b.audio_features;

    const normalizedAFeatures = normalizeFeatures(aFeatures, consideredFeatures, features);
    const normalizedBFeatures = normalizeFeatures(bFeatures, consideredFeatures, features);

    const normalisedWeightedAFeatures = getNormalizedWeightedFeatures(
      normalizedAFeatures,
      consideredFeatures,
      features
    );
    const normalisedWeightedBFeatures = getNormalizedWeightedFeatures(
      normalizedBFeatures,
      consideredFeatures,
      features
    );

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

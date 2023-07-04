import React, { useEffect, useState } from "react";
import { useAuth } from "../management/spotify";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import gradientsData from "../utils/gradients";
// import { makeStyles } from "@material-ui/core/styles";
import CardMedia from "@mui/material/CardMedia";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { set } from "animejs";

const TinyColor = require("tinycolor2");

const SavePage = () => {
  let navigate = useNavigate();
  const { sortedPlaylist, SavePlaylist } = useAuth();
  const [playlistName, setPlaylistName] = useState("Playlistify");
  const [playlistDescription, setPlaylistDescription] = useState("Created with Playlistify");
  const [playlistImage, setPlaylistImage] = useState(null);
  const [playlistCovers, setPlaylistCovers] = useState(null);
  const [wipePlaylist, setWipePlaylist] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [typingTimer, setTypingTimer] = useState(0);
  const [savedPlaylist, setSavedPlaylist] = useState(null);

  useEffect(() => {
    const load = async () => {
      let images = [];
      for (let track of sortedPlaylist.tracks.items) {
        if (track.track.album && track.track.album.images.length > 0) {
          images.push(track.track.album.images.slice(-1)[0].url);
          if (images.length >= 10) {
            break;
          }
        }
      }
      setPlaylistCovers(images);
      //wait .2 seconds
      await new Promise((r) => setTimeout(r, 400));
      generatePlaylistImage(playlistName, gradientsData, images);
    };
    if (!sortedPlaylist) {
      navigate(-1);
    } else load();
  }, []);

  const generatePlaylistImage = async (playlistName, gradientsData, images) => {
    const canvas = document.createElement("canvas");
    canvas.width = 500; // Adjusted the width and height as requested
    canvas.height = 500;

    const ctx = canvas.getContext("2d");

    // Select a random gradient from the array
    const gradientIndex = Math.floor(Math.random() * gradientsData.length);
    const gradientData = gradientsData[gradientIndex];

    // Create a linear gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, gradientData.color1);
    gradient.addColorStop(1, gradientData.color2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate brightness of the color
    const color = gradientData.color1;
    const tintColor = TinyColor(color);

    // Check if color1 is light or dark
    const isLight = tintColor.isLight();

    // Adjust brightness by a percentage (e.g., -20 for darker, +20 for lighter)
    let adjustedTintColor;
    if (isLight) {
      adjustedTintColor = tintColor.darken(60); // Adjust the value as needed for darker shade
    } else {
      adjustedTintColor = tintColor.lighten(50); // Adjust the value as needed for lighter shade
    }

    // Determine text color based on adjusted brightness
    const textColor = adjustedTintColor.toString();

    // Create circle bubbles containing the images
    const imagePromises = images.map((imageSrc) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // This allows the image to be loaded from a different domain
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageSrc;
      });
    });

    const loadedImages = await Promise.all(imagePromises);

    // The amount of vertical space to leave between bubbles
    const bubbleSpacing = 60; // Adjust as needed for desired spacing between bubbles
    const bubbleRadius = 60; // Adjust as needed

    // Sort the images randomly
    const sortedImages = [...loadedImages].sort(() => Math.random() - 0.5);

    // Center position of the canvas where bubbles will gather
    // Subtract 91 pixels from the center's y coordinate
    const center = { x: canvas.width / 2, y: (canvas.height - 91) / 2 };

    sortedImages.forEach((img, index) => {
      // Generate a random angle for bubble position
      const angle = Math.random() * 2 * Math.PI;

      // Calculate x and y position of the bubble
      let x = center.x + bubbleSpacing * Math.cos(angle) * index;
      let y = center.y + bubbleSpacing * Math.sin(angle) * index;

      // To avoid bubbles being drawn beyond the desired vertical limit,
      // make sure the y-coordinate + radius does not exceed the height - 91
      if (y + bubbleRadius > canvas.height - 91) {
        y = canvas.height - 91 - bubbleRadius;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, bubbleRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      // Scale the image
      const scaleFactor = Math.min((bubbleRadius * 2) / img.width, (bubbleRadius * 2) / img.height);
      const imgWidth = img.width * scaleFactor;
      const imgHeight = img.height * scaleFactor;

      // Center the image
      const imgX = x - imgWidth / 2;
      const imgY = y - imgHeight / 2;

      //give the bubble an opacity
      ctx.globalAlpha = 0.7;

      ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);

      ctx.beginPath();
      ctx.arc(x, y, bubbleRadius, 0, Math.PI * 2, true);
      ctx.clip();
      ctx.closePath();
      ctx.restore();
    });

    // Add the text "playlistName"
    ctx.font = "50px VarelaRound";
    ctx.fillStyle = textColor;
    playlistName = playlistName.charAt(0).toUpperCase() + playlistName.slice(1);

    // Measure the width of the text
    const textWidth = ctx.measureText(playlistName).width;

    // Calculate the rectangle width based on the text width
    const rectWidth = textWidth; // Adjust the padding as needed

    // Draw the text
    ctx.fillText(playlistName, 50, 500 - 56);

    // Draw the rectangle
    // ctx.fillStyle = "rgba(255,255,255,0.9)"; // Set the fill color
    ctx.fillStyle = textColor;

    ctx.fillRect(50, 480, rectWidth, 20); // Draw a filled rectangle

    // Convert the canvas to a base64 PNG encoded string
    let base64Image = canvas.toDataURL("image/png");

    // Calculate the length in bytes
    let len = base64Image.length;
    let sizeInBytes = len - (len / 8) * 2; // Base64 string size in bytes
    let sizeInKb = sizeInBytes / 1024; // Convert bytes to KB

    // If size of the PNG is larger than 200KB, create a JPEG instead
    if (sizeInKb > 200) {
      base64Image = canvas.toDataURL("image/jpeg", 0.8);
    }
    setPlaylistImage(base64Image);
    return base64Image;
  };

  const handleImageClick = () => {
    generatePlaylistImage(playlistName, gradientsData, playlistCovers);
  };

  const savePlaylistWrapper = async (playlistName, sortedPlaylist, wipePlaylist, playlistImage) => {
    setIsSaving(true);
    const uri = await SavePlaylist(playlistName, sortedPlaylist, wipePlaylist, playlistImage, playlistDescription);
    setSavedPlaylist(uri);
    setIsSaving(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #380036, #0CBABA)",
        backgroundSize: "200% 200%",
        animation: "gradient 15s ease infinite",
        padding: "10px",
        boxSizing: "border-box",
      }}>
      <h1 style={{ color: "#fff", textAlign: "center" }}>Save Playlist</h1>

      <Card sx={{ maxWidth: "400px", boxShadow: "none", background: "rgba(0,0,0,0)" }}>
        {playlistImage && (
          <Card
            style={{
              width: "400px", // Adjust the width as needed for mobile responsiveness
              height: "auto", // Adjust the height as needed for mobile responsiveness
              // maxHeight: "400px", // Maximum height for larger screens
              borderRadius: 10,
              overflow: "visible",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)", // Adjust the shadow as needed
              cursor: "pointer",
              marginBottom: 20,
            }}
            onClick={handleImageClick}>
            <CardMedia
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              component="img"
              image={playlistImage}
              alt="playlist"
            />
          </Card>
        )}
        <Box sx={{ borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <CardContent>
            <TextField
              id="standard-basic"
              label="Playlist Name"
              variant="standard"
              value={playlistName}
              autoFocus={true}
              onChange={(e) => {
                setPlaylistName(e.target.value);
                clearTimeout(typingTimer);
                setTypingTimer(
                  setTimeout(() => {
                    generatePlaylistImage(e.target.value, gradientsData, playlistCovers);
                  }, 500)
                );
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleImageClick();
                }
              }}
              style={{
                width: "80vw",
                maxWidth: "400px",
                color: "white",
                backgroundColor: "transparent",
                marginBottom: "20px",
              }}
              InputProps={{
                style: {
                  color: "white",
                  borderBottom: "none",
                  fontSize: "24px", // Set the desired font size here
                },
                disableUnderline: true,
              }}
              InputLabelProps={{
                style: {
                  color: "rgba(255,255,255,0.5)",
                },
              }}
            />
            <TextField
              id="standard-basic"
              label="Description"
              variant="standard"
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
              onAbort={(e) => handleImageClick()}
              style={{
                width: "80vw",
                maxWidth: "400px",
                color: "white",
                backgroundColor: "transparent",
              }}
              InputProps={{
                style: {
                  color: "white",
                  borderBottom: "none",
                  fontSize: "16px",
                },
                disableUnderline: true,
              }}
              InputLabelProps={{
                style: {
                  color: "rgba(255,255,255,0.5)",
                },
              }}
            />
          </CardContent>
          <CardActions>
            {isSaving ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <Button
                variant="contained"
                onClick={() => {
                  savePlaylistWrapper(playlistName, sortedPlaylist, wipePlaylist, playlistImage, playlistDescription);
                }}>
                Save
              </Button>
            )}
            {savedPlaylist && (
              <Button
                variant="contained"
                onClick={() => {
                  window.open(savedPlaylist);
                }}>
                View Playlist
              </Button>
            )}
          </CardActions>
        </Box>
      </Card>
    </div>
  );
};

export default SavePage;

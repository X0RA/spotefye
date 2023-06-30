import "./App.css";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./management/PrivateRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Playlist from "./pages/Playlist";
import { AuthProvider } from "./management/spotify";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route exact path="/login" element={<Login />} />

        <Route
          exact
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          exact
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          exact
          path="/playlist/:id"
          element={
            <PrivateRoute>
              <Playlist />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;

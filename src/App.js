import "./App.css";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./management/PrivateRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Playlist from "./pages/Playlist";
import SavePage from "./pages/Save";
import { AuthProvider } from "./management/spotify";
import { FirebaseProvider, useAuth } from "./management/firebase";

function App() {
  return (
    <AuthProvider>
      <FirebaseProvider>
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
          <Route
            exact
            path="/save"
            element={
              <PrivateRoute>
                <SavePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </FirebaseProvider>
    </AuthProvider>
  );
}

export default App;

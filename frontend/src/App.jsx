// App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Helmet } from "react-helmet";
import AdminUsers from "./pages/AdminUsers";
import AdminPanel from "./pages/AdminPanel";
import Login from "./components/Login";
import Register from "./components/Register";
import Index from "./pages/Index";
import Series from "./pages/Series";
import Movies from "./pages/Movies";
import Header from "./components/Header";
import Footer from "./components/Footer";
import UserProfile from "./pages/UserProfile";
import Modal from "./components/Modal";
import MiLista from "./pages/MiLista";
import EditProfile from "./pages/EditProfile";
import Portada from "./pages/Portada";


const App = () => {
  const user = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;

  // Estado para el mensaje flotante de favoritos
  const [favoriteMessage, setFavoriteMessage] = useState("");

  return (
    <Router>
      <Helmet>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
      </Helmet>

      {favoriteMessage && (
        <div className="floating-message">{favoriteMessage}</div>
      )}

      <Header user={user} />
      <Routes>
        <Route path="/" element={<Portada />} />  {/* Nueva portada */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/dashboard" element={<AdminPanel />} />
        <Route
          path="/milista"
          element={<MiLista setFavoriteMessage={setFavoriteMessage} />}
        />
        <Route
          path="/index"
          element={<Index setFavoriteMessage={setFavoriteMessage} />}
        />
        <Route
          path="/series"
          element={<Series setFavoriteMessage={setFavoriteMessage} />}
        />
        <Route
          path="/peliculas"
          element={<Movies setFavoriteMessage={setFavoriteMessage} />}
        />
        <Route
          path="/usuario/:id"
          element={<UserProfile setFavoriteMessage={setFavoriteMessage} />}
        />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>

      <Modal
        setFavoriteMessage={setFavoriteMessage}
        isOpen={false}
        onClose={() => {}}
        data={null}
      />

      <Footer />
    </Router>
  );
};

export default App;

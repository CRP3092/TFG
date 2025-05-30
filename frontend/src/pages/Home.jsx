import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/styles.css";

/**
 * Componente Home
 * - Muestra la página de inicio con una lista de películas y series destacadas.
 */
const movies = [
    { title: "Stranger Things", img: "https://via.placeholder.com/200x300" }, // Imagen representativa
    { title: "Breaking Bad", img: "https://via.placeholder.com/200x300" },
    { title: "Squid Game", img: "https://via.placeholder.com/200x300" }
];

const Home = () => {
    return (
        <div>
            <Navbar /> {/* Muestra la barra de navegación */}
            <h1>BlockBuster: Lo mejor en películas y series</h1>

            {/* Contenedor de películas */}
            <div className="movies-container">
                {movies.map((movie, index) => (
                    <div key={index} className="movie-card">
                        <img src={movie.img} alt={movie.title} /> {/* Imagen de la película */}
                        <h3>{movie.title}</h3> {/* Título de la película */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home; // Exporta el componente para su uso en otras partes de la aplicación

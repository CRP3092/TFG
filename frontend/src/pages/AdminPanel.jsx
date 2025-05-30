import React, { useEffect, useState } from "react";
import config from "../utils/config";
import "../styles/styles.css";

const AdminPanel = () => {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Objeto para la creación
  const [newItem, setNewItem] = useState({
    Title: "",
    genreId: "",
    releaseYear: "",
    duration: "", // Para películas
    seasons: "", // Para series
    language: "",
    type: "movies", // "movies" o "series"
  });

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        setError("❌ No hay token de autenticación.");
        return;
      }
      try {
        const [moviesResponse, seriesResponse, genresResponse] = await Promise.all([
          fetch(`${config.API_URL}/api/admin/movies`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${config.API_URL}/api/admin/series`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${config.API_URL}/api/admin/genres`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!moviesResponse.ok || !seriesResponse.ok || !genresResponse.ok) {
          throw new Error("Error al obtener datos.");
        }

        const moviesData = await moviesResponse.json();
        const seriesData = await seriesResponse.json();
        const genresData = await genresResponse.json();

        console.log("📌 Películas recibidas:", JSON.stringify(moviesData, null, 2));
        console.log("📌 Series recibidas:", JSON.stringify(seriesData, null, 2));
        console.log("📌 Géneros recibidos:", JSON.stringify(genresData, null, 2));

        setMovies(moviesData);
        setSeries(seriesData);
        setGenres(genresData);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  // Función para crear un elemento (película o serie)
  const handleCreate = async () => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      setError("❌ No hay token de autenticación.");
      return;
    }
    try {
      const response = await fetch(`${config.API_URL}/api/admin/${newItem.type}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Title: newItem.Title,
          genreId: newItem.genreId,
          releaseYear: parseInt(newItem.releaseYear, 10),
          duration: newItem.type === "movies" ? parseInt(newItem.duration, 10) : undefined,
          seasons: newItem.type === "series" ? parseInt(newItem.seasons, 10) : undefined,
          language: newItem.language,
        }),
      });
      if (!response.ok) {
        throw new Error("Error al crear contenido.");
      }
      const createdItem = await response.json();

      // Normalizamos el objeto para que tenga las claves que la UI utiliza.
      let normalizedCreatedItem;
      if (newItem.type === "movies") {
        normalizedCreatedItem = {
          ...createdItem,
          Title: createdItem.Title,               // Se espera Title
          Genre: createdItem.genreId,               // Normalizamos a "Genre"
          Release_Year: createdItem.releaseYear,    // Normalizamos a "Release_Year"
          Duration: createdItem.duration,           // Se espera Duration
          Language: createdItem.language,           // Se espera Language
          id: createdItem.id || createdItem.Id_Movie, // Fijamos el id
        };
        setMovies((prevMovies) => [...prevMovies, normalizedCreatedItem]);
      } else {
        normalizedCreatedItem = {
          ...createdItem,
          Title: createdItem.Title,
          Genre: createdItem.genreId,
          Release_Year: createdItem.releaseYear,
          Seasons: createdItem.seasons,
          Language: createdItem.language,
          id: createdItem.id || createdItem.Id_Series,
        };
        setSeries((prevSeries) => [...prevSeries, normalizedCreatedItem]);
      }
  
      setIsAdding(false);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Función para eliminar contenido
  const handleDelete = async (type, id) => {
    const accessToken = sessionStorage.getItem("accessToken");
    try {
      const response = await fetch(`${config.API_URL}/api/admin/${type}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        throw new Error("Error al eliminar contenido.");
      }
      if (type === "movies") {
        setMovies(movies.filter((movie) => movie.Id_Movie !== id && movie.id !== id));
      } else {
        setSeries(series.filter((serie) => serie.Id_Series !== id && serie.id !== id));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Función para iniciar la edición
  const handleEdit = (item) => {
    const resolvedType = item.type;
    let id, genreId, releaseYear, field, language;
  
    if (resolvedType === "movies") {
      id = item.id || item.Id_Movie;
      genreId = item.genreId || item.Genre || "";
      releaseYear = item.releaseYear || item.Release_Year || "";
      field = item.duration || item.Duration || "";
      language = item.language || item.Language || "";
    } else if (resolvedType === "series") {
      id = item.id || item.Id_Series;
      genreId = item.genreId || item.Genre || "";
      releaseYear = item.releaseYear || item.Release_Year || "";
      field = item.seasons || item.Seasons || "";
      language = item.language || item.Language || "";
    }
  
    // Si genreId está vacío y tenemos géneros cargados, asignamos el primer género por defecto.
    if (!genreId && genres.length > 0) {
      genreId = String(genres[0].Id_Genre);
    }
  
    const newEditItem = {
      ...item,
      id,
      type: resolvedType,
      genreId: String(genreId),
      releaseYear,
      language,
    };
  
    if (resolvedType === "movies") {
      newEditItem.duration = field;
    } else if (resolvedType === "series") {
      newEditItem.seasons = field;
    }
  
    console.log("handleEdit, newEditItem:", newEditItem);
    setEditItem(newEditItem);
    setIsEditing(true);
  };

  // Captura de cambios en el modal de edición
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditItem({ ...editItem, [name]: value });
  };

  // Función para actualizar en el backend y refrescar la UI sin recargar la página
  const handleUpdate = async () => {
    const accessToken = sessionStorage.getItem("accessToken");
  
    // --- Sanitizamos y convertimos los valores ingresados ---
    const title = String(editItem.Title || "").trim();
    const language = String(editItem.language || "").trim();
    const genreStr = String(editItem.genreId || "").trim();
    const releaseYearStr = String(editItem.releaseYear || "").trim();
  
    const parsedGenre = parseInt(genreStr, 10);
    const parsedReleaseYear = parseInt(releaseYearStr, 10);
  
    let parsedField;
    if (editItem.type === "movies") {
      parsedField = parseInt(String(editItem.duration || "").trim(), 10);
    } else if (editItem.type === "series") {
      parsedField = parseInt(String(editItem.seasons || "").trim(), 10);
    }
  
    // Validamos los campos obligatorios.
    if (
      !title ||
      !genreStr ||
      !releaseYearStr ||
      !language ||
      isNaN(parsedGenre) ||
      isNaN(parsedReleaseYear) ||
      (editItem.type === "movies" && isNaN(parsedField)) ||
      (editItem.type === "series" && isNaN(parsedField))
    ) {
      setError("Por favor, complete todos los campos obligatorios con valores válidos.");
      return;
    }
  
    // --- Objeto para enviar al backend (usa las mismas claves que en la creación) ---
    let updateForBackend;
    if (editItem.type === "movies") {
      updateForBackend = {
        Title: title,
        genreId: parsedGenre,
        releaseYear: parsedReleaseYear,
        duration: parsedField,
        language: language,
      };
    } else if (editItem.type === "series") {
      updateForBackend = {
        Title: title,
        genreId: parsedGenre,
        releaseYear: parsedReleaseYear,
        seasons: parsedField,
        language: language,
      };
    }
  
    console.log("📌 Datos enviados al backend:", updateForBackend);
  
    // --- Objeto para actualizar el estado local (normalizado según lo que renderiza la UI) ---
    let normalizedLocalData;
    if (editItem.type === "movies") {
      normalizedLocalData = {
        Title: title,
        Genre: parsedGenre,
        Release_Year: parsedReleaseYear,
        Duration: parsedField,
        Language: language,
      };
    } else if (editItem.type === "series") {
      normalizedLocalData = {
        Title: title,
        Genre: parsedGenre,
        Release_Year: parsedReleaseYear,
        Seasons: parsedField,
        Language: language,
      };
    }
  
    try {
      const response = await fetch(
        `${config.API_URL}/api/admin/${editItem.type}/${editItem.id}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateForBackend),
        }
      );
  
      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Error al actualizar contenido: ${errorDetail}`);
      }
  
      // Se actualizó en el backend. Actualizamos el estado local para que la UI se refresque.
      if (editItem.type === "movies") {
        setMovies((prevMovies) =>
          prevMovies.map((movie) =>
            movie.id === editItem.id || movie.Id_Movie === editItem.id
              ? { ...movie, ...normalizedLocalData }
              : movie
          )
        );
      } else if (editItem.type === "series") {
        setSeries((prevSeries) =>
          prevSeries.map((serie) =>
            serie.id === editItem.id || serie.Id_Series === editItem.id
              ? { ...serie, ...normalizedLocalData }
              : serie
          )
        );
      }
  
      setIsEditing(false);
      setError("");
    } catch (error) {
      console.error("❌ Error en actualización:", error);
      setError(error.message);
    }
  };
  
  return (
    <div className="admin-container">
      <h1>Panel de Administración</h1>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="Buscar título..."
        onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        className="search-box"
      />
  
      {/* Sección de Películas */}
      <h2>Películas</h2>
      <button
        className="add-btn"
        onClick={() => {
          setIsAdding(true);
          setNewItem({
            Title: "",
            genreId: "",
            releaseYear: "",
            duration: "",
            language: "",
            type: "movies",
          });
        }}
      >
        Añadir Película
      </button>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Género</th>
            <th>Año</th>
            <th>Duración</th>
            <th>Idioma</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movies
            .filter(
              (movie) =>
                movie.Title &&
                movie.Title.toLowerCase().includes(searchQuery)
            )
            .map((movie) => (
              <tr key={movie.id || movie.Id_Movie}>
                <td>{movie.id || movie.Id_Movie}</td>
                <td>{movie.Title}</td>
                <td>
                  {genres?.length > 0
                    ? genres.find(
                        (g) => Number(g.Id_Genre) === Number(movie.Genre)
                      )?.Name || "Sin género"
                    : "Cargando..."}
                </td>
                <td>{movie.Release_Year ? movie.Release_Year : "N/A"}</td>
                <td>{movie.Duration ? `${movie.Duration} min` : "N/A"}</td>
                <td>{movie.Language ? movie.Language : "No definido"}</td>
                <td>
                    <button onClick={() => handleEdit({ ...movie, type: "movies" })}>Modificar</button>
                    <button
                    className="delete-btn"
                    onClick={() => handleDelete("movies", movie.id || movie.Id_Movie)}
                    >
                    Eliminar
                    </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
  
      {/* Sección de Series */}
      <h2>Series</h2>
      <button
        className="add-btn"
        onClick={() => {
          setIsAdding(true);
          setNewItem({
            Title: "",
            genreId: "",
            releaseYear: "",
            seasons: "",
            language: "",
            type: "series",
          });
        }}
      >
        Añadir Serie
      </button>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Género</th>
            <th>Año</th>
            <th>Temporadas</th>
            <th>Idioma</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {series
            .filter(
              (serie) =>
                serie.Title &&
                serie.Title.toLowerCase().includes(searchQuery)
            )
            .map((serie) => (
              <tr key={serie.id || serie.Id_Series}>
                <td>{serie.id || serie.Id_Series}</td>
                <td>{serie.Title}</td>
                <td>
                  {genres?.length > 0
                    ? genres.find(
                        (g) => Number(g.Id_Genre) === Number(serie.Genre)
                      )?.Name || "Sin género"
                    : "Cargando..."}
                </td>
                <td>{serie.Release_Year ? serie.Release_Year : "N/A"}</td>
                <td>{serie.Seasons ? serie.Seasons : "N/A"}</td>
                <td>{serie.Language ? serie.Language : "No definido"}</td>
                <td>
                  <button onClick={() => handleEdit({ ...serie, type: "series" })}>Modificar</button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete("series", serie.id || serie.Id_Series)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
  
      {/* Modal de Edición */}
      {isEditing && editItem && (
        <div className="modal">
          <div className="modal-content">
            <h2>
              Editar {editItem.type === "movies" ? "Película" : "Serie"}
            </h2>
            <label>Título:</label>
            <input
              type="text"
              name="Title"
              value={editItem.Title || ""}
              onChange={handleEditInputChange}
            />
  
            <label>Género:</label>
            <select 
              name="genreId" 
              value={editItem.genreId || ""}
              onChange={handleEditInputChange}
            >
              <option value="">Seleccionar género...</option>
              {genres.map((genre) => (
                <option key={genre.Id_Genre} value={String(genre.Id_Genre)}>
                  {genre.Name}
                </option>
              ))}
            </select>
  
            <label>Año de estreno:</label>
            <input
              type="number"
              name="releaseYear"
              value={editItem.releaseYear || ""}
              onChange={handleEditInputChange}
            />
  
            {editItem.type === "movies" ? (
              <>
                <label>Duración (min):</label>
                <input
                  type="number"
                  name="duration"
                  value={editItem.duration || ""}
                  onChange={handleEditInputChange}
                />
              </>
            ) : (
              <>
                <label>Temporadas:</label>
                <input
                  type="number"
                  name="seasons"
                  value={editItem.seasons || ""}
                  onChange={handleEditInputChange}
                />
              </>
            )}
  
            <label>Idioma:</label>
            <input
              type="text"
              name="language"
              value={editItem.language || ""}
              onChange={handleEditInputChange}
            />
  
            <button className="update-btn" onClick={handleUpdate}>
              Guardar Cambios
            </button>
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
  
      {/* Modal de Creación */}
      {isAdding && (
        <div className="modal">
          <div className="modal-content">
            <h2>
              Añadir {newItem.type === "movies" ? "Película" : "Serie"}
            </h2>
            <input
              type="text"
              name="Title"
              value={newItem.Title}
              onChange={(e) =>
                setNewItem({ ...newItem, Title: e.target.value })
              }
              placeholder="Título"
            />
            <select
              name="genreId"
              value={newItem.genreId}
              onChange={(e) =>
                setNewItem({ ...newItem, genreId: e.target.value })
              }
            >
              <option value="">Seleccionar género...</option>
              {genres.map((genre) => (
                <option key={genre.Id_Genre} value={genre.Id_Genre}>
                  {genre.Name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="releaseYear"
              value={newItem.releaseYear}
              onChange={(e) =>
                setNewItem({ ...newItem, releaseYear: e.target.value })
              }
              placeholder="Año de estreno"
            />
            {newItem.type === "movies" ? (
              <input
                type="number"
                name="duration"
                value={newItem.duration}
                onChange={(e) =>
                  setNewItem({ ...newItem, duration: e.target.value })
                }
                placeholder="Duración en minutos"
              />
            ) : (
              <input
                type="number"
                name="seasons"
                value={newItem.seasons}
                onChange={(e) =>
                  setNewItem({ ...newItem, seasons: e.target.value })
                }
                placeholder="Número de temporadas"
              />
            )}
            <input
              type="text"
              name="language"
              value={newItem.language}
              onChange={(e) =>
                setNewItem({ ...newItem, language: e.target.value })
              }
              placeholder="Idioma"
            />
            <button onClick={handleCreate}>Guardar</button>
            <button className="cancel-btn" onClick={() => setIsAdding(false)}>
                Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

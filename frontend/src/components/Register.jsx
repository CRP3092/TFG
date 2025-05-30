import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../utils/config";
import "../styles/styles.css";

/**
 * Componente Register
 * - Permite el registro de usuarios con validación de contraseña y selección de avatar.
 */
const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
    avatar: "",
    subscription: "",
  });

  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const avatarList = [
    { id: 4, url: `${config.API_URL}/uploads/avatars/9334176.jpg`, description: "Avatar2" },
    { id: 5, url: `${config.API_URL}/uploads/avatars/10491830.jpg`, description: "Avatar3" },
    { id: 6, url: `${config.API_URL}/uploads/avatars/7309681.jpg`, description: "Avatar1" },
  ];

  const subscriptionPlans = [
    { id: 1, name: "Mensual", price: 9.99 },
    { id: 2, name: "Trimestral", price: 27.99 },
    { id: 3, name: "Anual", price: 109.99 },
  ];

  // Maneja cambios en los campos del formulario
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Maneja la selección de avatar
  const handleAvatarSelect = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
    setUser((prevUser) => ({ ...prevUser, avatar: avatarUrl }));
  };

  // Maneja el cambio de suscripción seleccionada
  const handleSubscriptionChange = (e) => {
    const selectedPlan = subscriptionPlans.find(
      (plan) => plan.id === parseInt(e.target.value)
    );
    if (selectedPlan) {
      setUser({ ...user, subscription: selectedPlan.id });
    }
  };

  // Validación de seguridad de la contraseña
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (user.password !== user.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (!validatePassword(user.password)) {
      setErrorMessage("La contraseña debe tener al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.");
      return;
    }

    if (!user.avatar) {
      setErrorMessage("Debes seleccionar un avatar.");
      return;
    }

    if (!user.subscription) {
      setErrorMessage("Debes seleccionar un tipo de suscripción.");
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error al registrar. Inténtalo de nuevo.");
      }

      alert("Registro exitoso.");
      navigate("/login", { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-scroll-wrapper">
        <div className="form-box">
          <h2>Registro</h2>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Nombre" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Correo" onChange={handleChange} required />
            <input type="text" name="address" placeholder="Dirección" onChange={handleChange} required />

            <h3>Selecciona tu avatar:</h3>
            <div className="avatar-selection">
              {avatarList.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar.url}
                  alt={avatar.description}
                  className={`avatar ${selectedAvatar === avatar.url ? "selected" : ""}`}
                  onClick={() => handleAvatarSelect(avatar.url)}
                />
              ))}
            </div>

            <div className="subscription-select-container">
              <select name="subscription" onChange={handleSubscriptionChange} required>
                <option value="">Selecciona un plan</option>
                {subscriptionPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {plan.price} €
                  </option>
                ))}
              </select>
            </div>

            <div className="password-container">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Contraseña" onChange={handleChange} required />
            </div>
            <div className="password-container">
              <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Repetir Contraseña" onChange={handleChange} required />
            </div>
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>

            <button type="submit">Registrar</button>
          </form>
          <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;

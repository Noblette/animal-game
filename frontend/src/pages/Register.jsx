import React, { useState } from "react";
import "../index.css";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    genre: "",
    adresse: "",
    photo: "",
    date_naissance: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    alert(data.message);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Inscription</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required />
        <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required />
        <input name="first_name" type="text" placeholder="Prénom" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <input name="last_name" type="text" placeholder="Nom" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <input name="phone" type="text" placeholder="Téléphone" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <select name="genre" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded">
          <option value="">Sélectionnez le genre</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>
        <input name="adresse" type="text" placeholder="Adresse" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <input name="photo" type="text" placeholder="URL Photo" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <input name="date_naissance" type="date" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
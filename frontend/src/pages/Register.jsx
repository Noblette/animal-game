import React, { useState } from "react";
import "../index.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    genre: "",
    adresse: "",
    photo: null,
    date_naissance: ""
  });

  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    // Si c'est un fichier, on prend le premier fichier sélectionné
    setFormData(prevState => ({
      ...prevState,
      [name]: files ? files[0] : value 
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Utilisation de FormData pour inclure le fichier dans la requête
  const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }

  const response = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      body: data, // Note : Ne pas ajouter 'Content-Type': 'application/json' ici, FormData le gère
    });
    
  const result = await response.json();
    alert(result.message);
  };



  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Inscription</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input name="last_name" type="text" placeholder="Nom" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <input name="first_name" type="text" placeholder="Prénom" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required />
        <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
         <input name="phone" type="text" placeholder="Téléphone" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <select name="genre" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded">
          <option value="">Sélectionnez le genre</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>
        <input name="adresse" type="text" placeholder="Adresse" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <input name="photo" type="file" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <input name="date_naissance" type="date" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
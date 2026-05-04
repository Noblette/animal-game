import React, { useState } from "react";
import "../index.css";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Swal from "sweetalert2";


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
        if (formData[key] !== null) {
            data.append(key, formData[key]);
        }
}

try{  
const response = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      body: data, // Note : Ne pas ajouter 'Content-Type': 'application/json' ici, FormData le gère
    });
    
  const result = await response.json();
    
 
  if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Succès 🎉",
        text: result.message,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: result.message,
      });
    }

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Erreur réseau",
      text: "Impossible de contacter le serveur",
    });
     };
  }




  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign up</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input name="last_name" type="text" placeholder="Nom" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"  />
        <input name="first_name" type="text" placeholder="Prénom" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" required autoComplete="new-password"/>
        {/* Champ mot de passe regroupé avec son bouton de bascule */}
        <div className="relative">
        <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Mot de passe" 
            onChange={handleChange} 
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" 
            required 
            autoComplete="new-password"
        />
        <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
        </div>
         <input name="phone" type="text" placeholder="Téléphone" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" />
        <select name="genre" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500">
          <option value="">Sélectionnez le genre</option>
          <option value="male">Homme</option>
          <option value="female">Femme</option>
        </select>
        <input name="adresse" type="text" placeholder="Adresse" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" />
        <div className="flex items-center gap-3">
           <span className="text-sm text-gray-700 whitespace-nowrap">Entrez votre photo</span>
           <label className="flex-1 p-2 border border-gray-300 rounded cursor-pointer text-center text-gray-700 hover:bg-gray-50">
    Choisir une photo
           <input name="photo" type="file" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" />
           </label>
        </div>
        <input name="date_naissance" type="date" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" />
        <div className="flex gap-3">
        <button type="reset" className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition duration-200">
          Cancel
        </button>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200">
          Register
        </button>
        </div>
        <p className="text-sm text-gray-600 mt-4 text-center">
            Déjà un  compte créé ?{" "}
            <span 
              className="text-blue-600 cursor-pointer"
              onClick={() => window.location.href = "/"}
            >
              Se connecter
            </span>
          </p>
      </form>
    </div>
  );
}

export default Register;
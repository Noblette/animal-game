import React, { useState } from "react";
import Swal from "sweetalert2";
import { FiEye, FiEyeOff } from "react-icons/fi";

function Login() {
  console.log("Login component rendered");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("role", data.role);

      Swal.fire({
        icon: "success",
        title: "Bienvenue 🎉",
        text: "Connexion réussie",
      });

      if (data.role === "admin") {
          window.location.href = "/admin";
        } 
            
      else {
          window.location.href = "/profile";
        }
        }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-white">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-purple-100">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg pr-12 focus:outline-none focus:border-green-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg"
          >
            Login
          </button>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Pas encore de compte ?{" "}
            <span 
              className="text-blue-600 cursor-pointer"
              onClick={() => window.location.href = "/register"}
            >
              S'inscrire
            </span>
          </p>

          <p className="text-sm text-gray-600 mt-2 text-center">
            <span 
              className="text-red-500 cursor-pointer"
              onClick={() => window.location.href = "/forgot-password"}
            >
              Mot de passe oublié ?
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
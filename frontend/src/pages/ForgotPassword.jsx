import React, { useState } from "react";
import Swal from "sweetalert2";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      Swal.fire({
        icon: res.ok ? "success" : "error",
        title: res.ok ? "Code envoyé" : "Erreur",
        text: data.message,
      });

      if (res.ok) setStep(2);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erreur de connexion" });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user_id", data.user_id);
        Swal.fire({
          icon: "success",
          title: "Connexion réussie !",
          text: "Bienvenue sur votre compte",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "/profile";
        });
      } else {
        Swal.fire({ icon: "error", title: "Erreur", text: data.message });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erreur serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-white p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">
          {step === 1 ? "Mot de passe oublié ?" : "Vérifiez votre email"}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {step === 1 
            ? "Nous allons vous envoyer un code de vérification" 
            : "Entrez le code reçu par email"}
        </p>

        {step === 1 ? (
          <form onSubmit={sendCode} className="space-y-4">
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Envoi en cours..." : "Recevoir le code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <input
              type="text"
              placeholder="Code à 6 chiffres"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="w-full p-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Vérification..." : "Se connecter"}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-sm">
          <span className="text-blue-600 cursor-pointer hover:underline" 
                onClick={() => window.location.href = "/"}>
            Retour à la connexion
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
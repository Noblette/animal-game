import React, { useState } from "react";
import Swal from "sweetalert2";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email, 2 = code + nouveau mdp
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
        title: res.ok ? "Code envoyé !" : "Erreur",
        text: data.message,
      });

      if (res.ok) setStep(2);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erreur serveur" });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Succès !",
          text: "Votre mot de passe a été modifié.",
        }).then(() => {
          window.location.href = "/login";
        });
      } else {
        Swal.fire({ icon: "error", title: "Erreur", text: data.message });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erreur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-white p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {step === 1 ? "Mot de passe oublié ?" : "Vérification"}
        </h2>

        {step === 1 ? (
          <form onSubmit={sendCode} className="space-y-4">
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Envoi..." : "Recevoir le code"}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <input
              type="text"
              placeholder="Code à 6 chiffres"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 border rounded-lg"
              maxLength={6}
              required
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        )}

        <p className="text-center mt-4 text-sm">
          <span className="text-blue-600 cursor-pointer" onClick={() => window.location.href = "/login"}>
            Retour à la connexion
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
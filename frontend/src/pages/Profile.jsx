import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!userId) {
          setUser(null);
          return;
        }
        const res = await fetch(`http://127.0.0.1:5000/user/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Erreur");
        setUser(data);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Déconnexion ?",
      text: "Vous allez être déconnecté.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, se déconnecter",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("user_id");
      await Swal.fire({
        title: "À bientôt 👋",
        text: "Vous êtes déconnecté.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      window.location.href = "/";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-white">
        <div className="text-center">
          <p className="text-gray-700 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-white p-6">
        {/* Ton message d'erreur actuel */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-purple-100">
          {/* En-tête */}
          <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="relative flex-shrink-0">
              <img
                src={`http://127.0.0.1:5000/${user.photo}`}
                alt="profil"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-md"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">{user.email}</p>

              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
                <span className="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                  Compte client
                </span>
                <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                  ID: {userId}
                </span>
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="p-6 sm:p-10">
            <h3 className="font-semibold text-xl text-gray-800 mb-6">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="font-semibold text-lg mt-1">{user.first_name}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-semibold text-lg mt-1">{user.last_name}</p>
              </div>
              <div className="md:col-span-2 bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-lg mt-1">{user.email}</p>
              </div>
            </div>

            {/* Bouton Logout */}
            <div className="mt-10 flex justify-center sm:justify-end">
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-3.5 rounded-2xl font-semibold transition shadow-md"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Bienvenue sur votre espace profil.
        </p>
      </div>
    </div>
  );
}

export default Profile;
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

        if (!res.ok) {
          throw new Error(data?.message || "Erreur lors du chargement du profil");
        }

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
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-purple-100">
          <h2 className="text-xl font-bold text-red-600 text-center mb-3">
            Profil introuvable
          </h2>
          <p className="text-gray-600 text-center">
            Votre session a peut-être expiré. Merci de vous reconnecter.
          </p>

          <button
            onClick={() => (window.location.href = "/")}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Aller au login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl border border-purple-100 overflow-hidden">
          <div className="p-6 sm:p-8 flex items-center gap-6">
            <div className="relative">
              <img
                src={`http://127.0.0.1:5000/${user.photo}`}
                alt="profil"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-purple-100"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-600 mt-1">{user.email}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                  Compte client
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
                  ID: {userId}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-800">Informations</h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Prénom</p>
                  <p className="font-medium">{user.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium">{user.last_name}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => handleLogout()}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-lg font-semibold transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Bienvenue sur votre espace profil.
        </p>
      </div>
    </div>
  );
}

export default Profile;
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!userId) return setUser(null);
        
        const res = await fetch(`http://127.0.0.1:5000/user/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error();
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
      localStorage.removeItem("role");
      await Swal.fire({ title: "À bientôt 👋", icon: "success", timer: 1500, showConfirmButton: false });
      window.location.href = "/";
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-white">Chargement...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-white p-6">Profil introuvable</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-white">
      {/* Conteneur plus large */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-purple-100">
          
          {/* En-tête plus grand */}
          <div className="p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 bg-gradient-to-r from-indigo-50 to-purple-50">
            {/* <div className="relative">
              <img
                src={`http://127.0.0.1:5000/${user.photo}`}
                alt="profil"
                className="w-36 h-36 lg:w-44 lg:h-44 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div> */}
            <img
                src={`http://127.0.0.1:5000/uploads/${user.photo}`}
                alt="profil"
                className="w-36 h-36 lg:w-44 lg:h-44 rounded-full object-cover border-4 border-white shadow-lg"
              />

            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-xl text-gray-600 mt-3">{user.email}</p>

              <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-4">
                <span
                  className={`px-5 py-2 rounded-full font-medium ${
                    role === "admin"
                      ? "bg-red-100 text-red-700"
                      : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {role === "admin"
                    ? "Administrateur 👑"
                    : "Utilisateur 🎮"}
                </span>

                <span className="px-5 py-2 rounded-full bg-purple-100 text-purple-700 font-medium">
                  ID: {userId}
                </span>
              </div>
            </div>
          </div>

          {/* Section Informations */}
          <div className="p-8 lg:p-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-8">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="text-2xl font-semibold mt-2">{user.first_name}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-sm text-gray-500">Nom</p>
                <p className="text-2xl font-semibold mt-2">{user.last_name}</p>
              </div>
              <div className="md:col-span-2 bg-gray-50 rounded-2xl p-6">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-2xl font-semibold mt-2">{user.email}</p>
              </div>
            </div>

            {/* Logout */}
            <div className="mt-12 flex justify-center lg:justify-end">
              <button
                onClick={handleLogout}
                className="w-full lg:w-auto bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition shadow-lg"
              >
                Se déconnecter
              </button>
              {
                role === "admin" && (
                  <button
                    onClick={() => window.location.href="/admin"}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700"
                  >
                    Dashboard Admin
                  </button>
                )
              }
              {
                role === "user" && (
                  <button
                    onClick={() => window.location.href="/user"}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
                  >
                    Dashboard User
                  </button>
                )
              }

            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-8">
          Bienvenue sur votre espace profil.
        </p>
      </div>
    </div>
  );
}

export default Profile;
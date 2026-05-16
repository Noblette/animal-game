import React from "react";
import Swal from "sweetalert2";
import {
  FaUsers,
  FaPaw,
  FaGamepad,
  FaChartBar,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

function Admin() {
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center">
          <h1 className="text-4xl font-bold text-red-500">
            Accès refusé 🚫
          </h1>
          <p className="text-gray-500 mt-3">
            Vous n’avez pas les permissions.
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Déconnexion ?",
      text: "Vous allez être déconnecté.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      localStorage.clear();

      await Swal.fire({
        title: "À bientôt 👋",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      window.location.href = "/";
    }
  };

  const cards = [
    {
      title: "Gestion Utilisateurs",
      icon: <FaUsers size={40} />,
      description: "Ajouter, modifier ou supprimer des utilisateurs",
    },
    {
      title: "Gestion Animaux",
      icon: <FaPaw size={40} />,
      description: "Administrer les animaux du jeu",
    },
    {
      title: "Gestion Jeux",
      icon: <FaGamepad size={40} />,
      description: "Configurer les mini-jeux",
    },
    {
      title: "Statistiques",
      icon: <FaChartBar size={40} />,
      description: "Visualiser les données",
    },
    {
      title: "Paramètres",
      icon: <FaCog size={40} />,
      description: "Configuration du système",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-white">
      <div className="max-w-7xl mx-auto p-8">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900">
              Dashboard Admin 👑
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Gérez votre plateforme Animal Game
            </p>
          </div>

          <div className="flex gap-4 mt-5 md:mt-0">
            <button
              onClick={() => window.location.href = "/profile"}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl shadow-lg"
            >
              <FaUserCircle />
              Profil
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl shadow-lg"
            >
              <FaSignOutAlt />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 p-8 cursor-pointer border border-purple-100 hover:-translate-y-2"
            >
              <div className="text-purple-600 mb-4">
                {card.icon}
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                {card.title}
              </h2>

              <p className="text-gray-500 mt-3">
                {card.description}
              </p>

              <button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl w-full">
                Ouvrir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;
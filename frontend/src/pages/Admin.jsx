import React from "react";

function Admin() {
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-2xl font-bold">
        Accès refusé 🚫
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold">
        Dashboard Admin 👑
      </h1>
    </div>
  );
}

export default Admin;
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

function Profile() {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("user_id");



  useEffect(() => {
    fetch(`http://127.0.0.1:5000/user/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  if (!user) return <p>Chargement...</p>;

  return (
    <div>
      <h1>{user.first_name} {user.last_name}</h1>
      <p>{user.email}</p>

      <img 
        src={`http://127.0.0.1:5000/${user.photo}`} 
        alt="profil" 
        width="150"
      />
      <button
        onClick={() => {
          localStorage.removeItem("user_id");
          window.location.href = "/";
        }}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Logout
      </button>
    </div>
  );
}

export default Profile;
import React, { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/user/1") // test avec ID 1
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
    </div>
  );
}

export default Profile;
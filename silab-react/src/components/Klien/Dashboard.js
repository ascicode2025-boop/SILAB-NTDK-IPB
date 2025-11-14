import React, { useEffect, useState } from "react";
import NavbarLoginKlien from "./NavbarLoginKlien"; // sama folder Klien
import "@fontsource/poppins";
import { getUser } from "../../services/AuthService"; // naik dua folder ke luar
import DaftarAnalisisLogin from "./DaftarAnalisisLogin"; // sama folder Klien
import FooterSetelahLogin from "../FooterSetelahLogin"; // naik satu folder ke components


function Dashboard() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = getUser(); // ambil dari AuthService
    if (user && (user.name || user.username || user.email)) {
      setUsername(user.name || user.username || user.email);
    }
  }, []);

  return (
    <NavbarLoginKlien>
      <div
        className="dashboard-page p-4"
        style={{
          fontFamily: "Poppins, sans-serif",
          minHeight: "100vh",
          backgroundColor: "#fafafa",
        }}
      >
        <div className="container-fluid">
          <h4 className="fw-normal mb-3">
            Jumpa lagi,{" "}
            <span style={{ fontWeight: "600", color:"black" }}>
              {username || "Pengguna"}
            </span>
            👋
          </h4>
            <DaftarAnalisisLogin />
        </div>
      </div>
    <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
}

export default Dashboard;

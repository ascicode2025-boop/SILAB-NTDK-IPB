import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Image } from "react-bootstrap";
import FooterSetelahLogin from "../FooterSetelahLogin";
import NavbarProfile from "./NavbarProfile";
import { FaUserCircle } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import "@fontsource/poppins";

function EditProfileKlien() {
  const history = useHistory();

  // State awal user
  const [user, setUser] = useState({
    name: "Aryanto Pratama",
    email: "aryanto@example.com",
    institution: "IPB University",
    phone: "081234567890",
    role: "Member",
    avatar: "",
    bio: "Halo! Saya seorang pengembang React yang menyukai teknologi modern.",
  });

  // Update input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Upload avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const avatarUrl = URL.createObjectURL(file);
      setUser((prev) => ({ ...prev, avatar: avatarUrl }));
    }
  };

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(user));
    alert("Profil berhasil diperbarui!");
    history.push("/dashboard");
  };

  return (
    <>
      {/* ✅ NAVBAR DIPISAH */}
      <NavbarProfile user={user} />

      {/* Main Content */}
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-md-8">

            {/* Avatar */}
            <div className="text-center mb-4">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  roundedCircle
                  width={150}
                  height={150}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <FaUserCircle size={150} className="text-primary" />
              )}

              <div className="mt-2">
                <label className="form-label">{user.name}</label>
              </div>

              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  id="avatarInput"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() =>
                    document.getElementById("avatarInput").click()
                  }
                >
                  Ubah Foto Profile
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="card shadow-sm">
              <div className="card-body">

                <div className="mb-3">
                  <label className="form-label">Nama</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Institusi</label>
                  <input
                    type="text"
                    className="form-control"
                    name="institution"
                    value={user.institution}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Nomor Telepon</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-control"
                    name="role"
                    value={user.role}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-control"
                    name="bio"
                    value={user.bio}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <button className="btn btn-primary me-2" onClick={handleSave}>
                  Simpan
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => history.goBack()}
                >
                  Kembali
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <FooterSetelahLogin />
    </>
  );
}

export default EditProfileKlien;

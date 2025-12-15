import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Image, Dropdown, Spinner } from "react-bootstrap";
import FooterSetelahLogin from "../FooterSetelahLogin";
import NavbarProfile from "./NavbarProfile";
import { FaUserCircle } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "@fontsource/poppins";

function ProfileAkunKlien() {
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      history.push("/login");
      return;
    }

    axios
      .get("http://localhost:8000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.clear();
        history.push("/login");
      })
      .finally(() => setLoading(false));
  }, [history, token]);

  const handleLogout = () => {
    localStorage.clear();
    history.push("/LandingPage");
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const avatarUrl = user.avatar
    ? `http://localhost:8000/storage/${user.avatar}`
    : null;

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <NavbarProfile user={user} />

      {/* ===== MAIN CONTENT ===== */}
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-md-8">

            {/* PROFILE HEADER */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body d-flex align-items-center flex-wrap">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="rounded-circle me-4 mb-3 mb-md-0"
                    width="120"
                    height="120"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <FaUserCircle size={120} className="me-4 text-primary" />
                )}

                <div>
                  <h3>{user.name}</h3>
                  <p className="text-muted mb-1">{user.role}</p>
                  <p className="mb-0">{user.email}</p>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="row text-center mb-4">
              <div className="col-4">
                <div className="card py-3 shadow-sm">
                  <h5>—</h5>
                  <small className="text-muted">Pesanan</small>
                </div>
              </div>
              <div className="col-4">
                <div className="card py-3 shadow-sm">
                  <h5>—</h5>
                  <small className="text-muted">Keaktifan</small>
                </div>
              </div>
              <div className="col-4">
                <div className="card py-3 shadow-sm">
                  <h5>—</h5>
                  <small className="text-muted">Achievements</small>
                </div>
              </div>
            </div>

            {/* BIO */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Bio</h5>
                <p className="card-text">{user.bio || "Belum ada bio"}</p>
              </div>
            </div>

            <div className="mt-3">
              <button
                className="btn btn-primary me-2"
                onClick={() =>
                  history.push("/dashboard/ProfileAkunKlien/EditProfileKlien")
                }
              >
                Edit Profile
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => history.push("/dashboard")}
              >
                Kembali
              </button>
            </div>

          </div>
        </div>
      </div>

      <FooterSetelahLogin />
    </>
  );
}

export default ProfileAkunKlien;

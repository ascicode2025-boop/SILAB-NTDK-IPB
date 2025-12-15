import React from "react";
import { Image, Dropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import "@fontsource/poppins";

function NavbarProfile({ user }) {
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    history.push("/LandingPage");
  };

  return (
    <header className="dashboard-header d-flex justify-content-between align-items-center px-3 py-2 shadow-sm bg-white flex-wrap">
      {/* Logo */}
      <div className="d-flex align-items-center">
        <Image
          src="/asset/gambarLogo.png"
          alt="IPB Logo"
          style={{ width: "140px", height: "auto", marginBottom: "-11px" }}
        />
      </div>

      {/* User Dropdown */}
      <Dropdown align="end" className="mt-2 mt-md-0">
        <Dropdown.Toggle
          variant="light"
          id="dropdown-user"
          className="d-flex align-items-center border-0 bg-transparent"
        >
          {user?.avatar ? (
            <Image
              src={user.avatar}
              roundedCircle
              width={25}
              height={25}
              style={{ objectFit: "cover" }}
              className="me-2"
            />
          ) : (
            <FaUserCircle size={25} className="me-2 text-primary" />
          )}
          <span
            className="fw-semibold d-none d-md-inline"
            style={{ fontSize: "0.9rem" }}
          >
            {user?.name || "User"}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={() => history.push("/profile")}>
            Profil
          </Dropdown.Item>
          <Dropdown.Item onClick={handleLogout}>
            Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  );
}

export default NavbarProfile;

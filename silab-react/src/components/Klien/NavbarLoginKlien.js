import React, { useState, useEffect } from "react";
import { Image, Nav, Dropdown } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaCalendarAlt,
  FaClipboardList,
  FaClock,
  FaFlask,
  FaCreditCard,
  FaHistory,
  FaBars,
  FaUserCircle,
} from "react-icons/fa";
import "@fontsource/poppins";

function NavbarLogin({ children }) {
  const history = useHistory();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Ambil data user dari localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const menus = [
    { key: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { key: "sop", label: "SOP Analisis Lab", icon: <FaFileAlt /> },
    { key: "kalender", label: "Kalender Pemesanan", icon: <FaCalendarAlt /> },
    { key: "pemesanan", label: "Pemesanan Sampel", icon: <FaClipboardList /> },
    { key: "persetujuan", label: "Menunggu Persetujuan", icon: <FaClock /> },
    { key: "proses", label: "Proses Sampel", icon: <FaFlask /> },
    { key: "pembayaran", label: "Pembayaran & Invoice", icon: <FaCreditCard /> },
    { key: "riwayat", label: "Riwayat", icon: <FaHistory /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    history.push("/login");
  };

  return (
    <div className="dashboard-layout" style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Header */}
      <header className="dashboard-header d-flex justify-content-between align-items-center px-3 py-2 shadow-sm bg-white">
        <div className="d-flex align-items-center">
          {/* Tombol burger */}
          <button
            className="btn border-0 me-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars size={22} />
          </button>

          {/* Logo & subtitle */}
          <div className="text-center d-flex flex-column align-items-start">
            <Image
              src="/asset/gambarLogo.png"
              alt="IPB Logo"
              style={{ width: "140px", height: "auto", marginBottom: "8px" }}
            />
            <div className="text-muted subtitle-text">
              Sistem Informasi Laboratorium Nutrisi Ternak Daging Dan Kerja
            </div>
          </div>
        </div>

        {/* Profil Dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            id="dropdown-user"
            className="d-flex align-items-center border-0 bg-transparent"
          >
            <FaUserCircle size={25} className="me-2 text-primary" />
            <span
              className="fw-semibold d-none d-md-inline"
              style={{ fontSize: "0.9rem" }}
            >
              {user?.name || "User"}
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => alert("Profil belum tersedia")}>
              Profil
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </header>

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar bg-white p-3 shadow-sm ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <Nav className="flex-column mt-2">
          {menus.map((menu) => (
            <Nav.Link
              key={menu.key}
              onClick={() => {
                setActiveMenu(menu.key);
                history.push(`/${menu.key}`);
                setSidebarOpen(false);
              }}
              className={`d-flex align-items-center mb-2 py-2 px-3 rounded ${
                activeMenu === menu.key ? "active" : ""
              }`}
              style={{
                color: "#000",
                fontSize: "0.95rem",
                transition: "background 0.3s, color 0.3s",
                cursor: "pointer",
              }}
            >
              <span className="me-3" style={{ fontSize: "1.1rem" }}>
                {menu.icon}
              </span>
              {menu.label}
            </Nav.Link>
          ))}
        </Nav>
      </aside>

      {/* Overlay saat sidebar terbuka di mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Konten utama */}
      <main className="dashboard-content">
        <div className="page-title-bar">
          <h5 className="m-0 px-4 py-2">
            {menus.find((m) => m.key === activeMenu)?.label}
          </h5>
        </div>

        {/* ✅ tempat isi halaman */}
        <div className="dashboard-inner p-4">{children}</div>
      </main>

      {/* CSS */}
      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
        }

        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 1050;
        }

        .dashboard-sidebar {
          width: 240px;
          position: fixed;
          top: 70px;
          left: 0;
          height: calc(100vh - 70px);
          overflow-y: auto;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 1051;
          border-right: 1px solid #e5e5e5;
        }

        .dashboard-sidebar.open {
          transform: translateX(0);
        }

        .dashboard-sidebar .nav-link.active {
          background-color: #f0f0f0;
          font-weight: 600;
        }

        .dashboard-content {
          flex: 1;
          background-color: #fafafa;
          min-height: calc(100vh - 70px);
          margin-left: 0;
          transition: margin-left 0.3s ease;
        }

        .page-title-bar {
          background-color: #a6867b;
          color: #fff;
          font-weight: 500;
          font-size: 1.25rem;
          letter-spacing: 0.5px;
          box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.25) inset;
        }

        .sidebar-overlay {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1050;
        }

        .subtitle-text {
          font-size: 0.8rem;
          margin-top: -1px;
          white-space: normal;
        }

        @media (min-width: 992px) {
          .dashboard-sidebar {
            transform: translateX(0);
          }
          .dashboard-content {
            margin-left: 240px;
          }
          .sidebar-overlay {
            display: none;
          }
        }

        @media (max-width: 991.98px) {
          .dashboard-sidebar {
            padding-top: 1rem;
            width: 75%;
            max-width: 260px;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
            border-right: none;
          }

          .dashboard-header img {
            width: 120px;
          }

          .dashboard-header .subtitle-text {
            font-size: 0.4rem !important;
            white-space: nowrap !important;
            text-overflow: ellipsis;
            max-width: 180px;
          }

          .dashboard-header button {
            padding: 4px 6px;
          }

          .dashboard-sidebar .nav-link {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}

export default NavbarLogin;
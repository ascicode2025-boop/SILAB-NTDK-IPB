import React, { useState, useEffect } from "react";
import { Image, Nav, Dropdown } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardCheck,
  FaFileAlt,
  FaChartLine,
  FaBars,
  FaUserCircle,
} from "react-icons/fa";
import "@fontsource/poppins";
import Footer from "./Footer";

function NavbarLoginKepala({ children }) {
  const history = useHistory();
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const menus = [
    { key: "dashboard", label: "Dasbor", icon: <FaTachometerAlt /> },
    { key: "verifikasi", label: "Verifikasi Akhir Hasil Analisis", icon: <FaClipboardCheck /> },
    { key: "laporan", label: "Laporan & Arsip Hasil", icon: <FaFileAlt /> },
    { key: "monitoring", label: "Monitoring Aktivitas Lab", icon: <FaChartLine /> },
  ];

  useEffect(() => {
    const path = location.pathname.replace("/kepala/", "");
    const found = menus.find((m) => path.startsWith(m.key));
    if (found) setActiveMenu(found.key);
  }, [location.pathname]);

  const currentTitle =
    menus.find((m) => m.key === activeMenu)?.label || "Dashboard";

  const handleLogout = () => {
    localStorage.clear();
    history.push("/login");
  };

  return (
    <div className="layout-root">
      {/* ===== HEADER ===== */}
      <header className="topbar">
        <div className="d-flex align-items-center">
          <button
            className="btn d-lg-none me-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars size={22} />
          </button>

          <div className="logo-wrap">
            <Image
              src="/asset/gambarLogo.png"
              alt="IPB Logo"
              className="logo-img"
            />
            <span className="logo-subtitle">
              Sistem Informasi Laboratorium Nutrisi Ternak Daging Dan Kerja
            </span>
          </div>
        </div>

        <Dropdown align="end">
          <Dropdown.Toggle className="profile-btn">
            <FaUserCircle size={26} className="me-2" />
            <span>{user?.name || "Kepala Lab"}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </header>

      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Nav className="flex-column">
          {menus.map((menu) => (
            <Nav.Link
              key={menu.key}
              onClick={() => {
                setActiveMenu(menu.key);
                history.push(`/kepala/${menu.key}`);
                setSidebarOpen(false);
              }}
              className={`sidebar-item ${
                activeMenu === menu.key ? "active" : ""
              }`}
            >
              <span className="icon">{menu.icon}</span>
              {menu.label}
            </Nav.Link>
          ))}
        </Nav>
      </aside>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ===== CONTENT ===== */}
      <main className="content-area">
        <div className="page-title">
          <h5>{currentTitle}</h5>
        </div>

        <div className="content-inner">{children}</div>

        <Footer />
      </main>

      {/* ===== CSS ===== */}
      <style>{`
        .layout-root {
          font-family: "Poppins", sans-serif;
          min-height: 100vh;
        }

        .topbar {
          height: 72px;
          background: #fff;
          border-bottom: 1px solid #ddd;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1060;
        }

        .logo-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .logo-img {
          width: 150px;
        }

        .logo-subtitle {
          font-size: 0.8rem;
          color: #7b6f6a;
          line-height: 1.3;
          max-width: 480px;
        }

        .profile-btn {
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          font-weight: 500;
          color: #3e2723;
        }

        .sidebar {
          width: 260px;
          background: #fff;
          position: fixed;
          top: 72px;
          left: 0;
          height: calc(100vh - 72px);
          border-right: 1px solid #e5e5e5;
          padding: 20px 12px;
          transform: translateX(-100%);
          transition: 0.3s ease;
          z-index: 1055;
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 14px;
          color: #3e2723;
          font-size: 0.95rem;
          margin-bottom: 8px;
        }

        .sidebar-item:hover {
          background: #f3edea;
        }

        .sidebar-item.active {
        background: #e5e5e5;
        color: #3e2723;
        font-weight: 600;
        }


        .content-area {
          margin-top: 72px;
          background: #e5e5e5;
        }

        .page-title {
          background: #a6867b;
          color: #fff;
          padding: 14px 28px;
          border-bottom-left-radius: 28px;
          border-bottom-right-radius: 28px;
          box-shadow: inset 0 -4px 8px rgba(0,0,0,0.25);
        }

        .content-inner {
          padding: 24px;
        }

        .overlay {
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 1050;
        }

        @media (min-width: 992px) {
          .sidebar {
            transform: translateX(0);
          }
          .content-area {
            margin-left: 260px;
          }
        }
      `}</style>
    </div>
  );
}

export default NavbarLoginKepala;

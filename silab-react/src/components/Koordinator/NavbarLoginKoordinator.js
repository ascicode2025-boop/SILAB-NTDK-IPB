import React, { useState, useEffect } from "react";
import { Image, Nav, Dropdown } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardCheck,
  FaMoneyBill,
  FaPenFancy,
  FaFileAlt,
  FaCog,
  FaBars,
  FaUserCircle,
} from "react-icons/fa";
import "@fontsource/poppins";
import Footer from "./Footer";

function NavbarLoginKoordinator({ children }) {
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
    { key: "verifikasi", label: "Verifikasi Hasil Analisis", icon: <FaClipboardCheck /> },
    { key: "pembayaran", label: "Manajemen Pembayaran", icon: <FaMoneyBill /> },
    { key: "tandatangan", label: "Tanda Tangan", icon: <FaPenFancy /> },
    { key: "laporan", label: "Laporan & Rekapitulasi", icon: <FaFileAlt /> },
    { key: "manajemen", label: "Manajemen Akun & Sistem", icon: <FaCog /> },
  ];

  useEffect(() => {
    const path = location.pathname.replace("/koordinator/", "");
    const found = menus.find((m) => path.startsWith(m.key));
    if (found) setActiveMenu(found.key);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    history.push("/login");
  };

  const currentTitle =
    menus.find((m) => m.key === activeMenu)?.label || "Dashboard";

  return (
    <div className="dashboard-layout">
      {/* ================= HEADER ================= */}
      <header className="dashboard-header px-3 py-2 shadow-sm bg-white">
        <div className="d-flex align-items-center">
          <button
            className="btn border-0 me-3 d-lg-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars size={22} />
          </button>

          <div className="d-flex flex-column">
            <Image
              src="/asset/gambarLogo.png"
              alt="IPB Logo"
              style={{ width: "140px", marginBottom: "4px" }}
            />
            <div className="subtitle-text">
              Sistem Informasi Laboratorium Nutrisi Ternak Daging Dan Kerja
            </div>
          </div>
        </div>

        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="border-0 bg-transparent d-flex align-items-center"
          >
            <FaUserCircle size={24} className="me-2 text-primary" />
            <span className="fw-semibold d-none d-md-inline">
              {user?.name || "Koordinator"}
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </header>

   {/* ================= SIDEBAR ================= */}
      <aside className={`dashboard-sidebar bg-white p-3 shadow-sm ${sidebarOpen ? "open" : ""}`}>
        <Nav className="flex-column mt-2">
          {menus.map((menu) => (
            <Nav.Link
              key={menu.key}
              onClick={() => {
                setActiveMenu(menu.key);
                history.push(`/koordinator/${menu.key}`);
                setSidebarOpen(false);
              }}
              className={`d-flex align-items-center mb-2 py-2 px-3 rounded menu-item ${
                activeMenu === menu.key ? "active" : ""
              }`}
              style={{ cursor: "pointer" }}
            >
              <span className="me-3" style={{ fontSize: "1.1rem" }}>
                {menu.icon}
              </span>
              {menu.label}
            </Nav.Link>
          ))}
        </Nav>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= CONTENT ================= */}
      <main className="dashboard-content">
        <div className="page-title-bar">
          <h5 className="m-0 px-4 py-2">{currentTitle}</h5>
        </div>

        <div className="dashboard-inner">{children}</div>

        {/* ================= FOOTER ================= */}
        <Footer />
      </main>

      {/* ================= CSS ================= */}
      <style>{`
        .dashboard-layout {
          min-height: 100vh;
          font-family: "Poppins", sans-serif;
        }

        .dashboard-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          z-index: 1060;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
        }

      .subtitle-text {
         font-size: 0.8rem;
         color: #7b6f6a;
         margin-top: 4px;    
         line-height: 1.3;    
        }


        .dashboard-sidebar {
          width: 240px;
          position: fixed;
          top: 70px;
          left: 0;
          height: calc(100vh - 70px);
          background: #fff;
          border-right: 1px solid #e5e5e5;
          transform: translateX(-100%);
          transition: transform 0.3s;
          z-index: 1055;
          padding: 12px;
        }

        .dashboard-sidebar.open {
          transform: translateX(0);
        }

        .menu-item {
          padding: 10px 14px;
          border-radius: 14px;
          margin-bottom: 6px;
          color: #000;
          cursor: pointer;
        }

        .menu-item.active {
          background: #f0f0f0;
          font-weight: 600;
        }

        .dashboard-content {
          margin-top: 70px;
          background: #f0f0f0;
          min-height: auto;      
          padding-bottom: 0;     
        }
        .dashboard-inner {
          padding: 16px;
        }

        .page-title-bar {
          background-color: #a6867b;
          color: #fff;
          border-bottom-left-radius: 30px;
          border-bottom-right-radius: 30px;
          box-shadow: 0 -4px 8px rgba(0,0,0,0.25) inset;
        }

        .sidebar-overlay {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 1050;
        }

        @media (min-width: 992px) {
          .dashboard-sidebar {
            transform: translateX(0);
          }
          .dashboard-content {
            margin-left: 240px;
          }
        }
      `}</style>
    </div>
  );
}

export default NavbarLoginKoordinator;

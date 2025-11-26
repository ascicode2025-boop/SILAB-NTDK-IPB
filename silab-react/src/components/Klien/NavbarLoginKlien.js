import React, { useState, useEffect } from "react";
import { Image, Nav, Dropdown } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaFileAlt, FaCalendarAlt, FaClipboardList, FaClock, FaFlask, FaCreditCard, FaHistory, FaBars, FaUserCircle } from "react-icons/fa";
import "@fontsource/poppins";

function NavbarLogin({ children }) {
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
    { key: "dashboard", label: "Beranda", icon: <FaTachometerAlt /> },
    { key: "panduanSampelKlien", label: "SOP Analisis Lab", icon: <FaFileAlt /> },
    { key: "bookingCalenderKlien", label: "Kalender Pemesanan", icon: <FaCalendarAlt /> },
    { key: "pemesananSampelKlien", label: "Pemesanan Sampel", icon: <FaClipboardList /> },
    { key: "menungguPersetujuan", label: "Menunggu Persetujuan", icon: <FaClock /> },
    { key: "prosesAnalisis", label: "Proses Sampel", icon: <FaFlask /> },
    { key: "pembayaran", label: "Pembayaran & Invoice", icon: <FaCreditCard /> },
    { key: "riwayat", label: "Riwayat", icon: <FaHistory /> },
  ];

  // sinkronkan activeMenu berdasarkan URL
  useEffect(() => {
    const path = location.pathname.replace("/dashboard/", "");
    const found = menus.find((m) => path.startsWith(m.key));
    if (found) {
      setActiveMenu(found.key);
    }
  }, [location.pathname]);

  // ============== ✔ Tambahan logika judul tanpa mengubah tampilan ==============
  const currentTitle = (() => {
    return menus.find((m) => m.key === activeMenu)?.label;
  })();
  // ==============================================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    history.push("/landingPage");
  };

  return (
    <div className="dashboard-layout" style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Header */}
      <header className="dashboard-header d-flex justify-content-between align-items-center px-3 py-2 shadow-sm bg-white">
        <div className="d-flex align-items-center">
          <button className="btn border-0 me-3 d-lg-none" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <FaBars size={22} />
          </button>

          <div className="text-center d-flex flex-column align-items-start">
            <Image src="/asset/gambarLogo.png" alt="IPB Logo" style={{ width: "140px", height: "auto", marginBottom: "-11px" }} />
            <div className="text-muted subtitle-text" style={{ marginTop: "13px" }}>
              Sistem Informasi Laboratorium Nutrisi Ternak Daging Dan Kerja
            </div>
          </div>
        </div>

        <Dropdown align="end">
          <Dropdown.Toggle variant="light" id="dropdown-user" className="d-flex align-items-center border-0 bg-transparent">
            <FaUserCircle size={25} className="me-2 text-primary" />
            <span className="fw-semibold d-none d-md-inline" style={{ fontSize: "0.9rem" }}>
              {user?.name || "User"}
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => alert("Profil belum tersedia")}>Profil</Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </header>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar bg-white p-3 shadow-sm ${sidebarOpen ? "open" : ""}`}>
        <Nav className="flex-column mt-2">
          {menus.map((menu) => (
            <Nav.Link
              key={menu.key}
              onClick={() => {
                setActiveMenu(menu.key);
                history.push(`/dashboard/${menu.key}`);
                setSidebarOpen(false);
              }}
              className={`d-flex align-items-center mb-2 py-2 px-3 rounded ${activeMenu === menu.key ? "active" : ""}`}
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

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Konten */}
      <main className="dashboard-content">
        <div className="page-title-bar">
          {/* ✔ Judul diperbarui tanpa mengubah UI */}
          <h5 className="m-0 px-4 py-2">{currentTitle}</h5>
        </div>

        <div className="dashboard-inner">{children}</div>
      </main>

      {/* CSS */}
      <style>{`
        .dashboard-layout { display: flex; min-height: 100vh; flex-direction: column; }
        .dashboard-header { position: fixed; top: 0; left: 0; right: 0; height: 70px; z-index: 1060; background: #fff; display: flex; align-items: center; }
        .dashboard-sidebar { width: 240px; position: fixed; top: 70px; left: 0; height: calc(100vh - 70px); overflow-y: auto; transform: translateX(-100%); transition: transform 0.3s ease; z-index: 1055; border-right: 1px solid #e5e5e5; background: #fff; }
        .dashboard-sidebar.open { transform: translateX(0); }
        .dashboard-sidebar .nav-link.active { background-color: #f0f0f0; font-weight: 600; }
        .dashboard-content { flex: 1; background-color: #fafafa; min-height: calc(100vh - 70px); margin-top: 70px; margin-left: 0; padding: 0 !important; transition: margin-left 0.3s ease; }
        .dashboard-inner { padding: 0 !important; margin: 0 !important; }
        .page-title-bar { background-color: #a6867b; color: #fff; font-weight: 500; font-size: 1.25rem; letter-spacing: 0.5px; box-shadow: 0 -4px 8px rgba(0,0,0,0.25) inset; border-bottom-left-radius: 30px; border-bottom-right-radius:30px; }
        .sidebar-overlay { position: fixed; top: 70px; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 1050; }
        .subtitle-text { font-size: 0.8rem; white-space: normal; }

        @media (min-width: 992px) {
          .dashboard-sidebar { transform: translateX(0); }
          .dashboard-content { margin-left: 240px; margin-top: 70px; }
        }

        @media (max-width: 991.98px) {
          .dashboard-sidebar { padding-top: 1rem; width: 75%; max-width: 260px; box-shadow: 2px 0 8px rgba(0,0,0,0.15); }
          .dashboard-header img { width: 120px; }
          .dashboard-header .subtitle-text { font-size: 0.4rem !important; white-space: nowrap !important; text-overflow: ellipsis; max-width: 180px; }
          .dashboard-sidebar .nav-link { font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
}

export default NavbarLogin;

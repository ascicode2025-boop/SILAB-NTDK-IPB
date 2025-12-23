import React, { useState, useEffect } from "react";
import { Image, Nav, Dropdown, Badge } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaFileAlt, FaCalendarAlt, FaClipboardList, FaClock, FaFlask, FaCreditCard, FaHistory, FaBars, FaUserCircle, FaBell } from "react-icons/fa";
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../services/NotificationService";
import "@fontsource/poppins";

function NavbarLogin({ children }) {
  const history = useHistory();
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // 1. Ambil User dari LocalStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
        setUser(storedUser);
    }
  }, []);

  // 2. Fetch notifications dengan polling
  const fetchNotifications = async () => {
    try {
      const response = await getUnreadNotifications();
      setNotifications(response.data || []);
      setNotifCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications(); // Initial fetch
    const interval = setInterval(fetchNotifications, 30000); // Poll setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      await markNotificationAsRead(notif.id);
      fetchNotifications(); // Refresh
      
      // Navigate to relevant page
      if (notif.booking_id) {
        history.push('/dashboard/prosesAnalisis');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // ============================================================
  // 🔥 FITUR PROTEKSI: PAKSA LENGKAPI PROFIL 🔥
  // ============================================================
  useEffect(() => {
    const checkProfileCompletion = () => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        
        if (storedUser) {
            // Cek apakah data wajib sudah terisi?
            // Kita anggap belum lengkap jika full_name atau institusi masih kosong/null
            const isProfileIncomplete = !storedUser.full_name || !storedUser.institusi;

            // Halaman yang BOLEH diakses walau profil belum lengkap
            // (Hanya halaman Edit Profil yang diizinkan)
            // Sesuaikan string ini dengan URL Route di App.js Anda untuk Edit Profil
            const editProfilePath = "ProfileAkunKlien/EditProfileKlien"; 
            
            // Cek apakah user sedang berada di halaman edit profil?
            const isCurrentlyOnEditPage = location.pathname.includes(editProfilePath);

            // LOGIKA UTAMA:
            // Jika Profil Belum Lengkap DAN User BUKAN di halaman edit profil
            if (isProfileIncomplete && !isCurrentlyOnEditPage) {
                // Paksa pindah ke halaman Edit Profil
                // Pastikan path ini sesuai dengan Route Anda
                history.replace("/dashboard/ProfileAkunKlien/EditProfileKlien"); 
                
                // Opsional: Tampilkan alert sekali saja (bisa pakai toastr/swal agar lebih bagus)
                // alert("Mohon lengkapi Nama Lengkap dan Institusi Anda terlebih dahulu.");
            }
        }
    };

    // Jalankan pengecekan setiap kali URL berubah
    checkProfileCompletion();
  }, [location.pathname, history]);
  // ============================================================


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

  const currentTitle = (() => {
    return menus.find((m) => m.key === activeMenu)?.label;
  })();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    history.push("/LandingPage");
  };

  const avatarSrc = user?.avatar
  ? (user.avatar.startsWith('http') || user.avatar.startsWith('blob') 
      ? user.avatar 
      : `http://localhost:8000/storage/${user.avatar}`)
  : null;

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
            <div className="text-muted subtitle-text" style={{ marginTop: "15px" }}>
              Sistem Informasi Laboratorium Nutrisi Ternak Daging Dan Kerja
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Notification Bell */}
          <Dropdown show={showNotifDropdown} onToggle={(isOpen) => setShowNotifDropdown(isOpen)} align="end">
            <Dropdown.Toggle 
              variant="light" 
              className="border-0 bg-transparent position-relative p-2"
              style={{ cursor: 'pointer' }}
            >
              <FaBell size={20} className="text-secondary" />
              {notifCount > 0 && (
                <Badge 
                  bg="danger" 
                  pill 
                  style={{ 
                    position: 'absolute', 
                    top: '0', 
                    right: '0', 
                    fontSize: '0.65rem',
                    minWidth: '18px',
                    height: '18px'
                  }}
                >
                  {notifCount}
                </Badge>
              )}
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ maxHeight: '400px', overflowY: 'auto', minWidth: '300px' }}>
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                <strong>Notifikasi</strong>
                {notifCount > 0 && (
                  <button 
                    className="btn btn-link btn-sm text-decoration-none p-0" 
                    onClick={handleMarkAllAsRead}
                  >
                    Tandai Semua
                  </button>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <FaBell size={30} className="mb-2" />
                  <div>Tidak ada notifikasi</div>
                </div>
              ) : (
                notifications.map((notif) => (
                  <Dropdown.Item 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    className="py-2 px-3"
                    style={{ whiteSpace: 'normal', borderBottom: '1px solid #f0f0f0' }}
                  >
                    <div>
                      <strong className="d-block">{notif.title}</strong>
                      <small className="text-muted">{notif.message}</small>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(notif.created_at).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </Dropdown.Item>
                ))
              )}
            </Dropdown.Menu>
          </Dropdown>

          {/* User Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" id="dropdown-user" className="d-flex align-items-center border-0 bg-transparent">
              {avatarSrc ? (
                  <Image 
                      src={avatarSrc} 
                      roundedCircle 
                      width={25} 
                      height={25} 
                      style={{ objectFit: "cover" }} 
                      className="me-2" 
                  />
              ) : (
                  <FaUserCircle size={25} className="me-2 text-primary" />
              )}
              
              <span className="fw-semibold d-none d-md-inline" style={{ fontSize: "0.9rem" }}>
                {user?.name || "User"}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => history.push("/dashboard/ProfileAkunKlien")}>Profil</Dropdown.Item>
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar bg-white p-3 shadow-sm ${sidebarOpen ? "open" : ""}`}>
        <Nav className="flex-column mt-2">
          {menus.map((menu) => (
            <Nav.Link
              key={menu.key}
              onClick={() => {
                // Walau user klik menu, useEffect proteksi di atas akan tetap mencegatnya
                // jika profil belum lengkap
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
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Modal } from "react-bootstrap";
import { ShieldCheck, Edit3, Trash2, Plus, Search, Users, Settings, UserCircle, EyeOff, Eye, X } from "lucide-react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";
import axios from "axios";
import { getAuthHeader, getToken } from "../../services/AuthService";

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

const ManajemenAkun = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Manajemen Role";
  }, []);

  // State untuk Modal dan Visibilitas Password
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dynamic users fetched from backend
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Add account form state
  const [createForm, setCreateForm] = useState({ name: "", email: "", institution: "", phone: "", role: "Teknisi", password: "" });
  const [creating, setCreating] = useState(false);

  // helper: role match function (case-insensitive)
  const roleMatch = (role, keywords) => {
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return keywords.some((k) => r.includes(k.toLowerCase()));
  };

  // helper: check if user is internal IPB
  const isInternalIPB = (user) => {
    const inst = (user.institution || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    return inst.includes("ipb") || inst.includes("internal") || email.includes("@apps.ipb.ac.id") || email.includes("@ipb.ac.id");
  };

  // State untuk tab filter
  const [activeTab, setActiveTab] = useState("staff"); // "staff" or "klien"

  // State untuk modal konfirmasi aktivasi/nonaktifkan
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [statusPopup, setStatusPopup] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    // ensure we have a token before calling protected endpoint
    if (!getToken()) {
      console.warn("Tidak ada token otentikasi. Pastikan Anda login sebagai admin.");
      setUsers([]);
      setLoadingUsers(false);
      setUnauthenticated(true);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/users`, { headers: getAuthHeader() });
      const raw = (res && res.data && (res.data.data || res.data)) || [];
      setUsers(
        raw.map((u) => ({
          id: u.id,
          name: u.full_name || u.name || u.username || u.display_name || u.nama || "-",
          email: u.email || "-",
          role: u.role || u.jabatan || (u.roles && u.roles[0]) || "-",
          status: u.status || (u.active ? "Aktif" : "Non-Aktif") || "Aktif",
          institution: u.institution || u.institusi || u.institusi_id || "",
          phone: u.phone || u.no_hp || u.nomor_telepon || "",
        })),
      );
    } catch (e) {
      console.error("Gagal fetch users:", e);
      // if unauthorized, show friendly message
      if (e && e.response && e.response.status === 401) {
        setUnauthenticated(true);
      }
    }
    setLoadingUsers(false);
  };

  const toggleActive = async (user) => {
    const newStatus = (user.status || "Aktif") === "Aktif" ? "Non-Aktif" : "Aktif";
    // optimistic UI update
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
    try {
      const res = await axios.patch(`${API_URL}/users/${user.id}`, { status: newStatus }, { headers: getAuthHeader() });
      // refresh list from server to get authoritative values (and recalc counts)
      await fetchUsers();
    } catch (e) {
      console.error("Gagal update status:", e);
      // revert on error
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u)));
      const msg = e && e.response && e.response.data && e.response.data.message ? e.response.data.message : "Gagal mengubah status akun";
      alert(msg);
    }
  };

  const openView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    // client-side validation: institution required for Kepala Lab and Koordinator
    if (["Kepala Lab", "Koordinator"].includes(createForm.role) && !(createForm.institution || "").trim()) {
      alert("Institusi/Laboratorium wajib diisi untuk role yang dipilih.");
      setCreating(false);
      return;
    }

    try {
      const payload = {
        name: createForm.name,
        email: createForm.email,
        role: createForm.role,
        institution: createForm.institution,
        phone: createForm.phone,
        password: createForm.password,
      };
      await axios.post(`${API_URL}/users`, payload, { headers: getAuthHeader() });
      setShowModal(false);
      setCreateForm({ name: "", email: "", institution: "", phone: "", role: "Teknisi", password: "" });
      fetchUsers();
    } catch (err) {
      console.error("Gagal membuat akun:", err);
      alert("Gagal membuat akun. Periksa console untuk detail.");
    }
    setCreating(false);
  };

  // dynamic label for institution based on selected role
  const institutionLabel = () => {
    if (createForm.role === "Teknisi") return "Institusi";
    if (createForm.role === "Kepala Lab") return "Laboratorium";
    if (createForm.role === "Koordinator") return "Institusi / Unit";
    return "Institusi";
  };

  const theme = {
    primary: "#8D766B",
    dark: "#3E322E",
    accent: "#D4C7C1",
    background: "#F7F5F4",
    white: "#FFFFFF",
  };

  const cardStyle = {
    borderRadius: "20px",
    border: "1px solid rgba(141, 118, 107, 0.1)",
    boxShadow: "0 10px 30px rgba(62, 50, 46, 0.05)",
    backgroundColor: theme.white,
  };

  return (
    <NavbarLoginKoordinator>
      <div style={{ backgroundColor: theme.background, minHeight: "100vh", padding: "40px 0", color: theme.dark }}>
        <Container>
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Row className="mb-5 align-items-center">
              <Col>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div style={{ width: "40px", height: "4px", backgroundColor: theme.primary, borderRadius: "2px" }}></div>
                  <h6 className="text-uppercase fw-bold mb-0" style={{ color: theme.primary, letterSpacing: "2px", fontSize: "13px" }}>
                    Administrator Only
                  </h6>
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: "2.2rem" }}>
                  Manajemen Akun
                </h2>
                <p className="text-muted opacity-75">Kelola hak akses dan identitas digital personil laboratorium</p>
              </Col>
              <Col xs="auto">
                <Button onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2 border-0 py-2 px-4 fw-bold shadow" style={{ backgroundColor: theme.primary, borderRadius: "14px" }} id="btn-tambah">
                  <Plus size={20} /> Tambah Akun
                </Button>
              </Col>
            </Row>
          </motion.div>

          {/* Statistik Ringkas */}
          <Row className="mb-5 g-4">
            {[
              { label: "Total Pengguna", value: `${users.length} User`, icon: <Users size={24} />, color: theme.primary },
              { label: "Admin Aktif", value: `${users.filter((u) => roleMatch(u.role, ["kepala", "koordinator"]) && (u.status || "Aktif") === "Aktif").length} Akun`, icon: <ShieldCheck size={24} />, color: theme.dark },
              { label: "Klien Internal IPB", value: `${users.filter((u) => roleMatch(u.role, ["klien", "user", "mahasiswa"]) && isInternalIPB(u)).length} Akun`, icon: <UserCircle size={24} />, color: "#2E86AB" },
              { label: "Sistem Terintegrasi", value: "100%", icon: <Settings size={24} />, color: theme.accent },
            ].map((stat, idx) => (
              <Col md={4} key={idx}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card style={cardStyle} className="p-2 border-0 stat-card shadow-sm">
                    <Card.Body className="d-flex align-items-center">
                      <div className="p-3 rounded-4 me-3" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                        {stat.icon}
                      </div>
                      <div>
                        <h6 className="text-muted mb-0 small text-uppercase fw-bold">{stat.label}</h6>
                        <h4 className="fw-bold mb-0">{stat.value}</h4>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {unauthenticated && (
            <Row className="mb-4">
              <Col>
                <Card style={cardStyle} className="p-3 border-0 shadow-sm">
                  <Card.Body className="text-center text-muted">Silakan login sebagai admin untuk melihat daftar pengguna.</Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Tabel Utama */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Card style={cardStyle} className="overflow-hidden border-0 shadow-lg">
              <Card.Header className="bg-white border-0 p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <InputGroup className="rounded-4 overflow-hidden" style={{ border: `1.5px solid ${theme.accent}`, maxWidth: "400px" }}>
                    <InputGroup.Text className="bg-transparent border-0 pe-0">
                      <Search size={18} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control placeholder="Cari berdasarkan nama atau email..." className="bg-transparent border-0 py-2 shadow-none" style={{ fontSize: "14px" }} />
                  </InputGroup>

                  {/* Tab Filter */}
                  <div className="d-flex gap-2">
                    <Button
                      variant={activeTab === "staff" ? "primary" : "outline-secondary"}
                      size="sm"
                      className="rounded-pill px-3"
                      style={activeTab === "staff" ? { backgroundColor: theme.primary, borderColor: theme.primary } : {}}
                      onClick={() => setActiveTab("staff")}
                    >
                      <Users size={16} className="me-1" /> Staff Lab
                    </Button>
                    <Button
                      variant={activeTab === "klien" ? "primary" : "outline-secondary"}
                      size="sm"
                      className="rounded-pill px-3"
                      style={activeTab === "klien" ? { backgroundColor: "#2E86AB", borderColor: "#2E86AB" } : {}}
                      onClick={() => setActiveTab("klien")}
                    >
                      <UserCircle size={16} className="me-1" /> Klien Internal IPB
                    </Button>
                  </div>
                </div>
              </Card.Header>

              <Table hover responsive className="mb-0 custom-table">
                <thead style={{ backgroundColor: "#FBF9F8" }}>
                  <tr className="small text-uppercase" style={{ color: theme.primary, letterSpacing: "1px" }}>
                    <th className="py-4 px-4">Informasi Pengguna</th>
                    <th className="py-4">Jabatan / Role</th>
                    <th className="py-4 text-center">Status Akses</th>
                    <th className="py-4 text-center">Navigasi</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let filtered;
                    if (activeTab === "staff") {
                      filtered = users.filter((u) => roleMatch(u.role, ["teknisi", "koordinator", "kepala"]));
                    } else {
                      // Filter klien internal IPB (mahasiswa/user dari IPB)
                      filtered = users.filter((u) => roleMatch(u.role, ["klien", "user", "mahasiswa"]) && isInternalIPB(u));
                    }

                    if (filtered.length === 0)
                      return (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted">
                            {activeTab === "staff" ? "Tidak ada akun teknisi/koordinator/kepala" : "Tidak ada akun klien internal IPB"}
                          </td>
                        </tr>
                      );
                    return filtered.map((user) => {
                      const roleLower = (user.role || "").toLowerCase();
                      let color;
                      if (activeTab === "klien") {
                        color = "#2E86AB"; // Warna biru untuk klien
                      } else {
                        color = roleLower.includes("koordinator") ? "#A68A7D" : roleLower.includes("kepala") ? "#634E44" : "#8D766B";
                      }
                      return (
                        <tr key={user.id} style={{ verticalAlign: "middle", opacity: user.status === "Non-Aktif" ? 0.6 : 1 }}>
                          <td className="py-4 px-4">
                            <div className="d-flex align-items-center">
                              <div className="me-3 d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: "45px", height: "45px", backgroundColor: `${color}15`, color: color }}>
                                <UserCircle size={28} strokeWidth={1.5} />
                              </div>
                              <div>
                                <div className="fw-bold">{user.name}</div>
                                <div className="text-muted small">{user.email}</div>
                                {activeTab === "klien" && user.institution && (
                                  <div className="text-muted small">
                                    <i className="bi bi-building me-1"></i>
                                    {user.institution}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge bg="none" style={{ backgroundColor: `${color}15`, color: color, borderRadius: "8px", padding: "8px 12px", fontWeight: "600", fontSize: "11px", border: `1px solid ${color}25` }}>
                              {activeTab === "klien" ? "Klien Internal" : user.role}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: user.status === "Aktif" ? "#2ECC71" : "#E74C3C" }}></div>
                              <span className="fw-medium" style={{ fontSize: "13px", color: user.status === "Aktif" ? "#2ECC71" : "#E74C3C" }}>
                                {user.status || "Aktif"}
                              </span>
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button title="Lihat" onClick={() => openView(user)} className="action-btn edit">
                                <Eye size={16} />
                              </button>
                              <button
                                title={user.status === "Aktif" ? "Non-aktifkan Akun" : "Aktifkan Akun"}
                                onClick={() => {
                                  setUserToToggle(user);
                                  setShowConfirmModal(true);
                                }}
                                className={`action-btn ${user.status === "Aktif" ? "delete" : "activate"}`}
                              >
                                {user.status === "Aktif" ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </Table>
            </Card>
          </motion.div>
        </Container>

        {/* MODAL TAMBAH AKUN */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-lg custom-modal-content" style={{ zIndex: 1060 }}>
          <div className="p-2 text-end">
            <Button variant="link" onClick={() => setShowModal(false)} className="text-muted p-2 shadow-none">
              <X size={24} />
            </Button>
          </div>
          <Modal.Body className="px-4 px-md-5 pb-5 pt-0">
            <Form onSubmit={submitCreate}>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Nama Lengkap</Form.Label>
                <Form.Control name="name" value={createForm.name} onChange={handleCreateChange} type="text" className="custom-input shadow-sm" placeholder="Masukkan nama lengkap" required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Email</Form.Label>
                <Form.Control name="email" value={createForm.email} onChange={handleCreateChange} type="email" className="custom-input shadow-sm" placeholder="Masukkan email" required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">
                  {institutionLabel()}
                  {["Kepala Lab", "Koordinator"].includes(createForm.role) ? " *" : ""}
                </Form.Label>
                <Form.Control
                  name="institution"
                  value={createForm.institution}
                  onChange={handleCreateChange}
                  type="text"
                  className="custom-input shadow-sm"
                  placeholder={createForm.role === "Kepala Lab" ? "Nama laboratorium" : "Nama institusi / unit"}
                  required={["Kepala Lab", "Koordinator"].includes(createForm.role)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Nomor telepon</Form.Label>
                <Form.Control name="phone" value={createForm.phone} onChange={handleCreateChange} type="text" className="custom-input shadow-sm" placeholder="08xxxxxxxx" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Role</Form.Label>
                <Form.Select name="role" value={createForm.role} onChange={handleCreateChange} className="custom-input shadow-sm">
                  <option value="Teknisi">Teknisi</option>
                  <option value="Kepala Lab">Kepala Lab</option>
                  <option value="Koordinator">Koordinator</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Password</Form.Label>
                <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                  <Form.Control name="password" value={createForm.password} onChange={handleCreateChange} type={showPassword ? "text" : "password"} style={{ border: "none" }} className="py-2 px-3 shadow-none" required />
                  <InputGroup.Text className="bg-white border-0 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye size={18} className="text-muted" /> : <EyeOff size={18} className="text-muted" />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <div className="text-center mt-4">
                <Button type="submit" disabled={creating} className="w-50 border-0 py-2 shadow-sm btn-submit-cokelat" style={{ backgroundColor: "#92786D", borderRadius: "15px", fontWeight: "500" }}>
                  {creating ? "Membuat..." : "Buat akun"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* VIEW USER MODAL */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered contentClassName="border-0 shadow-lg custom-modal-content" style={{ zIndex: 1060 }}>
          <Modal.Header closeButton>
            <Modal.Title>Detail Akun</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedUser ? (
              <div>
                <p>
                  <strong>Nama:</strong> {selectedUser.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Role:</strong> {selectedUser.role}
                </p>
                <p>
                  <strong>Institusi:</strong> {selectedUser.institution || "-"}
                </p>
                <p>
                  <strong>Telepon:</strong> {selectedUser.phone || "-"}
                </p>
                <p>
                  <strong>Status:</strong> {selectedUser.status}
                </p>
              </div>
            ) : (
              <div className="text-center text-muted">Tidak ada data</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Tutup
            </Button>
          </Modal.Footer>
        </Modal>

        {/* MODAL KONFIRMASI AKTIVASI/NONAKTIFKAN AKUN */}
        <Modal
          show={showConfirmModal}
          onHide={() => {
            if (!togglingStatus) {
              setShowConfirmModal(false);
              setUserToToggle(null);
            }
          }}
          centered
          contentClassName="border-0 shadow-lg"
          style={{ zIndex: 1070 }}
        >
          <Modal.Body className="p-0">
            <div
              className="text-center py-4 px-3"
              style={{
                backgroundColor: userToToggle?.status === "Aktif" ? "#FEF3F2" : "#ECFDF5",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{
                  width: "70px",
                  height: "70px",
                  backgroundColor: userToToggle?.status === "Aktif" ? "#FEE4E2" : "#D1FAE5",
                }}
              >
                {userToToggle?.status === "Aktif" ? <EyeOff size={32} color="#DC2626" /> : <Eye size={32} color="#059669" />}
              </div>
              <h5 className="fw-bold mb-2" style={{ color: userToToggle?.status === "Aktif" ? "#DC2626" : "#059669" }}>
                {userToToggle?.status === "Aktif" ? "Nonaktifkan Akun?" : "Aktifkan Akun?"}
              </h5>
              <p className="text-muted mb-0 px-3">{userToToggle?.status === "Aktif" ? "Akun ini tidak akan bisa login setelah dinonaktifkan." : "Akun ini akan bisa login kembali setelah diaktifkan."}</p>
            </div>

            {userToToggle && (
              <div className="p-4">
                <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: "#F9FAFB" }}>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle me-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "#E5E7EB",
                    }}
                  >
                    <UserCircle size={28} color="#6B7280" />
                  </div>
                  <div>
                    <div className="fw-bold">{userToToggle.name}</div>
                    <div className="text-muted small">{userToToggle.email}</div>
                    <Badge
                      bg="none"
                      className="mt-1"
                      style={{
                        backgroundColor: userToToggle.status === "Aktif" ? "#DEF7EC" : "#FDE8E8",
                        color: userToToggle.status === "Aktif" ? "#03543F" : "#9B1C1C",
                        fontSize: "11px",
                        padding: "4px 10px",
                        borderRadius: "20px",
                      }}
                    >
                      Status: {userToToggle.status || "Aktif"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex gap-3 p-4 pt-0">
              <Button
                variant="light"
                className="flex-fill py-2 rounded-pill fw-medium"
                onClick={() => {
                  setShowConfirmModal(false);
                  setUserToToggle(null);
                }}
                disabled={togglingStatus}
              >
                Batal
              </Button>
              <Button
                variant={userToToggle?.status === "Aktif" ? "danger" : "success"}
                className="flex-fill py-2 rounded-pill fw-medium"
                onClick={async () => {
                  if (!userToToggle) return;
                  setTogglingStatus(true);
                  try {
                    await toggleActive(userToToggle);
                    setShowConfirmModal(false);
                    setUserToToggle(null);
                    setStatusPopup({
                      show: true,
                      type: "success",
                      message: userToToggle.status === "Aktif" ? `Akun ${userToToggle.name} berhasil dinonaktifkan` : `Akun ${userToToggle.name} berhasil diaktifkan`,
                    });
                  } catch (e) {
                    setStatusPopup({
                      show: true,
                      type: "error",
                      message: "Gagal mengubah status akun. Silakan coba lagi.",
                    });
                  } finally {
                    setTogglingStatus(false);
                  }
                }}
                disabled={togglingStatus}
              >
                {togglingStatus ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Memproses...
                  </>
                ) : userToToggle?.status === "Aktif" ? (
                  "Ya, Nonaktifkan"
                ) : (
                  "Ya, Aktifkan"
                )}
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* POPUP NOTIFIKASI STATUS */}
        {statusPopup.show && (
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                zIndex: 1075,
              }}
              onClick={() => setStatusPopup({ show: false, type: "", message: "" })}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1080,
                minWidth: "320px",
                maxWidth: "400px",
              }}
            >
              <Card className="border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                <Card.Body className="text-center p-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: "70px",
                      height: "70px",
                      backgroundColor: statusPopup.type === "success" ? "#D1FAE5" : "#FEE2E2",
                    }}
                  >
                    {statusPopup.type === "success" ? <i className="bi bi-check-lg" style={{ fontSize: "2rem", color: "#059669" }}></i> : <i className="bi bi-x-lg" style={{ fontSize: "2rem", color: "#DC2626" }}></i>}
                  </div>
                  <h5 className="fw-bold mb-2" style={{ color: statusPopup.type === "success" ? "#059669" : "#DC2626" }}>
                    {statusPopup.type === "success" ? "Berhasil!" : "Gagal!"}
                  </h5>
                  <p className="text-muted mb-4">{statusPopup.message}</p>
                  <Button variant={statusPopup.type === "success" ? "success" : "danger"} className="rounded-pill px-5 py-2" onClick={() => setStatusPopup({ show: false, type: "", message: "" })}>
                    Tutup
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          
          body { font-family: 'Plus Jakarta Sans', sans-serif; }

          .custom-modal-content {
            border-radius: 30px !important;
          }

          .custom-input {
            border-radius: 20px !important;
            border: 1px solid #ced4da !important;
            padding: 0.6rem 1rem !important;
            font-size: 14px;
          }

          .custom-input:focus {
            border-color: ${theme.primary} !important;
            box-shadow: 0 0 0 0.2rem rgba(141, 118, 107, 0.25) !important;
          }

          .stat-card { transition: all 0.3s ease; }
          .stat-card:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(62, 50, 46, 0.1) !important; }

          .custom-table tbody tr { transition: all 0.2s ease; border-bottom: 1px solid rgba(141, 118, 107, 0.05); }
          .custom-table tbody tr:hover { background-color: #FDFBFA !important; }

          .action-btn {
            width: 36px; height: 36px; border-radius: 10px;
            border: 1px solid ${theme.accent}; background: white;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease; color: ${theme.primary};
          }
          .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          .action-btn.edit:hover { color: #2980B9; border-color: #2980B9; }
          .action-btn.settings:hover { color: ${theme.dark}; border-color: ${theme.dark}; }
          .action-btn.delete:hover { color: #E74C3C; border-color: #E74C3C; }
          .action-btn.activate { color: #27AE60; }
          .action-btn.activate:hover { color: #2ECC71; border-color: #2ECC71; background-color: #2ECC7115; }

          #btn-tambah:hover { filter: brightness(1.1); transform: scale(1.02); }
          .btn-submit-cokelat:hover { opacity: 0.9; transform: scale(1.02); }
          .cursor-pointer { cursor: pointer; }
          .modal-backdrop { z-index: 1050 !important; }
        `}</style>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginKoordinator>
  );
};

export default ManajemenAkun;

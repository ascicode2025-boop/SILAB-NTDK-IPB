import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, InputGroup, Table, Modal, Dropdown } from "react-bootstrap";
import { FaSearch, FaPlus, FaEye, FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getInstruments, createInstrument, updateInstrument, deleteInstrument } from "../../services/InstrumentService";

export default function InventarisAlat() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama_alat: "",
    deskripsi: "",
    is_paid: false,
    harga_sewa: 0,
    status: "tersedia",
    total_unit: 1,
  });

  useEffect(() => {
    document.title = "SILAB-NTDK - Inventaris Alat";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await getInstruments();
      setEquipmentList(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Gagal mengambil data alat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Equipment List
  const filteredList = equipmentList.filter((item) => {
    const namaMatch = item.nama_alat ? item.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const descMatch = item.deskripsi ? item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesSearch = namaMatch || descMatch;

    const matchesStatus = statusFilter === "Semua" || 
      (item.status && item.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalAlat = equipmentList.length;
  const tersedia = equipmentList.filter((i) => i.status === "tersedia").length;
  const dipinjam = equipmentList.filter((i) => i.status === "dipinjam").length;
  const maintenance = equipmentList.filter((i) => i.status === "perawatan").length;

  // Open Detail Modal
  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Open Form Modal (Add or Edit)
  const handleOpenForm = (item = null) => {
    if (item) {
      setIsEditing(true);
      setSelectedItem(item);
      setFormData({
        nama_alat: item.nama_alat || "",
        deskripsi: item.deskripsi || "",
        is_paid: item.is_paid ? true : false,
        harga_sewa: item.harga_sewa || 0,
        status: item.status || "tersedia",
        total_unit: item.total_unit || 1,
      });
    } else {
      setIsEditing(false);
      setSelectedItem(null);
      setFormData({
        nama_alat: "",
        deskripsi: "",
        is_paid: false,
        harga_sewa: 0,
        status: "tersedia",
        total_unit: 1,
      });
    }
    setShowFormModal(true);
  };

  // Save Form (Add or Edit)
  const handleSaveForm = async (e) => {
    e.preventDefault();
    try {
      // Pastikan payload yang dikirim sudah sesuai format database
      const payload = {
        nama_alat: formData.nama_alat,
        deskripsi: formData.deskripsi,
        is_paid: formData.is_paid ? 1 : 0,
        harga_sewa: parseInt(formData.harga_sewa) || 0,
        status: formData.status,
        total_unit: parseInt(formData.total_unit) || 1,
      };
      
      if (isEditing && selectedItem) {
        await updateInstrument(selectedItem.id, payload);
        setSuccessMessage("Data alat berhasil diubah.");
      } else {
        await createInstrument(payload);
        setSuccessMessage("Data alat berhasil ditambahkan.");
      }
      setShowFormModal(false);
      setShowSuccessModal(true);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error saving form:", error);
      setErrorMessage("Gagal menyimpan data alat.");
      setShowErrorModal(true);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) {
      try {
        await deleteInstrument(selectedItem.id);
        setShowDeleteModal(false);
        setSuccessMessage("Data alat berhasil dihapus.");
        setShowSuccessModal(true);
        fetchData(); // Refresh list
      } catch (error) {
        console.error("Error deleting item:", error);
        setShowDeleteModal(false);
        setErrorMessage("Gagal menghapus alat.");
        setShowErrorModal(true);
      }
    }
  };
  
  // Helper Format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <NavbarLoginTeknisi>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAF9F8",
          fontFamily: "Poppins, sans-serif",
          padding: "24px 28px 40px",
        }}
      >
        <Container fluid>
          {/* ─── Top 4 Summary Cards ─── */}
          <Row className="g-3 mb-4">
            {/* Card 1: Total Alat */}
            <Col xs={12} sm={6} md={3}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#A6867B",
                    opacity: 0.85,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", color: "#616161", fontWeight: 600 }}>
                    Total Alat
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#212121", lineHeight: "1.2" }}>
                    {totalAlat}
                  </div>
                </div>
              </div>
            </Col>

            {/* Card 2: Tersedia */}
            <Col xs={12} sm={6} md={3}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#66BB6A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", color: "#616161", fontWeight: 600 }}>
                    Tersedia
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#212121", lineHeight: "1.2" }}>
                    {tersedia}
                  </div>
                </div>
              </div>
            </Col>

            {/* Card 3: Dipinjam */}
            <Col xs={12} sm={6} md={3}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#EF5350",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", color: "#616161", fontWeight: 600 }}>
                    Dipinjam
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#212121", lineHeight: "1.2" }}>
                    {dipinjam}
                  </div>
                </div>
              </div>
            </Col>

            {/* Card 4: Maintenance */}
            <Col xs={12} sm={6} md={3}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#D4E157",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", color: "#616161", fontWeight: 600 }}>
                    Maintenance
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#212121", lineHeight: "1.2" }}>
                    {maintenance}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* ─── Main Content Box (Card & Table View) ─── */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "28px 32px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
              border: "1px solid #EAEAEA",
            }}
          >
            {/* Top Bar: Search Box (Left) & Controls (Right) */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              {/* Search Bar (Left) */}
              <div style={{ maxWidth: "320px", width: "100%" }}>
                <InputGroup
                  style={{
                    borderRadius: "30px",
                    overflow: "hidden",
                    border: "1px solid #CCCCCC",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <Form.Control
                    type="text"
                    placeholder="Cari alat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      border: "none",
                      paddingLeft: "18px",
                      fontSize: "0.9rem",
                      boxShadow: "none",
                    }}
                  />
                  <Button
                    style={{
                      backgroundColor: "#757575",
                      borderColor: "#757575",
                      color: "#ffffff",
                      paddingLeft: "18px",
                      paddingRight: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaSearch size={14} />
                  </Button>
                </InputGroup>
              </div>

              {/* Controls Right (Status Dropdown + Tambah Alat Button) */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* Status Dropdown */}
                <style>{`
                  .status-dropdown-menu {
                    background-color: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    min-width: 170px !important;
                    margin-top: 6px !important;
                  }
                  .status-dropdown-item {
                    background-color: #ffffff !important;
                    border: 1.5px solid #757575 !important;
                    border-radius: 14px !important;
                    padding: 9px 20px !important;
                    text-align: center !important;
                    font-weight: 500 !important;
                    font-size: 0.95rem !important;
                    color: #111111 !important;
                    margin-bottom: 8px !important;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06) !important;
                    transition: all 0.2s ease-in-out !important;
                    cursor: pointer !important;
                  }
                  .status-dropdown-item:last-child {
                    margin-bottom: 0 !important;
                  }
                  .status-dropdown-item:hover, .status-dropdown-item:focus {
                    background-color: #F5EFEA !important;
                    border-color: #4A3933 !important;
                    color: #4A3933 !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12) !important;
                  }
                  .status-dropdown-item.active-status {
                    background-color: #4A3933 !important;
                    color: #ffffff !important;
                    border-color: #4A3933 !important;
                  }
                `}</style>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-status-filter"
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#424242",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      boxShadow: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 8px",
                    }}
                  >
                    Status {statusFilter !== "Semua" ? `(${statusFilter})` : ""}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="status-dropdown-menu">
                    {[
                      { label: "Semua", value: "Semua" },
                      { label: "Tersedia", value: "tersedia" },
                      { label: "Dipinjam", value: "dipinjam" },
                      { label: "Dalam Perawatan", value: "perawatan" },
                      { label: "Rusak", value: "rusak" },
                    ].map((opt) => (
                      <Dropdown.Item
                        key={opt.value}
                        onClick={() => setStatusFilter(statusFilter === opt.value ? "Semua" : opt.value)}
                        className={`status-dropdown-item ${statusFilter === opt.value ? "active-status" : ""}`}
                      >
                        {opt.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                {/* + Tambah Alat Button */}
                <Button
                  onClick={() => handleOpenForm(null)}
                  style={{
                    backgroundColor: "#A6867B",
                    borderColor: "#A6867B",
                    color: "#ffffff",
                    borderRadius: "30px",
                    padding: "8px 24px",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    boxShadow: "0 3px 10px rgba(166,134,123,0.35)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FaPlus size={12} /> Tambah Alat
                </Button>
              </div>
            </div>

            {/* Equipment Data Table */}
            <div className="table-responsive">
              <Table borderless style={{ verticalAlign: "middle", marginBottom: "0" }}>
                <thead>
                  <tr
                    style={{
                      color: "#212121",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      borderBottom: "1px solid #EEEEEE",
                    }}
                  >
                    <th style={{ paddingBottom: "16px" }}>Nama Alat</th>
                    <th style={{ paddingBottom: "16px" }}>Deskripsi</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Biaya Sewa</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Stok Tersedia</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Total Unit</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Status</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Terakhir Diupdate</th>
                    <th style={{ paddingBottom: "16px", textAlign: "center" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        Memuat data alat...
                      </td>
                    </tr>
                  ) : filteredList.length > 0 ? (
                    filteredList.map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          fontSize: "0.88rem",
                          borderBottom: "1px solid #F5F5F5",
                        }}
                      >
                        {/* Nama Alat */}
                        <td style={{ py: "14px", fontWeight: "600", color: "#212121" }}>
                          {item.nama_alat}
                        </td>

                        {/* Deskripsi */}
                        <td style={{ py: "14px", color: "#424242", maxWidth: "200px" }}>
                          {item.deskripsi?.substring(0, 50) || "-"}
                          {item.deskripsi?.length > 50 ? "..." : ""}
                        </td>

                        {/* Harga Sewa */}
                        <td style={{ py: "14px", textAlign: "center", color: "#424242" }}>
                          {item.is_paid ? formatRupiah(item.harga_sewa) : "Gratis"}
                        </td>

                        {/* Stok Tersedia */}
                        <td style={{ py: "14px", textAlign: "center", color: "#424242", fontWeight: "bold" }}>
                          {item.stok_tersedia ?? (item.total_unit ?? 1)}
                        </td>

                        {/* Total Unit */}
                        <td style={{ py: "14px", textAlign: "center", color: "#424242" }}>
                          {item.total_unit ?? 1}
                        </td>

                        {/* Status */}
                        <td style={{ py: "14px", textAlign: "center" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              display: "inline-block",
                              textTransform: "capitalize",
                              backgroundColor:
                                item.status === "tersedia"
                                  ? "#E8F5E9"
                                  : item.status === "dipinjam"
                                  ? "#E3F2FD"
                                  : item.status === "perawatan"
                                  ? "#FEF3C7"
                                  : "#FFEBEE",
                              color:
                                item.status === "tersedia"
                                  ? "#2E7D32"
                                  : item.status === "dipinjam"
                                  ? "#1565C0"
                                  : item.status === "perawatan"
                                  ? "#B45309"
                                  : "#C62828",
                            }}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Terakhir Diupdate */}
                        <td style={{ py: "14px", textAlign: "center", color: "#424242" }}>
                          {new Date(item.updated_at).toLocaleDateString("id-ID", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </td>

                        {/* Aksi Icons */}
                        <td style={{ py: "14px", textAlign: "center" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                            {/* Detail / View (Gray) */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(item)}
                              title="Lihat Detail"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#757575",
                                border: "none",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                              }}
                            >
                              <FaEye size={14} />
                            </button>

                            {/* Edit (Green) */}
                            <button
                              type="button"
                              onClick={() => handleOpenForm(item)}
                              title="Edit Alat"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#4CAF50",
                                border: "none",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 5px rgba(76,175,80,0.3)",
                              }}
                            >
                              <FaPencilAlt size={13} />
                            </button>

                            {/* Delete (Red) */}
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(item)}
                              title="Hapus Alat"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#E53935",
                                border: "none",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 5px rgba(229,57,53,0.3)",
                              }}
                            >
                              <FaTrashAlt size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-5 text-muted">
                        Tidak ada data alat ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </Container>
      </div>

      {/* ─── 1. Modal Edit / Tambah Alat (Matches Image 1 Mockup) ─── */}
      <Modal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        centered
        dialogClassName="modal-custom-inventaris"
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#A48479",
              color: "#ffffff",
              padding: "14px 20px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.15rem",
              letterSpacing: "0.2px",
            }}
          >
            {isEditing ? "Edit Alat" : "Tambah Alat"}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSaveForm} style={{ padding: "22px 28px 28px" }}>
            {/* Nama Alat */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#616161",
                  marginBottom: "6px",
                }}
              >
                Nama Alat
              </label>
              <input
                type="text"
                required
                placeholder="Micropipette 20–200 µL"
                value={formData.nama_alat}
                onChange={(e) => setFormData({ ...formData, nama_alat: e.target.value })}
                style={{
                  width: "100%",
                  borderRadius: "20px",
                  border: "1px solid #D0D0D0",
                  padding: "8px 16px",
                  fontSize: "0.88rem",
                  color: "#333",
                  outline: "none",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
                }}
              />
            </div>

            {/* Total Unit */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#616161",
                  marginBottom: "6px",
                }}
              >
                Total Unit
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="1"
                value={formData.total_unit}
                onChange={(e) => setFormData({ ...formData, total_unit: e.target.value })}
                style={{
                  width: "100%",
                  borderRadius: "20px",
                  border: "1px solid #D0D0D0",
                  padding: "8px 16px",
                  fontSize: "0.88rem",
                  color: "#333",
                  outline: "none",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
                }}
              />
            </div>

            {/* Berbayar & Harga Sewa */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    color: "#616161",
                    marginBottom: "6px",
                  }}
                >
                  Berbayar
                </label>
                <select
                  value={formData.is_paid ? "1" : "0"}
                  onChange={(e) => setFormData({ ...formData, is_paid: e.target.value === "1", harga_sewa: e.target.value === "0" ? 0 : formData.harga_sewa })}
                  style={{
                    width: "100%",
                    borderRadius: "20px",
                    border: "1px solid #D0D0D0",
                    padding: "8px 16px",
                    fontSize: "0.88rem",
                    color: "#333",
                    outline: "none",
                  }}
                >
                  <option value="0">Gratis</option>
                  <option value="1">Berbayar</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    color: "#616161",
                    marginBottom: "6px",
                  }}
                >
                  Harga Sewa
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Rp"
                  value={formData.harga_sewa}
                  disabled={!formData.is_paid}
                  onChange={(e) => setFormData({ ...formData, harga_sewa: parseInt(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    borderRadius: "20px",
                    border: "1px solid #D0D0D0",
                    padding: "8px 16px",
                    fontSize: "0.88rem",
                    color: "#333",
                    outline: "none",
                    backgroundColor: formData.is_paid ? "#fff" : "#f5f5f5"
                  }}
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#616161",
                  marginBottom: "6px",
                }}
              >
                Deskripsi
              </label>
              <textarea
                rows={3}
                placeholder="Digunakan untuk mengambil cairan dengan volume 20–200 µL."
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                style={{
                  width: "100%",
                  borderRadius: "20px",
                  border: "1px solid #D0D0D0",
                  padding: "10px 16px",
                  fontSize: "0.85rem",
                  color: "#333",
                  outline: "none",
                  resize: "none",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
                }}
              />
            </div>

            {/* Status Radio Group */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#616161",
                  marginBottom: "8px",
                }}
              >
                Status
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 16px", alignItems: "center" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    color: "#212121",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="tersedia"
                    checked={formData.status === "tersedia"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ accentColor: "#4A3933", cursor: "pointer" }}
                  />
                  Tersedia
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    color: "#212121",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="dipinjam"
                    checked={formData.status === "dipinjam"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ accentColor: "#4A3933", cursor: "pointer" }}
                  />
                  Dipinjam
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    color: "#212121",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="perawatan"
                    checked={formData.status === "perawatan"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ accentColor: "#4A3933", cursor: "pointer" }}
                  />
                  Dalam Perawatan
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    color: "#212121",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="rusak"
                    checked={formData.status === "rusak"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ accentColor: "#4A3933", cursor: "pointer" }}
                  />
                  Rusak
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                style={{
                  backgroundColor: "#D8D8D8",
                  color: "#333333",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 34px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: "#4A3933",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 34px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(74,57,51,0.3)",
                }}
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ─── 2. Modal Detail Alat (Matches Image 2 Mockup) ─── */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
        dialogClassName="modal-custom-inventaris"
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#A48479",
              color: "#ffffff",
              padding: "14px 20px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.15rem",
              letterSpacing: "0.2px",
            }}
          >
            Detail Alat
          </div>

          {/* Body Content */}
          {selectedItem && (
            <div style={{ padding: "26px 28px 28px" }}>
              {/* Row 1: Nama Alat & Kategori */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "16px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "4px" }}>
                    Nama Alat
                  </div>
                  <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                    {selectedItem.nama_alat}
                  </div>
                </div>
              </div>

              {/* Row 2: Biaya Sewa, Total Unit, Stok Tersedia */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  textAlign: "center",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "4px" }}>
                    Biaya Sewa
                  </div>
                  <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                    {selectedItem.is_paid ? formatRupiah(selectedItem.harga_sewa) : "Gratis"}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "4px" }}>
                    Total Unit
                  </div>
                  <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                    {selectedItem.total_unit ?? 1}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "4px" }}>
                    Stok Tersedia
                  </div>
                  <div style={{ color: "#212121", fontSize: "0.95rem", fontWeight: "600" }}>
                    {selectedItem.stok_tersedia ?? (selectedItem.total_unit ?? 1)}
                  </div>
                </div>
              </div>

              {/* Row 3: Status & Deskripsi */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.3fr",
                  gap: "16px",
                  marginBottom: "28px",
                  alignItems: "start",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "8px" }}>
                    Status
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#212121",
                      fontWeight: "600",
                      fontSize: "0.88rem",
                      textTransform: "capitalize",
                    }}
                  >
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: 
                          selectedItem.status === 'tersedia' ? "#66BB6A" : 
                          selectedItem.status === 'dipinjam' ? "#42A5F5" : 
                          selectedItem.status === 'perawatan' ? "#FFA726" : "#EF5350",
                        display: "inline-block",
                      }}
                    />
                    {selectedItem.status}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "700", color: "#616161", fontSize: "0.88rem", marginBottom: "4px", textAlign: "center" }}>
                    Deskripsi
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#424242", textAlign: "center", lineHeight: "1.4" }}>
                    {selectedItem.deskripsi || "-"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    backgroundColor: "#D8D8D8",
                    color: "#333333",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px 34px",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ─── 3. Modal Hapus Alat (Matches Image 3 Mockup) ─── */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        dialogClassName="modal-custom-inventaris"
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "36px 24px 28px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
          }}
        >
          <div
            style={{
              color: "#4A3933",
              fontWeight: "700",
              fontSize: "1.1rem",
              lineHeight: "1.4",
              marginBottom: "24px",
            }}
          >
            Apakah anda yakin ingin
            <br />
            menghapus alat ini?
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              style={{
                backgroundColor: "#D8D8D8",
                color: "#333333",
                border: "none",
                borderRadius: "12px",
                padding: "8px 34px",
                fontWeight: "600",
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              style={{
                backgroundColor: "#4A3933",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "8px 34px",
                fontWeight: "600",
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(74,57,51,0.3)",
              }}
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Success */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }} />
        <Modal.Body className="text-center pb-5">
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#d4edda",
              color: "#155724",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 16px",
            }}
          >
            ✓
          </div>
          <h5 className="fw-bold text-dark mb-2">Berhasil!</h5>
          <p className="text-muted">{successMessage}</p>
          <Button
            variant="success"
            className="px-4 mt-2"
            style={{
              borderRadius: "10px",
              fontWeight: 600,
              backgroundColor: "#28a745",
              border: "none",
            }}
            onClick={() => setShowSuccessModal(false)}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal Error */}
      <Modal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        centered
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }} />
        <Modal.Body className="text-center pb-5">
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 16px",
            }}
          >
            ✗
          </div>
          <h5 className="fw-bold text-dark mb-2">Terjadi Kesalahan</h5>
          <p className="text-muted">{errorMessage}</p>
          <Button
            variant="danger"
            className="px-4 mt-2"
            style={{
              borderRadius: "10px",
              fontWeight: 600,
              backgroundColor: "#dc3545",
              border: "none",
            }}
            onClick={() => setShowErrorModal(false)}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>

      {/* Custom CSS for Modal size and offset below top header */}
      <style>{`
        .modal-custom-inventaris {
          max-width: 440px !important;
          width: 92% !important;
          margin: 50px auto 1.75rem !important;
        }
        .modal-custom-inventaris .modal-content {
          border: none !important;
          background: transparent !important;
          border-radius: 16px !important;
          box-shadow: none !important;
        }
      `}</style>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}

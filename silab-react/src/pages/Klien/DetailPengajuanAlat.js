import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";

const DetailPengajuanAlat = () => {
  const history = useHistory();
  const { id } = useParams();

  const [showModalReturn, setShowModalReturn] = useState(false);
  const [tanggalPengembalian, setTanggalPengembalian] = useState("06 Juli 2026");
  const [kondisiAlat, setKondisiAlat] = useState("Baik");
  const [catatan, setCatatan] = useState("");
  const [statusPengembalian, setStatusPengembalian] = useState("BELUM DIKEMBALIKAN");

  useEffect(() => {
    document.title = "SILAB-NTDK - Detail Progress Pengajuan Alat";
  }, []);

  const handleSubmitPengembalian = () => {
    setStatusPengembalian("MENUNGGU VERIFIKASI");
    setShowModalReturn(false);
  };

  const dataDetail = {
    noPengajuan: id || "PJ-2026-001",
    tanggalPengajuan: "02 Juli 2026",
    statusPeminjaman: "Sedang Dipinjam",
    alat: "Micropipette 20–200 µL",
    jumlah: "2 Unit",
    keperluan: "Praktikum Analisis Hematologi",
    tanggalPinjam: "02 Juli 2026",
    tanggalKembali: "06 Juli 2026",
    statusPengembalian: statusPengembalian,
    statusBebasLab: "Belum tersedia.",
    activeStep: statusPengembalian === "MENUNGGU VERIFIKASI" ? 5 : 4, // Step 1–4 active (Alat Dipinjam)
  };

  const steps = [
    {
      title: "Pengajuan\nDikirim",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M2 21L23 12 2 3v7l15 2-15 2v7z" />
        </svg>
      ),
    },
    {
      title: "Diverifikasi\nKoordinator",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>
      ),
    },
    {
      title: "Disetujui Kepala\nLab",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      ),
    },
    {
      title: "Alat\nDipinjam",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M20 7H15V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-7 0H11V4h2v3z" />
        </svg>
      ),
    },
    {
      title: "Pengembalian",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>
      ),
    },
  ];

  const CIRCLE_SIZE = 60;
  const ACTIVE_COLOR = "#2C2C2C";
  const INACTIVE_COLOR = "#B0B0B0";
  const LINE_COLOR_ACTIVE = "#2C2C2C";
  const LINE_COLOR_INACTIVE = "#CFCFCF";

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#EBEBEB",
      fontFamily: "Poppins, sans-serif",
      padding: "24px 0 40px",
    },
    inner: {
      maxWidth: "640px",
      margin: "0 auto",
      padding: "0 16px",
    },
    backBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      background: "#fff",
      border: "none",
      borderRadius: "20px",
      padding: "6px 16px",
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
      fontSize: "0.82rem",
      color: "#4A3B32",
      cursor: "pointer",
      marginBottom: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: "20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      marginBottom: "16px",
      overflow: "hidden",
    },
    cardBody: {
      padding: "20px 24px",
    },
    labelSmall: {
      fontSize: "0.8rem",
      color: "#9E9E9E",
      fontWeight: 500,
      marginBottom: "4px",
    },
    valueNormal: {
      fontSize: "0.98rem",
      fontWeight: 700,
      color: "#212121",
    },
    pill: {
      display: "inline-block",
      padding: "5px 20px",
      borderRadius: "20px",
      backgroundColor: "#F0EBE7",
      color: "#3E2723",
      fontWeight: 700,
      fontSize: "0.9rem",
    },
    greenBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 16px",
      borderRadius: "20px",
      backgroundColor: "#B9EEC0",
      color: "#1B5E20",
      fontWeight: 700,
      fontSize: "0.88rem",
    },
    greenDot: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      backgroundColor: "#2E7D32",
      display: "inline-block",
    },
    sectionTitle: {
      fontSize: "1rem",
      fontWeight: 700,
      color: "#212121",
      marginBottom: "16px",
    },
    redBadge: {
      display: "inline-block",
      padding: "5px 14px",
      borderRadius: "6px",
      backgroundColor: "#F44336",
      color: "#fff",
      fontWeight: 700,
      fontSize: "0.8rem",
      letterSpacing: "0.4px",
    },
    darkBtn: {
      display: "block",
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      backgroundColor: "#2C2C2C",
      color: "#fff",
      fontWeight: 700,
      fontSize: "0.92rem",
      border: "none",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
      marginTop: "16px",
    },
    infoBannerWrap: {
      display: "flex",
      justifyContent: "center",
      paddingTop: "0",
    },
    infoBanner: {
      backgroundColor: "#3E2723",
      color: "#fff",
      fontWeight: 700,
      fontSize: "1rem",
      padding: "10px 40px",
      borderRadius: "0 0 16px 16px",
      display: "inline-block",
      letterSpacing: "0.3px",
    },
  };

  return (
    <NavbarLoginKlien>
      <div style={styles.page}>
        <div style={styles.inner}>
          {/* Back Button */}
          <button
            style={styles.backBtn}
            onClick={() => history.push("/dashboard/detailPengajuan")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#4A3B32">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            Kembali ke Daftar Pengajuan
          </button>

          {/* ─── Card 1: Header Info ─── */}
          <div style={styles.card}>
            <div style={{ ...styles.cardBody, padding: "18px 24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "8px",
                }}
              >
                {/* No. Pengajuan */}
                <div>
                  <div style={styles.labelSmall}>No. Pengajuan</div>
                  <span style={styles.pill}>{dataDetail.noPengajuan}</span>
                </div>
                {/* Tanggal Pengajuan */}
                <div>
                  <div style={styles.labelSmall}>Tanggal Pengajuan</div>
                  <span style={styles.pill}>{dataDetail.tanggalPengajuan}</span>
                </div>
                {/* Status Peminjaman */}
                <div>
                  <div style={styles.labelSmall}>Status Peminjaman</div>
                  <span style={styles.greenBadge}>
                    <span style={styles.greenDot} />
                    {dataDetail.statusPeminjaman}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Card 2: Informasi Peminjaman Alat ─── */}
          <div style={styles.card}>
            {/* Dark brown header banner */}
            <div style={styles.infoBannerWrap}>
              <span style={styles.infoBanner}>Informasi Peminjaman Alat</span>
            </div>

            <div style={{ padding: "20px 24px 24px" }}>
              {/* Row 1: Alat, Jumlah, Keperluan */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 0.7fr 1.5fr",
                  gap: "8px 16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={styles.labelSmall}>Alat</div>
                  <div style={styles.valueNormal}>{dataDetail.alat}</div>
                </div>
                <div>
                  <div style={styles.labelSmall}>Jumlah</div>
                  <div style={styles.valueNormal}>{dataDetail.jumlah}</div>
                </div>
                <div>
                  <div style={styles.labelSmall}>Keperluan</div>
                  <div style={styles.valueNormal}>{dataDetail.keperluan}</div>
                </div>
              </div>
              {/* Row 2: Tanggal Pinjam, Tanggal Kembali */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px 16px",
                }}
              >
                <div>
                  <div style={styles.labelSmall}>Tanggal Pinjam</div>
                  <div style={styles.valueNormal}>{dataDetail.tanggalPinjam}</div>
                </div>
                <div>
                  <div style={styles.labelSmall}>Tanggal Kembali</div>
                  <div style={styles.valueNormal}>{dataDetail.tanggalKembali}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Card 3: Status Pengajuan Stepper ─── */}
          <div style={styles.card}>
            <div style={{ ...styles.cardBody, padding: "20px 24px 28px" }}>
              <div style={styles.sectionTitle}>Status Pengajuan</div>

              {/* Stepper container */}
              <div style={{ position: "relative", padding: "8px 0 0" }}>
                {/* Background Line (full width, gray) */}
                <div
                  style={{
                    position: "absolute",
                    top: `${CIRCLE_SIZE / 2 + 8}px`,
                    left: `${CIRCLE_SIZE / 2}px`,
                    right: `${CIRCLE_SIZE / 2}px`,
                    height: "5px",
                    backgroundColor: LINE_COLOR_INACTIVE,
                    zIndex: 0,
                    borderRadius: "3px",
                  }}
                />
                {/* Active Line */}
                <div
                  style={{
                    position: "absolute",
                    top: `${CIRCLE_SIZE / 2 + 8}px`,
                    left: `${CIRCLE_SIZE / 2}px`,
                    width: `${((dataDetail.activeStep - 1) / (steps.length - 1)) * (100 - (CIRCLE_SIZE / 300) * 100)}%`,
                    height: "5px",
                    backgroundColor: LINE_COLOR_ACTIVE,
                    zIndex: 0,
                    borderRadius: "3px",
                    transition: "width 0.4s ease",
                  }}
                />

                {/* Steps Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isActive = stepNum <= dataDetail.activeStep;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        {/* Circle */}
                        <div
                          style={{
                            width: `${CIRCLE_SIZE}px`,
                            height: `${CIRCLE_SIZE}px`,
                            borderRadius: "50%",
                            backgroundColor: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: isActive
                              ? "0 4px 12px rgba(0,0,0,0.25)"
                              : "0 2px 6px rgba(0,0,0,0.1)",
                            transition: "background-color 0.3s ease",
                            marginBottom: "10px",
                          }}
                        >
                          {step.icon}
                        </div>
                        {/* Label */}
                        <div
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#333",
                            textAlign: "center",
                            whiteSpace: "pre-line",
                            lineHeight: "1.35",
                            maxWidth: "72px",
                          }}
                        >
                          {step.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Card 4 & 5: Bottom Row ─── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {/* Pengembalian */}
            <div style={styles.card}>
              <div style={{ ...styles.cardBody, padding: "20px" }}>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#212121",
                    marginBottom: "14px",
                  }}
                >
                  Pengembalian
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: "#9E9E9E",
                    marginBottom: "8px",
                  }}
                >
                  Status
                </div>
                <span
                  style={
                    statusPengembalian === "BELUM DIKEMBALIKAN"
                      ? styles.redBadge
                      : styles.greenBadge
                  }
                >
                  {statusPengembalian}
                </span>
                <button
                  style={{
                    ...styles.darkBtn,
                    backgroundColor:
                      statusPengembalian !== "BELUM DIKEMBALIKAN"
                        ? "#9E9E9E"
                        : "#2C2C2C",
                    cursor:
                      statusPengembalian !== "BELUM DIKEMBALIKAN"
                        ? "not-allowed"
                        : "pointer",
                  }}
                  disabled={statusPengembalian !== "BELUM DIKEMBALIKAN"}
                  onClick={() => setShowModalReturn(true)}
                >
                  {statusPengembalian !== "BELUM DIKEMBALIKAN"
                    ? "Pengembalian Diajukan"
                    : "Ajukan Pengembalian"}
                </button>
              </div>
            </div>

            {/* Status Bebas Lab */}
            <div style={styles.card}>
              <div
                style={{
                  ...styles.cardBody,
                  padding: "20px",
                  minHeight: "160px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#212121",
                    marginBottom: "14px",
                  }}
                >
                  Status Bebas Lab
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9E9E9E",
                    fontWeight: 500,
                    fontSize: "0.88rem",
                    textAlign: "center",
                  }}
                >
                  {dataDetail.statusBebasLab}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modal Pengajuan Pengembalian ─── */}
      <Modal
        show={showModalReturn}
        onHide={() => setShowModalReturn(false)}
        centered
        dialogClassName="modal-pengembalian-custom"
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              backgroundColor: "#4A3933",
              color: "#ffffff",
              padding: "16px 20px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.15rem",
              letterSpacing: "0.2px",
            }}
          >
            Pengajuan Pengembalian
          </div>

          {/* Modal Content */}
          <div style={{ padding: "24px 26px 28px" }}>
            {/* Info Box */}
            <div
              style={{
                border: "1px solid #E0E0E0",
                borderRadius: "18px",
                padding: "18px 20px",
                backgroundColor: "#ffffff",
                boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.2fr",
                  gap: "14px 16px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#616161",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    No. Pengajuan
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {dataDetail.noPengajuan}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#616161",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Alat
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {dataDetail.alat}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#616161",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Tanggal Pinjam
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {dataDetail.tanggalPinjam}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#616161",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Tanggal Kembali
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {dataDetail.tanggalKembali}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#616161",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Jumlah
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {dataDetail.jumlah}
                  </div>
                </div>
              </div>
            </div>

            {/* Tanggal Pengembalian Input */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#212121",
                  marginBottom: "8px",
                }}
              >
                Tanggal Pengembalian
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#F2F2F2",
                  border: "1px solid #E0E0E0",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  color: "#616161",
                  fontSize: "0.88rem",
                  fontWeight: "500",
                }}
              >
                <span>{tanggalPengembalian}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#616161">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                </svg>
              </div>
            </div>

            {/* Kondisi Alat Radio Buttons */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#212121",
                  marginBottom: "8px",
                }}
              >
                Kondisi Alat
              </label>
              <div
                style={{ display: "flex", gap: "28px", alignItems: "center" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    color: "#212121",
                  }}
                >
                  <input
                    type="radio"
                    name="kondisiAlat"
                    value="Baik"
                    checked={kondisiAlat === "Baik"}
                    onChange={(e) => setKondisiAlat(e.target.value)}
                    style={{
                      accentColor: "#4A3933",
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />
                  Baik
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    color: "#212121",
                  }}
                >
                  <input
                    type="radio"
                    name="kondisiAlat"
                    value="Ada Kerusakan"
                    checked={kondisiAlat === "Ada Kerusakan"}
                    onChange={(e) => setKondisiAlat(e.target.value)}
                    style={{
                      accentColor: "#4A3933",
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />
                  Ada Kerusakan
                </label>
              </div>
            </div>

            {/* Catatan Textarea */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#212121",
                  marginBottom: "8px",
                }}
              >
                Catatan
              </label>
              <textarea
                rows={3}
                placeholder="Apakah ada kerusakan?"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #D0D0D0",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontSize: "0.88rem",
                  color: "#333",
                  outline: "none",
                  resize: "none",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                }}
              />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowModalReturn(false)}
                style={{
                  backgroundColor: "#D8D8D8",
                  color: "#333333",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 36px",
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
                onClick={handleSubmitPengembalian}
                style={{
                  backgroundColor: "#4A3933",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 36px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(74,57,51,0.3)",
                }}
              >
                Ajukan
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Custom CSS for Modal centering, position, and z-index */}
      <style>{`
        .modal-pengembalian-custom {
          max-width: 440px !important;
          width: 92% !important;
          margin: 50px auto 1.75rem !important;
        }
        .modal-pengembalian-custom .modal-content {
          border: none !important;
          background: transparent !important;
          border-radius: 16px !important;
          box-shadow: none !important;
        }
        .modal {
          z-index: 1070 !important;
        }
        .modal-backdrop {
          z-index: 1065 !important;
        }
      `}</style>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
};

export default DetailPengajuanAlat;


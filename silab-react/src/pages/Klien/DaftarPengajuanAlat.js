import React, { useEffect } from "react";
import { Container, Card, Badge } from "react-bootstrap";
import { FaChevronRight } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";

const DEMO_PENGAJUAN = [
  {
    id: "PJ001",
    kode: "PJ001 – Micropipette 20–200 µL",
    tanggal: "02 Juli 2026",
    status: "Menunggu Verifikasi",
    badgeBg: "#A6867B",
  },
  {
    id: "PJ002",
    kode: "PJ001 – Micropipette 20–200 µL",
    tanggal: "02 Juli 2026",
    status: "Menunggu Verifikasi",
    badgeBg: "#A6867B",
  },
  {
    id: "PJ003",
    kode: "PJ001 – Micropipette 20–200 µL",
    tanggal: "02 Juli 2026",
    status: "Menunggu Verifikasi",
    badgeBg: "#A6867B",
  },
  {
    id: "PJ004",
    kode: "PJ001 – Micropipette 20–200 µL",
    tanggal: "02 Juli 2026",
    status: "Menunggu Verifikasi",
    badgeBg: "#A6867B",
  },
  {
    id: "PJ005",
    kode: "PJ001 – Micropipette 20–200 µL",
    tanggal: "02 Juli 2026",
    status: "Menunggu Verifikasi",
    badgeBg: "#A6867B",
  },
  {
    id: "PJ006",
    kode: "PJ001 – Micropipette 20–200 µL",
    tanggal: "02 Juli 2026",
    status: "Menunggu Verifikasi",
    badgeBg: "#A6867B",
  },
  {
    id: "PJ007",
    kode: "PJ001 – Micropipette 20–200 µL",
    tanggal: "02 Juli 2026",
    status: "Menunggu Verifikasi",
    badgeBg: "#A6867B",
  },
];

const DaftarPengajuanAlat = () => {
  const history = useHistory();

  useEffect(() => {
    document.title = "SILAB-NTDK - Daftar Pengajuan Peminjaman Alat";
  }, []);

  const handleOpenDetail = (id) => {
    history.push(`/dashboard/detailPengajuan/step/${id}`);
  };

  return (
    <NavbarLoginKlien>
      <Container
        fluid
        className="py-5 px-3 px-md-5"
        style={{
          minHeight: "100vh",
          backgroundColor: "#e9e9e9",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: "920px" }}>
          {/* Header Subtitle */}
          <div className="mb-4">
            <div
              style={{
                width: "45px",
                height: "4px",
                backgroundColor: "#8D6E63",
                borderRadius: "2px",
                marginBottom: "8px",
              }}
            />
            <span
              className="fw-semibold text-uppercase"
              style={{
                color: "#8D6E63",
                fontSize: "0.8rem",
                letterSpacing: "1.2px",
              }}
            >
              SILAB-NTDK SYSTEM
            </span>
            <h2
              className="fw-bold text-dark mt-1 mb-1"
              style={{
                fontSize: "1.9rem",
                color: "#2D3436",
              }}
            >
              Detail Pengajuan Peminjaman Alat
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.92rem" }}>
              Klik pada pengajuan alat untuk melihat status progress peminjaman secara lengkap.
            </p>
          </div>

          {/* List of Submission Cards */}
          <div className="d-flex flex-column gap-3 mb-5">
            {DEMO_PENGAJUAN.map((item) => (
              <Card
                key={item.id}
                className="border-0 shadow-sm pengajuan-card"
                style={{
                  borderRadius: "20px",
                  backgroundColor: "#ffffff",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onClick={() => handleOpenDetail(item.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                }}
              >
                <Card.Body className="px-4 py-3.5 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                  {/* Left Info: Code & Date */}
                  <div>
                    <h5
                      className="fw-bold mb-1 text-dark"
                      style={{
                        fontSize: "1.05rem",
                        fontFamily: "Poppins, sans-serif",
                        letterSpacing: "-0.2px",
                      }}
                    >
                      {item.kode}
                    </h5>
                    <div
                      className="text-muted"
                      style={{
                        fontSize: "0.88rem",
                        color: "#6C757D",
                      }}
                    >
                      {item.tanggal}
                    </div>
                  </div>

                  {/* Right Info: Status Pill & Lihat Progress */}
                  <div className="d-flex flex-column align-items-sm-end gap-1">
                    <Badge
                      style={{
                        backgroundColor: item.badgeBg,
                        color: "#ffffff",
                        borderRadius: "20px",
                        padding: "6px 18px",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        letterSpacing: "0.2px",
                      }}
                    >
                      {item.status}
                    </Badge>
                    <div
                      className="fw-bold mt-1 d-flex align-items-center"
                      style={{
                        fontSize: "0.85rem",
                        color: "#4A3B32",
                        cursor: "pointer",
                      }}
                    >
                      Lihat Progress <FaChevronRight size={10} className="ms-1" />
                      <FaChevronRight size={10} style={{ marginLeft: "-3px" }} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </Container>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
};

export default DaftarPengajuanAlat;

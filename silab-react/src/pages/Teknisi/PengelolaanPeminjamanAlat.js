import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";

import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import SiapDiambil from "../../components/PengelolaanPeminjaman/SiapDiambil";
import SedangDipinjam from "../../components/PengelolaanPeminjaman/SedangDipinjam";
import Pengembalian from "../../components/PengelolaanPeminjaman/Pengembalian";

export default function PengelolaanPeminjamanAlat() {
  const [activeTab, setActiveTab] = useState("siapDiambil");

  useEffect(() => {
    document.title = "SILAB-NTDK - Pengelolaan Peminjaman Alat";
  }, []);

  return (
    <NavbarLoginTeknisi>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAF9F8",
          fontFamily: "Poppins, sans-serif",
          padding: "28px 32px 48px",
        }}
      >
        <Container fluid>
          {/* Top Pill Navigation Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "32px",
              flexWrap: "wrap",
            }}
          >
            {/* Tab 1: Siap Diambil */}
            <button
              type="button"
              onClick={() => setActiveTab("siapDiambil")}
              style={{
                backgroundColor: activeTab === "siapDiambil" ? "#9E8880" : "#ffffff",
                color: activeTab === "siapDiambil" ? "#ffffff" : "#424242",
                border: activeTab === "siapDiambil" ? "none" : "1.5px solid #D0D0D0",
                borderRadius: "30px",
                padding: "8px 24px",
                fontSize: "0.92rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow:
                  activeTab === "siapDiambil"
                    ? "0 4px 14px rgba(158,136,128,0.4)"
                    : "0 2px 6px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease-in-out",
              }}
            >
              Siap Diambil (12)
            </button>

            {/* Tab 2: Sedang Dipinjam */}
            <button
              type="button"
              onClick={() => setActiveTab("sedangDipinjam")}
              style={{
                backgroundColor: activeTab === "sedangDipinjam" ? "#9E8880" : "#ffffff",
                color: activeTab === "sedangDipinjam" ? "#ffffff" : "#424242",
                border: activeTab === "sedangDipinjam" ? "none" : "1.5px solid #D0D0D0",
                borderRadius: "30px",
                padding: "8px 24px",
                fontSize: "0.92rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow:
                  activeTab === "sedangDipinjam"
                    ? "0 4px 14px rgba(158,136,128,0.4)"
                    : "0 2px 6px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease-in-out",
              }}
            >
              Sedang Dipinjam (7)
            </button>

            {/* Tab 3: Pengembalian */}
            <button
              type="button"
              onClick={() => setActiveTab("pengembalian")}
              style={{
                backgroundColor: activeTab === "pengembalian" ? "#9E8880" : "#ffffff",
                color: activeTab === "pengembalian" ? "#ffffff" : "#424242",
                border: activeTab === "pengembalian" ? "none" : "1.5px solid #D0D0D0",
                borderRadius: "30px",
                padding: "8px 24px",
                fontSize: "0.92rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow:
                  activeTab === "pengembalian"
                    ? "0 4px 14px rgba(158,136,128,0.4)"
                    : "0 2px 6px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease-in-out",
              }}
            >
              Pengembalian (4)
            </button>
          </div>

          {/* Dynamic Component Content */}
          {activeTab === "siapDiambil" && <SiapDiambil />}
          {activeTab === "sedangDipinjam" && <SedangDipinjam />}
          {activeTab === "pengembalian" && <Pengembalian />}
        </Container>
      </div>
    </NavbarLoginTeknisi>
  );
}

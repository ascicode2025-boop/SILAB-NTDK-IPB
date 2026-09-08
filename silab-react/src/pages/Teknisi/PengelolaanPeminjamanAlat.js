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
import { getRentals, handoverRental, returnRental } from "../../services/InstrumentRentalService";

export default function PengelolaanPeminjamanAlat() {
  const [activeTab, setActiveTab] = useState("siapDiambil");
  const [rentals, setRentals] = useState([]);

  const fetchRentals = async () => {
    try {
      const res = await getRentals();
      const mappedData = (res?.data || []).map(r => ({
        ...r,
        rental_number: `PJ${String(r.id).padStart(3, '0')}`,
        user: { name: r.user?.name || "Unknown" },
        items: r.instruments?.map(i => ({
          instrument_id: i.id,
          instrument: { name: i.nama_alat },
          quantity: i.pivot?.quantity || 1
        })) || [],
        start_date: r.tanggal_peminjaman,
        end_date: r.tanggal_pengembalian,
        handover_notes: r.handover_notes,
        actual_return_date: r.client_return_date,
        return_condition: r.client_return_condition,
        return_notes: r.client_return_notes,
      }));
      setRentals(mappedData);
    } catch (error) {
      console.error("Failed to fetch rentals", error);
    }
  };

  useEffect(() => {
    document.title = "SILAB-NTDK - Pengelolaan Peminjaman Alat";
    fetchRentals();
  }, []);

  const siapDiambilRentals = rentals.filter((r) => r.status === "disetujui");
  const sedangDipinjamRentals = rentals.filter((r) => r.status === "aktif");
  const pengembalianRentals = rentals.filter((r) => r.status === "menunggu_pengembalian");

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
              Siap Diambil ({siapDiambilRentals.length})
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
              Sedang Dipinjam ({sedangDipinjamRentals.length})
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
              Pengembalian ({pengembalianRentals.length})
            </button>
          </div>

          {/* Dynamic Component Content */}
          {activeTab === "siapDiambil" && (
            <SiapDiambil 
              rentals={siapDiambilRentals} 
              onRefresh={fetchRentals} 
              onHandover={handoverRental} 
            />
          )}
          {activeTab === "sedangDipinjam" && (
            <SedangDipinjam rentals={sedangDipinjamRentals} />
          )}
          {activeTab === "pengembalian" && (
            <Pengembalian 
              rentals={pengembalianRentals} 
              onRefresh={fetchRentals} 
              onReturn={returnRental} 
            />
          )}
        </Container>
      </div>
    </NavbarLoginTeknisi>
  );
}

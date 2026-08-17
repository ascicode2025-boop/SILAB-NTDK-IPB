import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Modal } from "react-bootstrap";
import { Calendar, ConfigProvider, DatePicker, Button } from "antd";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import "../../css/BookingCalenderKlien.css";

dayjs.extend(updateLocale);
dayjs.updateLocale("id", {
  weekStart: 1,
  weekdaysShort: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  months: [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ],
});
dayjs.locale("id");

// Data Sampel Peminjaman Alat
// Dynamic Mock Loans Relative to Realtime Date (dayjs())
const generateRealtimeLoans = () => {
  const now = dayjs();
  const todayStr = now.format("YYYY-MM-DD");
  const todayFormatted = now.format("DD MMMM YYYY");
  const endFormatted = now.add(3, "day").format("DD MMMM YYYY");

  const dayPlus2 = now.add(2, "day");
  const dayPlus2Str = dayPlus2.format("YYYY-MM-DD");
  const dayPlus2Formatted = dayPlus2.format("DD MMMM YYYY");
  const dayPlus2EndFormatted = dayPlus2.add(3, "day").format("DD MMMM YYYY");

  const dayPlus5 = now.add(5, "day");
  const dayPlus5Str = dayPlus5.format("YYYY-MM-DD");
  const dayPlus5Formatted = dayPlus5.format("DD MMMM YYYY");
  const dayPlus5EndFormatted = dayPlus5.add(3, "day").format("DD MMMM YYYY");

  return [
    {
      id: "PJ001-1",
      noPengajuan: "PJ001",
      namaPeminjam: "Nadine Maulia Fauzi",
      alat: "Micropipette 20–200 µL",
      jumlah: "2 Unit",
      tanggalPinjam: todayFormatted,
      tanggalKembali: endFormatted,
      status: "Disetujui",
      catatan: "Diperlukan untuk penelitian analisis sampel darah.",
      dateStr: todayStr,
    },
    {
      id: "PJ001-2",
      noPengajuan: "PJ001",
      namaPeminjam: "Nadine Maulia Fauzi",
      alat: "Micropipette 20–200 µL",
      jumlah: "2 Unit",
      tanggalPinjam: todayFormatted,
      tanggalKembali: endFormatted,
      status: "Disetujui",
      catatan: "Gunakan dengan teliti.",
      dateStr: todayStr,
    },
    {
      id: "PJ001-3",
      noPengajuan: "PJ001",
      namaPeminjam: "Nadine Maulia Fauzi",
      alat: "Micropipette 20–200 µL",
      jumlah: "2 Unit",
      tanggalPinjam: todayFormatted,
      tanggalKembali: endFormatted,
      status: "Disetujui",
      catatan: "Alat siap digunakan.",
      dateStr: todayStr,
    },
    {
      id: "PJ002-1",
      noPengajuan: "PJ002",
      namaPeminjam: "Budi Santoso",
      alat: "Spectrophotometer UV-Vis",
      jumlah: "1 Unit",
      tanggalPinjam: dayPlus2Formatted,
      tanggalKembali: dayPlus2EndFormatted,
      status: "Disetujui",
      catatan: "Diperlukan untuk analisis protein.",
      dateStr: dayPlus2Str,
    },
    {
      id: "PJ002-2",
      noPengajuan: "PJ002",
      namaPeminjam: "Siti Rahmawati",
      alat: "Centrifuge 15000 RPM",
      jumlah: "1 Unit",
      tanggalPinjam: dayPlus2Formatted,
      tanggalKembali: dayPlus2EndFormatted,
      status: "Disetujui",
      catatan: "Peminjaman rutin lab.",
      dateStr: dayPlus2Str,
    },
    {
      id: "PJ002-3",
      noPengajuan: "PJ002",
      namaPeminjam: "Ahmad Fauzi",
      alat: "Micropipette 20–200 µL",
      jumlah: "2 Unit",
      tanggalPinjam: dayPlus2Formatted,
      tanggalKembali: dayPlus2EndFormatted,
      status: "Disetujui",
      catatan: "Persiapan sampel pakan.",
      dateStr: dayPlus2Str,
    },
    {
      id: "PJ003-1",
      noPengajuan: "PJ003",
      namaPeminjam: "Dewi Kurnia",
      alat: "Timbangan Analitik 0.1mg",
      jumlah: "1 Unit",
      tanggalPinjam: dayPlus5Formatted,
      tanggalKembali: dayPlus5EndFormatted,
      status: "Disetujui",
      catatan: "Pengukuran sampel nutrisi.",
      dateStr: dayPlus5Str,
    },
  ];
};

export default function KalenderPeminjamanAlat() {
  useEffect(() => {
    document.title = "SILAB-NTDK - Kalender Peminjaman Alat";
  }, []);

  const [selectedDate, setSelectedDate] = useState(null);
  const [viewDate, setViewDate] = useState(dayjs());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const mockLoans = useMemo(() => generateRealtimeLoans(), []);

  // Group loan items by YYYY-MM-DD
  const loansMap = useMemo(() => {
    const map = {};
    mockLoans.forEach((item) => {
      if (!map[item.dateStr]) map[item.dateStr] = [];
      map[item.dateStr].push(item);
    });
    return map;
  }, [mockLoans]);

  // Filter loans for selected date
  const activeDate = selectedDate || dayjs();
  const selectedDateStr = activeDate.format("YYYY-MM-DD");
  const loansForSelectedDate = loansMap[selectedDateStr] || [
    {
      id: `PJ-DEF-1`,
      noPengajuan: "PJ001",
      namaPeminjam: "Nadine Maulia Fauzi",
      alat: "Micropipette 20–200 µL",
      jumlah: "2 Unit",
      tanggalPinjam: activeDate.format("DD MMMM YYYY"),
      tanggalKembali: activeDate.add(3, "day").format("DD MMMM YYYY"),
      status: "Disetujui",
      catatan: "Peminjaman alat analisis laboratorium.",
      dateStr: selectedDateStr,
    },
    {
      id: `PJ-DEF-2`,
      noPengajuan: "PJ001",
      namaPeminjam: "Nadine Maulia Fauzi",
      alat: "Micropipette 20–200 µL",
      jumlah: "2 Unit",
      tanggalPinjam: activeDate.format("DD MMMM YYYY"),
      tanggalKembali: activeDate.add(3, "day").format("DD MMMM YYYY"),
      status: "Disetujui",
      catatan: "Peminjaman alat analisis laboratorium.",
      dateStr: selectedDateStr,
    },
    {
      id: `PJ-DEF-3`,
      noPengajuan: "PJ001",
      namaPeminjam: "Nadine Maulia Fauzi",
      alat: "Micropipette 20–200 µL",
      jumlah: "2 Unit",
      tanggalPinjam: activeDate.format("DD MMMM YYYY"),
      tanggalKembali: activeDate.add(3, "day").format("DD MMMM YYYY"),
      status: "Disetujui",
      catatan: "Peminjaman alat analisis laboratorium.",
      dateStr: selectedDateStr,
    },
  ];

  const [detailViewLoan, setDetailViewLoan] = useState(null);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

  const handleDateSelect = (val) => {
    setSelectedDate(val);
    setViewDate(val);
    setDetailViewLoan(null);
    if (!isPanelOpen) {
      setIsPanelOpen(true);
    }
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setDetailViewLoan(null);
  };

  const handleOpenDetail = (item) => {
    setDetailViewLoan(item);
  };

  // Custom cell rendering for Calendar days
  const dateCellRender = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayOfWeek = value.day(); // 0: Sun, 6: Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isSelected = selectedDate ? value.isSame(selectedDate, "day") : false;
    const isToday = value.isSame(dayjs(), "day");
    const isSameMonth = value.month() === viewDate.month();
    const items = loansMap[dateStr] || (isSelected ? loansForSelectedDate : []);

    if (isSelected) {
      return (
        <div
          style={{
            backgroundColor: "#4E3C36",
            borderRadius: "14px",
            color: "#ffffff",
            padding: "6px 4px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(78,60,54,0.35)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            border: isToday ? "2px solid #FFD54F" : "none",
          }}
        >
          {isToday && (
            <span
              style={{
                backgroundColor: "#FFD54F",
                color: "#3E2723",
                fontSize: "0.58rem",
                fontWeight: "800",
                borderRadius: "6px",
                padding: "0px 5px",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              ★ Hari Ini
            </span>
          )}
          <div style={{ fontSize: "0.88rem", fontWeight: "700", lineHeight: "1.2" }}>
            {value.date()}
          </div>
          <span
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              color: "#ffffff",
              fontSize: "0.65rem",
              fontWeight: "600",
              borderRadius: "8px",
              padding: "1px 6px",
              display: "inline-block",
              lineHeight: "1.3",
            }}
          >
            Tersedia
          </span>
          <span
            style={{
              backgroundColor: "rgba(0,0,0,0.28)",
              color: "#ffffff",
              fontSize: "0.50rem",
              fontWeight: "500",
              borderRadius: "8px",
              padding: "1px 6px",
              whiteSpace: "nowrap",
              lineHeight: "1.3",
            }}
          >
            {items.length > 0 ? `${items.length} Peminjaman` : "3 Peminjaman"}
          </span>
        </div>
      );
    }

    if (isWeekend) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            opacity: isSameMonth ? 1 : 0.35,
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              color: "#E53935",
              fontWeight: "700",
              backgroundColor: isToday ? "rgba(229, 57, 53, 0.12)" : "transparent",
              borderRadius: "50%",
              width: isToday ? "24px" : "auto",
              height: isToday ? "24px" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: isToday ? "1.5px solid #E53935" : "none",
            }}
          >
            {value.date()}
          </div>
          <span
            style={{
              color: "#E53935",
              fontSize: "0.68rem",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}
          >
            TUTUP
          </span>
        </div>
      );
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          opacity: isSameMonth ? 1 : 0.35,
        }}
      >
        {isToday ? (
          <div
            style={{
              backgroundColor: "#8D6E63",
              color: "#ffffff",
              borderRadius: "50%",
              width: "26px",
              height: "26px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              fontWeight: "700",
              boxShadow: "0 2px 6px rgba(141,110,99,0.35)",
            }}
            title="Hari Ini"
          >
            {value.date()}
          </div>
        ) : (
          <div style={{ fontSize: "0.85rem", color: isSameMonth ? "#333333" : "#9E9E9E", fontWeight: "600" }}>
            {value.date()}
          </div>
        )}

        <span
          style={{
            color: isSameMonth ? "#2E7D32" : "#A5D6A7",
            fontSize: "0.68rem",
            fontWeight: "600",
          }}
        >
          Tersedia
        </span>
      </div>
    );
  };

  return (
    <NavbarLoginKoordinator>
      {/* CSS Overrides & Smooth Animations */}
      <style>{`
        .kalender-koordinator-clean .ant-picker-cell {
          padding: 3px !important;
        }
        .kalender-koordinator-clean .ant-picker-cell-inner {
          min-height: 76px !important;
          height: 76px !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 14px !important;
        }
        .kalender-koordinator-clean .ant-picker-calendar-date {
          min-height: 76px !important;
          height: 76px !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 14px !important;
        }
        .kalender-koordinator-clean .ant-picker-calendar-date-content {
          height: 100% !important;
        }
        .kalender-koordinator-clean .ant-picker-calendar-full .ant-picker-cell-selected .ant-picker-cell-inner {
          background: transparent !important;
        }

        .calendar-transition-wrapper {
          transition: flex 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes panelSlideIn {
          from {
            opacity: 0;
            transform: translateX(35px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .panel-slide-animated {
          animation: panelSlideIn 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div style={{ backgroundColor: "#FAF9F8", minHeight: "100vh", paddingBottom: "48px" }}>
        {/* Subtitle Header Banner */}
        <div style={{ padding: "28px 24px 16px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div style={{ width: "40px", height: "2px", backgroundColor: "#8D6E63" }} />
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: "800",
                color: "#3E2723",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
              }}
            >
              SILAB-NTDK SYSTEM
            </span>
            <div style={{ width: "40px", height: "2px", backgroundColor: "#8D6E63" }} />
          </div>

          <h2
            style={{
              fontWeight: 800,
              fontSize: "2rem",
              color: "#332723",
              marginBottom: "6px",
            }}
          >
            Kalender Peminjaman
          </h2>
          <p style={{ color: "#616161", fontSize: "0.92rem", margin: 0 }}>
            Lihat data peminjaman sesuai kalender dan atur jadwal disini.
          </p>
        </div>

        {/* Main Content Grid: Smooth Layout Transition Container */}
        <Container fluid className="px-3 px-md-5">
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            {/* Left Column: Ant Design Calendar (Width shrinks smoothly when panel is open) */}
            <div
              className="calendar-transition-wrapper"
              style={{
                flex: isPanelOpen ? "0 0 58%" : "0 0 100%",
                maxWidth: isPanelOpen ? "58%" : "100%",
                width: isPanelOpen ? "58%" : "100%",
              }}
            >
              <div
                className="kalender-koordinator-clean"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  border: "1px solid #EAEAEA",
                }}
              >
                <ConfigProvider locale={idID}>
                  <Calendar
                    value={viewDate}
                    onChange={(val) => handleDateSelect(val)}
                    headerRender={({ value, onChange }) => {
                      const currentMonth = value.format("MMMM YYYY");
                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "20px",
                            paddingBottom: "12px",
                            borderBottom: "1px solid #EEEEEE",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Button
                              onClick={() => {
                                const today = dayjs();
                                handleDateSelect(today);
                              }}
                              style={{
                                borderRadius: "18px",
                                borderColor: "#D0D0D0",
                                color: "#333",
                                fontSize: "0.82rem",
                                fontWeight: 500,
                              }}
                            >
                              Today
                            </Button>
                            <button
                              type="button"
                              onClick={() => onChange(value.clone().subtract(1, "month"))}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                border: "1px solid #E0E0E0",
                                backgroundColor: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <FaChevronLeft size={10} color="#555" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onChange(value.clone().add(1, "month"))}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                border: "1px solid #E0E0E0",
                                backgroundColor: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <FaChevronRight size={10} color="#555" />
                            </button>

                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "1.05rem",
                                color: "#332723",
                                marginLeft: "8px",
                              }}
                            >
                              {currentMonth}
                            </span>
                          </div>

                          <DatePicker
                            value={value}
                            format="DD/MM/YYYY"
                            onChange={(date) => {
                              if (date) {
                                handleDateSelect(date);
                              }
                            }}
                            style={{
                              borderRadius: "12px",
                              borderColor: "#E0E0E0",
                              fontSize: "0.85rem",
                              width: "135px",
                            }}
                          />
                        </div>
                      );
                    }}
                    fullCellRender={(value) => dateCellRender(value)}
                  />
                </ConfigProvider>
              </div>
            </div>

            {/* Right Column: Total Pinjaman Panel (Slides in when isPanelOpen is true) */}
            {isPanelOpen && (
              <div
                className="panel-slide-animated"
                style={{
                  flex: "0 0 40%",
                  maxWidth: "40%",
                  width: "40%",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    border: "1px solid #EAEAEA",
                  }}
                >
                  {/* Header Bar */}
                  <div
                    style={{
                      backgroundColor: "#A6867B",
                      color: "#ffffff",
                      padding: "14px 20px",
                      textAlign: "center",
                      fontWeight: "700",
                      fontSize: "1.1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaCalendarAlt size={18} />
                      <span>{activeDate.format("DD MMMM YYYY")}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClosePanel}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Tutup Panel"
                    >
                      ✕
                    </button>
                  </div>

                  {detailViewLoan ? (
                    /* Detail Jadwal View */
                    <div style={{ padding: "24px 24px 28px", textAlign: "center" }}>
                      <h4
                        style={{
                          fontWeight: 800,
                          fontSize: "1.2rem",
                          color: "#3E2723",
                          marginBottom: "16px",
                        }}
                      >
                        Detail Jadwal
                      </h4>

                      <hr style={{ borderTop: "1px solid #E0E0E0", width: "90%", margin: "0 auto 20px" }} />

                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>No Pengajuan</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>{detailViewLoan.noPengajuan}</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Nama</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>{detailViewLoan.namaPeminjam}</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Alat</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>{detailViewLoan.alat}</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Jumlah</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>{detailViewLoan.jumlah}</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Tanggal Pinjam</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>{detailViewLoan.tanggalPinjam}</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Tanggal Kembali</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>{detailViewLoan.tanggalKembali}</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "6px" }}>Status</div>
                          <div>
                            <span
                              style={{
                                backgroundColor: "#DCFCE7",
                                color: "#166534",
                                borderRadius: "20px",
                                padding: "4px 18px",
                                fontSize: "0.85rem",
                                fontWeight: "700",
                                display: "inline-block",
                              }}
                            >
                              {detailViewLoan.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <hr style={{ borderTop: "1px solid #E0E0E0", width: "90%", margin: "24px auto 20px" }} />

                      <h4
                        style={{
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          color: "#3E2723",
                          marginBottom: "16px",
                        }}
                      >
                        Ketersediaan Alat
                      </h4>

                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Total Unit</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>10</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Sudah Dipinjam</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>8</div>
                        </div>

                        <div>
                          <div style={{ color: "#757575", fontSize: "0.85rem", marginBottom: "2px" }}>Sisa</div>
                          <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800 }}>2 Unit</div>
                        </div>
                      </div>

                      <hr style={{ borderTop: "1px solid #E0E0E0", width: "90%", margin: "24px auto 20px" }} />

                      <h4
                        style={{
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          color: "#3E2723",
                          marginBottom: "12px",
                        }}
                      >
                        Tanggal Penggunaan
                      </h4>

                      <div style={{ color: "#3E2723", fontSize: "1.02rem", fontWeight: 800, marginBottom: "24px" }}>
                        {detailViewLoan.tanggalPinjam}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
                        <button
                          type="button"
                          onClick={() => setDetailViewLoan(null)}
                          style={{
                            backgroundColor: "#666666",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "20px",
                            padding: "8px 24px",
                            fontWeight: "700",
                            fontSize: "0.88rem",
                            cursor: "pointer",
                            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                          }}
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSaveConfirmModal(true)}
                          style={{
                            backgroundColor: "#44352F",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "20px",
                            padding: "8px 24px",
                            fontWeight: "700",
                            fontSize: "0.88rem",
                            cursor: "pointer",
                            boxShadow: "0 3px 8px rgba(68,53,47,0.3)",
                          }}
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Total Pinjaman List View */
                    <div style={{ padding: "24px 24px 16px", textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 800,
                          color: "#3E2723",
                          marginBottom: "4px",
                        }}
                      >
                        Total Pinjaman
                      </div>
                      <div
                        style={{
                          fontSize: "2.4rem",
                          fontWeight: 800,
                          color: "#212121",
                          lineHeight: "1.2",
                        }}
                      >
                        {loansForSelectedDate.length}
                      </div>

                      <hr style={{ borderTop: "1px solid #E0E0E0", width: "90%", margin: "20px auto 24px" }} />

                      {/* List of Loan Cards */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "480px", overflowY: "auto", paddingRight: "4px" }}>
                        {loansForSelectedDate.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "16px",
                              border: "1px solid #EBEBEB",
                              boxShadow: "0 3px 12px rgba(0,0,0,0.04)",
                              padding: "18px 20px",
                              textAlign: "left",
                              transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            }}
                          >
                            {/* Header: No Pengajuan */}
                            <div style={{ fontWeight: 800, color: "#212121", fontSize: "0.95rem", marginBottom: "8px" }}>
                              {item.noPengajuan}
                            </div>

                            {/* Peminjam */}
                            <div style={{ color: "#333333", fontSize: "0.92rem", fontWeight: 500, marginBottom: "6px" }}>
                              {item.namaPeminjam}
                            </div>

                            {/* Alat */}
                            <div style={{ color: "#555555", fontSize: "0.88rem", marginBottom: "4px" }}>
                              {item.alat}
                            </div>

                            {/* Jumlah */}
                            <div style={{ color: "#555555", fontSize: "0.88rem", marginBottom: "14px" }}>
                              {item.jumlah}
                            </div>

                            {/* Footer: Status Pill & Lihat Detail Button */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "0.85rem", color: "#616161" }}>Status</span>
                                <span
                                  style={{
                                    backgroundColor: "#DCFCE7",
                                    color: "#166534",
                                    borderRadius: "20px",
                                    padding: "3px 14px",
                                    fontSize: "0.8rem",
                                    fontWeight: "700",
                                  }}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenDetail(item)}
                                style={{
                                  backgroundColor: "#44352F",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "20px",
                                  padding: "6px 20px",
                                  fontWeight: "600",
                                  fontSize: "0.82rem",
                                  cursor: "pointer",
                                  boxShadow: "0 3px 8px rgba(68,53,47,0.3)",
                                }}
                              >
                                Lihat Detail
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Container>

        {/* Modal Detail Peminjaman */}
        <style>{`
          .custom-modal-clean .modal-content {
            border-radius: 18px !important;
            border: none !important;
            overflow: hidden !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18) !important;
            background-color: #ffffff !important;
          }
          .custom-modal-narrow {
            max-width: 440px !important;
          }
        `}</style>
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          centered
          dialogClassName="custom-modal-narrow custom-modal-clean"
        >
          {/* Header Bar */}
          <div
            style={{
              backgroundColor: "#A6867B",
              color: "#ffffff",
              padding: "14px 20px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "1.15rem",
              letterSpacing: "0.2px",
            }}
          >
            Detail Peminjaman
          </div>

          {selectedLoan && (
            <div style={{ padding: "24px 28px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>No Pengajuan</span>
                  <span style={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>{selectedLoan.noPengajuan}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>Nama</span>
                  <span style={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>{selectedLoan.namaPeminjam}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>Alat</span>
                  <span style={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>{selectedLoan.alat}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>Tanggal Pinjam</span>
                  <span style={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>{selectedLoan.tanggalPinjam}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>Tanggal Kembali</span>
                  <span style={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>{selectedLoan.tanggalKembali}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem" }}>Status</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4CAF50" }} />
                    <span style={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.9rem" }}>{selectedLoan.status}</span>
                  </div>
                </div>

                <div style={{ marginTop: "4px" }}>
                  <span style={{ fontWeight: 600, color: "#616161", fontSize: "0.9rem", display: "block", marginBottom: "6px" }}>
                    Catatan
                  </span>
                  <div
                    style={{
                      backgroundColor: "#F5F5F5",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      fontSize: "0.88rem",
                      color: "#424242",
                      border: "1px solid #E0E0E0",
                    }}
                  >
                    {selectedLoan.catatan || "Tidak ada catatan tambahan."}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    backgroundColor: "#44352F",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "14px",
                    padding: "8px 44px",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    boxShadow: "0 3px 10px rgba(68,53,47,0.35)",
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Konfirmasi Simpan Perubahan */}
        <style>{`
          .confirm-save-modal .modal-content {
            border-radius: 22px !important;
            border: none !important;
            padding: 24px 28px !important;
            text-align: center !important;
            box-shadow: 0 12px 32px rgba(0,0,0,0.18) !important;
            background-color: #ffffff !important;
          }
        `}</style>
        <Modal
          show={showSaveConfirmModal}
          onHide={() => setShowSaveConfirmModal(false)}
          centered
          dialogClassName="custom-modal-narrow confirm-save-modal"
        >
          <div style={{ padding: "12px 8px 8px" }}>
            <h5
              style={{
                fontWeight: "800",
                color: "#3E2723",
                fontSize: "1.1rem",
                marginBottom: "28px",
                lineHeight: "1.5",
              }}
            >
              Apakah anda yakin ingin menyimpan perubahan?
            </h5>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
              <button
                type="button"
                onClick={() => setShowSaveConfirmModal(false)}
                style={{
                  backgroundColor: "#9E9E9E",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  padding: "8px 28px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveConfirmModal(false);
                  setDetailViewLoan(null);
                }}
                style={{
                  backgroundColor: "#44352F",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  padding: "8px 32px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(68,53,47,0.35)",
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </NavbarLoginKoordinator>
  );
}

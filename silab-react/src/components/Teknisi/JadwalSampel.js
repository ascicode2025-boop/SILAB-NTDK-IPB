import React, { useState } from "react";
import { Calendar, ConfigProvider, DatePicker, Button, Modal } from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/JadwalSampel.css";

dayjs.extend(updateLocale);

dayjs.updateLocale("id", {
  weekStart: 1,
  weekdaysShort: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
});

dayjs.locale("id");

// Jadwal tersedia berdasarkan kategori
const AVAILABLE_DATES = {
  metabolit: ["12/09/2025", "26/09/2025"],
  hematologi: ["05/09/2025", "19/09/2025", "03/10/2025"],
};

export default function JadwalSampel() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewDate, setViewDate] = useState(dayjs());
  const [category, setStatus] = useState("metabolit");
  const [status, setStatusDate] = useState("Tersedia");

  // Info panel yang mengikuti klik tanggal
  const formattedDate = selectedDate.format("D MMMM YYYY");
  const selectedCategory = category === "metabolit" ? "Metabolit" : "Hematologi";

  // Hari merah berdasarkan kategori
  const isRedDay = (date) => {
    const day = date.day();
    if (category === "metabolit") return day === 6 || day === 0;
    if (category === "hematologi") return day === 5 || day === 6 || day === 0;
    return false;
  };

  return (
    <NavbarLoginTeknisi>
      <ConfigProvider locale={idID}>
        <div className="min-h-screen bg-[#eee9e6] p-6 font-poppins flex justify-center p-5 gap-10">
          {/* ======================= Kiri: Kalender ======================= */}
          <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
            <div className="flex justify-end mb-6 mt-5 m-lg-4">
              <select className="custom-select-clean" value={category} onChange={(e) => setStatus(e.target.value)}>
                <option value="metabolit">Metabolit</option>
                <option value="hematologi">Hematologi</option>
              </select>
            </div>

            {/* Kalender */}
            <div className="calendar-wrapper mt-1">
              <Calendar
                fullscreen={false}
                value={selectedDate}
                onSelect={(date) => setSelectedDate(date)} // --> klik tanggal update info panel
                onChange={(v) => {
                  setSelectedDate(v);
                  setViewDate(v);
                }}
                onPanelChange={(value) => setViewDate(value)}
                className="custom-calendar"
                headerRender={({ value, onChange }) => {
                  const month = value.format("MMMM");
                  const year = value.format("YYYY");

                  const goPrev = () => {
                    const prev = value.subtract(1, "month");
                    onChange(prev);
                    setViewDate(prev);
                  };

                  const goNext = () => {
                    const next = value.add(1, "month");
                    onChange(next);
                    setViewDate(next);
                  };

                  const goToday = () => {
                    const today = dayjs();
                    onChange(today);
                    setViewDate(today);
                    setSelectedDate(today);
                  };

                  return (
                    <div className="calendar-custom-header">
                      <div className="left-controls">
                        <Button onClick={goToday} className="btn-today">
                          Today
                        </Button>
                        <button className="nav-circle" onClick={goPrev}>
                          ◀
                        </button>
                        <button className="nav-circle" onClick={goNext}>
                          ▶
                        </button>
                      </div>

                      <div className="center-title">
                        {month} {year}
                      </div>

                      <div className="right-controls">
                        <DatePicker
                          value={selectedDate}
                          onChange={(d) => {
                            if (d) {
                              setSelectedDate(d);
                              setViewDate(d);
                            }
                          }}
                          format="DD/MM/YYYY"
                          allowClear={false}
                          className="date-picker-header"
                        />
                      </div>
                    </div>
                  );
                }}
                dateFullCellRender={(date) => {
                  const isCurrentMonth = date.isSame(viewDate, "month");
                  if (!isCurrentMonth) return <div className="calendar-cell-empty" />;

                  const isToday = date.isSame(dayjs(), "day");
                  const isSelected = date.isSame(selectedDate, "day");

                  const dateString = date.format("D/MM/YYYY");
                  const isAvailable = AVAILABLE_DATES[category]?.includes(dateString);

                  const weekendRed = isRedDay(date);

                  return (
                    <div
                      className={`calendar-cell-custom
                        ${weekendRed ? "weekend" : ""}
                        ${isToday ? "today" : ""}
                        ${isSelected ? "selected" : ""}
                        ${isAvailable ? "available" : "not-available"}
                      `}
                    >
                      {date.date()}
                    </div>
                  );
                }}
              />
            </div>
          </div>
          {/* ====================== Kanan: Info Panel ====================== */}
          <div className="info-panel-wrapper mt-5">
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">Tanggal</span>
                <span className="info-value">{formattedDate}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Jenis Analisis</span>
                <span className="info-value">{selectedCategory}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Status</span>

                <select className="info-select" value={status} onChange={(e) => setStatusDate(e.target.value)}>
                  <option value="Tersedia">Tersedia</option>
                  <option value="Tak Tersedia">Tak Tersedia</option>
                </select>
              </div>

              <button className="btn-save">Simpan Perubahan</button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mt-6">
          <FooterSetelahLogin />
        </div>
      </ConfigProvider>
    </NavbarLoginTeknisi>
  );
}

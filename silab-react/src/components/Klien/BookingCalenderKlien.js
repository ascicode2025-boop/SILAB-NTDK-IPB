import React, { useState } from "react";
import { Calendar, ConfigProvider, DatePicker, Button } from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/BookingCalenderKlien.css";

dayjs.extend(updateLocale);

// Locale Indonesia + mulai Senin
dayjs.updateLocale("id", {
  weekStart: 1,
  weekdaysShort: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
});

dayjs.locale("id");

// Tanggal tersedia berdasarkan kategori
const AVAILABLE_DATES = {
  metabolit: ["12/09/2025", "26/09/2025"],
  hematologi: ["05/09/2025", "19/09/2025", "03/10/2025"],
};

export default function BookingCalenderKlien() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewDate, setViewDate] = useState(dayjs());
  const [category, setCategory] = useState("metabolit");

  // Hari merah berdasarkan kategori
  const isRedDay = (date) => {
    const day = date.day();
    if (category === "metabolit") return day === 6 || day === 0;
    if (category === "hematologi") return day === 5 || day === 6 || day === 0;
    return false;
  };

  return (
    <NavbarLoginKlien>
      <ConfigProvider locale={idID}>
        <div className="min-h-screen bg-[#eee9e6] p-6 font-poppins flex justify-center">
          <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200" style={{paddingBottom: "2rem"}}>
            {/* Dropdown kategori */}
            <div className="flex justify-end mb-6 mt-5 m-lg-4">
              <select className="px-3 py-2 border rounded-lg shadow-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition custom-select-dropdown" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="metabolit">Metabolit</option>
                <option value="hematologi">Hematologi</option>
              </select>
            </div>

            {/* Kalender */}
            <div className="calendar-wrapper mt-1">
              <Calendar
                fullscreen={false}
                value={selectedDate}
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
                  const isAvailable = AVAILABLE_DATES[category] && AVAILABLE_DATES[category].includes(dateString);

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

            <div className="flex items-center gap-2"
              style={{ margin: "1rem" }}
            >
              <span className="legend-box inline-flex items-center justify-center"></span>
              <span className="leading-none"
              style={{marginLeft: "3px"}}
              >Tanggal merah menandakan kouta penuh/tidak tersedia</span>
            </div>

            <span className="m-3 text-center w-full block text-gray-700">
                Kouta yang tersedia untuk {category === "metabolit" ? "Metabolit" : "Hematologi"} pada {selectedDate.format("DD MMMM YYYY")}:{" "}
                <strong>
                  {AVAILABLE_DATES[category] && AVAILABLE_DATES[category].includes(selectedDate.format("D/MM/YYYY"))
                    ? category === "metabolit"
                      ? "5 slot"
                      : "3 slot"
                      : "0 slot"}
                </strong>
            </span>
          </div>

          {/* Footer tetap di bawah */}
          <div className="w-full max-w-6xl mt-6">
            <FooterSetelahLogin />
          </div>
          
        </div>
      </ConfigProvider>
    </NavbarLoginKlien>
  );
}

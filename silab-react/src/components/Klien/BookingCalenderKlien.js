import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ConfigProvider, DatePicker, Button, Modal, Spin, message } from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/BookingCalenderKlien.css";

import { getMonthlyQuota } from "../../services/QuotaService";

dayjs.extend(updateLocale);
dayjs.updateLocale("id", {
  weekStart: 1,
  weekdaysShort: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
});
dayjs.locale("id");

export default function BookingCalenderKlien() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewDate, setViewDate] = useState(dayjs());
  const [category, setCategory] = useState("metabolit");

  const [quotaData, setQuotaData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");

  useEffect(() => {
    const savedDate = localStorage.getItem("selected_booking_date");
    if (savedDate) {
      const loaded = dayjs(savedDate);
      setSelectedDate(loaded);
      setViewDate(loaded);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const month = viewDate.month() + 1;
      const year = viewDate.year();
      const response = await getMonthlyQuota(month, year, category);
      setQuotaData(response.data || []);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  }, [viewDate, category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const onFocus = () => {
      fetchData();
    };

    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchData]);

  const isStandardHoliday = (date, type) => {
    const day = date.day();
    if (type === "hematologi") return day === 5 || day === 6 || day === 0;
    return day === 6 || day === 0;
  };

  const handleDateSelect = (value) => {
    if (value.isBefore(dayjs(), "day")) return;

    const dateStr = value.format("YYYY-MM-DD");
    const dayData = quotaData.find((item) => item.date === dateStr);

    let isAvailable = true;
    let remaining = 15;
    let max = 15;

    if (dayData) {
      isAvailable = dayData.is_available;
      remaining = dayData.remaining_quota;
      max = dayData.max_quota;
    } else {
      if (isStandardHoliday(value, category)) {
        isAvailable = false;
        remaining = 0;
      }
    }

    const isFull = isAvailable && remaining === 0 && max > 0;

    if (!isAvailable) {
      setModalContent("Maaf, Tanggal ini TUTUP. Silakan pilih tanggal lain.");
      setModalOpen(true);
      return;
    }

    if (isFull) {
      setModalContent("Maaf, Kuota PENUH. Silakan pilih tanggal lain.");
      setModalOpen(true);
      return;
    }

    setSelectedDate(value);
    setViewDate(value);
    localStorage.setItem("selected_booking_date", dateStr);

    message.success(`Tanggal ${value.format("DD MMMM YYYY")} berhasil disimpan!`);
  };

  const getSelectedQuota = () => {
    const dateStr = selectedDate.format("YYYY-MM-DD");
    const dayData = quotaData.find((item) => item.date === dateStr);

    if (dayData) return dayData.remaining_quota;
    if (isStandardHoliday(selectedDate, category)) return 0;
    return 15;
  };

  return (
    <NavbarLoginKlien>
      <ConfigProvider locale={idID}>
        <div className="min-h-screen bg-[#eee9e6] font-poppins flex justify-center p-3">
          <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
            {/* HEADER */}
            <div className="flex justify-end mb-6 mt-5 m-lg-4">
              <div className="flex items-center gap-3">
                <select className="custom-select-clean border-b border-gray-300" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="metabolit">Metabolit</option>
                  <option value="hematologi">Hematologi</option>
                </select>
              </div>
            </div>

            {/* SPIN LOADING */}
            <Spin spinning={loading} tip="Memuat Data...">
              <div className="calendar-wrapper mt-1">
                <Calendar
                  fullscreen={true}
                  value={viewDate}
                  onChange={(v) => {
                    if (!v.isSame(viewDate, "month")) {
                      setViewDate(v);
                    } else {
                      handleDateSelect(v);
                    }
                  }}
                  onPanelChange={(value) => setViewDate(value)}
                  className="custom-calendar"
                  headerRender={({ value, onChange }) => {
                    const month = value.format("MMMM");
                    const year = value.format("YYYY");
                    return (
                      <div className="calendar-custom-header">
                        <div className="left-controls" style={{ display: "flex", alignItems: "center" }}>
                          <Button
                            onClick={() => {
                              const today = dayjs();
                              onChange(today);
                              setViewDate(today);
                              setSelectedDate(today);
                            }}
                            className="btn-today"
                            style={{ marginRight: "10px" }}
                          >
                            Today
                          </Button>

                          <button
                            className="nav-circle"
                            onClick={() => {
                              const prev = value.clone().subtract(1, "month");
                              onChange(prev);
                              setViewDate(prev);
                            }}
                          >
                            ◀
                          </button>

                          <button
                            className="nav-circle"
                            style={{ marginLeft: "5px" }}
                            onClick={() => {
                              const next = value.clone().add(1, "month");
                              onChange(next);
                              setViewDate(next);
                            }}
                          >
                            ▶
                          </button>

                          <div className="center-title" style={{ fontSize: "18px", fontWeight: "500" }}>
                            {month} {year}
                          </div>
                        </div>

                        <div className="right-controls">
                          <DatePicker
                            value={selectedDate}
                            onChange={(d) => {
                              if (d) {
                                setSelectedDate(d);
                                setViewDate(d);
                                onChange(d);
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
                  fullCellRender={(date, info) => {
                    if (info.type !== "date") return info.originNode;

                    const dateStr = date.format("YYYY-MM-DD");
                    const dayData = quotaData.find((item) => item.date === dateStr);

                    let isAvailable = true;
                    let displayQuota = 15;
                    let maxQuota = 15;

                    if (dayData) {
                      isAvailable = dayData.is_available;
                      displayQuota = dayData.remaining_quota;
                      maxQuota = dayData.max_quota;
                    } else {
                      if (isStandardHoliday(date, category)) {
                        isAvailable = false;
                        displayQuota = 0;
                        maxQuota = 0;
                      }
                    }

                    const isFull = isAvailable && displayQuota === 0 && maxQuota > 0;
                    const isCurrentMonth = date.isSame(viewDate, "month");
                    const isPast = date.isBefore(dayjs(), "day");
                    const isToday = date.isSame(dayjs(), "day");
                    const isSelected = date.isSame(selectedDate, "day");

                    let cellClass = "calendar-cell-custom";

                    if (!isCurrentMonth) cellClass += " outside-month";
                    else if (isPast) cellClass += " past-date";
                    else if (isSelected) cellClass += " selected";
                    else if (isToday) cellClass += " today";
                    else if (isFull) cellClass += " fully-booked";
                    else if (!isAvailable) cellClass += " not-available";
                    else cellClass += " available";

                    if (isSelected && !isAvailable) cellClass += " selected-red";
                    if (isToday && !isAvailable) cellClass += " today-closed";

                    return (
                      <div className={cellClass}>
                        <div className="date-number">{date.date()}</div>

                        {isCurrentMonth && !isPast && (
                          <>
                            {isFull && <div className="full-badge">PENUH</div>}
                            {!isAvailable && !isFull && <div className="tutup-badge">TUTUP</div>}
                            {isAvailable && !isFull && <div className="quota-badge">Sisa: {displayQuota}</div>}
                          </>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            </Spin>
          </div>

          {/* LEGENDA */}
          <div
            className="calendar-legend-container"
            style={{
              marginTop: "-0.5rem",
            }}
          >
            <div className="legend-item">
              <div className="legend-box red"></div> <span>Merah = Tutup</span>
            </div>
            <div className="legend-item ml-4">
              <div className="legend-box orange"></div> <span>Oranye = Penuh</span>
            </div>
          </div>

          {/* QUOTA INFO CARD */}
          <div className="quota-card-container w-full mb-6">
            <div className="quota-card bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Kuota Hari Ini</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* SISA KUOTA */}
                <div className="quota-item p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="text-sm text-gray-500">Sisa Kuota</div>
                  <div className="mt-1 text-3xl font-bold text-green-700">{getSelectedQuota()}</div>
                </div>

                {/* KATEGORI */}
                <div className="quota-item p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-sm text-gray-500">Kategori Pemeriksaan</div>
                  <div className="mt-1 text-xl font-semibold text-blue-700">{category === "metabolit" ? "Metabolit" : "Hematologi"}</div>
                </div>

                {/* TANGGAL */}
                <div className="quota-item p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-sm text-gray-500">Tanggal Dipilih</div>
                  <div className="mt-1 text-xl font-semibold text-gray-800">{selectedDate.format("DD MMMM YYYY")}</div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Kapasitas Terpakai </span>
                  <span className="font-medium text-gray-800">{15 - getSelectedQuota()} / 15</span>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${((15 - getSelectedQuota()) / 15) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL ERROR */}
        <Modal
          open={modalOpen}
          onOk={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
          centered
          footer={[
            <Button key="ok" onClick={() => setModalOpen(false)}>
              OK
            </Button>,
          ]}
        >
          <p className="text-center text-red-600 font-semibold mt-4">{modalContent}</p>
        </Modal>
      </ConfigProvider>

      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
}

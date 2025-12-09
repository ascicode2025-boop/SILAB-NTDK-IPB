import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ConfigProvider, DatePicker, Button, Modal, Spin, message } from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/AturTanggalTeknisi.css";

import { getMonthlyQuota } from "../../services/QuotaService";

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
      if(isStandardHoliday(value, category)) {
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

    message.success(
      `Tanggal ${value.format("DD MMMM YYYY")} berhasil disimpan!`
    );
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
        <div className="min-h-screen bg-[#eee9e6] font-poppins flex justify-center p-5">
          <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6 mt-4">
              <h2 className="text-xl font-bold text-[#3e2723]">Pilih Jadwal Pengiriman</h2>
              <div className="flex items-center gap-3">
                <select
                  className="custom-select-clean border-b border-gray-300"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
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

                          <div className="center-title" style={{ marginLeft: "20px", fontSize: "18px", fontWeight: "bold" }}>
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
                            {isAvailable && !isFull && (
                              <div className="quota-badge">Sisa: {displayQuota}</div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            </Spin>

            {/* SECTION INFO */}
            <div style={{ marginTop: "2rem" }}>
              <div className="legend-wrapper flex items-center gap-6 justify-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="legend-box red"></div>
                  <span className="text-sm font-medium text-gray-600">Merah = Tutup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="legend-box" style={{ background: "#f59e0b" }}></div>
                  <span className="text-sm font-medium text-gray-600">Oranye = Penuh</span>
                </div>
              </div>

              <div className="quota-info text-center w-full p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700">
                <span>
                  Kouta yang tersedia untuk <strong>{category}</strong> pada{" "}
                  <strong>{selectedDate.format("DD MMMM YYYY")}</strong>:
                </span>
                <span className="text-xl font-bold text-[#059669] ml-2">{getSelectedQuota()} slot</span>
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
    </NavbarLoginKlien>
  );
}

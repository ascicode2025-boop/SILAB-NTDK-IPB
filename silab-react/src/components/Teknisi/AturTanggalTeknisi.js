import React, { useState } from "react";
import { Calendar, ConfigProvider, DatePicker, Button, Modal } from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/AturTanggalTeknisi.css";

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

export default function AturTanggalTeknisi() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewDate, setViewDate] = useState(dayjs());
  const [category, setCategory] = useState("metabolit");
  const [formCategory, setFormCategory] = useState("metabolit");
  const [kuota, setKuota] = useState("");
  const [applyAll, setApplyAll] = useState(false);

  // Modal state (sukses / error)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalIsError, setModalIsError] = useState(false);

  // Hari merah berdasarkan kategori
  const isRedDay = (date) => {
    const day = date.day();
    if (category === "metabolit") return day === 6 || day === 0;
    if (category === "hematologi") return day === 5 || day === 6 || day === 0;
    return false;
  };

  const showModal = (title, content, isError = false) => {
    setModalTitle(title);
    setModalContent(content);
    setModalIsError(isError);
    setModalOpen(true);
  };

  const handleSaveKuota = () => {
    if (!selectedDate) {
      showModal("Gagal", "Silakan pilih tanggal terlebih dahulu.", true);
      return;
    }

    if (kuota === "" || kuota === null) {
      showModal("Gagal", "Silakan masukkan jumlah kuota terlebih dahulu.", true);
      return;
    }

    const kuotaNum = Number(kuota);
    if (Number.isNaN(kuotaNum)) {
      showModal("Gagal", "Kuota harus berupa angka.", true);
      return;
    }

    if (!Number.isInteger(kuotaNum)) {
      showModal("Gagal", "Kuota harus berupa bilangan bulat.", true);
      return;
    }

    if (kuotaNum > 15) {
      showModal("Gagal", "Kuota tidak boleh lebih dari 15.", true);
      return;
    }

    if (kuotaNum < 0) {
      showModal("Gagal", "Kuota tidak boleh negatif.", true);
      return;
    }

    // ==============================
    //  ATURAN BARU APPLY ALL
    // ==============================
    if (applyAll) {
      const startDate = selectedDate;

      // Tentukan batas akhir kategori
      const weekStart = selectedDate.startOf("week"); // Senin
      let maxEnd;

      if (formCategory === "hematologi") {
        maxEnd = weekStart.add(3, "day"); // Kamis
      } else {
        maxEnd = weekStart.add(4, "day"); // Jumat
      }

      // End tidak boleh melewati batas kategori
      const endDate = selectedDate.isBefore(maxEnd) ? maxEnd : selectedDate;

      const startLabel = startDate.format("dddd, DD/MM/YYYY");
      const endLabel = endDate.format("dddd, DD/MM/YYYY");

      const analysisName = formCategory === "Hematologi" ? "Hematologi" : "Metabolit";

      showModal("Berhasil", `Kuota untuk analisis ${analysisName} pada rentang ${startLabel} - ${endLabel} berhasil diatur menjadi ${kuotaNum}.`, false);
    } else {
      const analysisName = formCategory === "hematologi" ? "Hematologi" : "Metabolit";

      showModal("Berhasil", `Kuota untuk analisis ${analysisName} pada tanggal ${selectedDate.format("dddd, DD/MM/YYYY")} berhasil diatur sebanyak ${kuotaNum}.`, false);
    }

    setKuota("");
  };

  return (
    <NavbarLoginTeknisi>
      <ConfigProvider locale={idID}>
        <div className="min-h-screen bg-[#eee9e6] font-poppins flex justify-center p-5">
          <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
            {/* Dropdown kategori */}
            <div className="flex justify-end mb-6 mt-5 m-lg-4">
              <select className="custom-select-clean" value={category} onChange={(e) => setCategory(e.target.value)}>
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
          </div>

          {/* ================== FORM INPUT KUOTA ================== */}
          <div className="quota-container mt-5">
            <h2 className="text-center font-semibold text-lg mb-6">Atur Kuota Harian</h2>

            <div className="quota-header">
              <label>Pilih Tanggal</label>
              <DatePicker
                disabled={applyAll}
                value={selectedDate}
                onChange={(d) => {
                  if (d) {
                    setSelectedDate(d);
                    setViewDate(d);
                  }
                }}
                format="DD/MM/YYYY"
                allowClear={false}
                className="quota-date-picker"
              />
            </div>

            <div className="quota-form">
              <label>Masukan Jumlah Kuota</label>
              <input type="number" min="0" className="quota-input" placeholder="(maks 15)" value={kuota} onChange={(e) => setKuota(e.target.value)} />

              <label>Jenis Analisis</label>
              <div className="select-wrapper">
                <select className="custom-select" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                  <option value="metabolit">Metabolit</option>
                  <option value="hematologi">Hematologi</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input type="checkbox" checked={applyAll} onChange={() => setApplyAll(!applyAll)} />
                <span>Terapkan ke semua hari</span>
              </div>

              <button className="quota-button" onClick={handleSaveKuota}>
                Simpan Kuota
              </button>
            </div>
          </div>

          {/* ================= END FORM KUOTA ================= */}
        </div>

        {/* Footer tetap di bawah */}
        <div className="w-full max-w-6xl mt-6">
          <FooterSetelahLogin />
        </div>

        {/* Modal (sukses / error) */}
        <Modal
          title={modalIsError ? "Terjadi Kesalahan" : "Berhasil"}
          open={modalOpen}
          onOk={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
          okText="OK"
          cancelButtonProps={{ style: { display: "none" } }}
          maskClosable={false}
          centered
          style={{ paddingRight: 0 }}
          bodyStyle={{ paddingRight: 0 }}
          rootClassName="no-scroll-shift"
        >
          <p>{modalContent}</p>
        </Modal>
      </ConfigProvider>
    </NavbarLoginTeknisi>
  );
}

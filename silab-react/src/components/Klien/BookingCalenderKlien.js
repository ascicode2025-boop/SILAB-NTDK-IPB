import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewDate, setViewDate] = useState(dayjs());
  const [category, setCategory] = useState("metabolit");

  // Pastikan inisialisasi sebagai Array kosong
  const [quotaData, setQuotaData] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Cache untuk menghindari fetch berulang
  const [cache, setCache] = useState({});

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

  // FUNGSI FETCH DATA (OPTIMASI: Caching untuk menghindari request berulang)
  const fetchData = useCallback(async (forceRefresh = false) => {
    const month = viewDate.month() + 1;
    const year = viewDate.year();
    const cacheKey = `${year}-${month}-${category}`;
    
    // Gunakan cache jika ada dan tidak force refresh
    if (!forceRefresh && cache[cacheKey]) {
      setQuotaData(cache[cacheKey]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await getMonthlyQuota(month, year, category);
      
      // Safety check: Pastikan response.data adalah Array
      if (Array.isArray(response.data)) {
        setQuotaData(response.data);
        // Simpan ke cache
        setCache(prev => ({ ...prev, [cacheKey]: response.data }));
      } else {
        setQuotaData([]); 
        console.warn("Format data backend bukan array:", response.data);
      }
    } catch (error) {
      console.error("Gagal ambil data:", error);
      setQuotaData([]);
    } finally {
      setLoading(false);
    }
  }, [viewDate, category, cache]);

  useEffect(() => { fetchData(); }, [viewDate, category]);
  
  // Refresh data saat kembali ke halaman (dengan debounce)
  useEffect(() => { 
    const timer = setTimeout(() => fetchData(true), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const onFocus = () => fetchData(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchData]);

  useEffect(() => {
    const handleVisibilityChange = () => { if (!document.hidden) fetchData(true); };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchData]);

  // Memoize quotaData lookup untuk performa
  const quotaMap = useMemo(() => {
    const map = {};
    quotaData.forEach(item => { map[item.date] = item; });
    return map;
  }, [quotaData]);

  const isStandardHoliday = (date, type) => {
    const day = date.day();
    if (type === "hematologi") return day === 5 || day === 6 || day === 0;
    return day === 6 || day === 0;
  };

  const isUnlimitedService = () => {
    return category === "metabolit";
  };

  const handleDateSelect = (value) => {
    if (value.isBefore(dayjs(), "day")) return;

    const dateStr = value.format("YYYY-MM-DD");
    
    // Gunakan quotaMap untuk lookup cepat
    const dayData = quotaMap[dateStr];

    let isAvailable = true;
    let remaining = 15;
    let max = 15;
    let isStrict = true;

    if (dayData) {
      isAvailable = dayData.is_available;
      remaining = dayData.remaining_quota;
      max = dayData.max_quota;
      isStrict = dayData.is_strict;
    } else {
      // Default values dari master rule
      remaining = getDefaultQuota();
      max = getDefaultQuota();
      
      if (isStandardHoliday(value, category)) {
        isAvailable = false;
        remaining = 0;
      }
    }

    // Logic Penuh (Hanya jika Strict Mode aktif)
    const isFull = isAvailable && remaining === 0 && max > 0 && isStrict;

    if (!isAvailable) {
      setModalContent("Maaf, Tanggal ini TUTUP/LIBUR.");
      setModalOpen(true);
      return;
    }

    if (isFull) {
      setModalContent("Maaf, Kuota PENUH untuk tanggal ini.");
      setModalOpen(true);
      return;
    }

    // Jika Soft Limit (Hematologi > 15), beri warning tapi jangan block
    if (category === 'hematologi' && remaining === 0 && !isStrict) {
        if(!window.confirm("Kuota standar harian sudah terpenuhi. Hasil mungkin keluar lebih lama. Lanjutkan?")) {
            return;
        }
    }

    setSelectedDate(value);
    setViewDate(value);
    localStorage.setItem("selected_booking_date", dateStr);

    message.success(`Tanggal ${value.format("DD MMMM YYYY")} dipilih!`);
  };

  const getSelectedQuota = () => {
    const dateStr = selectedDate.format("YYYY-MM-DD");
    const dayData = quotaData.find((item) => item.date === dateStr);

    if (isUnlimitedService()) {
      if (dayData && !dayData.is_available) return 0;
      if (isStandardHoliday(selectedDate, category)) return 0;
      return "∞"; 
    }

    // Gunakan data dari API jika ada
    if (dayData) return dayData.remaining_quota;
    
    // Fallback: jika libur return 0
    if (isStandardHoliday(selectedDate, category)) return 0;
    
    // Default: gunakan getDefaultQuota()
    return getDefaultQuota();
  };

  const getDefaultQuota = () => {
    return category === "hematologi" ? 30 : 999;
  };

  const getSelectedDayData = () => {
    const dateStr = selectedDate.format("YYYY-MM-DD");
    return quotaMap[dateStr];
  };

  const getSelectedUsed = () => {
    const d = getSelectedDayData();
    if (!d) return 0;
    if (typeof d.used_quota === "number") return d.used_quota; // Ini adalah total (Hema + Gabungan)
    return 0;
  };

  const getSelectedMax = () => {
    const d = getSelectedDayData();
    if (d && typeof d.max_quota === "number") return d.max_quota;
    return getDefaultQuota();
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

            <Spin spinning={loading} tip="Memuat Data...">
              <div className="calendar-wrapper mt-1">
                <Calendar
                  fullscreen={true}
                  value={viewDate}
                  onChange={(v) => {
                    if (!v.isSame(viewDate, "month")) { setViewDate(v); } 
                    else { handleDateSelect(v); }
                  }}
                  onPanelChange={(value) => setViewDate(value)}
                  className="custom-calendar"
                  headerRender={({ value, onChange }) => {
                    const month = value.format("MMMM");
                    const year = value.format("YYYY");
                    return (
                      <div className="calendar-custom-header">
                        <div className="left-controls" style={{ display: "flex", alignItems: "center" }}>
                          <Button onClick={() => { const today = dayjs(); onChange(today); setViewDate(today); setSelectedDate(today); }} className="btn-today" style={{ marginRight: "10px" }}>Today</Button>
                          <div className="center-title" style={{ fontSize: "18px", fontWeight: "500" }}>{month} {year}</div>
                        </div>
                        <div className="right-controls">
                          <DatePicker value={selectedDate} onChange={(d) => { if (d) { setSelectedDate(d); setViewDate(d); onChange(d); } }} format="DD/MM/YYYY" allowClear={false} className="date-picker-header" />
                        </div>
                      </div>
                    );
                  }}
                  fullCellRender={(date, info) => {
                    if (info.type !== "date") return info.originNode;

                    const dateStr = date.format("YYYY-MM-DD");
                    // Gunakan quotaMap untuk lookup cepat
                    const dayData = quotaMap[dateStr];

                    let isAvailable = true;
                    let displayQuota = getDefaultQuota();
                    let maxQuota = getDefaultQuota();
                    let isStrict = !isUnlimitedService();

                    if (dayData) {
                      isAvailable = dayData.is_available;
                      displayQuota = dayData.remaining_quota;
                      maxQuota = dayData.max_quota;
                      isStrict = dayData.is_strict;
                    } else {
                      if (isStandardHoliday(date, category)) {
                        isAvailable = false;
                        displayQuota = 0;
                      }
                    }

                    // Logika Visual
                    const isFull = isAvailable && isStrict && displayQuota === 0;
                    const isWarning = isAvailable && !isStrict && displayQuota === 0;

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

                    return (
                      <div className={cellClass} style={isWarning ? { backgroundColor: '#fff7e6', color: '#d46b08', borderColor: '#ffd591' } : {}}>
                        <div className="date-number">{date.date()}</div>
                        {isCurrentMonth && !isPast && (
                          <>
                            {isFull && <div className="full-badge">PENUH</div>}
                            {!isAvailable && !isFull && <div className="tutup-badge">TUTUP</div>}
                            
                            {(isAvailable && !isFull) && (
                              <div className="quota-badge" style={isWarning ? {color: '#d46b08', fontWeight: 'bold'} : {}}>
                                {isUnlimitedService() ? "Tersedia" : (isWarning ? "Padat" : `Sisa: ${displayQuota}`)}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            </Spin>

            {/* KETERANGAN WARNA - Horizontal, rapi */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px',
              marginTop: '24px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: '#52c41a', border: '1px solid #389e0d' }}></div>
                <span style={{ fontSize: 14, color: '#595959', fontWeight: 500 }}>Tersedia</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: '#fa8c16', border: '1px solid #d46b08' }}></div>
                <span style={{ fontSize: 14, color: '#595959', fontWeight: 500 }}>Penuh</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: '#ff4d4f', border: '1px solid #cf1322' }}></div>
                <span style={{ fontSize: 14, color: '#595959', fontWeight: 500 }}>Tutup / Libur</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: '#d9d9d9', border: '1px solid #bfbfbf' }}></div>
                <span style={{ fontSize: 14, color: '#595959', fontWeight: 500 }}>Lewat</span>
              </div>
            </div>
          </div>

          {/* QUOTA INFO CARD */}
          <div className="quota-card-container w-full mb-6">
            <div className="quota-card bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Kuota Hari Ini</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="quota-item p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="text-sm text-gray-500">{isUnlimitedService() ? "Kuota Terpakai" : "Sisa Kuota"}</div>
                  <div className="mt-1 text-3xl font-bold text-green-700">
                    {isUnlimitedService() ? getSelectedUsed() : getSelectedQuota()}
                  </div>
                </div>
                <div className="quota-item p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-sm text-gray-500">Kategori Pemeriksaan</div>
                  <div className="mt-1 text-xl font-semibold text-blue-700">{category === "metabolit" ? "Metabolit" : "Hematologi"}</div>
                </div>
                <div className="quota-item p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-sm text-gray-500">Tanggal Dipilih</div>
                  <div className="mt-1 text-xl font-semibold text-gray-800">{selectedDate.format("DD MMMM YYYY")}</div>
                </div>
              </div>

              {!isUnlimitedService() && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Kapasitas Terpakai </span>
                    <span className="font-medium text-gray-800">
                      {getSelectedUsed()} / {getSelectedMax()}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getSelectedUsed() > getSelectedMax() ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{
                        width: `${(() => { const used = getSelectedUsed(); const max = getSelectedMax(); return max > 0 ? Math.min(100, (used / max) * 100) : 0; })()}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Modal open={modalOpen} onOk={() => setModalOpen(false)} onCancel={() => setModalOpen(false)} centered footer={[<Button key="ok" onClick={() => setModalOpen(false)}>OK</Button>]}>
          <p className="text-center text-red-600 font-semibold mt-4">{modalContent}</p>
        </Modal>
      </ConfigProvider>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
}
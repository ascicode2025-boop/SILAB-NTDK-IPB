import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ConfigProvider, DatePicker, Button, message, Spin } from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/JadwalSampel.css";

import { getMonthlyQuota, updateQuota } from "../../services/QuotaService";

dayjs.extend(updateLocale);
dayjs.updateLocale("id", {
  weekStart: 1,
  weekdaysShort: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
});
dayjs.locale("id");

export default function JadwalSampel() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewDate, setViewDate] = useState(dayjs());
  const [category, setCategory] = useState("metabolit");
  
  const [quotaData, setQuotaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [status, setStatus] = useState("Tersedia");
  const [isLocked, setIsLocked] = useState(false); // State baru untuk mengunci form

  // 1. FETCH DATA
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const month = viewDate.month() + 1;
      const year = viewDate.year();
      const response = await getMonthlyQuota(month, year, category);
      setQuotaData(response.data || []);
    } catch (error) {
      message.error("Gagal memuat jadwal.");
    } finally {
      setLoading(false);
    }
  }, [viewDate, category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

 
  const isStandardHolidayDay = (date) => {
      const day = date.day();
      if (category === "metabolit") return day === 6 || day === 0;
      if (category === "hematologi") return day === 5 || day === 6 || day === 0;
      return false;
  };

  const updatePanelInfo = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    const dayData = quotaData.find(item => item.date === dateStr);
    
  
    const isHoliday = isStandardHolidayDay(date);

   
    let currentStatus = "Tersedia";
    let locked = false;

    if (dayData) {
        
        if (dayData.max_quota === 0 || !dayData.is_available) {
            currentStatus = "Tak Tersedia";
        } else {
            currentStatus = "Tersedia";
        }
        
        if (isHoliday) {
             currentStatus = "Tak Tersedia";
             locked = true; 
        }

    } else {
      
        if (isHoliday) {
            currentStatus = "Tak Tersedia";
            locked = true; 
        }
    }

    setStatus(currentStatus);
    setIsLocked(locked);
  };


  const onSelectDate = (date) => {
    setSelectedDate(date);
    updatePanelInfo(date);
  };

  const handleSave = async () => {
    if (isLocked) return; 

    setSaveLoading(true);
    try {
        const finalQuota = status === "Tak Tersedia" ? 0 : 15;
        const payload = {
            tanggal: selectedDate.format("YYYY-MM-DD"),
            jenis_analisis: category,
            kuota_maksimal: finalQuota,
            terapkan_semua: false 
        };

        await updateQuota(payload);
        message.success(`Jadwal diperbarui!`);
        fetchData(); 
    } catch (error) {
        message.error("Gagal menyimpan.");
    } finally {
        setSaveLoading(false);
    }
  };

  const getDateStatusColor = (date) => {
      const isHoliday = isStandardHolidayDay(date);
      const dateStr = date.format("YYYY-MM-DD");
      const dayData = quotaData.find(item => item.date === dateStr);

      if (dayData) {
          if (dayData.max_quota === 0 || !dayData.is_available) return "weekend"; 
          return "available"; // Putih
      }
      return isHoliday ? "weekend" : "available";
  };

  const formattedDate = selectedDate.format("D MMMM YYYY");
  const selectedCategoryLabel = category === "metabolit" ? "Metabolit" : "Hematologi";

  return (
    <NavbarLoginTeknisi>
      <ConfigProvider locale={idID}>
        <div className="min-h-screen bg-[#eee9e6] p-6 font-poppins flex justify-center p-5 gap-10">
          
          {/* KIRI: KALENDER */}
          <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
            <div className="flex justify-end mb-6 mt-5 m-lg-4">
              <select 
                className="custom-select-clean" 
                value={category} 
                onChange={(e) => {
                    setCategory(e.target.value);
                    setViewDate(dayjs(viewDate)); 
                }}
              >
                <option value="metabolit">Metabolit</option>
                <option value="hematologi">Hematologi</option>
              </select>
            </div>

            <Spin spinning={loading}>
            <div className="calendar-wrapper mt-1">
              <Calendar
                fullscreen={false}
                value={viewDate}
                onSelect={(date) => {
                    if (!date.isSame(viewDate, 'month')) {
                        setViewDate(date);
                    } else {
                        onSelectDate(date);
                    }
                }}
                headerRender={({ value, onChange }) => {
                  const month = value.format("MMMM");
                  const year = value.format("YYYY");
                  const goPrev = () => { const p = value.clone().subtract(1, "month"); onChange(p); setViewDate(p); };
                  const goNext = () => { const n = value.clone().add(1, "month"); onChange(n); setViewDate(n); };
                  const goToday = () => { const t = dayjs(); onChange(t); setViewDate(t); setSelectedDate(t); onSelectDate(t); };

                  return (
                    <div className="calendar-custom-header">
                      <div className="left-controls">
                        <Button onClick={goToday} className="btn-today">Today</Button>
                        <button className="nav-circle" onClick={goPrev}>◀</button>
                        <button className="nav-circle" onClick={goNext}>▶</button>
                      </div>
                      <div className="center-title">{month} {year}</div>
                      <div className="right-controls">
                        <DatePicker 
                            value={selectedDate} 
                            onChange={(d) => { if(d) { setSelectedDate(d); setViewDate(d); onSelectDate(d); onChange(d); }}} 
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
                  const colorClass = getDateStatusColor(date);

                  return (
                    <div
                      className={`calendar-cell-custom ${colorClass} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                    >
                      {date.date()}
                    </div>
                  );
                }}
              />
            </div>
            </Spin>
          </div>

          {/* KANAN: INFO PANEL */}
          <div className="info-panel-wrapper mt-5">
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">Tanggal</span>
                <span className="info-value">{formattedDate}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Jenis Analisis</span>
                <span className="info-value">{selectedCategoryLabel}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Status</span>
                <select 
                    className="info-select" 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isLocked} // DISABLED JIKA HARI LIBUR STANDAR
                    style={isLocked ? { backgroundColor: '#f0f0f0', color: '#999', cursor: 'not-allowed' } : {}}
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Tak Tersedia">Tak Tersedia</option>
                </select>
              </div>

              {isLocked && (
                  <div className="mb-3 text-center text-xs text-red-500 font-semibold">
                      *Hari Libur Standar tidak dapat diubah.
                  </div>
              )}

              <button 
                className="btn-save" 
                onClick={handleSave}
                disabled={saveLoading || isLocked} // TOMBOL JUGA DISABLED
                style={isLocked ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {}}
              >
                {saveLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
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
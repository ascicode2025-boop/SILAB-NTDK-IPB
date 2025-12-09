import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ConfigProvider, DatePicker, Button, Modal, Spin, message } from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import updateLocale from "dayjs/plugin/updateLocale";
import "antd/dist/reset.css";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/AturTanggalTeknisi.css";

// IMPORT SERVICE API
import { getMonthlyQuota, updateQuota as updateQuotaApi } from "../../services/QuotaService";

dayjs.extend(updateLocale);

// Locale Indonesia
dayjs.updateLocale("id", {
  weekStart: 1,
  weekdaysShort: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
});

dayjs.locale("id");

export default function AturTanggalTeknisi() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewDate, setViewDate] = useState(dayjs());
  const [category, setCategory] = useState("metabolit");
  
  const [formCategory, setFormCategory] = useState("metabolit"); 
  const [kuota, setKuota] = useState("");
  const [applyAll, setApplyAll] = useState(false);

  const [quotaData, setQuotaData] = useState([]); 
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalIsError, setModalIsError] = useState(false);

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

  const showModal = (title, content, isError = false) => {
    setModalTitle(title);
    setModalContent(content);
    setModalIsError(isError);
    setModalOpen(true);
  };

  const isStandardHoliday = (date, type) => {
      const day = date.day(); 
      if (type === 'hematologi') return day === 5 || day === 6 || day === 0;
      return day === 6 || day === 0;
  };

  const handleSaveKuota = async () => {
    if (selectedDate.isBefore(dayjs(), 'day')) {
        return showModal("Gagal", "Tidak dapat mengubah kuota untuk tanggal yang sudah lewat.", true);
    }
    if (isStandardHoliday(selectedDate, formCategory)) {
        return showModal("Gagal", `Hari ini adalah jadwal libur standar untuk ${formCategory}.`, true);
    }
    if (!selectedDate) return showModal("Gagal", "Pilih tanggal dulu.", true);
    if (kuota === "" || kuota === null) return showModal("Gagal", "Isi jumlah kuota.", true);
    const kuotaNum = Number(kuota);
    if (kuotaNum < 0) return showModal("Gagal", "Kuota tidak boleh negatif.", true);

    try {
      setLoading(true);
      await updateQuotaApi({
        tanggal: selectedDate.format("YYYY-MM-DD"),
        jenis_analisis: formCategory,
        kuota_maksimal: kuotaNum,
        terapkan_semua: applyAll
      });
      
      message.success("Kuota berhasil diperbarui!");
      setKuota("");
      setApplyAll(false);
      fetchData(); 
    } catch (error) {
      showModal("Gagal", "Terjadi kesalahan saat menyimpan data.", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NavbarLoginTeknisi>
      <ConfigProvider locale={idID}>
        <div className="min-h-screen bg-[#eee9e6] font-poppins flex justify-center p-5">
          <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
            
            <div className="flex justify-end mb-6 mt-5 m-lg-4">
              <select 
                className="custom-select-clean" 
                value={category} 
                onChange={(e) => { setCategory(e.target.value); setFormCategory(e.target.value); }}
              >
                <option value="metabolit">Metabolit</option>
                <option value="hematologi">Hematologi</option>
              </select>
            </div>

            <Spin spinning={loading} tip="Memuat Data...">
              <div className="calendar-wrapper mt-1">
                <Calendar
                  fullscreen={true}
                  value={viewDate}
                  onChange={(v) => {
                    if (!v.isSame(viewDate, 'month')) { setViewDate(v); } 
                    else {
                        if (v.isBefore(dayjs(), 'day')) return; 
                        setSelectedDate(v); setViewDate(v);
                    }
                  }}
                  onPanelChange={(value) => setViewDate(value)}
                  className="custom-calendar"
                  
                  headerRender={({ value, onChange }) => {
                    const month = value.format("MMMM");
                    const year = value.format("YYYY");
                    return (
                      <div className="calendar-custom-header">
                        <div className="left-controls" style={{ display: 'flex', alignItems: 'center' }}>
                          <Button onClick={() => { const today = dayjs(); onChange(today); setViewDate(today); setSelectedDate(today); }} className="btn-today" style={{marginRight: '10px'}}>Today</Button>
                          <button className="nav-circle" onClick={() => { const prev = value.clone().subtract(1, "month"); onChange(prev); setViewDate(prev); }}>◀</button>
                          <button className="nav-circle" style={{marginLeft: '5px'}} onClick={() => { const next = value.clone().add(1, "month"); onChange(next); setViewDate(next); }}>▶</button>
                          <div className="center-title" style={{marginLeft: '20px', fontSize: '18px', fontWeight: 'bold'}}>{month} {year}</div>
                        </div>
                        <div className="right-controls">
                          <DatePicker value={selectedDate} onChange={(d) => { if (d) { setSelectedDate(d); setViewDate(d); onChange(d); }}} format="DD/MM/YYYY" allowClear={false} className="date-picker-header" />
                        </div>
                      </div>
                    );
                  }}

                 
                  fullCellRender={(date, info) => {
                    if (info.type !== 'date') return info.originNode;
                    
                    const dateStr = date.format("YYYY-MM-DD");
                    const dayData = quotaData.find(item => item.date === dateStr);
                    
                    let isAvailable = true; 
                    let displayQuota = 15;
                    let maxQuota = 15;

                    if (dayData) {
                        isAvailable = dayData.is_available;
                        displayQuota = dayData.remaining_quota;
                        maxQuota = dayData.max_quota;
                    } else {
                        if (isStandardHoliday(date, category)) {
                            isAvailable = false; displayQuota = 0; maxQuota = 0;
                        }
                    }
                    const isFull = isAvailable === false && displayQuota === 0 && maxQuota > 0; 
                    const actuallyFull = displayQuota === 0 && maxQuota > 0;

                    const isCurrentMonth = date.isSame(viewDate, "month");
                    const isPast = date.isBefore(dayjs(), 'day');
                    const isToday = date.isSame(dayjs(), "day");
                    const isSelected = date.isSame(selectedDate, "day");

                    let cellClass = "calendar-cell-custom";

                    if (!isCurrentMonth) cellClass += " outside-month";
                    else if (isPast) cellClass += " past-date";
                    else if (isSelected) cellClass += " selected";
                    else if (isToday) cellClass += " today";
                    else if (actuallyFull) cellClass += " fully-booked"; // Prioritas Oranye
                    else if (!isAvailable) cellClass += " not-available"; // Prioritas Merah
                    else cellClass += " available";

                    if (isSelected && !isAvailable) cellClass += " selected-red"; 

                    return (
                      <div className={cellClass}>
                        <div className="date-number">{date.date()}</div>
                        
                        {isCurrentMonth && !isPast && (
                            <>
                                {/* 1. JIKA PENUH (ORANYE) */}
                                {actuallyFull && (
                                    <div className="full-badge">PENUH</div>
                                )}

                                {/* 2. JIKA TUTUP / LIBUR (MERAH) - KECUALI KALAU PENUH */}
                                {!isAvailable && !actuallyFull && (
                                    <div className="tutup-badge">TUTUP</div>
                                )}

                                {/* 3. JIKA TERSEDIA (HIJAU) */}
                                {isAvailable && !actuallyFull && (
                                    <div className="quota-badge">Sisa: {displayQuota}</div>
                                )}
                            </>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
              
              {/* LEGENDA */}
              <div className="calendar-legend-container">
                <div className="legend-item">
                    <div className="legend-box red"></div> <span>Merah = Tutup</span>
                </div>
                <div className="legend-item ml-4">
                    <div className="legend-box orange"></div> <span>Oranye = Penuh</span>
                </div>
              </div>

            </Spin>
          </div>

          <div className="quota-container mt-5">
            <h2 className="text-center font-semibold text-lg mb-6">Atur Kuota Harian</h2>
            <div className="quota-header">
              <label>Pilih Tanggal</label>
              <DatePicker disabled={applyAll} value={selectedDate} disabledDate={(c)=>c&&c<dayjs().endOf('day').subtract(1,'day')} onChange={(d)=>{if(d){setSelectedDate(d);setViewDate(d);}}} format="DD/MM/YYYY" allowClear={false} className="quota-date-picker" />
            </div>
            <div className="quota-form mt-4">
              <label>Masukan Jumlah Kuota</label>
              <input type="number" min="0" className="quota-input" placeholder="(0 = Libur/Penuh)" value={kuota} onChange={(e)=>setKuota(e.target.value)} />
              <small className="text-gray-500 mb-2">Tips: Isi 0 untuk meliburkan/menutup tanggal.</small>
              <label>Jenis Analisis</label>
              <div className="select-wrapper">
                <select className="custom-select" value={formCategory} onChange={(e)=>setFormCategory(e.target.value)}>
                  <option value="metabolit">Metabolit</option>
                  <option value="hematologi">Hematologi</option>
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <input type="checkbox" checked={applyAll} onChange={()=>setApplyAll(!applyAll)} />
                <span className="text-sm">Terapkan ke semua hari (Minggu ini)</span>
              </div>
              <button className="quota-button" onClick={handleSaveKuota} disabled={loading}>{loading?"Menyimpan...":"Simpan Kuota"}</button>
            </div>
          </div>
        </div>
        <div className="w-full max-w-6xl mt-6"><FooterSetelahLogin /></div>
        <Modal title={modalIsError ? "Terjadi Kesalahan" : "Berhasil"} open={modalOpen} onOk={()=>setModalOpen(false)} onCancel={()=>setModalOpen(false)} okText="OK" cancelButtonProps={{style:{display:"none"}}} centered><p style={{whiteSpace:"pre-wrap"}}>{modalContent}</p></Modal>
      </ConfigProvider>
    </NavbarLoginTeknisi>
  );
}
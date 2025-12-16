import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom"; 
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings, updateAnalysisResult } from "../../services/BookingService"; 
import { Button, Spin, message } from "antd";
import "@fontsource/poppins";

function FormInputNilaiAnalisis() {
  const { id } = useParams();
  const history = useHistory();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nilaiAnalisis, setNilaiAnalisis] = useState({});
  const [groupedItems, setGroupedItems] = useState({});

  // === 1. STATE KONSENTRASI STANDAR (Bisa Diedit User) ===
  // Nilai Default:
  // - Dari Excel: Glukosa, Kolestrol, Trigliserida, Total Protein
  // - Estimasi Umum: Albumin, Urea, Kreatinin, dll (Bisa diedit di form)
  const [stdConc, setStdConc] = useState({
    "Glukosa": 109,      // Sesuai koreksi user
    "Kolestrol": 196,    // Sesuai Excel
    "Trigliserida": 218, // Sesuai Excel
    "Total Protein": 7.98, // Sesuai Excel

    // Parameter di bawah ini TIDAK ADA di Excel, tapi pakai rumus yang sama.
    // Nilai ini adalah nilai umum kit reagen. User WAJIB cek botol reagen.
    "Albumin": 4.0,      // Estimasi (g/dL)
    "Urea/BUN": 50,      // Estimasi (mg/dL)
    "Kreatinin": 2.0,    // Estimasi (mg/dL)
    "Kalsium": 10.0,     // Estimasi (mg/dL)
    "HDL-kol": 50,       // Estimasi (mg/dL)
    "LDL-kol": 100,      // Estimasi (mg/dL)
    "Asam Urat": 6.0,    // Estimasi (mg/dL) - Jika ada
    "SGOT": 0,           // Biasanya kinetik (tidak pakai standar), set 0 atau hapus jika kinetik
    "SGPT": 0            // Biasanya kinetik
  });

  // Fungsi ubah nilai standar (Support Desimal)
  const handleStdChange = (namaItem, val) => {
    setStdConc(prev => ({
        ...prev,
        [namaItem]: val 
    }));
  };

  // =================================================================================
  // 2. HELPER KALKULASI & FORMATTING
  // =================================================================================
  const calculateResult = (namaItem, rawVal1, rawVal2 = null) => {
    
    // --- A. LOGIKA METABOLIT / KIMIA KLINIK (Input 2: Abs Std & Abs Spl) ---
    // Jika nama item ada di daftar stdConc, maka gunakan rumus Spektrofotometri
    if (stdConc[namaItem] !== undefined) {
        const absStd = parseFloat(rawVal1); // Input 1: Abs Standar
        const absSpl = parseFloat(rawVal2); // Input 2: Abs Sampel
        const concStd = parseFloat(stdConc[namaItem]); // Konsentrasi Standar

        // Validasi
        if (!absStd || !absSpl || isNaN(absStd) || isNaN(absSpl) || !concStd) return "-";

        // RUMUS: (Abs Sampel / Abs Standar) * Konsentrasi Standar
        const hasil = (absSpl / absStd) * concStd;
        
        return hasil.toFixed(2);
    }

    // --- B. LOGIKA HEMATOLOGI & LAINNYA (Input Tunggal) ---
    if (rawVal1 === "" || isNaN(parseFloat(rawVal1))) return "-";
    const val = parseFloat(rawVal1);

    // Hemoglobin (1 Desimal)
    if (namaItem === "Hemoglobin" || namaItem === "Hemoglobin Darah") {
        return val.toFixed(1); 
    }

    // Hematokrit (Bulat)
    if (namaItem === "Hematokrit") {
        return val.toFixed(0); 
    }

    // BDM (Eritrosit) - Rumus Standar
    if (namaItem === "BDM") {
      let hasil = val * 10000;
      let kolom6 = (hasil / 1000000).toFixed(2);
      return `${kolom6} (10⁶/µL)`; 
    }
    
    // BDP (Leukosit) - Faktor 125 (Sesuai Excel Anda)
    if (namaItem === "BDP") {
      let hasil = val * 125; 
      let kolom3 = (hasil / 1000).toFixed(2);
      return `${kolom3} (10³/µL)`; 
    }

    // Default (Return nilai apa adanya)
    return val;
  };

  // Helper Hitung Persentase Diferensiasi Leukosit (2 Desimal)
  const hitungDiferensiasi = (rowValues) => {
    let total = (parseInt(rowValues.Limfosit) || 0) + (parseInt(rowValues.Heterofil) || 0) + (parseInt(rowValues.Eosinofil) || 0) + (parseInt(rowValues.Monosit) || 0) + (parseInt(rowValues.Basofil) || 0);
    const persen = (val) => (total > 0 ? ((val / total) * 100).toFixed(2) : "0.00");
    return {
      Total: total,
      LimfositPersen: persen(rowValues.Limfosit || 0),
      HeterofilPersen: persen(rowValues.Heterofil || 0),
      EosinofilPersen: persen(rowValues.Eosinofil || 0),
      MonositPersen: persen(rowValues.Monosit || 0),
      BasofilPersen: persen(rowValues.Basofil || 0),
      TotalPersen: total > 0 ? "100.00" : "0.00",
    };
  };

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      const all = data?.data || [];
      const detail = all.find((b) => String(b.id) === String(id));
      setBooking(detail);

      if (detail?.analysis_items) {
        const groups = {};
        detail.analysis_items.forEach((item) => {
          const nama = item.nama_analisis || booking?.jenis_analisis || "Analisis";
          if (!groups[nama]) groups[nama] = [];
          groups[nama].push(item);
        });
        setGroupedItems(groups);
        setNilaiAnalisis({});
      }
    } catch (error) {
        console.error("Gagal memuat data:", error);
        message.error("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setNilaiAnalisis((prev) => ({ ...prev, [key]: value }));
  };

  const generateSampleCodes = (booking) => {
    if (!booking) return [];
    const count = booking.jumlah_sampel;
    const main = booking.kode_sampel;
    if (count <= 1) return [main];
    let arr = [];
    for (let i = 1; i <= count; i++) arr.push(`${main}-${i}`);
    return arr;
  };

  // ================= SUBMIT DATA =================
  const handleSubmit = async () => {
    setLoading(true);
    try {
        const itemsPayload = [];
        const sampleCodes = generateSampleCodes(booking);

        if(booking.analysis_items) {
            booking.analysis_items.forEach(dbItem => {
                let finalResultString = "";

                if (dbItem.nama_item === "Diferensiasi Leukosit") {
                    const results = sampleCodes.map(code => {
                        const base = `DL-${code}`;
                        const vals = {
                            Lim: nilaiAnalisis[`${base}-Limfosit`] || 0,
                            Het: nilaiAnalisis[`${base}-Heterofil`] || 0,
                            Eos: nilaiAnalisis[`${base}-Eosinofil`] || 0,
                            Mon: nilaiAnalisis[`${base}-Monosit`] || 0,
                            Bas: nilaiAnalisis[`${base}-Basofil`] || 0
                        };
                        const hitung = hitungDiferensiasi(vals);
                        return `[${code}] Lim:${hitung.LimfositPersen}%, Het:${hitung.HeterofilPersen}%, Eos:${hitung.EosinofilPersen}%, Mon:${hitung.MonositPersen}%, Bas:${hitung.BasofilPersen}%`;
                    });
                    finalResultString = results.join(" | ");

                } else if (stdConc[dbItem.nama_item] !== undefined) {
                    // LOGIKA METABOLIT (Kimia Klinik)
                    const results = sampleCodes.map(code => {
                        const keyStd = `${dbItem.nama_item}-std-${code}`;
                        const keySpl = `${dbItem.nama_item}-spl-${code}`;
                        const valStd = nilaiAnalisis[keyStd];
                        const valSpl = nilaiAnalisis[keySpl];
                        
                        const calcVal = calculateResult(dbItem.nama_item, valStd, valSpl);
                        return `[${code}]: ${calcVal !== undefined ? calcVal : '-'}`;
                    });
                    finalResultString = results.join(" | ");

                } else {
                    // LOGIKA UMUM (Hematologi, dll)
                    const results = sampleCodes.map(code => {
                        const keyInput = `${dbItem.nama_item}-${dbItem.nama_item === 'BDM' || dbItem.nama_item === 'BDP' ? 'jumlah-' : ''}${code}`;
                        const rawVal = nilaiAnalisis[keyInput];
                        const calcVal = calculateResult(dbItem.nama_item, rawVal);
                        return `[${code}]: ${calcVal !== undefined ? calcVal : '-'}`;
                    });
                    finalResultString = results.join(" | ");
                }

                itemsPayload.push({
                    id: dbItem.id,
                    hasil: finalResultString,
                    metode: "Lab Test" 
                });
            });
        }

        await updateAnalysisResult(booking.id, { items: itemsPayload });
        message.success("Data berhasil disimpan!");
        setTimeout(() => {
            history.push("/teknisi/dashboard/inputAnalisis");
        }, 1500);

    } catch (error) {
        console.error("Error submit:", error);
        message.error("Gagal menyimpan data: " + (error.response?.data?.message || error.message));
    } finally {
        setLoading(false);
    }
  };

  if (loading && !booking) return <NavbarLoginTeknisi><div className="py-5 text-center"><Spin size="large" /></div></NavbarLoginTeknisi>;
  if (!booking) return null;

  return (
    <NavbarLoginTeknisi>
      <div className="p-4" style={{ backgroundColor: "#f7f7f7", minHeight: "100vh" }}>
        <div className="container">
          <h4 className="fw-semibold mb-4">Input Nilai: <span className="text-primary">{booking.kode_sampel}</span></h4>

          <div className="card p-3 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <div className="d-flex justify-content-between">
                <div>
                    <strong>Klien:</strong> {booking.user?.name} <br/>
                    <strong>Analisis:</strong> {booking.jenis_analisis}
                </div>
                <div className="text-end">
                    <strong>Jml Sampel:</strong> {booking.jumlah_sampel}
                </div>
            </div>
          </div>

          {/* LOOP ITEM */}
          {Object.values(groupedItems).flat().map((item) => (
              <div key={item.id} className="card p-3 shadow-sm mb-3" style={{ borderRadius: "12px" }}>
                <h5 className="fw-bold mb-3 text-primary">{item.nama_item}</h5>

                {/* 1. TABEL METABOLIT & KIMIA KLINIK (GLUKOSA, ALBUMIN, UREA, DLL) */}
                {stdConc[item.nama_item] !== undefined ? (
                    <div className="table-responsive">
                    
                    {/* INPUT KONSENTRASI STANDAR */}
                    <div className="alert alert-info py-2 small mb-3 d-flex align-items-center gap-2">
                        <i className="bi bi-gear-fill"></i>
                        <span className="fw-bold">Konsentrasi Standar (Cstd):</span>
                        <input 
                            type="number" 
                            className="form-control form-control-sm text-center fw-bold text-primary"
                            style={{width: '100px'}}
                            step="0.01" 
                            value={stdConc[item.nama_item]}
                            onChange={(e) => handleStdChange(item.nama_item, e.target.value)}
                        />
                        <span className="text-muted fst-italic ms-2">*Ubah nilai ini sesuai botol reagen Anda</span>
                    </div>

                    <table className="table table-bordered text-center">
                        <thead className="table-success">
                        <tr>
                            <th>Label</th>
                            <th style={{width: '25%'}}>Abs Standar</th>
                            <th style={{width: '25%'}}>Abs Sampel</th>
                            <th>Hasil Akhir</th>
                        </tr>
                        </thead>
                        <tbody>
                        {generateSampleCodes(booking).map((code, i) => {
                            const keyStd = `${item.nama_item}-std-${code}`;
                            const keySpl = `${item.nama_item}-spl-${code}`;
                            const valStd = nilaiAnalisis[keyStd] || "";
                            const valSpl = nilaiAnalisis[keySpl] || "";
                            
                            const hasil = calculateResult(item.nama_item, valStd, valSpl);

                            return (
                            <tr key={i}>
                                <td style={{ minWidth: "150px" }}>{code}</td>
                                <td>
                                <input type="number" className="form-control text-center" 
                                    placeholder="0.000" step="0.001"
                                    value={valStd} 
                                    onChange={(e) => handleInputChange(keyStd, e.target.value)} 
                                />
                                </td>
                                <td>
                                <input type="number" className="form-control text-center" 
                                    placeholder="0.000" step="0.001"
                                    value={valSpl} 
                                    onChange={(e) => handleInputChange(keySpl, e.target.value)} 
                                />
                                </td>
                                <td>
                                <input type="text" className="form-control text-center bg-light" value={hasil} disabled />
                                </td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    </div>

                ) : item.nama_item === "BDM" || item.nama_item === "BDP" ? (
                  /* 2. TABEL HEMATOLOGI (BDM / BDP) */
                  <div className="table-responsive">
                    <table className="table table-bordered text-center">
                      <thead className="table-warning">
                        <tr>
                          <th>Label</th>
                          <th>Input (N)</th>
                          <th>Hasil (butir/mm³)</th> 
                          <th>Total ({item.nama_item === "BDM" ? "10⁶/µL" : "10³/µL"})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateSampleCodes(booking).map((code, i) => {
                          const keyJumlah = `${item.nama_item}-jumlah-${code}`;
                          const rawVal = nilaiAnalisis[keyJumlah] || "";
                          
                          let hasilTengah = "-";
                          let hasilAkhir = "-";

                          if (rawVal !== "" && !isNaN(parseFloat(rawVal))) {
                              const val = parseFloat(rawVal);
                              if (item.nama_item === "BDM") {
                                  hasilTengah = val * 10000;
                                  hasilAkhir = (hasilTengah / 1000000).toFixed(2);
                              } else {
                                  // BDP: Faktor 125
                                  hasilTengah = val * 125;
                                  hasilAkhir = (hasilTengah / 1000).toFixed(2);
                              }
                          }

                          return (
                            <tr key={i}>
                              <td style={{ minWidth: "200px" }}>{code}</td>
                              <td>
                                <input type="number" className="form-control text-center" 
                                    value={rawVal} 
                                    onChange={(e) => handleInputChange(keyJumlah, e.target.value)} 
                                    placeholder="0"
                                />
                              </td>
                              <td><input type="text" className="form-control text-center bg-light" value={hasilTengah} disabled /></td>
                              <td><input type="text" className="form-control text-center bg-light" value={hasilAkhir} disabled /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                ) : item.nama_item === "Diferensiasi Leukosit" ? (
                  /* 3. TABEL DIFF COUNT */
                  <div className="table-responsive">
                    <table className="table table-bordered text-center table-sm">
                      <thead className="table-info">
                        <tr style={{fontSize:'12px'}}>
                          <th>Label</th><th>Lim</th><th>Het</th><th>Eos</th><th>Mon</th><th>Bas</th>
                          <th>Total</th><th>%Lim</th><th>%Het</th><th>%Eos</th><th>%Mon</th><th>%Bas</th><th>%Tot</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateSampleCodes(booking).map((code, i) => {
                          const base = `DL-${code}`;
                          const v = {
                            Limfosit: nilaiAnalisis[`${base}-Limfosit`] || "",
                            Heterofil: nilaiAnalisis[`${base}-Heterofil`] || "",
                            Eosinofil: nilaiAnalisis[`${base}-Eosinofil`] || "",
                            Monosit: nilaiAnalisis[`${base}-Monosit`] || "",
                            Basofil: nilaiAnalisis[`${base}-Basofil`] || "",
                          };
                          const h = hitungDiferensiasi(v);
                          return (
                            <tr key={i}>
                              <td style={{ minWidth: "120px" }}>{code}</td>
                              {Object.keys(v).map((k) => (
                                <td key={k} style={{ minWidth: "60px" }}>
                                  <input type="number" className="form-control form-control-sm text-center px-1" value={v[k]} onChange={(e) => handleInputChange(`${base}-${k}`, e.target.value)} />
                                </td>
                              ))}
                              <td className="bg-light">{h.Total}</td>
                              <td className="bg-light">{h.LimfositPersen}</td>
                              <td className="bg-light">{h.HeterofilPersen}</td>
                              <td className="bg-light">{h.EosinofilPersen}</td>
                              <td className="bg-light">{h.MonositPersen}</td>
                              <td className="bg-light">{h.BasofilPersen}</td>
                              <td className="bg-light fw-bold">{h.TotalPersen}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                ) : (
                  /* 4. TABEL DEFAULT */
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Label</th>
                          <th>Nilai Input</th>
                          <th>Hasil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateSampleCodes(booking).map((code, i) => {
                          const key = `${item.nama_item}-${code}`;
                          const rawVal = nilaiAnalisis[key] || "";
                          const displayResult = calculateResult(item.nama_item, rawVal);
                          return (
                            <tr key={i}>
                              <td style={{ minWidth: "200px" }}>{code}</td>
                              <td>
                                <input type="number" className="form-control" placeholder="0.00" value={rawVal} onChange={(e) => handleInputChange(key, e.target.value)} />
                              </td>
                              <td>
                                <input type="text" className="form-control bg-light" value={displayResult} disabled />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

          <div className="text-end pb-5">
            <Button type="primary" size="large" onClick={handleSubmit} loading={loading} style={{minWidth: "200px"}}>
              Simpan Data & Selesai
            </Button>
          </div>
        </div>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}

export default FormInputNilaiAnalisis;
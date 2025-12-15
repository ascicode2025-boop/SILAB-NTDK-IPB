// =================== FULL KODE LENGKAP + DIFERENSIASI LEUKOSIT ===================

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings } from "../../services/BookingService";
import { Button, Spin, message } from "antd";
import "@fontsource/poppins";

function FormInputNilaiAnalisis() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nilaiAnalisis, setNilaiAnalisis] = useState({});
  const [groupedItems, setGroupedItems] = useState({});

  // === RUMUS NORMAL TIAP ITEM ===
  const rumusPerItem = {
    "BDP & BDM": (x) => x * 1.1,
    "Hemoglobin Darah & Hematokrit": (x) => x * 2 + 1,
    "Diferensiasi Leukosit": (x) => x,
    Glukosa: (x) => x / 18,
    "Total Protein": (x) => x * 0.9,
    Albumin: (x) => x + 0.5,
    Trigliserida: (x) => x / 88.5,
    Kolestrol: (x) => x / 38.7,
    "HDL-kol": (x) => x * 1.2,
    "LDL-kol": (x) => x * 1.3,
    "Urea/BUN": (x) => x * 0.357,
    Kreatinin: (x) => x / 88.4,
    Kalsium: (x) => x / 4,
  };

  // === RUMUS BDM ===
  const hitungBDM = (jumlah) => {
    let hasil = jumlah * 10000;
    let kolom6 = (hasil / 1000000).toFixed(2);
    return { hasil, kolom6 };
  };

  // === RUMUS BDP ===
  const hitungBDP = (jumlah) => {
    let hasil = jumlah * 125;
    let kolom3 = (hasil / 1000).toFixed(2);
    return { hasil, kolom3 };
  };

  // === RUMUS HB ===
  const hitungHB = (kolom3) => {
    if (!kolom3 || isNaN(kolom3)) return "";
    return (parseFloat(kolom3) / 3.56).toFixed(2);
  };

  // === RUMUS DIFERENSIASI LEUKOSIT ===
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

  // ================= FETCH =================
  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      const all = data?.data || [];
      const detail = all.find((b) => b.id == id);
      setBooking(detail);

      if (detail?.analysis_items) {
        const groups = {};
        const init = {};

        detail.analysis_items.forEach((item) => {
          const nama = item.nama_analisis || "Tanpa Nama Analisis";
          if (!groups[nama]) groups[nama] = [];

          groups[nama].push(item);
          init[item.nama_item] = "";
        });

        setGroupedItems(groups);
        setNilaiAnalisis(init);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (nama_item, value) => {
    setNilaiAnalisis({ ...nilaiAnalisis, [nama_item]: value });
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

  const handleSubmit = () => {
    console.log("KIRIM NILAI: ", nilaiAnalisis);
    message.success("Nilai analisis berhasil disimpan!");
  };

  if (loading || !booking)
    return (
      <NavbarLoginTeknisi>
        <div className="py-5 text-center">
          <Spin />
        </div>
        <FooterSetelahLogin />
      </NavbarLoginTeknisi>
    );

  return (
    <NavbarLoginTeknisi>
      <div className="p-4" style={{ backgroundColor: "#f7f7f7", minHeight: "100vh" }}>
        <div className="container">
          <h4 className="fw-semibold mb-4">
            Input Nilai Analisis Sampel: <span className="text-primary">{booking.kode_sampel}</span>
          </h4>

          <div className="card p-3 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <h6>
              <strong>Nama Klien:</strong> {booking.user?.name}
            </h6>
            <h6>
              <strong>Jenis Analisis:</strong> {booking.jenis_analisis}
            </h6>
          </div>

          {/* ==================== LOOP SEMUA ITEM ANALISIS ==================== */}
          {Object.values(groupedItems)
            .flat()
            .map((item) => (
              <div key={item.id} className="card p-3 shadow-sm mb-3" style={{ borderRadius: "12px" }}>
                <h5 className="fw-bold mb-3 text-primary">{item.nama_item}</h5>

                {/* ========== BDM & BDP TABLE ========== */}
                {item.nama_item === "BDM" || item.nama_item === "BDP" ? (
                  <div className="table-responsive">
                    <table className="table table-bordered text-center">
                      <thead className="table-warning">
                        <tr>
                          <th>Label</th>
                          <th>Jumlah</th>
                          <th>Hasil (Butir/mm³)</th>
                          <th>{item.nama_item === "BDM" ? "10×6" : "10×3"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateSampleCodes(booking).map((code, i) => {
                          const keyJumlah = `${item.nama_item}-jumlah-${code}`;
                          const jumlah = parseFloat(nilaiAnalisis[keyJumlah] || "");

                          let hasil = "";
                          let kolom = "";

                          if (!isNaN(jumlah) && jumlah !== "") {
                            if (item.nama_item === "BDM") {
                              hasil = hitungBDM(jumlah).hasil;
                              kolom = hitungBDM(jumlah).kolom6;
                            } else {
                              hasil = hitungBDP(jumlah).hasil;
                              kolom = hitungBDP(jumlah).kolom3;
                            }
                          }

                          return (
                            <tr key={i}>
                              <td style={{ minWidth: "250px" }}>{code}</td>
                              <td>
                                <input type="number" className="form-control" value={nilaiAnalisis[keyJumlah] || ""} onChange={(e) => handleInputChange(keyJumlah, e.target.value)} />
                              </td>
                              <td>
                                <input type="number" className="form-control" value={hasil || ""} disabled />
                              </td>
                              <td>
                                <input type="number" className="form-control" value={kolom || ""} disabled />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : item.nama_item === "Diferensiasi Leukosit" ? (
                  /* ========== DIFERENSIASI LEUKOSIT TABLE ========== */
                  <div className="table-responsive">
                    <table className="table table-bordered text-center">
                      <thead className="table-info">
                        <tr>
                          <th>Label</th>
                          <th>Limfosit</th>
                          <th>Heterofil</th>
                          <th>Eosinofil</th>
                          <th>Monosit</th>
                          <th>Basofil</th>
                          <th>Total</th>
                          <th>Limfosit%</th>
                          <th>Heterofit%</th>
                          <th>Eosinofil%</th>
                          <th>Monosit%</th>
                          <th>Basofil%</th>
                          <th>Total%</th>
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
                              <td style={{ minWidth: "250px" }}>{code}</td>

                              {Object.keys(v).map((k, idx2) => (
                                <td key={idx2} style={{ minWidth: "110px" }}>
                                  <input type="number" className="form-control text-center" value={v[k]} onChange={(e) => handleInputChange(`${base}-${k}`, e.target.value)} />
                                </td>
                              ))}

                              <td>{h.Total}</td>
                              <td>{h.LimfositPersen}</td>
                              <td>{h.HeterofilPersen}</td>
                              <td>{h.EosinofilPersen}</td>
                              <td>{h.MonositPersen}</td>
                              <td>{h.BasofilPersen}</td>
                              <td>{h.TotalPersen}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* ========== NORMAL TABLE LAINNYA (GLUKOSA, PROTEIN, HDL, DLL) ========== */
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Label</th>
                          <th>Nilai Asli</th>
                          <th>Nilai</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateSampleCodes(booking).map((code, i) => {
                          const key = `${item.nama_item}-${code}`;
                          const nilai = nilaiAnalisis[key] || "";
                          let hasil = "-";

                          if (nilai !== "" && !isNaN(parseFloat(nilai))) {
                            const rumus = rumusPerItem[item.nama_item];
                            hasil = rumus ? rumus(parseFloat(nilai)).toFixed(2) : nilai;
                          }

                          return (
                            <tr key={i}>
                              <td style={{ minWidth: "250px" }}>{code}</td>
                              <td>
                                <input type="number" className="form-control" value={nilai} onChange={(e) => handleInputChange(key, e.target.value)} />
                              </td>
                              <td>{hasil}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

          <div className="text-end">
            <Button type="primary" onClick={handleSubmit}>
              Simpan Nilai Analisis
            </Button>
          </div>
        </div>
      </div>

      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}

export default FormInputNilaiAnalisis;

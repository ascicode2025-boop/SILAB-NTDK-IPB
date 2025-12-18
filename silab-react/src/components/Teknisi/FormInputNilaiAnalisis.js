import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings, updateAnalysisResult } from "../../services/BookingService";
import { Button, Spin, message, Card, Input, Typography, Divider, Tag, Space, Alert, Checkbox } from "antd";
import { SaveOutlined, ExperimentOutlined, InfoCircleOutlined, UserOutlined, BarcodeOutlined, SettingOutlined } from "@ant-design/icons";
import "@fontsource/poppins";

const { Title, Text } = Typography;

function FormInputNilaiAnalisis() {
  const { id } = useParams();
  const history = useHistory();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nilaiAnalisis, setNilaiAnalisis] = useState({});
  const [groupedItems, setGroupedItems] = useState({});
  const [jenisBDP, setJenisBDP] = useState("unggas"); // unggas | ruminansia
  const [jenisDL, setJenisDL] = useState("unggas"); // unggas | ruminansia

  const [resultUnit, setResultUnit] = useState("mg/dL");

  // === 1. STATE KONSENTRASI STANDAR ===
  const [stdConc, setStdConc] = useState({
    Glukosa: 109,
    Kolestrol: 196,
    Trigliserida: 218,
    "Total Protein": 7.98,
    Albumin: 4.0,
    "Urea/BUN": 50,
    Kreatinin: 2.0,
    Kalsium: 10.0,
    "HDL-kol": 50,
    "LDL-kol": 100,
    "Asam Urat": 6.0,
    SGOT: 0,
    SGPT: 0,
  });

  const handleStdChange = (namaItem, val) => {
    setStdConc((prev) => ({ ...prev, [namaItem]: val }));
  };

  // === 2. HELPER KALKULASI (Logic tetap sama) ===
  const calculateResult = (namaItem, rawVal1, rawVal2 = null) => {
    if (stdConc[namaItem] !== undefined) {
      const absStd = parseFloat(rawVal1);
      const absSpl = parseFloat(rawVal2);
      const concStd = parseFloat(stdConc[namaItem]);
      if (!absStd || !absSpl || isNaN(absStd) || isNaN(absSpl) || !concStd) return "-";
      return ((absSpl / absStd) * concStd).toFixed(2);
    }
    if (rawVal1 === "" || isNaN(parseFloat(rawVal1))) return "-";
    const val = parseFloat(rawVal1);
    if (namaItem === "Hemoglobin" || namaItem === "Hemoglobin Darah") return val.toFixed(1);
    if (namaItem === "Hematokrit") return val.toFixed(0);
    if (namaItem === "BDM") return `${((val * 10000) / 1000000).toFixed(2)} (10⁶/µL)`;
    if (namaItem === "BDP") return `${((val * 125) / 1000).toFixed(2)} (10³/µL)`;
    return val;
  };

  const hitungDiferensiasi = (v) => {
    const toNum = (x) => Number(x) || 0;

    const Limfosit = toNum(v.Limfosit);
    const Heterofil = toNum(v.Heterofil);
    const Eosinofil = toNum(v.Eosinofil);
    const Monosit = toNum(v.Monosit);
    const Basofil = toNum(v.Basofil);

    const Total = Limfosit + Heterofil + Eosinofil + Monosit + Basofil;

    const persen = (x) => (Total > 0 ? ((x / Total) * 100).toFixed(1) : "0.0");

    return {
      Total,
      LimfositPersen: persen(Limfosit),
      HeterofilPersen: persen(Heterofil),
      EosinofilPersen: persen(Eosinofil),
      MonositPersen: persen(Monosit),
      BasofilPersen: persen(Basofil),

      // 🔴 TOTAL %
      TotalPersen: Total > 0 ? (persen(Limfosit) * 1 + persen(Heterofil) * 1 + persen(Eosinofil) * 1 + persen(Monosit) * 1 + persen(Basofil) * 1).toFixed(1) : "0.0",
    };
  };

  // === FETCH DATA ===
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
          const nama = item.nama_analisis || detail?.jenis_analisis || "Analisis";
          if (!groups[nama]) groups[nama] = [];
          groups[nama].push(item);
        });
        setGroupedItems(groups);
        parseExistingResult(detail);
      }
    } catch (error) {
      message.error("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const parseExistingResult = (detail) => {
    if (!detail?.analysis_items) return;

    const parsed = {};

    detail.analysis_items.forEach((item) => {
      if (!item.hasil) return;

      const parts = item.hasil.split(" | ");

      parts.forEach((p) => {
        const match = p.match(/\[(.*?)\]:\s*(.*)/);
        if (!match) return;

        const code = match[1];
        const value = match[2];

        // ===============================
        // BDM & BDP
        // ===============================
        if (item.nama_item === "BDM" || item.nama_item === "BDP") {
          // Ambil angka saja
          const num = value.match(/[\d.]+/);
          if (num) {
            parsed[`${item.nama_item}-jumlah-${code}`] = num[0];
          }
          return;
        }

        // ===============================
        // Diferensiasi Leukosit
        // ===============================
        if (item.nama_item === "Diferensiasi Leukosit") {
          const regex = /(\w+):([\d.]+)/g;
          let m;
          while ((m = regex.exec(value)) !== null) {
            const labelMap = {
              Lim: "Limfosit",
              Het: "Heterofil",
              Eos: "Eosinofil",
              Mon: "Monosit",
              Bas: "Basofil",
            };
            const key = labelMap[m[1]];
            if (key) {
              parsed[`DL-${code}-${key}`] = m[2];
            }
          }
          return;
        }

        // ===============================
        // Kimia Klinik
        // ===============================
        if (stdConc[item.nama_item] !== undefined) {
          parsed[`${item.nama_item}-spl-${code}`] = value;
          return;
        }

        // ===============================
        // Hemoglobin / Hematokrit
        // ===============================
        parsed[`${item.nama_item}-${code}`] = value;
      });
    });

    setNilaiAnalisis(parsed);
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

  const handleBack = async () => {
    try {
      await saveDraft();
    } catch (error) {
      console.warn("Draft gagal disimpan, tetap kembali", error);
    } finally {
      history.push("/teknisi/dashboard/inputNilaiAnalisis");
    }
  };

  if (loading && !booking)
    return (
      <NavbarLoginTeknisi>
        <div className="py-5 text-center">
          <Spin size="large" />
        </div>
      </NavbarLoginTeknisi>
    );
  if (!booking) return null;

  const saveDraft = async () => {
    const itemsPayload = booking.analysis_items.map((dbItem) => ({
      id: dbItem.id,
      // Gunakan hasil yang sudah ada atau string kosong yang valid bagi backend
      hasil: dbItem.hasil ? dbItem.hasil : "-",
      metode: "Draft",
    }));

    try {
      await updateAnalysisResult(booking.id, { items: itemsPayload });
    } catch (error) {
      console.error("Gagal simpan draft:", error.response?.data || error.message);
    }
  };

  return (
    <NavbarLoginTeknisi>
      <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", paddingBottom: "50px", fontFamily: "'Poppins', sans-serif" }}>
        {/* Header Section */}
        <div className="bg-white border-bottom mb-4 p-4 shadow-sm">
          <div className="container">
            <Title level={3} className="mb-1">
              <ExperimentOutlined className="text-primary me-2" /> Input Hasil Analisis
            </Title>
            <Text type="secondary">Silakan masukkan data mentah laboratorium di bawah ini.</Text>
          </div>
        </div>

        <div className="container">
          {/* Booking Info Card */}
          <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
            <div className="row">
              <div className="col-md-4 border-end">
                <Space direction="vertical" size={0}>
                  {" "}
                  {/* Gunakan direction="vertical" tetap benar di antd v4/v5, tapi hapus small */}
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    <BarcodeOutlined /> Kode Utama
                  </Text>
                  <Title level={4} className="m-0 text-primary">
                    {booking.kode_sampel}
                  </Title>
                </Space>
              </div>
              <div className="col-md-4 border-end">
                <Space direction="vertical">
                  <Text type="secondary">
                    <UserOutlined /> Nama Klien
                  </Text>
                  <Text strong className="d-block">
                    {booking.user?.name}
                  </Text>
                </Space>
              </div>
              <div className="col-md-4">
                <Space direction="vertical">
                  <Text type="secondary">Jenis Analisis</Text>
                  <Tag color="blue" style={{ fontSize: "14px", padding: "4px 12px" }}>
                    {booking.jenis_analisis}
                  </Tag>
                </Space>
              </div>
            </div>
          </Card>

          {/* Form items */}
          {Object.values(groupedItems)
            .flat()
            .map((item) => (
              <Card
                key={item.id}
                className="shadow-sm border-0 mb-4"
                style={{ borderRadius: "12px" }}
                title={
                  <span className="text-primary">
                    <ExperimentOutlined /> {item.nama_item}
                  </span>
                }
              >
                {/* Case 1: Kimia Klinik (Metabolit) */}
                {stdConc[item.nama_item] !== undefined && (
                  <div>
                    <Alert
                      className="mb-3"
                      message={
                        <div className="d-flex align-items-center gap-3">
                          <SettingOutlined />
                          <Text strong>Konsentrasi Standar (Cstd):</Text>
                          <Input type="number" size="small" className="fw-bold text-center" style={{ width: "100px", borderRadius: "6px" }} value={stdConc[item.nama_item]} onChange={(e) => handleStdChange(item.nama_item, e.target.value)} />
                          <Text type="secondary" italic className="small">
                            *Sesuaikan dengan botol reagen
                          </Text>
                        </div>
                      }
                      type="info"
                    />

                    {/* === PILIHAN SATUAN === */}
                    <div className="d-flex gap-4 mb-3">
                      <Checkbox checked={resultUnit === "mg/dL"} onChange={() => setResultUnit("mg/dL")}>
                        Hasil (mg/dL)
                      </Checkbox>

                      <Checkbox checked={resultUnit === "g/dL"} onChange={() => setResultUnit("g/dL")}>
                        Hasil (g/dL)
                      </Checkbox>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Label Sampel</th>
                            <th className="text-center">Abs Standar</th>
                            <th className="text-center">Abs Sampel</th>
                            <th className="text-center bg-light">Hasil ({resultUnit})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generateSampleCodes(booking).map((code, i) => {
                            const valStd = nilaiAnalisis[`${item.nama_item}-std-${code}`] || "";
                            const valSpl = nilaiAnalisis[`${item.nama_item}-spl-${code}`] || "";

                            const hasilMg = calculateResult(item.nama_item, valStd, valSpl);

                            const hasilFinal = hasilMg === "-" || hasilMg === "" ? hasilMg : resultUnit === "g/dL" ? (parseFloat(hasilMg) / 1000).toFixed(3) : hasilMg;

                            return (
                              <tr key={i}>
                                <td>
                                  <Tag>{code}</Tag>
                                </td>
                                <td>
                                  <Input type="number" step="0.001" className="text-center" placeholder="0.000" value={valStd} onChange={(e) => handleInputChange(`${item.nama_item}-std-${code}`, e.target.value)} />
                                </td>
                                <td>
                                  <Input type="number" step="0.001" className="text-center" placeholder="0.000" value={valSpl} onChange={(e) => handleInputChange(`${item.nama_item}-spl-${code}`, e.target.value)} />
                                </td>
                                <td className="bg-light">
                                  <Input className="text-center fw-bold text-primary" value={hasilFinal} disabled />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Case 2: Hematologi (BDM) */}
                {item.nama_item === "BDM" && (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Label Sampel</th>
                          <th className="text-center">Input (N)</th>
                          <th className="text-center">Hasil (butir/mm³)</th>
                          <th className="text-center bg-light">Total (10⁶/µL)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateSampleCodes(booking).map((code, i) => {
                          const rawVal = nilaiAnalisis[`BDM-jumlah-${code}`] || "";
                          const tngh = rawVal ? parseFloat(rawVal) * 10000 : "-";
                          const akhr = rawVal ? (tngh / 1_000_000).toFixed(2) : "-";

                          return (
                            <tr key={i}>
                              <td>
                                <Tag>{code}</Tag>
                              </td>
                              <td>
                                <Input type="number" className="text-center" value={rawVal} onChange={(e) => handleInputChange(`BDM-jumlah-${code}`, e.target.value)} />
                              </td>
                              <td className="text-center text-muted">{tngh}</td>
                              <td className="bg-light">
                                <Input className="text-center fw-bold text-success" value={akhr} disabled />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Case 2: Hematologi (BDP) */}
                {item.nama_item === "BDP" && (
                  <>
                    {/* Pilihan Jenis Hewan */}
                    <div className="mb-3 d-flex gap-4 align-items-center">
                      <Text strong>Jenis Hewan:</Text>
                      <Checkbox checked={jenisBDP === "unggas"} onChange={() => setJenisBDP("unggas")}>
                        Unggas (×125)
                      </Checkbox>
                      <Checkbox checked={jenisBDP === "ruminansia"} onChange={() => setJenisBDP("ruminansia")}>
                        Ruminansia (×50)
                      </Checkbox>
                    </div>

                    {/* Tabel BDP */}
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Label Sampel</th>
                            <th className="text-center">Input (N)</th>
                            <th className="text-center">Hasil (butir/mm³)</th>
                            <th className="text-center bg-light">Total (10³/µL)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generateSampleCodes(booking).map((code, i) => {
                            const rawVal = nilaiAnalisis[`BDP-jumlah-${code}`] || "";
                            const factor = jenisBDP === "unggas" ? 125 : 50;
                            const tngh = rawVal ? parseFloat(rawVal) * factor : "-";
                            const akhr = rawVal ? (tngh / 1000).toFixed(2) : "-";

                            return (
                              <tr key={i}>
                                <td>
                                  <Tag>{code}</Tag>
                                </td>
                                <td>
                                  <Input type="number" className="text-center" value={rawVal} onChange={(e) => handleInputChange(`BDP-jumlah-${code}`, e.target.value)} />
                                </td>
                                <td className="text-center text-muted">{tngh}</td>
                                <td className="bg-light">
                                  <Input className="text-center fw-bold text-success" value={akhr} disabled />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* Case 3: Diferensiasi Leukosit */}
                {item.nama_item === "Diferensiasi Leukosit" && (
                  <>
                    {/* Pilihan Jenis Hewan */}
                    <div className="mb-3 d-flex gap-4 align-items-center">
                      <Text strong>Jenis Hewan:</Text>

                      <Checkbox checked={jenisDL === "unggas"} onChange={() => setJenisDL("unggas")}>
                        Unggas
                      </Checkbox>

                      <Checkbox checked={jenisDL === "ruminansia"} onChange={() => setJenisDL("ruminansia")}>
                        Ruminansia
                      </Checkbox>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered align-middle text-center small">
                        <thead className="table-light">
                          <tr>
                            <th rowSpan="2">Label</th>
                            <th colSpan="5">Hitung Jenis (Input N)</th>
                            <th rowSpan="2" className="bg-light">
                              Total
                            </th>
                            <th colSpan="6" className="bg-light">
                              Persentase (%)
                            </th>
                          </tr>
                          <tr style={{ fontSize: "10px" }}>
                            <th>Limfosit</th>
                            <th>{jenisDL === "unggas" ? "Neutrofil" : "Heterofil"}</th>
                            <th>Eosinofil</th>
                            <th>Monosit</th>
                            <th>Basofil</th>

                            <th>Limfosit%</th>
                            <th>{jenisDL === "unggas" ? "Neutrofil%" : "Heterofil%"}</th>
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
                                <td>
                                  <Tag>{code}</Tag>
                                </td>

                                <td>
                                  <Input size="small" className="text-center px-1" value={v.Limfosit} onChange={(e) => handleInputChange(`${base}-Limfosit`, e.target.value)} />
                                </td>

                                {/* NEUTROFIL / HETEROFIL */}
                                <td>
                                  <Input size="small" className="text-center px-1" value={v.Heterofil} onChange={(e) => handleInputChange(`${base}-Heterofil`, e.target.value)} />
                                </td>

                                <td>
                                  <Input size="small" className="text-center px-1" value={v.Eosinofil} onChange={(e) => handleInputChange(`${base}-Eosinofil`, e.target.value)} />
                                </td>

                                <td>
                                  <Input size="small" className="text-center px-1" value={v.Monosit} onChange={(e) => handleInputChange(`${base}-Monosit`, e.target.value)} />
                                </td>

                                <td>
                                  <Input size="small" className="text-center px-1" value={v.Basofil} onChange={(e) => handleInputChange(`${base}-Basofil`, e.target.value)} />
                                </td>

                                <td className="bg-light">{h.Total}</td>
                                <td className="bg-light text-primary">{h.LimfositPersen}</td>
                                <td className="bg-light text-primary">{h.HeterofilPersen}</td>
                                <td className="bg-light text-primary">{h.EosinofilPersen}</td>
                                <td className="bg-light text-primary">{h.MonositPersen}</td>
                                <td className="bg-light text-primary">{h.BasofilPersen}</td>
                                <td className="text-center fw-bold text-success">{h.TotalPersen}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* Case 4: Hemoglobin / Hematokrit */}
                {(item.nama_item === "Hemoglobin Darah" || item.nama_item === "Hematokrit") && (
                  <div className="table-responsive" style={{ maxWidth: "600px" }}>
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Label</th>
                          <th className="text-center">Input (N)</th>
                          <th className="text-center bg-light">Hasil {item.nama_item.includes("Hemo") ? "(G%)" : "(%)"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateSampleCodes(booking).map((code, i) => {
                          const key = `${item.nama_item === "Hematokrit" ? "Hematokrit" : "Hemoglobin"}-${code}`;
                          return (
                            <tr key={i}>
                              <td>
                                <Tag>{code}</Tag>
                              </td>
                              <td>
                                <Input type="number" className="text-center" value={nilaiAnalisis[key] || ""} onChange={(e) => handleInputChange(key, e.target.value)} />
                              </td>
                              <td className="bg-light">
                                <Input className="text-center fw-bold" value={calculateResult(item.nama_item.includes("Hemo") ? "Hemoglobin" : "Hematokrit", nilaiAnalisis[key])} disabled />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            ))}

          {/* Action Footer */}
          <div className="d-flex justify-content-between align-items-center mt-5 p-4 bg-white shadow-sm" style={{ borderRadius: "12px" }}>
            <Button
              size="large"
              onClick={handleBack}
              style={{
                minWidth: "180px",
                height: "50px",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              Kembali
            </Button>

            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
              style={{
                minWidth: "250px",
                height: "50px",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              Simpan & Selesaikan Analisis
            </Button>
          </div>
        </div>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}

export default FormInputNilaiAnalisis;

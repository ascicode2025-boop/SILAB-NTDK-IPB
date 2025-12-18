import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { Spin, message } from "antd";
import dayjs from "dayjs";
import { Modal } from "react-bootstrap";

// Import Service API
import { getAllBookings, updateBookingStatus } from "../../services/BookingService";

const VerifikasiSampel = () => {
  const history = useHistory();
  const [dataBookings, setDataBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const approvedData = dataBookings.filter((item) => item.status === "Disetujui");

  // --- 1. AMBIL DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllBookings();
      setDataBookings(response.data);
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil data pesanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. HELPER GENERATE KODE SAMPEL TURUNAN (LOGIKA BARU) ---
  const generateSampleCodes = (booking) => {
    if (!booking) return [];
    const count = booking.jumlah_sampel;
    const mainCode = booking.kode_sampel;

    // Jika cuma 1, tampilkan kode utama saja
    if (count <= 1) return [mainCode];

    // Jika banyak, buat array: Kode-1, Kode-2, dst
    let codes = [];
    for (let i = 1; i <= count; i++) {
      codes.push(`${mainCode}-${i}`);
    }
    return codes;
  };

  // --- 3. FILTER PENCARIAN ---
  const filteredData = dataBookings.filter((item) => {
    const query = search.toLowerCase();
    const userName = item.user ? item.user.name.toLowerCase() : "";
    const kode = item.kode_sampel.toLowerCase();
    const status = item.status.toLowerCase();
    const analisis = item.jenis_analisis.toLowerCase();

    return kode.includes(query) || userName.includes(query) || status.includes(query) || analisis.includes(query);
  });

  // --- 4. AKSI TOMBOL ---
  const handleDetail = (row) => {
    setDetailData(row);
    setShowDetailModal(true);
  };

  const handleSetuju = (row) => {
    setSelectedSample(row);
    setShowPopup(true);
  };

  const confirmSetuju = async () => {
    if (!selectedSample) return;
    setIsProcessing(true);
    try {
      await updateBookingStatus(selectedSample.id, "Disetujui");
      message.success(`Sampel ${selectedSample.kode_sampel} berhasil disetujui!`);
      setShowPopup(false);
      fetchData();
    } catch (error) {
      message.error("Gagal update status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTolak = (row) => {
    // Ambil No HP dari tabel users (sesuai database Anda: nomor_telpon)
    const noHp = row.user ? row.user.nomor_telpon : "";

    history.push({
      pathname: "/teknisi/dashboard/verifikasiSampel/alasanMenolak",
      state: {
        bookingId: row.id,
        kodeSampel: row.kode_sampel,
        namaKlien: row.user ? row.user.name : "-",
        nomorTelpon: noHp,
      },
    });
  };

  const handleSampelSampai = async (row) => {
    try {
      await updateBookingStatus(row.id, "Sampel Diterima");
      await fetchData(); // refresh data

      message.success("Status diubah menjadi Sampel Diterima");

      history.push(`/teknisi/dashboard/inputNilaiAnalisis`);
    } catch (err) {
      console.error("ERROR UPDATE STATUS:", err.response?.data || err);
      message.error("Gagal mengubah status sampel");
    }
  };

  return (
    <NavbarLoginTeknisi>
      <div className="font-poppins container py-5">
        {/* Search Bar */}
        <div className="mb-4 d-flex justify-content-center">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <input type="text" className="form-control rounded-start-pill" placeholder="Cari Kode / Nama..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="input-group-text rounded-end-pill bg-white">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="table-responsive bg-white rounded-4 shadow p-3">
          <Spin spinning={loading} tip="Memuat data...">
            <table className="table table-bordered align-middle text-center table-hover">
              <thead className="table-light">
                <tr>
                  <th>No</th>
                  <th>Kode Sampel</th>
                  <th>Nama Klien</th>
                  <th style={{ width: "80px" }}>Jml</th>
                  <th>Jenis Analisis</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td className="fw-bold">{row.kode_sampel}</td>
                      <td>{row.user ? row.user.name : "Guest"}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{row.jumlah_sampel}</span>
                      </td>
                      <td>{row.jenis_analisis}</td>
                      <td>{dayjs(row.tanggal_kirim).format("DD MMM")}</td>
                      <td>
                        <span className={`badge ${row.status === "Menunggu Persetujuan" ? "bg-warning text-dark" : row.status === "Disetujui" ? "bg-success" : row.status === "Ditolak" ? "bg-danger" : "bg-secondary"}`}>{row.status}</span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-info btn-sm text-white" onClick={() => handleDetail(row)} title="Detail">
                            <i className="bi bi-eye"></i>
                          </button>
                          {row.status === "Menunggu Persetujuan" && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleSetuju(row)}>
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleTolak(row)}>
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Spin>
        </div>

        {/* ================= TABEL SAMPEL DISETUJUI ================= */}
        <div className="mt-5">
          <h5 className="fw-bold text-success mb-3">
            <i className="bi bi-check-circle-fill me-2"></i>
            Sampel yang Telah Disetujui
          </h5>

          <div className="table-responsive bg-white rounded-4 shadow p-3">
            <table className="table table-bordered align-middle text-center table-hover">
              <thead className="table-success">
                <tr>
                  <th>No</th>
                  <th>Kode Sampel</th>
                  <th>Nama Klien</th>
                  <th>Jumlah</th>
                  <th>Jenis Analisis</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {approvedData.length > 0 ? (
                  approvedData.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td className="fw-bold">{row.kode_sampel}</td>
                      <td>{row.user ? row.user.name : "-"}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{row.jumlah_sampel}</span>
                      </td>
                      <td>{row.jenis_analisis}</td>
                      <td>{dayjs(row.tanggal_kirim).format("DD MMM YYYY")}</td>
                      <td>
                        <span className="badge bg-success">Disetujui</span>
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm px-3" onClick={() => handleSampelSampai(row)}>
                          <i className="bi bi-box-arrow-in-down me-1"></i>
                          Sampel diterima
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-muted py-4">
                      Belum ada sampel yang disetujui.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL DETAIL (POPUP INFO LENGKAP) --- */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered style={{ marginTop: "3.1rem", marginLeft: "2rem" }}>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold text-dark">
            <i className="bi bi-file-earmark-text me-2"></i> Detail Pesanan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {detailData && (
            <div className="row g-4">
              {/* Kiri: Info Klien */}
              <div className="col-md-6 border-end">
                <h6 className="fw-bold text-primary mb-3">Informasi Klien</h6>
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td className="text-muted" width="120">
                        Nama Klien
                      </td>
                      <td>: {detailData.user?.name}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Kode Batch</td>
                      <td className="fw-bold text-dark">: {detailData.kode_sampel}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Tgl Kirim</td>
                      <td>: {dayjs(detailData.tanggal_kirim).format("DD MMMM YYYY")}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Status</td>
                      <td>
                        : <span className={`badge ms-1 ${detailData.status === "Ditolak" ? "bg-danger" : "bg-warning text-dark"}`}>{detailData.status}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Kanan: Detail Sampel */}
              <div className="col-md-6">
                <h6 className="fw-bold text-primary mb-3">Detail Sampel</h6>
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td className="text-muted" width="120">
                        Jenis Hewan
                      </td>
                      <td>
                        : {detailData.jenis_hewan} {detailData.jenis_hewan_lain ? `(${detailData.jenis_hewan_lain})` : ""}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Kelamin</td>
                      <td>: {detailData.jenis_kelamin}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Umur</td>
                      <td>: {detailData.umur}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Fisiologis</td>
                      <td>: {detailData.status_fisiologis}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Jumlah</td>
                      <td className="fw-bold fs-5 text-success">
                        : {detailData.jumlah_sampel} <small className="fs-6 text-muted fw-normal">Sampel</small>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="col-12">
                <hr className="my-0" />
              </div>

              {/* --- BAGIAN BARU: DAFTAR KODE SAMPEL --- */}
              <div className="col-12">
                <h6 className="fw-bold text-primary mb-2">Daftar Label Sampel</h6>
                <div className="bg-light p-3 rounded border" style={{ maxHeight: "150px", overflowY: "auto" }}>
                  <div className="d-flex flex-wrap gap-2">
                    {generateSampleCodes(detailData).map((code, idx) => (
                      <span key={idx} className="badge bg-white text-dark border py-2 px-3">
                        <i className="bi bi-tag-fill me-2 text-secondary"></i>
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bawah: Parameter Uji */}
              <div className="col-12 mt-2">
                <h6 className="fw-bold text-primary">Parameter Uji ({detailData.jenis_analisis})</h6>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {detailData.analysis_items && detailData.analysis_items.length > 0 ? (
                    detailData.analysis_items.map((item, idx) => (
                      <span key={idx} className="badge bg-secondary px-3 py-2 rounded-pill">
                        {item.nama_item}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted fst-italic">Full Package</span>
                  )}
                </div>
              </div>

              {/* Alasan Penolakan */}
              {detailData.alasan_penolakan && (
                <div className="col-12">
                  <div className="alert alert-danger mt-2">
                    <strong>Alasan Ditolak:</strong> {detailData.alasan_penolakan}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary px-4" onClick={() => setShowDetailModal(false)}>
            Tutup
          </button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL KONFIRMASI SETUJU --- */}
      {showPopup && selectedSample && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h4 className="popup-title">Konfirmasi Persetujuan</h4>
            <p className="popup-text">
              Setujui sampel <b>{selectedSample.kode_sampel}</b>? <br />
              Jumlah: <b>{selectedSample.jumlah_sampel} Sampel</b>
            </p>
            <div className="popup-buttons">
              <button className="popup-btn-yes" onClick={confirmSetuju} disabled={isProcessing}>
                {isProcessing ? "Memproses..." : "Ya, Setujui"}
              </button>
              <button className="popup-btn-no" onClick={() => setShowPopup(false)} disabled={isProcessing}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.45); display: flex; justify-content: center; align-items: center; z-index: 9999; }
        .popup-box { width: 420px; background: #ffffff; padding: 25px; border-radius: 20px; box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2); animation: popupShow 0.25s ease-out; text-align: center; }
        .popup-title { font-size: 20px; font-weight: 600; color: #4b3a34; margin-bottom: 12px; }
        .popup-text { font-size: 15px; color: #4b3a34; margin-bottom: 20px; line-height: 1.5; }
        .popup-buttons { display: flex; justify-content: center; gap: 12px; }
        .popup-btn-yes { padding: 8px 18px; background: #6c9a3b; color: white; border: none; border-radius: 12px; font-size: 14px; transition: 0.2s; }
        .popup-btn-yes:hover { background: #5a832f; }
        .popup-btn-no { padding: 8px 18px; background: #c75050; color: white; border: none; border-radius: 12px; font-size: 14px; transition: 0.2s; }
        .popup-btn-no:hover { background: #aa3f3f; }

        html, body { height: 100%;} 
        #root { min-height: 100%; display: flex; flex-direction: column;}
        .page-wrapper { flex: 1; display: flex; flex-direction: column;}
        @keyframes popupShow { from { opacity: 0; transform: scale(0.93); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
};

export default VerifikasiSampel;

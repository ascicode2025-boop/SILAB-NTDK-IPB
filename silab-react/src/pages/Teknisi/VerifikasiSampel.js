import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { message } from "antd";
import dayjs from "dayjs";
import { Modal } from "react-bootstrap";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

// Import Service API
import { getAllBookings, updateBookingStatus, deleteBooking } from "../../services/BookingService";

const VerifikasiSampel = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Verifikasi Sampel";
  }, []);

  const history = useHistory();
  const [dataBookings, setDataBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showPopup, setShowPopup] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // Memoize approved data
  const approvedData = useMemo(
    () =>
      dataBookings.filter((item) => {
        const status = (item.status || "").toLowerCase();
        return status === "disetujui";
      }),
    [dataBookings],
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllBookings();
      // Limit data untuk performa - bisa disesuaikan di backend
      setDataBookings(response.data || []);
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil data pesanan.");
    } finally {
      setLoading(false);
    }
  };

  const generateSampleCodes = useCallback((booking) => {
    if (!booking) return [];
    try {
      let codes = [];
      if (typeof booking.kode_sampel === "string") {
        try {
          codes = JSON.parse(booking.kode_sampel);
          if (Array.isArray(codes)) return codes;
        } catch (e) {
          codes = [booking.kode_sampel];
        }
      } else if (Array.isArray(booking.kode_sampel)) {
        codes = booking.kode_sampel;
      }
      return codes;
    } catch (error) {
      return [];
    }
  }, []);

  const formatStatus = useCallback((status) => {
    const st = (status || "").toLowerCase();
    if (st === "menunggu") return "Menunggu Persetujuan";
    if (st === "menunggu persetujuan") return "Menunggu Persetujuan";
    if (st === "menunggu_pembayaran" || st === "menunggu pembayaran" || st === "menunggu-pembayaran") return "Menunggu Pembayaran";
    if (st === "menunggu_verifikasi_kepala") return "Menunggu Verifikasi";
    if (st === "disetujui") return "Disetujui";
    if (st === "proses") return "Proses";
    if (st === "selesai") return "Selesai";
    if (st === "ditolak") return "Ditolak";
    return status || "-";
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Memoize filtered data untuk performa
  const filteredData = useMemo(() => {
    return dataBookings.filter((item) => {
      const query = search.toLowerCase();
      const userName = item.user ? (item.user.full_name || item.user.name).toLowerCase() : "";
      const kode = (item.kode_sampel || "").toLowerCase();
      const status = (item.status || "").toLowerCase();
      const analisis = (item.jenis_analisis || "").toLowerCase();

      if (statusFilter !== "semua" && status !== statusFilter) return false;
      return kode.includes(query) || userName.includes(query) || status.includes(query) || analisis.includes(query);
    });
  }, [dataBookings, search, statusFilter]);

  // Pagination untuk tabel utama
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

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
      await updateBookingStatus(selectedSample.id, { status: "disetujui" });
      message.success(`Sampel ${generateSampleCodes(selectedSample)[0]} berhasil disetujui!`);
      setShowPopup(false);
      fetchData();
    } catch (error) {
      message.error("Gagal update status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTolak = (row) => {
    const noHp = row.user ? row.user.nomor_telpon : "";
    history.push({
      pathname: "/teknisi/dashboard/verifikasiSampel/alasanMenolak",
      state: {
        bookingId: row.id,
        kodeSampel: row.kode_sampel,
        kodeBatch: row.kode_batch,
        sampleCodes: generateSampleCodes(row),
        namaKlien: row.user ? row.user.full_name || row.user.name : "-",
        nomorTelpon: noHp,
      },
    });
  };

  const handleSampelSampai = async (row) => {
    try {
      await updateBookingStatus(row.id, { status: "proses" });
      // Ambil data booking terbaru setelah update status
      const allBookings = (await getAllBookings()).data;
      const updatedBooking = allBookings.find((b) => b.id === row.id);
      await fetchData();
      message.success("Sampel diterima! Status: Sedang Dianalisis");
      history.push({
        pathname: "/teknisi/dashboard/inputNilaiAnalisis",
        state: { booking: updatedBooking || row },
      });
    } catch (err) {
      message.error("Gagal mengubah status sampel");
    }
  };

  // Hapus booking (hanya status dibatalkan)
  const handleDelete = async (row) => {
    if (!window.confirm(`Hapus booking batch ${row.kode_batch || ""}? Data tidak bisa dikembalikan!`)) return;
    try {
      setIsProcessing(true);
      await deleteBooking(row.id);
      message.success("Booking berhasil dihapus!");
      fetchData();
    } catch (err) {
      message.error(err?.message || "Gagal menghapus booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <NavbarLoginTeknisi>
      <div className="font-poppins container py-5">
        {/* Search Bar dan Filter */}
        <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h4 className="fw-bold mb-0 text-dark">Daftar Verifikasi Sampel</h4>
          <div className="d-flex gap-2">
            <div className="input-group shadow-sm" style={{ maxWidth: "300px" }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input type="text" className="form-control border-start-0 ps-0" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <select className="form-select shadow-sm" style={{ maxWidth: "180px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu Persetujuan</option>
              <option value="disetujui">Disetujui</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>

        {/* Tabel Data Utama */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: "1100px" }}>
              <thead className="bg-dark text-white">
                <tr>
                  <th className="ps-4 py-3 text-uppercase small fw-bold" style={{ width: "60px" }}>
                    No
                  </th>
                  <th className="py-3 text-uppercase small fw-bold">Kode Batch</th>
                  <th className="py-3 text-uppercase small fw-bold">Klien</th>
                  <th className="py-3 text-uppercase small fw-bold text-center">Jml</th>
                  <th className="py-3 text-uppercase small fw-bold">Jenis Analisis</th>
                  <th className="py-3 text-uppercase small fw-bold text-center">Tanggal</th>
                  <th className="py-3 text-uppercase small fw-bold text-center">Status</th>
                  <th className="py-3 text-uppercase small fw-bold text-center pe-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={row.id}>
                      <td className="ps-4 text-muted">{index + 1}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: "1rem", letterSpacing: "1px" }}>
                          {row.kode_batch || "-"}
                        </span>
                        {generateSampleCodes(row).length > 1 && (
                          <div className="text-muted" style={{ fontSize: "11px" }}>
                            +{generateSampleCodes(row).length - 1} sampel lainnya
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="text-dark fw-medium">{row.user ? row.user.full_name || row.user.name : "Guest"}</div>
                      </td>
                      <td className="text-center">
                        <span className="badge rounded-pill bg-light text-dark border px-3">{row.jumlah_sampel}</span>
                      </td>
                      <td>
                        <span className="text-muted small">{row.jenis_analisis}</span>
                      </td>
                      <td className="text-center text-secondary small">{dayjs(row.tanggal_kirim).format("DD/MM/YY")}</td>
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill px-3 py-2 fw-normal ${
                            (row.status || "").toLowerCase() === "menunggu"
                              ? "bg-warning text-dark"
                              : (row.status || "").toLowerCase() === "disetujui"
                                ? "bg-primary text-white"
                                : (row.status || "").toLowerCase() === "proses"
                                  ? "bg-info text-white"
                                  : (row.status || "").toLowerCase() === "selesai"
                                    ? "bg-success text-white"
                                    : "bg-secondary text-white"
                          }`}
                        >
                          {formatStatus(row.status)}
                        </span>
                      </td>
                      <td className="text-center pe-4">
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-outline-secondary btn-sm rounded-3 shadow-sm" onClick={() => handleDetail(row)}>
                            <i className="bi bi-eye"></i>
                          </button>
                          {(row.status || "").toLowerCase() === "menunggu" && (
                            <>
                              <button className="btn btn-success btn-sm rounded-3 shadow-sm" onClick={() => handleSetuju(row)}>
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button className="btn btn-danger btn-sm rounded-3 shadow-sm" onClick={() => handleTolak(row)}>
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </>
                          )}
                          {/* Tombol hapus hanya untuk status dibatalkan */}
                          {(row.status || "").toLowerCase() === "dibatalkan" && (
                            <button className="btn btn-danger btn-sm rounded-3 shadow-sm" onClick={() => handleDelete(row)} disabled={isProcessing} title="Hapus booking dibatalkan">
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                      Tidak ada data pesanan ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="d-flex justify-content-between align-items-center p-3 border-top">
            <span className="text-muted small">
              Menampilkan {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
            </span>
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                    &larr; Sebelumnya
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                  .map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    </li>
                  ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                    Selanjutnya &rarr;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* ================= TABEL SAMPEL DISETUJUI ================= */}
        <div className="mt-5">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-success rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
              <i className="bi bi-check2 text-white"></i>
            </div>
            <h5 className="fw-bold mb-0 text-dark">Siap Diterima (Approved)</h5>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ minWidth: "900px" }}>
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="ps-4 py-3 text-muted small fw-bold" style={{ width: "60px" }}>
                      No
                    </th>
                    <th className="py-3 text-muted small fw-bold">Kode Batch</th>
                    <th className="py-3 text-muted small fw-bold">Klien</th>
                    <th className="py-3 text-muted small fw-bold text-center">Jumlah</th>
                    <th className="py-3 text-muted small fw-bold">Analisis</th>
                    <th className="py-3 text-muted small fw-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedData.length > 0 ? (
                    approvedData.map((row, index) => (
                      <tr key={row.id}>
                        <td className="ps-4 text-muted">{index + 1}</td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: "1rem", letterSpacing: "1px" }}>
                            {row.kode_batch || "-"}
                          </span>
                        </td>
                        <td>{row.user ? row.user.full_name || row.user.name : "-"}</td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border">{row.jumlah_sampel}</span>
                        </td>
                        <td>
                          <small className="text-muted">{row.jenis_analisis}</small>
                        </td>
                        <td className="text-center pe-4">
                          <button className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm" onClick={() => handleSampelSampai(row)}>
                            <i className="bi bi-box-seam me-2"></i>
                            Konfirmasi Terima
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted small italic">
                        Belum ada sampel yang menunggu penerimaan fisik.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DETAIL --- */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered style={{ margin: "2rem" }}>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Detail Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {detailData && (
            <div className="row g-4">
              <div className="col-md-6">
                <p className="text-muted small text-uppercase fw-bold mb-2">Informasi Klien</p>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between border-bottom pb-1">
                    <span className="text-secondary">Nama</span>
                    <span className="fw-medium">{detailData.user?.full_name || detailData.user?.name}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-1">
                    <span className="text-secondary">Kode Batch</span>
                    <span className="fw-bold badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: "1rem", letterSpacing: "1px" }}>
                      {detailData.kode_batch || "-"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-1">
                    <span className="text-secondary">Tgl Kirim</span>
                    <span>{dayjs(detailData.tanggal_kirim).format("DD MMM YYYY")}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <p className="text-muted small text-uppercase fw-bold mb-2">Spesifikasi Sampel</p>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between border-bottom pb-1">
                    <span className="text-secondary">Jenis Hewan</span>
                    <span>{detailData.jenis_hewan === "Lainnya" ? detailData.jenis_hewan_lain : detailData.jenis_hewan}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-1">
                    <span className="text-secondary">Jumlah</span>
                    <span className="fw-bold text-success">{detailData.jumlah_sampel} Unit</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-1">
                    <span className="text-secondary">Status</span>
                    <span className="badge bg-info">{formatStatus(detailData.status)}</span>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <p className="text-muted small text-uppercase fw-bold mb-2">Daftar Label</p>
                <div className="d-flex flex-wrap gap-2">
                  {generateSampleCodes(detailData).map((code, idx) => (
                    <span key={idx} className="badge bg-light text-dark border fw-normal">
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-12">
                <p className="text-muted small text-uppercase fw-bold mb-2">Parameter Analisis</p>
                <div className="d-flex flex-wrap gap-2">
                  {detailData.analysis_items?.length > 0 ? (
                    detailData.analysis_items.map((item, idx) => (
                      <span key={idx} className="badge border text-secondary rounded-pill px-3">
                        {item.nama_item}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted fst-italic">Full Package ({detailData.jenis_analisis})</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <button className="btn btn-light px-4 rounded-3" onClick={() => setShowDetailModal(false)}>
            Tutup
          </button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL KONFIRMASI SETUJU --- */}
      {showPopup && selectedSample && (
        <div className="popup-overlay">
          <div className="popup-box border-0 shadow-lg">
            <div className="mb-3 text-success">
              <i className="bi bi-question-circle fs-1"></i>
            </div>
            <h4 className="fw-bold">Konfirmasi</h4>
            <p className="text-muted">
              Setujui <b>batch {selectedSample.kode_batch || "-"}</b>? <br />
              Klien: <b>{selectedSample.user?.full_name || selectedSample.user?.name}</b>
            </p>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button className="btn btn-success px-4 rounded-3" onClick={confirmSetuju} disabled={isProcessing}>
                {isProcessing ? "Memproses..." : "Ya, Setujui"}
              </button>
              <button className="btn btn-light px-4 rounded-3" onClick={() => setShowPopup(false)} disabled={isProcessing}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .table thead th { vertical-align: middle; border: none; }
        .table tbody td { border-bottom: 1px solid #f2f2f2; }
        .table-hover tbody tr:hover { background-color: #fbfbfb; transition: 0.2s; }
        .card { border: none; }
        .badge { font-weight: 500; letter-spacing: 0.3px; }
        
        .popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(2px); }
        .popup-box { width: 380px; background: white; padding: 30px; border-radius: 24px; text-align: center; }
        
        @keyframes popupShow { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .popup-box { animation: popupShow 0.3s ease-out; }
      `}</style>

      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
};

export default VerifikasiSampel;

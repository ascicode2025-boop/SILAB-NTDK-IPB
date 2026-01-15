import React, { useEffect, useState } from "react";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { motion } from "framer-motion";
import { Copy, Clock, CheckCircle, Wallet, Upload, RefreshCcw } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

const PembayaranKlien = () => {
  const [detailBooking, setDetailBooking] = useState(null);
  const [data, setData] = useState({
    vaNumber: "02835230893",
    expiryDate: "27 Oktober 2025, 13:00 WIB",
    method: "Bank Mandiri",
    total: "0",
  });
  const [invoiceIdRaw, setInvoiceIdRaw] = useState(null);
  const [invoiceProofPath, setInvoiceProofPath] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingBookings, setPendingBookings] = useState([]);

  // --- FUNGSI FETCH UTAMA (PERBAIKAN GLITCH TOTAL) ---
  // Parameter isBackground = true mencegah loading screen muncul saat auto-refresh
  const fetchInvoiceForBooking = async (useBookingId, isBackground = false) => {
    if (!useBookingId) return;

    if (!isBackground) setLoading(true);

    try {
      const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Coba ambil invoice
      const res = await fetch(`${apiBase}/invoices?booking_id=${useBookingId}`, { headers });
      const json = await res.json();

      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        const inv = json.data[0];
        setInvoiceIdRaw(inv.id);
        setInvoiceProofPath(inv.payment_proof_path || null);

        // Cek status lunas
        const paid = (inv.status && inv.status.toUpperCase() === "PAID") || !!inv.paid_at;
        setPaymentSuccess(paid);

        setData({
          vaNumber: "02835230893",
          expiryDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString("id-ID") : "7 hari dari sekarang",
          method: "Bank Mandiri",
          total: (inv.amount || 0).toLocaleString("id-ID"),
        });

        if (inv.booking) {
          const merged = { ...inv.booking, pdf_path: inv.booking.pdf_path || inv.pdf_path || inv.booking.pdfPath };
          setDetailBooking(merged);
          // Double check status booking jika invoice belum paid tapi booking statusnya selesai
          if (merged.is_paid || (merged.status && ["selesai", "ditandatangani", "lunas", "paid"].includes((merged.status || "").toLowerCase()))) {
            setPaymentSuccess(true);
          }
        }
      } else {
        // 2. Fallback: Ambil data dari Booking jika invoice belum ada
        const userRes = await fetch(`${apiBase}/bookings`, { headers });
        const userJson = await userRes.json();

        if (userJson && userJson.success) {
          const bookings = userJson.data || [];
          const b = bookings.find((x) => String(x.id) === String(useBookingId));

          if (b) {
            // Hitung harga
            try {
              const pricesRes = await fetch(`${apiBase}/analysis-prices`, { headers });
              const pricesJson = await pricesRes.json();
              const priceMap = {};
              if (Array.isArray(pricesJson)) {
                pricesJson.forEach((p) => {
                  priceMap[(p.jenis_analisis || p.jenisAnalisis || "").toString().toLowerCase()] = Number(p.harga || 0);
                });
              }
              const items = b.analysis_items || b.analysisItems || [];
              let sumPrices = 0;
              if (Array.isArray(items) && items.length > 0) {
                items.forEach((it) => {
                  const name = (it.nama_item || it.namaItem || it || "").toString().toLowerCase();
                  const p = priceMap[name];
                  sumPrices += typeof p === "number" && !isNaN(p) ? p : 50000;
                });
              } else {
                sumPrices = 50000;
              }
              const total = (Number(b.jumlah_sampel) || 0) * sumPrices;

              setData({
                vaNumber: "02835230893",
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
                method: "Bank Mandiri",
                total: total.toLocaleString("id-ID"),
              });
            } catch (err) {
              const total = (Number(b.jumlah_sampel) || 0) * 50000;
              setData({
                vaNumber: "02835230893",
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
                method: "Bank Mandiri",
                total: total.toLocaleString("id-ID"),
              });
            }
            setInvoiceIdRaw(null);
            setInvoiceProofPath(b.payment_proof_path || null);
            setPaymentSuccess(!!b.is_paid || (b.status && ["selesai", "ditandatangani", "lunas", "paid"].includes((b.status || "").toLowerCase())));
            setDetailBooking(b);
          }
        }
      }
    } catch (e) {
      console.error("Gagal memuat invoice", e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // --- EFFECT: Load Awal & Polling List Pending ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");
    if (bookingId) fetchInvoiceForBooking(bookingId);

    const fetchPending = async () => {
      try {
        // Jika sedang detail, jangan refresh list pending (hemat resource)
        if (params.get("bookingId")) return;

        const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const userRes = await fetch(`${apiBase}/bookings`, { headers });
        const userJson = await userRes.json();

        if (userJson && userJson.success) {
          // Tampilkan booking dengan status pembayaran relevan
          const pending = (userJson.data || []).filter((b) => {
            const st = (b.status || "").toLowerCase();
            return st.includes("pembayaran") || st === "menunggu_konfirmasi_pembayaran" || st === "lunas" || st === "paid" || st === "verified" || st === "selesai" || st === "ditandatangani";
          });
          setPendingBookings(pending);
        }
      } catch (e) {
        console.error("Gagal memuat daftar booking", e);
      }
    };
    fetchPending();

    // Polling list pending setiap 10 detik (jika tidak sedang di mode detail)
    const listInterval = setInterval(() => {
      if (!new URLSearchParams(window.location.search).get("bookingId")) {
        fetchPending();
      }
    }, 10000);

    return () => clearInterval(listInterval);
  }, []);

  // --- EFFECT: Polling Detail (SINKRONISASI STATUS) ---
  useEffect(() => {
    const id = detailBooking ? detailBooking.id : invoiceIdRaw;
    if (!id) return;

    // Refresh detail setiap 5 detik dengan mode background (isBackground=true)
    // Ini memperbaiki masalah GLITCH loading
    const iv = setInterval(() => fetchInvoiceForBooking(id, true), 5000);

    // Fetch pertama kali tetap normal
    // fetchInvoiceForBooking(id, false); // Sudah dipanggil di handleViewProgress

    return () => clearInterval(iv);
  }, [detailBooking?.id, invoiceIdRaw]);

  // Update jika status berubah jadi success secara tiba-tiba
  useEffect(() => {
    if (!paymentSuccess) return;
    if (detailBooking || invoiceIdRaw) return;
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");
    if (bookingId) fetchInvoiceForBooking(bookingId);
  }, [paymentSuccess, detailBooking, invoiceIdRaw]);

  const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
  const apiHost = apiBase.replace(/\/api$/, "");

  const theme = {
    primary: "#483D3F",
    secondary: "#8D766B",
    background: "#F7F5F4",
  };

  // Payment is considered successful only if paid and verified by coordinator
  const isPaid = detailBooking && (detailBooking.status === "paid" || detailBooking.status === "lunas" || detailBooking.status === "verified" || detailBooking.status === "selesai" || detailBooking.status === "ditandatangani");
  const isVerified = detailBooking && (detailBooking.verified === true || detailBooking.status === "lunas" || detailBooking.status === "verified" || detailBooking.status === "selesai" || detailBooking.status === "ditandatangani");
  const alreadyUploaded = detailBooking && (detailBooking.payment_proof_path || invoiceProofPath);
  const canUpload = !uploading && !alreadyUploaded;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.vaNumber);
    alert("Nomor VA berhasil disalin!");
  };

  // --- UPLOAD BUKTI PEMBAYARAN ---
  const handleUploadProof = async () => {e
    if (!selectedFile) {
      alert("Silakan pilih file terlebih dahulu");
      return;
    }

    if (!detailBooking || !detailBooking.id) {
      alert("Booking tidak ditemukan");
      return;
    }

    if (!invoiceIdRaw) {
      alert("Invoice belum dibuat, silakan tunggu atau hubungi admin");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Format file harus JPG, PNG, atau PDF");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      // 5MB
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("payment_proof", selectedFile);
      formData.append("booking_id", detailBooking.id);

      const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${apiBase}/invoices/${invoiceIdRaw}/upload-proof`, {
        method: "POST",
        headers,
        body: formData,
      });

      const json = await response.json();

      if (response.ok && json.success) {
        alert("Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin...");
        setSelectedFile(null);
        setInvoiceProofPath(json.data?.payment_proof_path || null);
        // Refresh data
        fetchInvoiceForBooking(detailBooking.id, false);
      } else {
        alert(json.message || "Gagal upload bukti pembayaran");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Terjadi kesalahan saat upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- PERBAIKAN TAMPILAN TOTAL (MENCEGAH GLITCH) ---
  const getDisplayedTotal = () => {
    // Prioritas 1: Jika data sudah ada, tampilkan langsung (ABAINKAN LOADING BACKGROUND)
    if (data && data.total && String(data.total).trim() !== "" && String(data.total).trim() !== "0") return data.total;

    // Prioritas 2: Hitung dari detailBooking jika ada
    const b = detailBooking;
    const candidates = [b && b.amount, b && b.total_amount, b && b.invoice_amount, b && b.harga, b && b.jumlah_sampel && b.jumlah_sampel * 50000];
    for (const c of candidates) {
      if (typeof c === "number" && !isNaN(c) && c > 0) return Number(c).toLocaleString("id-ID");
      if (typeof c === "string" && c.trim() !== "") {
        const n = Number(c);
        if (!isNaN(n) && n > 0) return n.toLocaleString("id-ID");
      }
    }

    // Prioritas 3: Baru cek loading jika data benar-benar kosong
    if (loading) return "...";

    return "0";
  };

  const handleViewProgress = (b) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("bookingId", b.id);
      window.history.replaceState({}, "", url.toString());
    } catch (e) {
      window.location.search = `?bookingId=${b.id}`;
    }
    setDetailBooking(b);
    fetchInvoiceForBooking(b.id, false);

    setTimeout(() => {
      const el = document.getElementById("payment-info");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  // --- PERBAIKAN TOMBOL KEMBALI ---
  const handleBackToList = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("bookingId");
      window.history.replaceState({}, "", url.toString());
    } catch (e) {
      window.location.search = "";
    }
    // Reset SEMUA state detail agar tampilan bersih kembali ke list
    setDetailBooking(null);
    setInvoiceIdRaw(null);
    setInvoiceProofPath(null);
    setPaymentSuccess(false);
    setSelectedFile(null);

    // Scroll ke atas
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
  };

  const renderEmptyPaymentState = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-5 px-4"
      style={{
        borderRadius: "20px",
        border: "1px dashed #e5e5e5",
        background: "#ffffff",
      }}
    >
      <div className="mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center shadow-sm"
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "#F7F5F4",
            color: theme.primary,
          }}
        >
          <Wallet size={42} />
        </div>
      </div>

      <h4 className="fw-bold mb-2" style={{ color: theme.primary }}>
        Belum Ada Tagihan
      </h4>

      <p className="text-muted mb-4" style={{ maxWidth: 420, margin: "0 auto" }}>
        Anda belum memiliki pesanan analisis yang perlu dibayar. Silakan buat pesanan sampel terlebih dahulu untuk memulai proses laboratorium.
      </p>

      <button
        className="btn fw-semibold px-5 py-3 shadow-sm"
        style={{
          backgroundColor: theme.primary,
          color: "#fff",
          borderRadius: "999px",
        }}
        onClick={() => (window.location.href = "/dashboard/pemesananSampelKlien")}
      >
        Buat Pesanan Sampel
      </button>

      <div className="mt-4">
        <small className="text-muted">
          Butuh bantuan? <span style={{ color: theme.secondary, cursor: "pointer" }}>Hubungi admin laboratorium</span>
        </small>
      </div>
    </motion.div>
  );

  return (
    <NavbarLogin>
      <div className="container-fluid min-vh-100 py-5" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="d-flex justify-content-center align-items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card border-0 shadow-sm p-4 p-md-5" style={{ width: "100%", maxWidth: "550px", borderRadius: "24px" }}>
            {/* Judul Halaman */}
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-1" style={{ fontSize: "24px" }}>
                Pembayaran
              </h2>
              <p className="text-muted small">Selesaikan transaksi Anda agar pesanan diproses</p>
            </div>

            {/* View List atau Detail (Logika detailBooking Anda) */}
            {!detailBooking && !new URLSearchParams(window.location.search).get("bookingId") ? (
              // ... [Render List Pending Anda] ...
              <div>List Booking...</div>
            ) : (
              <div id="payment-info">
                {/* Stepper Progres */}
                <div className="d-flex justify-content-center align-items-center mb-5 position-relative">
                  <div className="text-center z-1">
                    <div className="step-circle mx-auto d-flex align-items-center justify-content-center shadow-sm" style={{ backgroundColor: paymentSuccess ? "#E0E0E0" : "#8D766B", color: paymentSuccess ? "#A0A0A0" : "#fff" }}>
                      <Clock size={24} />
                    </div>
                    <div className="small mt-2 fw-semibold" style={{ color: paymentSuccess ? "#A0A0A0" : "#000" }}>
                      Menunggu
                    </div>
                  </div>

                  <div className="progress-line-connector mx-2">
                    <div className="progress-line-fill" style={{ width: paymentSuccess ? "100%" : "50%" }}></div>
                  </div>

                  <div className="text-center z-1">
                    <div className="step-circle mx-auto d-flex align-items-center justify-content-center shadow-sm" style={{ backgroundColor: paymentSuccess ? "#8D766B" : "#E0E0E0", color: paymentSuccess ? "#fff" : "#A0A0A0" }}>
                      <CheckCircle size={24} />
                    </div>
                    <div className="small mt-2 fw-semibold" style={{ color: paymentSuccess ? "#000" : "#A0A0A0" }}>
                      Berhasil
                    </div>
                  </div>
                </div>

                {/* Box Nomor Virtual Account */}
                <div className="p-4 mb-4" style={{ backgroundColor: "#fff", border: "1px solid #E0E0E0", borderRadius: "16px" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold text-muted">Nomor Virtual Account</span>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg" alt="Mandiri" height="20" />
                  </div>

                  <div className="d-flex align-items-center justify-content-between p-3" style={{ border: "1px solid #E0E0E0", borderRadius: "12px" }}>
                    <span className="fs-3 fw-bold tracking-widest" style={{ letterSpacing: "4px" }}>
                      {data.vaNumber}
                    </span>
                    <button onClick={copyToClipboard} className="btn btn-link text-muted p-0">
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                {/* Deadline Box */}
                {!paymentSuccess && (
                  <div className="p-2 mb-4 text-center rounded-pill" style={{ backgroundColor: "#FFE5E5", color: "#D32F2F", fontSize: "14px", fontWeight: "600" }}>
                    <Clock size={16} className="me-2" />
                    Bayar sebelum: {data.expiryDate}
                  </div>
                )}

                {/* Info Detail Tagihan */}
                <div className="px-2 mb-4">
                  <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <span className="text-muted">Metode Pembayaran</span>
                    <span className="fw-bold">Bank Mandiri</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Total yang harus dibayar</span>
                    <div className="d-flex align-items-baseline">
                      <span className="fw-bold me-1">Rp</span>
                      <span className="fs-3 fw-bolder">{getDisplayedTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="d-grid gap-2">
                  <button
                    className="btn py-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: "#483D3F", borderRadius: "12px" }}
                    onClick={() => document.getElementById("file-upload").click()}
                    disabled={uploading || alreadyUploaded}
                  >
                    <Upload size={20} />
                    {alreadyUploaded ? "Bukti Sudah Diunggah" : "Unggah Bukti Pembayaran"}
                  </button>
                  <input type="file" id="file-upload" hidden onChange={(e) => setSelectedFile(e.target.files[0])} />

                  <button
                    className="btn py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: "#F1F3F5", color: "#495057", borderRadius: "12px", border: "1px solid #DEE2E6" }}
                    onClick={() => fetchInvoiceForBooking(detailBooking?.id)}
                  >
                    <RefreshCcw size={18} />
                    Cek Status Otomatis
                  </button>

                  <button className="btn btn-link text-muted mt-2 btn-sm" onClick={handleBackToList}>
                    Kembali ke Daftar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        .step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .progress-line-connector {
          flex: 1;
          height: 4px;
          background-color: #E0E0E0;
          max-width: 100px;
          position: relative;
          border-radius: 2px;
        }
        .progress-line-fill {
          height: 100%;
          background-color: #8D766B;
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        .z-1 { z-index: 1; }
        .tracking-widest { letter-spacing: 0.15em; }
      `}</style>

      <FooterSetelahLogin />
    </NavbarLogin>
  );
};
export default PembayaranKlien;

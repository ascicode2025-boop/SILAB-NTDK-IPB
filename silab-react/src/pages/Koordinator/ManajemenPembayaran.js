import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Modal, Stack } from "react-bootstrap";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getInvoices, uploadInvoicePaymentProof, confirmInvoicePayment, getAllBookings, updateBookingStatus, verifikasiKoordinator } from "../../services/BookingService";
import { sendInvoiceEmail } from "../../services/BookingService";
import { getAuthHeader } from "../../services/AuthService";

// axios used for uploading payment proof
import axios from "axios";

const ManajemenPembayaran = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Manajemen Pembayaran";
  }, []);

  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [proofBlobUrl, setProofBlobUrl] = useState(null);
  const [proofMime, setProofMime] = useState(null);

  const [formData, setFormData] = useState({
    namaKlien: "",
    institusi: "",
    tanggal: "",
    dueDate: "",
    total: "",
    status: "DRAFT",
  });

  const customColors = {
    brown: "#a3867a",
    lightGray: "#e9ecef",
    textDark: "#45352F",
  };

  const [summaryTotals, setSummaryTotals] = useState({ totalAll: 0, paid: 0, unpaid: 0 });
  const [pendingBookings, setPendingBookings] = useState([]);
  const [analysisSummary, setAnalysisSummary] = useState([]);

  const handleShowDetail = (item) => {
    // Check if this is a pending booking or an invoice
    const isBooking = item.type === "booking";

    if (isBooking) {
      // For pending bookings, use pre-calculated itemized data or calculate fresh
      const booking = item.booking || {};
      const enrich = async () => {
        try {
          const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
          const priceRes = await fetch(`${apiBase}/analysis-prices`);
          const priceData = await priceRes.json();
          const priceMap = {};
          if (priceData && Array.isArray(priceData)) {
            priceData.forEach((p) => {
              // Support multiple field names for compatibility
              const keys = [p.jenis_analisis, p.nama_analisis, p.nama_item].filter((k) => k);
              keys.forEach((key) => {
                if (key) priceMap[key] = Number(p.harga) || 0;
              });
            });
          }
          console.log("Price map loaded:", priceMap); // DEBUG

          const analysisItems = booking.analysis_items || [];
          const jumlahSampel = Number(item.jumlah_sampel || booking.jumlah_sampel) || 1;

          console.log("Analysis items untuk booking:", analysisItems); // DEBUG

          const itemized =
            analysisItems.length > 0
              ? analysisItems.map((ai) => {
                  const price = priceMap[ai.nama_item] || 50000;
                  return {
                    nama: ai.nama_item || "Item tidak tersedia",
                    hargaSatuan: Number(price) || 0, // Ensure it's a number
                    total: (Number(price) || 0) * jumlahSampel,
                  };
                })
              : [
                  {
                    nama: "Item tidak tersedia",
                    hargaSatuan: 0,
                    total: 0,
                  },
                ];

          console.log("Itemized array untuk booking:", itemized); // DEBUG

          const enriched = {
            ...item,
            itemized,
            jumlah_sampel: jumlahSampel,
            tanggal_kirim: booking.tanggal_kirim ? new Date(booking.tanggal_kirim).toLocaleDateString("id-ID") : item.dueDate || "-",
            jenis_analisis: booking.jenis_analisis || item.deskripsi || "Pending",
            klien: item.namaKlien || "-",
            total: itemized.reduce((s, i) => s + Number(i.total || 0), 0),
          };
          setSelectedInvoice(enriched);
          setShowDetailModal(true);
        } catch (e) {
          console.error("Gagal memuat harga analisis untuk booking", e);
          // Show modal with available data even if price fetch fails
          setSelectedInvoice({
            ...item,
            itemized: [],
            klien: item.namaKlien || "-",
            jenis_analisis: booking.jenis_analisis || item.deskripsi || "Pending",
          });
          setShowDetailModal(true);
        }
      };
      enrich();
      return;
    }

    // For invoices, enrich with itemized prices
    const enrich = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
        const resp = await fetch(`${apiBase}/analysis-prices`);
        const prices = resp.ok ? await resp.json() : [];
        const priceMap = {};
        prices.forEach((p) => {
          if (p.jenis_analisis) priceMap[p.jenis_analisis] = Number(p.harga);
        });

        // Access booking from mapped state object
        const booking = item.booking || {};
        const items = booking.analysis_items || booking.analysisItems || [];
        const jumlahSampel = Number(booking.jumlah_sampel ?? item.jumlah_sampel ?? 0);
        const itemized = (items || []).map((it) => {
          const name = it.nama_item || it.nama_analisis || it.nama || it;
          const unitPrice = Number(priceMap[name]) || 0;
          return {
            name: name || "Item tidak tersedia",
            unitPrice: unitPrice || 0,
            hargaSatuan: unitPrice || 0, // Add hargaSatuan as fallback field name
            total: (unitPrice || 0) * jumlahSampel,
          };
        });

        const enriched = {
          ...item,
          itemized,
          jumlah_sampel: jumlahSampel,
          tanggal_kirim: booking.tanggal_kirim ? new Date(booking.tanggal_kirim).toLocaleDateString("id-ID") : item.tanggal || "-",
          // Set jenis_analisis from booking or build from itemized names
          jenis_analisis: booking.jenis_analisis || item.deskripsi || (itemized && itemized.length > 0 ? itemized.map((i) => i.name || i.nama).join(", ") : "-"),
          // Use itemized total as the authoritative total (override backend amount)
          total: itemized.reduce((s, i) => s + Number(i.total || 0), 0),
        };
        setSelectedInvoice(enriched);
        setShowDetailModal(true);
      } catch (e) {
        console.error("Gagal memuat harga analisis", e);
        setSelectedInvoice(item);
        setShowDetailModal(true);
      }
    };
    enrich();
  };

  useEffect(() => {
    fetchInvoicesFromServer();
  }, []);

  const fetchInvoicesFromServer = async () => {
    setLoadingInvoices(true);
    try {
      const res = await getInvoices();
      if (res && res.data && Array.isArray(res.data)) {
        // Map invoices directly
        // Keep booking object reference in state for detail modal to access analysisItems etc.
        const mapped = res.data.map((inv) => ({
          invoiceId: inv.invoice_number,
          namaKlien: inv.user?.full_name || inv.user?.name || "-",
          institusi: inv.user?.institution || inv.user?.company || "-",
          tanggal: inv.created_at ? new Date(inv.created_at).toLocaleDateString("id-ID") : "-",
          dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString("id-ID") : "-",
          total: inv.amount || 0,
          status: inv.status || "DRAFT",
          deskripsi: inv.booking?.jenis_analisis || "-",
          invoiceIdRaw: inv.id,
          bookingId: inv.booking?.id,
          uploadedProof: !!inv.payment_proof_path,
          paidAt: inv.paid_at ? new Date(inv.paid_at).toLocaleString("id-ID") : null,
          confirmedBy: inv.confirmer?.name || null,
          booking: inv.booking || {}, // Store full booking object for detail modal
          invoice_number: inv.invoice_number,
          jumlah_sampel: inv.booking?.jumlah_sampel || 0, // Extract jumlah_sampel from booking for display
        }));

        // compute totals for summary from invoices
        const totalAllInvoices = mapped.reduce((s, i) => s + (Number(i.total) || 0), 0);
        const paid = mapped.filter((i) => (i.status || "").toString().toUpperCase() === "PAID").reduce((s, i) => s + (Number(i.total) || 0), 0);
        const unpaidInvoices = mapped.filter((i) => (i.status || "").toString().toUpperCase() === "UNPAID").reduce((s, i) => s + (Number(i.total) || 0), 0);
        // set invoices into state first
        setInvoices(mapped);

        // Always fetch pending bookings and include their expected totals into the 'MENUNGGU' bucket
        let pendingTotal = 0;
        let mappedPend = [];
        try {
          const bres = await getAllBookings();
          if (bres && bres.data && Array.isArray(bres.data)) {
            // Get booking IDs that already have invoices to avoid duplicates
            const invoiceBookingIds = mapped.map((inv) => inv.bookingId).filter((id) => id != null);
            // Filter pending bookings: hanya yang status menunggu_pembayaran AND belum punya invoice
            const pend = bres.data.filter((b) => ["menunggu_pembayaran", "menunggu_konfirmasi_pembayaran"].includes((b.status || "").toLowerCase()) && !invoiceBookingIds.includes(b.id));
            // Fetch analysis prices for accurate calculation
            const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
            const priceRes = await fetch(`${apiBase}/analysis-prices`);
            const priceData = await priceRes.json();
            const priceMap = {};
            if (priceData && Array.isArray(priceData)) {
              priceData.forEach((p) => {
                // Support multiple field names for compatibility
                const keys = [p.jenis_analisis, p.nama_analisis, p.nama_item].filter((k) => k);
                keys.forEach((key) => {
                  if (key) priceMap[key] = Number(p.harga) || 0;
                });
              });
            }
            mappedPend = pend.map((b) => {
              const jumlahSampel = Number(b.jumlah_sampel) || 0;
              const analysisItems = b.analysis_items || [];
              // Calculate accurate total from analysis items
              let itemTotal = 0;
              if (analysisItems.length > 0) {
                analysisItems.forEach((item) => {
                  const price = priceMap[item.nama_item] || 50000;
                  itemTotal += price * jumlahSampel;
                });
              } else {
                itemTotal = jumlahSampel * 50000; // fallback
              }
              return {
                bookingId: b.id,
                invoiceId: b.kode_batch ? `INV-${b.kode_batch}` : `INV-DRAFT-${b.id}`,
                namaKlien: b.user?.full_name || b.user?.name || "-",
                institusi: b.user?.institution || b.user?.company || "-",
                dueDate: b.status_updated_at ? new Date(b.status_updated_at).toLocaleDateString("id-ID") : "-",
                tanggal: b.created_at ? new Date(b.created_at).toLocaleDateString("id-ID") : "-",
                total: itemTotal,
                status: b.status || "UNPAID",
                uploadedProof: !!b.payment_proof_path,
                type: "booking",
                booking: b,
                deskripsi: b.jenis_analisis || "-",
                jumlah_sampel: jumlahSampel,
              };
            });
            setPendingBookings(mappedPend);
            pendingTotal = mappedPend.reduce((s, p) => s + (Number(p.total) || 0), 0);
          } else {
            setPendingBookings([]);
          }
        } catch (e) {
          console.error("Gagal memuat pending bookings", e);
          setPendingBookings([]);
        }

        // combine invoice totals and pending bookings into displayed summary
        const totalAll = totalAllInvoices + pendingTotal;
        const unpaid = unpaidInvoices + pendingTotal;
        // Build per-analysis-type summary
        try {
          const combinedList = [
            ...mapped.map((i) => ({
              jenis: i.deskripsi || i.jenis_analisis || "-",
              total: Number(i.total) || 0,
              paid: (i.status || "").toString().toUpperCase() === "PAID",
            })),
            ...(typeof mappedPend !== "undefined"
              ? mappedPend.map((p) => ({
                  jenis: p.deskripsi || p.jenis_analisis || "-",
                  total: Number(p.total) || 0,
                  paid: false,
                }))
              : (pendingBookings || []).map((p) => ({
                  jenis: p.deskripsi || p.jenis_analisis || "-",
                  total: Number(p.total) || 0,
                  paid: false,
                }))),
          ];
          const summaryMap = {};
          combinedList.forEach((it) => {
            const key = (it.jenis || "Lainnya").toString();
            if (!summaryMap[key]) summaryMap[key] = { jenis: key, paidCount: 0, paidTotal: 0, waitingCount: 0, waitingTotal: 0 };
            if (it.paid) {
              summaryMap[key].paidCount += 1;
              summaryMap[key].paidTotal += it.total;
            } else {
              summaryMap[key].waitingCount += 1;
              summaryMap[key].waitingTotal += it.total;
            }
          });
          setAnalysisSummary(Object.values(summaryMap));
        } catch (e) {
          console.warn("Failed to compute analysis summary", e);
          setAnalysisSummary([]);
        }

        setSummaryTotals({ totalAll, paid, unpaid });
      }
    } catch (e) {
      console.error("Gagal memuat invoices dari server", e);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInvoice = {
      invoiceId: `INV-2026-0${invoices.length + 1}`,
      ...formData,
      total: parseInt(formData.total),
    };
    setInvoices([newInvoice, ...invoices]);
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    // Normalize incoming status to uppercase string for mapping
    const key = (status || "").toString().toUpperCase().replace(/\s+/g, "_");
    const statusMap = {
      DRAFT: { color: "#6c757d", label: "Draft" },
      UNPAID: { color: "#dc3545", label: "Belum Bayar" },
      PAID: { color: "#198754", label: "Lunas" },
    };

    const current = statusMap[key];
    // Fallback when status is unknown or mapping missing
    const fallback = { color: "#6c757d", label: (status && status.toString()) || "Unknown" };
    const use = current || fallback;

    return (
      <span
        style={{
          fontSize: "0.8rem",
          color: use.color,
          border: `1px solid ${use.color}`,
          padding: "2px 12px",
          borderRadius: "10px",
          fontWeight: "500",
        }}
      >
        {use.label}
      </span>
    );
  };

  return (
    <NavbarLoginKoordinator>
      <div style={{ backgroundColor: customColors.lightGray, minHeight: "100vh" }}>
        <Container className="py-5">
          {/* STATS SUMMARY SECTION */}
          <Row className="mb-4 g-3 text-center">
            {[
              { label: "TOTAL TAGIHAN", val: summaryTotals.totalAll ? `Rp ${summaryTotals.totalAll.toLocaleString("id-ID")}` : "Rp 0", color: customColors.brown },
              { label: "SUDAH DIBAYAR", val: summaryTotals.paid ? `Rp ${summaryTotals.paid.toLocaleString("id-ID")}` : "Rp 0", color: "#198754" },
              { label: "MENUNGGU", val: summaryTotals.unpaid ? `Rp ${summaryTotals.unpaid.toLocaleString("id-ID")}` : "Rp 0", color: "#dc3545" },
            ].map((stat, i) => (
              <Col md={4} key={i}>
                <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                  <Card.Body className="p-3">
                    <small className="fw-bold text-muted text-uppercase" style={{ fontSize: "0.7rem" }}>
                      {stat.label}
                    </small>
                    <h4 className="fw-bold mb-0" style={{ color: stat.color }}>
                      {stat.val}
                    </h4>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* MAIN TABLE CARD */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: "20px", overflow: "hidden" }}>
            <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: customColors.brown, color: "white", borderBottomRightRadius: "50px", padding: "0 30px" }}>
              <h4 className="mb-0 fw-normal py-2" style={{ fontFamily: "serif" }}>
                Manajemen Invoice
              </h4>
              <div>{/* Manual invoice creation removed: invoices are auto-created when booking status becomes 'menunggu_pembayaran' */}</div>
            </div>

            <Card.Body className="p-4 p-md-5 bg-white">
              <div className="mb-4" style={{ maxWidth: "400px" }}>
                <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                  <Form.Control placeholder="Cari klien..." className="border-0 ps-4" style={{ fontSize: "0.9rem" }} />
                  <Button variant="white" className="border-0 px-3 text-muted">
                    Cari
                  </Button>
                </InputGroup>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered align-middle text-center mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="py-3">No Invoice</th>
                      <th className="py-3">Klien</th>
                      <th className="py-3">Total</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Combine invoices and pending bookings into one list
                      const combined = [
                        ...invoices.map((inv) => ({ ...inv, type: "invoice" })),
                        ...pendingBookings.map((b) => ({
                          ...b,
                          type: "booking",
                          // Keep formatted invoiceId if available; otherwise build from kode_batch
                          invoiceId: b.invoiceId || (b.kode_batch ? `INV-${b.kode_batch}` : `INV-DRAFT-${b.bookingId}`),
                          invoiceIdRaw: null,
                        })),
                      ];

                      if (combined.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-muted">
                              Belum ada invoice atau booking menunggu pembayaran
                            </td>
                          </tr>
                        );
                      }

                      return combined.map((item) => (
                        <tr key={item.type === "invoice" ? item.invoiceId : `booking-${item.bookingId}`}>
                          <td className="py-3 fw-bold text-primary">{item.invoiceId}</td>
                          <td className="py-3 text-start ps-4">
                            <div className="fw-bold">{item.namaKlien}</div>
                          </td>
                          <td className="py-3 fw-bold">Rp {item.total.toLocaleString("id-ID")}</td>
                          <td className="py-3">{getStatusBadge(item.status)}</td>
                          <td className="py-3">
                            <Stack direction="horizontal" gap={2} className="justify-content-center">
                              <Button size="sm" className="text-white px-3" style={{ backgroundColor: customColors.brown, border: "none", borderRadius: "15px" }} onClick={() => handleShowDetail(item)}>
                                Detail
                              </Button>
                              {item.type === "invoice" && item.uploadedProof && item.status === "UNPAID" && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  style={{ borderRadius: "15px" }}
                                  onClick={async () => {
                                    if (!window.confirm("Konfirmasi pembayaran untuk invoice " + item.invoiceId + "?")) return;
                                    try {
                                      // Confirm invoice (backend should update invoice.status)
                                      await confirmInvoicePayment(item.invoiceIdRaw);
                                      // If invoice is linked to a booking, ensure booking-level verification runs too
                                      if (item.bookingId) {
                                        try {
                                          await verifikasiKoordinator(item.bookingId);
                                        } catch (innerErr) {
                                          console.warn("verifikasiKoordinator failed after confirmInvoicePayment", innerErr);
                                        }
                                      }
                                      await fetchInvoicesFromServer();
                                      alert("Pembayaran berhasil dikonfirmasi.");
                                    } catch (e) {
                                      console.error("Gagal konfirmasi pembayaran", e);
                                      alert("Gagal mengonfirmasi pembayaran. Cek console.");
                                    }
                                  }}
                                >
                                  Konfirmasi Pembayaran
                                </Button>
                              )}
                              {item.type === "booking" && item.uploadedProof && (item.status === "menunggu_konfirmasi_pembayaran" || (item.status || "").toLowerCase() === "menunggu_konfirmasi_pembayaran") && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  style={{ borderRadius: "15px" }}
                                  onClick={async () => {
                                    if (!window.confirm("Konfirmasi pembayaran untuk booking " + (item.invoiceId || item.bookingId) + "?")) return;
                                    try {
                                      // Use coordinator verification endpoint which will set booking as paid and update related invoice if any
                                      await verifikasiKoordinator(item.bookingId);
                                      await fetchInvoicesFromServer();
                                      alert("Pembayaran berhasil dikonfirmasi (booking).");
                                    } catch (e) {
                                      console.error("Gagal konfirmasi pembayaran booking", e);
                                      alert("Gagal mengonfirmasi pembayaran. Cek console.");
                                    }
                                  }}
                                >
                                  Konfirmasi
                                </Button>
                              )}
                            </Stack>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Container>
        <FooterSetelahLogin />
      </div>

      {/* MODAL UPLOAD BUKTI PEMBAYARAN */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Unggah Bukti Pembayaran</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Unggah file bukti pembayaran (PDF atau gambar). Setelah berhasil, tombol akan berubah menjadi "Sudah Unggah".</p>
          <p className="text-muted small mb-3">
            Invoice: <strong>{uploadTarget?.invoiceId}</strong>
          </p>
          <Form.Group controlId="formFilePayment" className="mb-3">
            <Form.Label>Pilih File</Form.Label>
            <Form.Control type="file" accept="application/pdf,image/*" onChange={(e) => setFileToUpload(e.target.files[0])} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)} disabled={uploading}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              if (!uploadTarget || !fileToUpload) return alert("Pilih file terlebih dahulu.");
              setUploading(true);
              try {
                const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
                const fd = new FormData();
                fd.append("file", fileToUpload, fileToUpload.name);
                const url = `${apiBase}/bookings/${uploadTarget.bookingId}/upload-payment-proof`;
                const headers = { ...getAuthHeader() };
                // axios will set proper multipart boundary
                await axios.post(url, fd, { headers });
                // refresh from server to stay fully synchronized with DB
                await fetchInvoicesFromServer();
                setShowUploadModal(false);
                setFileToUpload(null);
                alert("Bukti pembayaran berhasil diunggah.");
              } catch (e) {
                console.error("Gagal mengunggah bukti pembayaran", e);
                alert("Gagal mengunggah bukti pembayaran. Periksa koneksi atau coba lagi.");
              } finally {
                setUploading(false);
              }
            }}
            disabled={uploading || !fileToUpload}
          >
            {uploading ? "Mengunggah..." : "Unggah dan Selesai"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Manual create-from-booking modal removed (invoices are auto-created). */}

      {/* MODAL DETAIL INVOICE */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg" className="custom-detail-modal" style={{ zIndex: 1050 }} backdropClassName="custom-modal-backdrop">
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2" style={{ color: customColors.brown }}>
            <span>Rincian Penagihan</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 pb-4">
          {selectedInvoice && (
            <div className="invoice-container">
              {/* Header Info: Nomor Invoice & Status */}
              <div className="d-flex justify-content-between align-items-start mb-4 p-3 rounded-4" style={{ backgroundColor: "#F8F9FA", border: "1px solid #E9ECEF" }}>
                <div>
                  <div className="text-muted small text-uppercase fw-bold mb-1">Nomor Referensi</div>
                  <h5 className="fw-bold text-primary mb-0">{selectedInvoice.invoiceId || selectedInvoice.invoice_number || "Booking #" + (selectedInvoice.bookingId || selectedInvoice.id)}</h5>
                </div>
                <div className="text-end">
                  <div className="text-muted small text-uppercase fw-bold mb-1">Status Pembayaran</div>
                  {getStatusBadge(selectedInvoice.status)}
                </div>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small text-uppercase fw-bold d-block mb-1">Informasi Klien</label>
                    <div className="p-3 rounded-3 border bg-white shadow-sm">
                      <div className="fw-bold fs-5">{selectedInvoice.klien || selectedInvoice.namaKlien || "-"}</div>
                      <div className="text-muted small mt-1">{selectedInvoice.institusi || "Institusi Umum"}</div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small text-uppercase fw-bold d-block mb-1">Informasi Pengiriman</label>
                    <div className="p-3 rounded-3 border bg-white shadow-sm">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">Tanggal Kirim:</span>
                        <span className="fw-bold small">{selectedInvoice.tanggal_kirim || selectedInvoice.tanggal || "-"}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted small">Sampel:</span>
                        <span className="fw-bold small">{selectedInvoice.jumlah_sampel || 0} Sampel</span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Tabel Rincian Harga */}
              <div className="mb-4">
                <label className="text-muted small text-uppercase fw-bold d-block mb-2">Daftar Item Analisis</label>
                <div className="table-responsive border rounded-3 overflow-hidden shadow-sm">
                  <Table className="mb-0 custom-table-detail">
                    <thead style={{ backgroundColor: "#F8F9FA" }}>
                      <tr className="small text-uppercase fw-bold">
                        <th className="py-3 ps-3 border-0">Nama Analisis</th>
                        <th className="py-3 text-end border-0">Harga / Sampel</th>
                        <th className="py-3 text-end pe-3 border-0">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.itemized && selectedInvoice.itemized.length > 0 ? (
                        selectedInvoice.itemized.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-3 ps-3 align-middle">{it.nama || it.name}</td>
                            <td className="py-3 text-end align-middle">Rp {(it.hargaSatuan || it.unitPrice || 0).toLocaleString("id-ID")}</td>
                            <td className="py-3 text-end pe-3 align-middle fw-bold">Rp {(it.total || 0).toLocaleString("id-ID")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-3 ps-3">{selectedInvoice.jenis_analisis || "-"}</td>
                          <td className="py-3 text-end">-</td>
                          <td className="py-3 text-end pe-3 fw-bold">Rp {(selectedInvoice.total || 0).toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* Total Akhir */}
              <div className="d-flex justify-content-end">
                <div className="p-3 rounded-4 border shadow-sm text-end" style={{ minWidth: "250px", backgroundColor: "#fdfbf9" }}>
                  <div className="text-muted small text-uppercase fw-bold mb-1">Total Penagihan</div>
                  <h3 className="fw-bold mb-0" style={{ color: customColors.brown }}>
                    Rp {(selectedInvoice.itemized ? selectedInvoice.itemized.reduce((s, i) => s + Number(i.total || 0), 0) : selectedInvoice.total || 0).toLocaleString("id-ID")}
                  </h3>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 bg-light p-4">
          <div className="w-100">
            <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
              {/* Aksi Lihat Hasil */}
              {selectedInvoice && selectedInvoice.booking && ["lunas", "verified", "selesai", "ditandatangani"].includes((selectedInvoice.booking.status || "").toLowerCase()) && (
                <Button
                  variant="outline-primary"
                  className="rounded-pill px-4"
                  onClick={async () => {
                    try {
                      const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
                      const headers = { ...getAuthHeader(), Accept: "application/pdf" };
                      const stored =
                        selectedInvoice.booking.file_ttd_path || selectedInvoice.booking.pdf_path ? apiBase.replace(/\/api\/?$/, "") + "/storage/" + (selectedInvoice.booking.file_ttd_path || selectedInvoice.booking.pdf_path) : null;
                      if (stored) {
                        try {
                          const res = await fetch(stored);
                          if (res.ok) {
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            setProofBlobUrl(url);
                            setProofMime(blob.type || "application/octet-stream");
                            setShowProofModal(true);
                            return;
                          }
                          window.open(stored, "_blank");
                          return;
                        } catch (e) {
                          window.open(stored, "_blank");
                          return;
                        }
                      }
                      const res = await fetch(`${apiBase}/bookings/${selectedInvoice.bookingId || selectedInvoice.booking.id}/pdf-generated`, { headers });
                      if (!res.ok) throw new Error("Tidak dapat memuat PDF");
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      setProofBlobUrl(url);
                      setProofMime(blob.type || "application/octet-stream");
                      setShowProofModal(true);
                    } catch (e) {
                      alert("Gagal membuka hasil analisis.");
                    }
                  }}
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i>Lihat Hasil Analisis
                </Button>
              )}

              {/* Aksi Preview Bukti */}
              {selectedInvoice && (selectedInvoice.uploadedProof || (selectedInvoice.booking && selectedInvoice.booking.payment_proof_path)) && (
                <Button
                  variant="outline-info"
                  className="rounded-pill px-4"
                  onClick={async () => {
                    try {
                      const apiBaseRoot = (process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");
                      const path = selectedInvoice.payment_proof_path || (selectedInvoice.booking && selectedInvoice.booking.payment_proof_path);
                      if (!path) return alert("Tidak ada bukti pembayaran untuk ditampilkan.");
                      const full = `${apiBaseRoot}/storage/${path}`;
                      try {
                        console.debug("Fetching proof via:", full);
                        const res = await fetch(full);
                        if (!res.ok) throw new Error("Gagal mengambil file bukti, status=" + res.status);
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        setProofBlobUrl(url);
                        setProofMime(blob.type || "application/octet-stream");
                        setShowProofModal(true);
                      } catch (e) {
                        console.warn("Fetch proof failed, fallback to open:", e);
                        window.open(full, "_blank");
                      }
                    } catch (e) {
                      console.error("Gagal memuat bukti pembayaran", e);
                      alert("Gagal memuat bukti pembayaran.");
                    }
                  }}
                >
                  <i className="bi bi-image me-2"></i>Preview Bukti
                </Button>
              )}

              {/* Kirim Invoice */}
              {selectedInvoice && selectedInvoice.type !== "booking" && (
                <Button
                  variant="outline-success"
                  className="rounded-pill px-4"
                  onClick={async () => {
                    if (!selectedInvoice || !selectedInvoice.invoiceIdRaw) {
                      alert("Tidak ada invoice untuk dikirim.");
                      return;
                    }

                    try {
                      const resp = await sendInvoiceEmail(selectedInvoice.invoiceIdRaw);
                      console.debug("sendInvoiceEmail response:", resp);
                      const successMsg = resp && (resp.message || resp.msg || resp.data || resp.success) ? resp.message || resp.msg || (typeof resp.data === "string" ? resp.data : "Invoice dikirim.") : "Invoice dikirim.";
                      alert(String(successMsg));
                    } catch (e) {
                      console.error("Gagal kirim invoice -- full error:", e);
                      let serverMsg = null;
                      try {
                        if (e && e.response && e.response.data) {
                          serverMsg = e.response.data.message || e.response.data.msg || JSON.stringify(e.response.data);
                        } else if (e && e.message) {
                          serverMsg = e.message;
                        } else {
                          serverMsg = String(e);
                        }
                      } catch (ex) {
                        serverMsg = "Gagal mengirim invoice. Cek console.";
                      }
                      alert(serverMsg ? `Gagal mengirim invoice: ${serverMsg}` : "Gagal mengirim invoice. Cek console.");
                    }
                  }}
                >
                  <i className="bi bi-envelope me-2"></i>Kirim Invoice
                </Button>
              )}
            </div>

            {/* Konfirmasi Pembayaran - Penuh width jika muncul */}
            {selectedInvoice &&
              (selectedInvoice.uploadedProof || (selectedInvoice.booking && selectedInvoice.booking.payment_proof_path)) &&
              ((selectedInvoice.booking && !["lunas", "verified", "selesai", "ditandatangani"].includes((selectedInvoice.booking.status || "").toLowerCase())) ||
                (!selectedInvoice.booking && !["lunas", "verified", "selesai", "ditandatangani"].includes((selectedInvoice.status || "").toLowerCase()))) && (
                <Button
                  variant="success"
                  className="rounded-pill px-4 w-100 fw-bold mb-2"
                  onClick={async () => {
                    if (!window.confirm("Setujui pembayaran ini?")) return;
                    try {
                      const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
                      const token = localStorage.getItem("token");
                      const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };
                      let id = selectedInvoice.booking ? selectedInvoice.booking.id : selectedInvoice.bookingId || selectedInvoice.id;
                      const res = await fetch(`${apiBase}/bookings/${id}/verify-payment`, { method: "POST", headers });
                      if (!res.ok) throw new Error("Gagal menyetujui pembayaran");
                      alert("Pembayaran telah disetujui!");
                      setShowDetailModal(false);
                      fetchInvoicesFromServer();
                    } catch (e) {
                      alert("Gagal menyetujui pembayaran.");
                    }
                  }}
                >
                  <i className="bi bi-check-circle me-2"></i>Setujui Pembayaran
                </Button>
              )}

            {/* Tombol Tutup */}
            <Button className="rounded-pill py-2 text-white shadow-sm border-0 w-100" style={{ backgroundColor: customColors.brown }} onClick={() => setShowDetailModal(false)}>
              Tutup Detail
            </Button>
          </div>
        </Modal.Footer>

        <style>{`
          .custom-detail-modal {
            padding-top: 35px !important;
          }
          .custom-detail-modal .modal-dialog {
            margin-top: 60px !important;
          }
          .custom-detail-modal .modal-content {
            border-radius: 25px;
            border: none;
            box-shadow: 0 15px 50px rgba(0,0,0,0.1);
          }
          .custom-modal-backdrop {
            z-index: 1049 !important;
          }
          .custom-table-detail {
            font-size: 0.95rem;
          }
          .custom-table-detail tr:last-child td {
            border-bottom: none;
          }
          .invoice-container {
            font-family: 'Inter', sans-serif;
          }
        `}</style>
      </Modal>

      {/* MODAL PREVIEW BUKTI PEMBAYARAN */}
      <Modal
        show={showProofModal}
        onHide={() => {
          setShowProofModal(false);
          if (proofBlobUrl) {
            try {
              window.URL.revokeObjectURL(proofBlobUrl);
            } catch (e) {}
            setProofBlobUrl(null);
            setProofMime(null);
          }
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Preview Bukti Pembayaran</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ minHeight: "60vh" }}>
          {proofBlobUrl ? (
            proofMime && proofMime.indexOf("pdf") !== -1 ? (
              <object data={proofBlobUrl} type="application/pdf" width="100%" height="520">
                PDF tidak didukung di browser ini.
              </object>
            ) : (
              <img src={proofBlobUrl} alt="Bukti Pembayaran" style={{ maxWidth: "100%", maxHeight: "70vh", display: "block", margin: "0 auto" }} />
            )
          ) : (
            <div className="text-center text-muted">Tidak ada bukti pembayaran untuk ditampilkan.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowProofModal(false);
              if (proofBlobUrl) {
                try {
                  window.URL.revokeObjectURL(proofBlobUrl);
                } catch (e) {}
                setProofBlobUrl(null);
                setProofMime(null);
              }
            }}
          >
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Manual invoice modal removed — invoices are generated automatically from booking data */}
    </NavbarLoginKoordinator>
  );
};

export default ManajemenPembayaran;

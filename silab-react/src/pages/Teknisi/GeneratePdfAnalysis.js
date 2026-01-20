import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useHistory, useLocation } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { formatDataForPDF } from "../../utils/pdfHelpers";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

import { message, Table, Tag, Button, Modal, Progress } from "antd";
import { EyeOutlined, SendOutlined, EditOutlined, DownloadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { getAllBookings, uploadPdfAndKirim } from "../../services/BookingService";

export default function GeneratePdfAnalysis({ autoGenerate = false, filename = "hasil_analisis.pdf", booking: propBooking = null }) {
  useEffect(() => {
    document.title = "SILAB-NTDK - Generate PDF Analisis";
  }, []);

  // modal state and upload state for sending PDF to Koordinator
  const location = useLocation();
  const history = useHistory();
  const resolvedAutoGenerate = location.state?.autoGenerate ?? autoGenerate;
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingList, setBookingList] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'detail'
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const bookingFromRoute = propBooking || location.state?.booking;

  const instituteHeader = [
    "KEMENTERIAN RISET, TEKNOLOGI DAN PENDIDIKAN TINGGI",
    "INSTITUT PERTANIAN BOGOR",
    "FAKULTAS PETERNAKAN",
    "DEPARTEMEN ILMU NUTRISI DAN TEKNOLOGI PAKAN",
    "LABORATORIUM NUTRISI TERNAK DAGING DAN KERJA",
    "Jl. Agathis Kampus IPB Darmaga, Bogor 16680",
  ];

  // --- DATA DEFAULT ---
  const defaultData = {
    header: {
      kepada: "Kepada Yth.",
      instansi: "****",
      tempat: "Di Tempat",
      tanggal: "**/**/****",
      title1: "Tabel 1. Hasil Analisis Hematologi",
      title2: "Tabel 2. Hasil Analisis Metabolit",
    },
    table1: [
      ["Kode", "BDM\n(10⁶/µL)", "BDP\n(10³/µL)", "HB\n(g%)", "PCV\n(%)", "Limfosit\n(%)", "Neutrofil\n(%)", "Eosinofil\n(%)", "Monosit\n(%)", "Basofil\n(%)"],
      ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
    ],
    table2: [
      ["No", "Kode", "Glukosa\n(mg/dL)", "Total Protein\n(g/dL)", "Albumin\n(mg/dL)", "Kolestrol\n(mg/dL)", "Trigliserida\n(mg/dL)", "Urea/BUN\n(mg/dL)", "Kreatinin\n(mg/dL)", "Kalsium\n(mg/dL)", "HDL-kol\n(mg/dL)", "LDL-kol\n(mg/dL)"],
      [],
    ],
  };

  useEffect(() => {
    if (bookingFromRoute?.id) {
      fetchBookingData(bookingFromRoute.id);
      setViewMode("detail");
    } else {
      fetchAllVerificationBookings();
      setViewMode("list");
    }
  }, [bookingFromRoute]);

  // --- PATCH: Pastikan status tidak auto-kirim ---
  useEffect(() => {
    if (bookingData && (bookingData.status === "proses" || bookingData.status === "draft")) {
      // Status tetap, tidak auto update ke 'menunggu_verifikasi'
      // Hanya update status setelah teknisi klik tombol kirim
    }
  }, [bookingData]);

  // --- LOGIKA FETCH DATA UTAMA (DIPERBAIKI) ---
  const fetchAllVerificationBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      const allBookings = response?.data || [];

      // Filter status: Tampilkan mulai dari 'menunggu_verifikasi' sampai selesai
      // Agar teknisi bisa melihat riwayat yang sudah dikirim
      const visibleStatuses = [
        "menunggu_verifikasi",
        "menunggu_verifikasi_kepala",
        "menunggu_ttd",
        "menunggu_ttd_koordinator",
        "menunggu_pembayaran",
        "selesai",
        "disetujui", // Jika ada
      ];

      const verificationBookings = allBookings.filter((b) => visibleStatuses.includes((b.status || "").toLowerCase()));

      // Sorting: Prioritaskan yang BUTUH AKSI (menunggu_verifikasi) di paling atas
      verificationBookings.sort((a, b) => {
        const statusA = (a.status || "").toLowerCase();
        const statusB = (b.status || "").toLowerCase();

        if (statusA === "menunggu_verifikasi" && statusB !== "menunggu_verifikasi") return -1;
        if (statusA !== "menunggu_verifikasi" && statusB === "menunggu_verifikasi") return 1;

        // Sisanya urutkan berdasarkan tanggal terbaru
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setBookingList(verificationBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Gagal memuat daftar booking.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingData = async (bookingId) => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      const allBookings = response?.data || [];
      const booking = allBookings.find((b) => b.id === bookingId);

      if (booking) {
        setBookingData(booking);
        setSelectedBooking(booking);
      } else {
        message.error("Data booking tidak ditemukan!");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      message.error("Gagal memuat data booking.");
    } finally {
      setLoading(false);
    }
  };

  const parseKodeSampel = (kodeSampel) => {
    try {
      let codes = [];
      if (typeof kodeSampel === "string") {
        const parsed = JSON.parse(kodeSampel);
        codes = Array.isArray(parsed) ? parsed : [parsed];
      } else if (Array.isArray(kodeSampel)) {
        codes = kodeSampel;
      } else {
        codes = [kodeSampel];
      }
      return codes.filter((c) => c && c.trim() !== "");
    } catch (e) {
      return [kodeSampel];
    }
  };

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setBookingData(booking);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedBooking(null);
    setBookingData(null);
    setPdfUrl(null);
    fetchAllVerificationBookings();
  };

  const handleEditData = () => {
    if (!selectedBooking) return;
    history.push(`/teknisi/dashboard/inputNilaiAnalisis/input-analisis/${selectedBooking.id}`);
  };

  // sending to Koordinator removed: generate PDF only

  // --- LOGIKA GENERATE PDF ---
  const payload = bookingData ? formatDataForPDF(bookingData) : defaultData;

  function generatePdfFile() {
    if (!bookingData) return null;
    const doc = new jsPDF("p", "mm", "a4");
    let kodeBatch = bookingData?.kode_batch || bookingData?.kode_sampel || "-";
    if (Array.isArray(kodeBatch)) kodeBatch = kodeBatch[0] || "-";
    const safeKodeBatch = String(kodeBatch).replace(/[^a-zA-Z0-9-_]/g, "_");
    const customFilename = `hasil_analisis - ${safeKodeBatch}.pdf`;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftMargin = 14;
    const rightMargin = 14;
    const usableWidth = pageWidth - leftMargin - rightMargin;

    const commonTableStyles = {
      font: "helvetica",
      fontSize: 8,
      textColor: 20,
      cellPadding: 1.5,
      valign: "middle",
      halign: "center",
      lineWidth: 0.1,
      lineColor: [200, 200, 200],
      overflow: "linebreak",
    };
    const commonHeadStyles = {
      fillColor: [0, 85, 128],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      cellPadding: 2,
    };
    const commonAlternateRowStyles = {
      fillColor: [248, 248, 248],
    };

    let cursorY = 20;
    const logoWidth = 43;
    const logoHeight = 30;
    try {
      doc.addImage("/asset/Logo-IPB.png", "PNG", 12, 5, logoWidth, logoHeight);
    } catch (err) {}

    let headerY = 10;
    const offsetX = 15;
    doc.setFontSize(12);
    doc.setFont("Times New Roman", "bold");
    instituteHeader.forEach((line) => {
      doc.text(line, pageWidth / 2 + offsetX, headerY, { align: "center" });
      headerY += 6;
    });
    headerY -= 2;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(14, headerY, pageWidth - 14, headerY);
    cursorY = headerY + 10;

    doc.setFontSize(11);
    doc.setFont("Times New Roman", "normal");
    doc.text(payload.header.kepada, leftMargin, cursorY);
    if (payload.header.tanggal) {
      doc.text(`Tanggal: ${payload.header.tanggal}`, pageWidth - rightMargin, cursorY, { align: "right" });
    }
    cursorY += 6;
    doc.text(payload.header.instansi, leftMargin, cursorY);
    cursorY += 6;
    doc.text(payload.header.tempat, leftMargin, cursorY);
    cursorY += 12;

    if (payload.table1 && payload.table1.length > 0 && payload.header.title1) {
      doc.setFontSize(11);
      doc.setFont("Times New Roman", "bold");
      const title1Lines = doc.splitTextToSize(payload.header.title1, usableWidth);
      doc.text(title1Lines, leftMargin, cursorY);
      cursorY += title1Lines.length * 5 + 2;
      const [table1Head, ...table1Body] = payload.table1;
      const colNoWidth = 10;
      const colKodeWidth = 35;
      const remainingWidth = usableWidth - colNoWidth - colKodeWidth;
      const paramColCount = table1Head.length - 2;
      const paramColWidth = remainingWidth / (paramColCount > 0 ? paramColCount : 1);
      let columnStylesT1 = { 0: { cellWidth: colNoWidth }, 1: { cellWidth: colKodeWidth } };
      for (let i = 2; i < table1Head.length; i++) {
        columnStylesT1[i] = { cellWidth: paramColWidth };
      }
      autoTable(doc, {
        startY: cursorY,
        head: [table1Head],
        body: table1Body,
        theme: "grid",
        styles: commonTableStyles,
        headStyles: commonHeadStyles,
        alternateRowStyles: commonAlternateRowStyles,
        columnStyles: columnStylesT1,
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: "auto",
      });
      cursorY = doc.lastAutoTable.finalY + 12;
    }

    if (payload.table2 && payload.table2.length > 0 && payload.header.title2) {
      if (pageHeight - cursorY < 40) {
        doc.addPage();
        cursorY = 20;
      }
      doc.setFontSize(11);
      doc.setFont("Times New Roman", "bold");
      const title2Lines = doc.splitTextToSize(payload.header.title2, usableWidth);
      doc.text(title2Lines, leftMargin, cursorY);
      cursorY += title2Lines.length * 5 + 2;
      const [table2Head, ...table2Body] = payload.table2;
      const colNoWidth = 10;
      const colKodeWidth = 35;
      const remainingWidth = usableWidth - colNoWidth - colKodeWidth;
      const paramColCount = table2Head.length - 2;
      const paramColWidth = remainingWidth / (paramColCount > 0 ? paramColCount : 1);
      let columnStylesT2 = { 0: { cellWidth: colNoWidth }, 1: { cellWidth: colKodeWidth } };
      for (let i = 2; i < table2Head.length; i++) {
        columnStylesT2[i] = { cellWidth: paramColWidth };
      }
      autoTable(doc, {
        startY: cursorY,
        head: [table2Head],
        body: table2Body,
        theme: "grid",
        styles: commonTableStyles,
        headStyles: commonHeadStyles,
        alternateRowStyles: commonAlternateRowStyles,
        columnStyles: columnStylesT2,
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: "auto",
      });
      cursorY = doc.lastAutoTable.finalY + 15;
    }

    if (pageHeight - cursorY < 60) {
      doc.addPage();
      cursorY = 40;
    } else {
      cursorY += 15;
    }
    const signatureCenterPoint = pageWidth - 45;
    doc.setFontSize(10);
    doc.setFont("Times New Roman", "normal");
    doc.text("Penanggungjawab Lab. Analisis", signatureCenterPoint, cursorY, { align: "center" });
    cursorY += 5;
    doc.text("Ilmu Nutrisi Ternak Daging dan Kerja", signatureCenterPoint, cursorY, { align: "center" });
    cursorY += 25;
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    doc.line(signatureCenterPoint - 25, cursorY, signatureCenterPoint + 25, cursorY);
    cursorY += 4;
    doc.text("Prof. Dewi Apri Astuti, MS", signatureCenterPoint, cursorY, { align: "center" });

    const blob = doc.output("blob");
    return new File([blob], customFilename, { type: "application/pdf" });
  }

  function buildPDF(download = false) {
    const file = generatePdfFile();
    if (!file) return;

    if (!download) {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      // Logic download
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  // --- DO UPLOAD & KIRIM KE KOORDINATOR ---
  const doKirimKeKoordinator = async () => {
    if (!bookingData) {
      message.error("Data booking tidak ditemukan!");
      return;
    }
    try {
      setUploading(true);
      setUploadProgress(0);

      // Generate PDF as a File
      const file = generatePdfFile();
      if (!file) {
        message.error("Gagal membuat file PDF. Silakan coba lagi.");
        setUploading(false);
        return;
      }
      if (!(file instanceof File)) {
        message.error("File PDF tidak valid. Silakan coba lagi.");
        setUploading(false);
        return;
      }
      // Upload PDF ke server
      try {
        await uploadPdfAndKirim(bookingData.id, file, (percent) => {
          setUploadProgress(percent);
        });
      } catch (err) {
        console.error("Upload error response:", err?.response || err);
        const serverMsg = err?.response?.data?.message || err?.response?.statusText || err.message || "Gagal upload PDF ke server.";
        const details = err?.response?.data?.errors ? JSON.stringify(err.response.data.errors) : null;
        message.error(serverMsg + (details ? `: ${details}` : ""));
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      // Fetch ulang data agar status terupdate di UI
      await fetchBookingData(bookingData.id);
      setUploadProgress(100);
      message.success({ content: "Hasil analisis berhasil dikirim ke Koordinator Lab!", duration: 2 });
    } catch (error) {
      console.error("Gagal kirim ke koordinator:", error);
      message.error("Terjadi kesalahan saat mengirim ke koordinator.");
    } finally {
      setUploading(false);
      // small delay to allow UI to show 100% progress
      setTimeout(() => setUploadProgress(0), 800);
    }
  };

  // Build preview PDF when entering detail view (do not change booking status)
  useEffect(() => {
    if (payload && bookingData && viewMode === "detail") {
      buildPDF(false); // hanya preview, tidak update status
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData, viewMode]);
  // Do not auto-download even if routed with autoGenerate flag; keep preview only

  // --- KOLOM TABEL (Status Dinamis) ---
  const columns = [
    {
      title: "Kode Sampel",
      dataIndex: "kode_batch",
      key: "kode_batch",
      width: 200,
      fixed: "left",
      render: (text, record) => {
        const kodeBatch = text || record.kode_sampel || "-";
        return (
          <Tag color="blue" style={{ fontSize: "12px" }}>
            {kodeBatch}
          </Tag>
        );
      },
    },
    {
      title: "Nama Lengkap",
      dataIndex: "user",
      key: "user",
      width: 180,
      render: (user) => user?.full_name || user?.name || "-",
    },
    {
      title: "Jenis Analisis",
      dataIndex: "jenis_analisis",
      key: "jenis_analisis",
      width: 200,
      render: (text) => text || "-",
    },
    {
      title: "Tanggal Pemesanan",
      key: "tanggal_pemesanan",
      width: 150,
      render: (_, record) => {
        const tanggal = record.tanggal_booking || record.created_at;
        if (!tanggal) return "-";
        return new Date(tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 170,
      align: "center",
      render: (status) => {
        let color = "default";
        let text = status;

        switch (status) {
          case "proses":
          case "draft":
            color = "warning";
            text = "Perlu Kirim Koordinator";
            break;
          case "menunggu_verifikasi":
            // Already sent by teknisi, waiting Koordinator verification
            color = "processing";
            text = "Sudah Dikirim ke Koordinator";
            break;
          case "menunggu_verifikasi_kepala":
            color = "processing";
            text = "Di Koordinator";
            break;
          case "menunggu_ttd":
          case "menunggu_ttd_koordinator":
            color = "purple";
            text = "Menunggu TTD";
            break;
          case "menunggu_pembayaran":
          case "selesai":
            color = "success";
            text = "Selesai";
            break;
          default:
            text = status?.replace(/_/g, " ") || "-";
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 150,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Button type="primary" icon={<EyeOutlined />} size="small" onClick={() => handleViewDetail(record)}>
          Lihat PDF
        </Button>
      ),
    },
  ];

  const sentStatuses = ["menunggu_verifikasi", "menunggu_verifikasi_kepala", "menunggu_ttd", "menunggu_ttd_koordinator", "menunggu_pembayaran", "selesai", "disetujui"];

  const isSent = bookingData && sentStatuses.includes((bookingData.status || "").toLowerCase());

  return (
    <NavbarLoginTeknisi>
      <div className="container-fluid p-4" style={{ minHeight: "calc(100vh - 160px)" }}>
        {loading && (
          <div className="text-center py-5">
            <LoadingSpinner spinning={loading} tip="Memuat data..." />
          </div>
        )}

        {!loading && viewMode === "list" && (
          <div className="card shadow-sm" style={{ borderRadius: "12px", overflow: "hidden", border: "none" }}>
            {/* Header dengan nuansa Cokelat Tua */}
            <div
              className="card-header text-white"
              style={{
                backgroundColor: "#cdb0a7", // Deep Brown
                borderBottom: "2px solid #8D6E63",
                padding: "15px 20px",
              }}
            >
              <h5 className="mb-0" style={{ fontWeight: "600", letterSpacing: "0.5px" }}>
                Daftar Hasil Analisis (Riwayat)
              </h5>
            </div>

            <div className="card-body" style={{ backgroundColor: "#FAF8F6" }}>
              <Table
                columns={columns}
                dataSource={bookingList}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  style: { marginTop: "20px" },
                }}
                scroll={{ x: 1100 }}
                locale={{ emptyText: "Tidak ada data analisis" }}
                // Menambahkan class custom untuk styling baris & header tabel
                className="custom-brown-table"
              />
            </div>
          </div>
        )}

        {!loading && viewMode === "detail" && (
          <div className="d-flex flex-column gap-3">
            <div className="card shadow-sm p-3">
              <h5 className="mb-3">Preview Hasil Analisis</h5>
              <div className="d-flex gap-2 flex-wrap">
                <Button icon={<DownloadOutlined />} onClick={() => buildPDF(true)}>
                  Download PDF
                </Button>

                {/* Edit tetap boleh diklik selama booking belum dikirim ke Koordinator */}
                <Button icon={<EditOutlined />} onClick={handleEditData} disabled={!bookingData || isSent}>
                  Edit Data
                </Button>

                {/* Jika sudah dikirim, tampilkan indikator; jika belum, tampilkan tombol Kirim */}
                {(() => {
                  const sentStatuses = ["menunggu_verifikasi", "menunggu_verifikasi_kepala", "menunggu_ttd", "menunggu_ttd_koordinator", "menunggu_pembayaran", "selesai", "disetujui"];
                  const isSent = bookingData && sentStatuses.includes((bookingData.status || "").toLowerCase());
                  if (isSent) {
                    return (
                      <Button type="default" icon={<CheckCircleOutlined />} disabled style={{ background: "#f6ffed", borderColor: "#b7eb8f", color: "#52c41a" }}>
                        Sudah Dikirim ke Koordinator
                      </Button>
                    );
                  }
                  return (
                    <Button type="primary" icon={<SendOutlined />} onClick={() => setModalVisible(true)} disabled={!bookingData || uploading}>
                      Kirim Ke Koordinator Lab
                    </Button>
                  );
                })()}

                {uploading && (
                  <div style={{ minWidth: 240, marginLeft: 12 }}>
                    <Progress percent={uploadProgress} status={uploadProgress < 100 ? "active" : "success"} />
                  </div>
                )}

                <Modal
                  title="Konfirmasi Pengiriman"
                  open={modalVisible}
                  onOk={() => {
                    setModalVisible(false);
                    doKirimKeKoordinator();
                  }}
                  onCancel={() => setModalVisible(false)}
                  okText="Ya, Kirim"
                  cancelText="Batal"
                >
                  <p>Apakah Anda yakin ingin mengirim hasil analisis ke Koordinator Lab?</p>
                </Modal>
                <Button onClick={handleBackToList}>Kembali ke Daftar</Button>
              </div>
            </div>

            <div className="card shadow-sm p-0" style={{ height: "800px" }}>
              {pdfUrl && <iframe src={pdfUrl} title="PDF Preview" style={{ width: "100%", height: "100%", border: "none" }} />}
            </div>
          </div>
        )}
      </div>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}

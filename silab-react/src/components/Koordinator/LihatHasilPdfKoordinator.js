import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { formatDataForPDF } from "../../utils/pdfHelpers";
import { getAllBookings, updateBookingStatus } from "../../services/BookingService";
import { Button, Spinner } from "react-bootstrap";

export default function LihatHasilPdfKoordinator({ filename = "hasil_analisis.pdf" }) {
  const { id } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [processing, setProcessing] = useState(false);

  const instituteHeader = [
    "KEMENTERIAN RISET, TEKNOLOGI DAN PENDIDIKAN TINGGI",
    "INSTITUT PERTANIAN BOGOR",
    "FAKULTAS PETERNAKAN",
    "DEPARTEMEN ILMU NUTRISI DAN TEKNOLOGI PAKAN",
    "LABORATORIUM NUTRISI TERNAK DAGING DAN KERJA",
    "Jl. Agathis Kampus IPB Darmaga, Bogor 16680",
  ];


  useEffect(() => {
    if (id) fetchBookingById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBookingById = async (bookingId) => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      const all = res?.data || [];
      const booking = all.find((b) => String(b.id) === String(bookingId));
      setBookingData(booking || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const buildPDF = (download = false) => {
    if (!bookingData) return;

    const payload = formatDataForPDF(bookingData);
    const doc = new jsPDF("p", "mm", "a4");
    const leftMargin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    let cursorY = 20;

    // ===== LOGO =====
    try {
      doc.addImage("/asset/Logo-IPB.png", "PNG", 12, 5, 43, 30);
    } catch (e) {}

    // ===== HEADER INSTITUSI =====
    let headerY = 10;
    const offsetX = 15;

    doc.setFontSize(12);
    doc.setFont("Times New Roman", "bold");

    instituteHeader.forEach((line) => {
      doc.text(line, pageWidth / 2 + offsetX, headerY, {
        align: "center",
      });
      headerY += 6;
    });

    // ===== GARIS PEMISAH =====
    doc.setLineWidth(0.5);
    doc.line(14, headerY - 2, pageWidth - 14, headerY - 2);
    cursorY = headerY + 8;

    // ===== KEPADA YTH =====
    doc.setFontSize(11);
    doc.setFont("Times New Roman", "normal");

    doc.text(payload.header.kepada || "Kepada Yth.", leftMargin, cursorY);
    if (payload.header.tanggal) {
      doc.text(`Tanggal ${payload.header.tanggal}`, pageWidth - 54, cursorY);
    }

    cursorY += 6;
    doc.text(payload.header.instansi || "-", leftMargin, cursorY);
    cursorY += 6;
    doc.text(payload.header.tempat || "-", leftMargin, cursorY);
    cursorY += 10;

    // ===== Table 1 (Hematologi) - hanya tampilkan jika ada data =====
    if (payload.table1 && payload.header.title1) {
      doc.setFontSize(12);
      doc.text(payload.header.title1, leftMargin, cursorY);
      cursorY += 6;
      const [table1Head, ...table1Body] = payload.table1;

      // Hitung jumlah kolom untuk distribusi lebar otomatis
      const numCols = table1Head.length;
      const availableWidth = pageWidth - leftMargin - 14; // total lebar yang tersedia
      const kodeWidth = 25; // lebar khusus untuk kolom kode
      const remainingWidth = availableWidth - kodeWidth;
      const colWidth = remainingWidth / (numCols - 1); // distribusi merata untuk kolom lainnya

      // Build columnStyles dynamically
      const columnStyles = { 0: { cellWidth: kodeWidth, halign: "center" } };
      for (let i = 1; i < numCols; i++) {
        columnStyles[i] = { cellWidth: colWidth, halign: "center" };
      }

      autoTable(doc, {
        startY: cursorY,
        head: [table1Head],
        body: table1Body,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          halign: "center",
          valign: "middle",
        },
        headStyles: {
          fillColor: [220, 220, 220],
          fontSize: 7,
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
          minCellHeight: 10,
        },
        columnStyles: columnStyles,
        margin: { left: leftMargin, right: 14 },
        tableWidth: "auto",
      });

      let finalY = doc.lastAutoTable?.finalY || cursorY + 40;
      cursorY = finalY + 12;
    }

    // ===== Table 2 (Metabolit) - hanya tampilkan jika ada data =====
    if (payload.table2 && payload.header.title2) {
      doc.setFontSize(12);
      doc.text(payload.header.title2, leftMargin, cursorY);
      cursorY += 6;
      const [table2Head, ...table2Body] = payload.table2;

      // Hitung jumlah kolom untuk distribusi lebar otomatis
      const numCols = table2Head.length;
      const availableWidth = pageWidth - leftMargin - 14;
      const noWidth = 10; // kolom No sangat kecil
      const kodeWidth = 25; // kolom Kode
      const remainingWidth = availableWidth - noWidth - kodeWidth;
      const colWidth = remainingWidth / (numCols - 2); // distribusi untuk kolom parameter

      // Build columnStyles dynamically
      const columnStyles = {
        0: { cellWidth: noWidth, halign: "center" },
        1: { cellWidth: kodeWidth, halign: "center" },
      };
      for (let i = 2; i < numCols; i++) {
        columnStyles[i] = { cellWidth: colWidth, halign: "center" };
      }

      autoTable(doc, {
        startY: cursorY,
        head: [table2Head],
        body: table2Body,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          halign: "center",
          valign: "middle",
        },
        headStyles: {
          fillColor: [220, 220, 220],
          fontSize: 7,
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
          minCellHeight: 10,
        },
        columnStyles: columnStyles,
        margin: { left: leftMargin, right: 14 },
        tableWidth: "auto",
      });
    }

    // ===== PREVIEW / DOWNLOAD =====
    if (!download) {
      const blob = doc.output("blob");
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const file = new File([blob], filename, {
        type: "application/pdf",
      });
      setPdfUrl(URL.createObjectURL(file));
      return;
    }

    doc.save(filename);
  };

  useEffect(() => {
    if (bookingData) buildPDF(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData]);

  const handleSetuju = async () => {
    if (!bookingData) return;
    setProcessing(true);
    try {
      // Kirim status agar masuk ke antrian verifikasi Kepala
      await updateBookingStatus(bookingData.id, { status: "menunggu_verifikasi" });
      // update lokal state untuk refleksi UI
      setBookingData({ ...bookingData, status: "menunggu_verifikasi" });
      // kembali ke daftar verifikasi koordinator (opsional)
      history.push("/koordinator/dashboard/verifikasiSampelKoordinator");
    } catch (err) {
      console.error("Gagal mengirim ke verifikasi kepala:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <NavbarLoginKoordinator>
      <div className="container-fluid p-4" style={{ minHeight: "calc(100vh - 160px)" }}>
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {!loading && (
          <>
            <div className="d-flex gap-2 mb-3">
              <Button onClick={() => history.goBack()}>Kembali</Button>
              <Button variant="primary" onClick={() => buildPDF(true)}>
                Download PDF
              </Button>
              {bookingData && bookingData.status !== "selesai" && (
                <Button variant="success" onClick={handleSetuju} disabled={processing}>
                  {processing ? "Mengirim..." : "Setuju"}
                </Button>
              )}
            </div>

            <div
              style={{
                width: "100%",
                minHeight: "800px",
                height: "calc(100vh - 260px)",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#f5f5f5",
              }}
            >
              {pdfUrl ? (
                <iframe
                  title="PDF Preview"
                  src={pdfUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    backgroundColor: "#fff",
                  }}
                />
              ) : (
                <div className="text-center py-5 text-muted">Tidak ada data untuk ditampilkan</div>
              )}
            </div>
          </>
        )}
      </div>

      <FooterSetelahLogin />
    </NavbarLoginKoordinator>
  );
}

// (handler implemented inside component)

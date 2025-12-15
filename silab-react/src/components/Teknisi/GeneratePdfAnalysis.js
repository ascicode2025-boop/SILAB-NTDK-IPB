import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";

export default function GeneratePdfAnalysis({ autoGenerate = true, filename = "hasil_analisis.pdf", data = null }) {
  const [pdfUrl, setPdfUrl] = useState(null);

  const instituteHeader = [
    "KEMENTERIAN RISET, TEKNOLOGI DAN PENDIDIKAN TINGGI",
    "INSTITUT PERTANIAN BOGOR",
    "FAKULTAS PETERNAKAN",
    "DEPARTEMEN ILMU NUTRISI DAN TEKNOLOGI PAKAN",
    "LABORATORIUM NUTRISI TERNAK DAGING DAN KERJA",
    "Jl. Agathis Kampus IPB Darmaga, Bogor 16680",
  ];

  const defaultData = {
    header: {
      kepada: "Kepada Yth.",
      instansi: "****",
      tempat: "Di Tempat",
      tanggal: "DD/MM/YY",
      title1: "Tabel 1. Hasil Analisis BDM, BDP, HB, PCV dan Diferensiasi Leukosit pada hewan ternak ****",
      title2: "Tabel 2. Hasil Analisis Metabolit (Glukosa, Total Protein, Albumin) pada hewan ternak Domba",
    },
    table1: [
      ["Kode", "BDM x10^6 (Butir/mm3)", "BDP x10^3 (Butir/mm3)", "HB (G%)", "PCV (%)", "Limfosit (%)", "Neutrofil (%)", "Eosinofil (%)", "Monosit (%)", "Basofil (%)"],
      ["A", 4.26, 14.3, 8.0, 28, 54.35, 26.81, 8.7, 9.42, 0.72],
      ["B", 6.53, 9.75, 10.0, 31, 51.41, 28.17, 11.27, 8.45, 0.7],
      ["A", 5.12, 16.85, 9.6, 26, 50.43, 32.48, 6.84, 9.4, 0.85],
      ["B", 5.55, 8.1, 10.2, 29, 45.97, 39.52, 8.87, 4.84, 0.81],
      ["A", 3.86, 5.65, 7.2, 18, 43.7, 37.82, 8.4, 9.24, 0.84],
      ["B", 4.53, 8.0, 7.4, 20, 52.11, 33.1, 5.63, 8.45, 0.7],
      ["A", 6.28, 7.2, 11.0, 30, 49.61, 27.13, 13.18, 9.3, 0.78],
      ["B", 4.95, 13.65, 7.8, 29, 54.07, 32.59, 5.93, 6.67, 0.74],
      ["A", 5.62, 11.35, 9.0, 26, 47.15, 31.71, 13.82, 6.5, 0.81],
      ["B", 4.9, 9.4, 6.0, 15, 49.57, 34.78, 8.7, 6.09, 0.87],
    ],
    table2: [
      ["Kode", "Glukosa (mg/dL)", "Total Protein (g/dL)", "Albumin (mg/dL)"],
      ["A", 61.31, 7.82, 3.02],
      ["B", 66.29, 6.52, 2.91],
      ["A", 55.71, 7.24, 2.76],
      ["B", 52.29, 7.79, 2.9],
      ["A", 61.31, 6.13, 2.55],
      ["B", 61.63, 6.07, 2.64],
      ["A", 54.16, 7.44, 3.03],
      ["B", 50.11, 7.01, 2.71],
      ["A", 71.59, 7.84, 2.99],
      ["B", 56.33, 8.58, 2.49],
    ],
  };

  const payload = data || defaultData;

  function buildPDF(download = false) {
    const doc = new jsPDF("p", "mm", "a4");
    const leftMargin = 14;
    let cursorY = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    /// ===== Tambahkan logo IPB =====
    const logoWidth = 43;
    const logoHeight = 30;
    const logoX = 12; // posisi dari kiri
    const logoY = 5; // posisi mendekati atas

    doc.addImage("/asset/Logo-IPB.png", "PNG", logoX, logoY, logoWidth, logoHeight);

    let headerY = 10; // mulai dekat atas halaman
    const offsetX = 15; // geser sedikit ke kanan

    doc.setFontSize(12); // ukuran font header
    doc.setFont("Times New Roman", "bold");

    instituteHeader.forEach((line) => {
      doc.text(line, pageWidth / 2 + offsetX, headerY, { align: "center" });
      headerY += 6; // jarak antar baris
    });

    cursorY = headerY + 4; // update cursorY setelah header

    // Garis pemisah
    const lineOffsetUp = 2;

    headerY -= lineOffsetUp;
    doc.setLineWidth(0.5);
    doc.line(14, headerY, pageWidth - 14, headerY);
    cursorY = headerY + 10;

    // ===== Header "Kepada Yth." =====
    doc.setFontSize(11);
    doc.setFont("Times New Roman", "400");
    doc.text(payload.header.kepada, leftMargin, cursorY);
    doc.text(`Tanggal ${payload.header.tanggal}`, 160, cursorY);
    cursorY += 6;
    doc.text(payload.header.instansi, leftMargin, cursorY);
    cursorY += 6;
    doc.text(payload.header.tempat, leftMargin, cursorY);

    cursorY += 10;

    // ===== Table 1 =====
    doc.setFontSize(12);
    doc.text(payload.header.title1, leftMargin, cursorY);
    cursorY += 6;
    const [table1Head, ...table1Body] = payload.table1;
    autoTable(doc, { startY: cursorY, head: [table1Head], body: table1Body, styles: { fontSize: 9 }, headStyles: { fillColor: [220, 220, 220] }, margin: { left: leftMargin, right: 14 } });

    let finalY = doc.lastAutoTable?.finalY || cursorY + 40;
    cursorY = finalY + 12;

    // ===== Table 2 =====
    doc.setFontSize(12);
    doc.text(payload.header.title2, leftMargin, cursorY);
    cursorY += 6;
    const [table2Head, ...table2Body] = payload.table2;
    autoTable(doc, { startY: cursorY, head: [table2Head], body: table2Body, styles: { fontSize: 9 }, headStyles: { fillColor: [220, 220, 220] }, margin: { left: leftMargin, right: 14 } });

    // ===== Preview / Download PDF =====
    if (!download) {
      const blob = doc.output("blob");

      // Revoke previous object URL if any to avoid memory leaks
      try {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      } catch (e) {
        // ignore
      }

      // Wrap blob into a File with a filename so browsers' PDF viewers
      // and download buttons can use the intended filename.
      const file = new File([blob], filename, { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return;
    }

    doc.save(filename);
  }

  useEffect(() => {
    if (autoGenerate) buildPDF(false);
  }, []);

  return (
    <NavbarLoginTeknisi>
      <div className="container-fluid p-4" style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className="row">
          <div className="col-12 d-flex flex-column">
            <div className="mb-3">
              <p>Preview PDF ditampilkan di bawah, klik tombol untuk download.</p>
              <div className="d-flex gap-2 mb-3">
                <button onClick={() => buildPDF(true)} className="btn btn-primary mb-2">
                  Download PDF
                </button>
                <button className="btn btn-secondary mb-2">
                  Kirim Ke Koordinator Lab
                </button>
              </div>
            </div>

            <div style={{ minHeight: "750px" }}>
              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="PDF Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "1px solid #ddd",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}

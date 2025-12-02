import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";

const VerifikasiSampel = () => {
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  const data = [
    { no: 1, kode: "MET-241101-002", nama: "Nadine Maulia", analisis: "Metabolit", tanggal: "1-Nov-25", status: "Selesai", nomorTelpon: "081234567890" },
    { no: 2, kode: "HEM-241102-003", nama: "Yahdillah", analisis: "Hematologi", tanggal: "2-Nov-25", status: "Menunggu Verifikasi", nomorTelpon: "081234567890" },
    { no: 3, kode: "MET-241103-004", nama: "Aryanto Pratama", analisis: "Metabolit", tanggal: "3-Nov-25", status: "Menunggu Dianalisis", nomorTelpon: "081234567890" },
    { no: 4, kode: "MET-241104-005", nama: "Putra", analisis: "Metabolit", tanggal: "4-Nov-25", status: "Selesai", nomorTelpon: "081234567890" },
    { no: 5, kode: "HEM-241105-006", nama: "Putri", analisis: "Hematologi", tanggal: "5-Nov-25", status: "Menunggu Verifikasi", nomorTelpon: "081234567890" },
    { no: 6, kode: "MET-241106-007", nama: "Ridho", analisis: "Metabolit", tanggal: "6-Nov-25", status: "Menunggu Dianalisis", nomorTelpon: "081234567890" },
  ];

  const filteredData = data.filter(
    (item) =>
      item.kode.toLowerCase().includes(search.toLowerCase()) ||
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.analisis.toLowerCase().includes(search.toLowerCase()) ||
      item.status.toLowerCase().includes(search.toLowerCase())
  );

  const history = useHistory();

  const handleSetuju = (row) => {
    setSelectedSample(row);
    setShowPopup(true);
  };

  const confirmSetuju = () => {
    console.log("Disetujui:", selectedSample);
    setShowPopup(false);
  };

  return (
    <NavbarLoginTeknisi>
      <div className="min-h-screen bg-[#eee9e6] font-poppins container py-5">

        {/* Search Bar */}
        <div className="mb-4 d-flex justify-content-center">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <input
              type="text"
              className="form-control rounded-start-pill"
              placeholder="Cari"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text rounded-end-pill bg-white">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive bg-white rounded-4 shadow p-3">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>No</th>
                <th>Kode Sampel</th>
                <th>Nama Klien</th>
                <th>Jenis Analisis</th>
                <th>Tanggal Masuk</th>
                <th>Nomor Telpon</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row) => (
                <tr key={row.no}>
                  <td>{row.no}</td>
                  <td>{row.kode}</td>
                  <td>{row.nama}</td>
                  <td>{row.analisis}</td>
                  <td>{row.tanggal}</td>
                  <td>{row.nomorTelpon}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button className="btn btn-success btn-sm" onClick={() => handleSetuju(row)}>
                        Setuju
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => history.push("/teknisi/dashboard/verifikasiSampel/alasanMenolak")}
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mt-6">
        <FooterSetelahLogin />
      </div>

      {/* Popup Setuju */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h4 className="popup-title">Konfirmasi Persetujuan</h4>
            <p className="popup-text">
              Apakah Anda yakin ingin menyetujui sampel <b>{selectedSample.kode}</b> milik{" "}
              <b>{selectedSample.nama}</b>?
            </p>

            <div className="popup-buttons">
              <button className="popup-btn-yes" onClick={confirmSetuju}>Ya, Setujui</button>
              <button className="popup-btn-no" onClick={() => setShowPopup(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
      /* Background gelap */
            .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            }

            /* Box Popup */
            .popup-box {
            width: 420px;
            background: #ffffff;
            padding: 25px;
            border-radius: 20px;
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
            animation: popupShow 0.25s ease-out;
            text-align: center;
            }

            /* Judul popup */
            .popup-title {
            font-size: 20px;
            font-weight: 600;
            color: #4b3a34;
            margin-bottom: 12px;
            }

            /* Isi */
            .popup-text {
            font-size: 15px;
            color: #4b3a34;
            margin-bottom: 20px;
            line-height: 1.5;
            }

            /* Tombol */
            .popup-buttons {
            display: flex;
            justify-content: center;
            gap: 12px;
            }

            .popup-btn-yes {
            padding: 8px 18px;
            background: #6c9a3b;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            transition: 0.2s;
            }

            .popup-btn-yes:hover {
            background: #5a832f;
            }

            .popup-btn-no {
            padding: 8px 18px;
            background: #c75050;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            transition: 0.2s;
            }

            .popup-btn-no:hover {
            background: #aa3f3f;
            }

            /* Animasi popup */
            @keyframes popupShow {
            from {
                opacity: 0;
                transform: scale(0.93);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
            }

      `}</style>
    </NavbarLoginTeknisi>
  );
};

export default VerifikasiSampel;

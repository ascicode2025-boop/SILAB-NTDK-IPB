import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
const DashboardTeknisi = () => {
  const history = useHistory();
  const [search, setSearch] = useState("");

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
      item.kode.toLowerCase().includes(search.toLowerCase()) || item.nama.toLowerCase().includes(search.toLowerCase()) || item.analisis.toLowerCase().includes(search.toLowerCase()) || item.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <NavbarLoginTeknisi>
      <div className="container py-5" style={{ background: "#f2f2f2", minHeight: "100vh" }}>
        <div className="mb-4 d-flex justify-content-center">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <input type="text" className="form-control rounded-start-pill" placeholder="Cari" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="input-group-text rounded-end-pill bg-white">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>

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
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </NavbarLoginTeknisi>
  );
};

export default DashboardTeknisi;

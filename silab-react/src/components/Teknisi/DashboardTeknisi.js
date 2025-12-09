import React, { useState, useEffect } from "react";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import { getAllBookings } from "../../services/BookingService"; 
import { Spin, message } from "antd";
import dayjs from "dayjs"; 

const DashboardTeknisi = () => {
  const [dataBookings, setDataBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllBookings();
        setDataBookings(response.data);
      } catch (error) {
        console.error(error);
        message.error("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = dataBookings.filter((item) => {
    const query = search.toLowerCase();
    const userName = item.user ? item.user.name.toLowerCase() : "";
    const kode = item.kode_sampel.toLowerCase();
    const status = item.status.toLowerCase();
    const analisis = item.jenis_analisis.toLowerCase();

    return (
      kode.includes(query) ||
      userName.includes(query) ||
      analisis.includes(query) ||
      status.includes(query)
    );
  });

 
  const getStatusBadge = (status) => {
    switch (status) {
      case "Menunggu Persetujuan":
        return "bg-warning text-dark";
      case "Disetujui":
      case "Menunggu Dianalisis":
        return "bg-primary";
      case "Selesai":
        return "bg-success";
      case "Ditolak":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <NavbarLoginTeknisi>
      <div className="container py-5" style={{ background: "#f2f2f2", minHeight: "100vh" }}>
        
        {/* Search Bar */}
        <div className="mb-4 d-flex justify-content-center">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <input
              type="text"
              className="form-control rounded-start-pill"
              placeholder="Cari Kode / Nama / Status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text rounded-end-pill bg-white">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="table-responsive bg-white rounded-4 shadow p-3">
          <Spin spinning={loading} tip="Memuat data...">
            <table className="table table-bordered align-middle text-center table-hover">
              <thead className="table-light">
                <tr>
                  <th>No</th>
                  <th>Kode Sampel</th>
                  <th>Nama Klien</th>
                  <th>Jenis Analisis</th>
                  <th>Tanggal Kirim</th>
                  <th>Status</th>
                </tr>
              </thead>
              
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td className="fw-bold">{row.kode_sampel}</td>
                      <td>{row.user ? row.user.name : "Guest"}</td>
                      <td>{row.jenis_analisis}</td>
                      <td>{dayjs(row.tanggal_kirim).format("DD MMM YYYY")}</td>
                      
                      {/* Status Badge */}
                      <td>
                        <span className={`badge ${getStatusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      {loading ? "Sedang memuat..." : "Tidak ada data ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Spin>
        </div>
      </div>
    </NavbarLoginTeknisi>
  );
};

export default DashboardTeknisi;
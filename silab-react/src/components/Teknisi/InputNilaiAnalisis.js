  import React, { useEffect, useState } from "react";
  import { useHistory } from "react-router-dom";
  import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
  import FooterSetelahLogin from "../FooterSetelahLogin";
  import { getAllBookings } from "../../services/BookingService";
  import { Button, Spin } from "antd";
  import "@fontsource/poppins";

  function InputNilaiAnalisis() {
    const [approvedSamples, setApprovedSamples] = useState([]);
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    useEffect(() => {
      fetchData();
    }, []);

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllBookings();
        const allBookings = data?.data || [];
        const approved = allBookings.filter((booking) => booking.status === "Disetujui");
        setApprovedSamples(approved);
      } catch (error) {
        console.error("Failed to fetch approved samples", error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <NavbarLoginTeknisi>
        <div
          className="p-4"
          style={{
            minHeight: "100vh",
            backgroundColor: "#f1f1f1",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <div className="container-fluid">
            <h4 className="fw-semibold mb-3">Sampel yang Disetujui ✔️</h4>

            <div className="card shadow-sm p-3" style={{ borderRadius: "12px" }}>
              {loading ? (
                <div className="text-center py-4">
                  <Spin />
                </div>
              ) : approvedSamples.length === 0 ? (
                <p className="text-muted">Belum ada sampel yang disetujui.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered" style={{ background: "white", borderRadius: "10px" }}>
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Kode Sampel</th>
                        <th>Nama Kien</th>
                        <th>Jenis Analisis</th>
                        <th>Analisis Item</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {approvedSamples.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.kode_sampel || "-"}</td>
                          <td>{item.user?.name || "-"}</td>
                          <td>{item.jenis_analisis || "-"}</td>
                          <td>{Array.isArray(item.analysis_items) && item.analysis_items.length > 0 ? item.analysis_items.map((analysisItem) => analysisItem.nama_item).join(", ") : "Tidak ada data"}</td>
                          <td>
                            <span className="badge bg-success">Disetujui</span>
                          </td>

                          <td>
                            <Button type="primary" style={{ backgroundColor: "#4A89F3" }} onClick={() => history.push(`/teknisi/dashboard/inputNilaiAnalisis/input-analisis/${item.id}`)}>
                              Input Nilai
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <FooterSetelahLogin />
      </NavbarLoginTeknisi>
    );
  }

  export default InputNilaiAnalisis;

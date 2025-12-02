import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { Modal, Button } from "react-bootstrap";

export default function AlasanMenolak() {
  const [alasan, setAlasan] = useState("");

  // Modal states
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Saat klik tombol simpan
  const handleSaveClick = () => {
    if (!alasan.trim()) {
      setShowEmptyModal(true); // tampilkan popup kosong
    } else {
      setShowConfirmModal(true); // tampilkan popup konfirmasi
    }
  };

  // Konfirmasi simpan
  const handleConfirm = () => {
    setShowConfirmModal(false);
    setShowSuccessModal(true); // tampilkan popup sukses
  };

  return (
    <NavbarLoginTeknisi>
      <div className="min-h-screen bg-[#eee9e6] font-poppins container py-5 justify-content-center d-flex">
        <div className="card shadow-lg p-0" style={{ width: "650px", borderRadius: "25px" }}>
          <div
            className="card-header text-center text-white"
            style={{
              background: "#4b3a34",
              borderTopLeftRadius: "25px",
              borderTopRightRadius: "25px",
            }}
          >
            <h5 className="m-2">Alasan Penolakan Sampel</h5>
          </div>

          <div
            className="card-body"
            style={{
              background: "#e7e7e7",
              borderBottomLeftRadius: "25px",
              borderBottomRightRadius: "25px",
            }}
          >
            <textarea
              className="form-control mb-4"
              rows="6"
              placeholder="Masukkan alasan penolakan..."
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              style={{
                resize: "none",
                background: "white",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            ></textarea>

            <div className="d-flex justify-content-center">
              <button className="btn text-white px-4 py-2" style={{ background: "#8e6b60", borderRadius: "25px" }} onClick={handleSaveClick}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="w-full max-w-6xl mt-6">
        <FooterSetelahLogin />
      </div>
      <Modal show={showEmptyModal} onHide={() => setShowEmptyModal(false)} centered dialogClassName="custom-popup">
        <div className="popup-body">
          <div className="popup-icon error">✖</div>
          <div className="popup-title">Alasan Tidak Boleh Kosong</div>
          <div className="popup-message">Silakan isi alasan penolakan terlebih dahulu.</div>

          <button className="popup-button" onClick={() => setShowEmptyModal(false)}>
            Tutup
          </button>
        </div>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered dialogClassName="custom-popup">
        <div className="popup-body">
          <div className="popup-icon" style={{ background: "#6c5b4c" }}>
            ?
          </div>

          <div className="popup-title">Konfirmasi Penolakan</div>

          <div className="popup-message">Apakah Anda yakin ingin menyimpan alasan berikut?</div>

          <div
            className="p-3 mb-3 rounded"
            style={{
              background: "#f8f8f8",
              border: "1px solid #ddd",
              textAlign: "left",
            }}
          >
            {alasan}
          </div>

          <div className="d-flex justify-content-center gap-3">
            <button className="popup-button" style={{ background: "#a0a0a0" }} onClick={() => setShowConfirmModal(false)}>
              Batal
            </button>

            <button className="popup-button" onClick={handleConfirm}>
              Konfirmasi
            </button>
          </div>
        </div>
      </Modal>
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered dialogClassName="custom-popup">
        <div className="popup-body">
          <div className="popup-icon success">✔</div>

          <div className="popup-title">Berhasil Disimpan</div>

          <div className="popup-message">Alasan penolakan sampel berhasil disimpan.</div>

          <button className="popup-button" onClick={() => setShowSuccessModal(false)}>
            Tutup
          </button>
        </div>
      </Modal>

      <style>{`
             .custom-popup .modal-content {
                border-radius: 25px !important;
                padding: 0;
                overflow: hidden;
                animation: fadeIn 0.25s ease-in-out;
                }

                .popup-body {
                text-align: center;
                padding: 25px;
                background: #ffffff;
                }

                .popup-icon {
                font-size: 65px;
                width: 95px;
                height: 95px;
                margin: 10px auto 15px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                }

                .popup-icon.success {
                background: #4caf50;
                box-shadow: 0px 4px 12px rgba(76, 175, 80, 0.5);
                }

                .popup-icon.error {
                background: #e53935;
                box-shadow: 0px 4px 12px rgba(229, 57, 53, 0.5);
                }

                .popup-title {
                font-size: 22px;
                font-weight: 600;
                margin-bottom: 10px;
                }

                .popup-message {
                font-size: 16px;
                margin-bottom: 25px;
                }

                .popup-button {
                background: #8e6b60;
                border: none;
                color: white;
                padding: 10px 25px;
                font-size: 15px;
                border-radius: 15px;
                cursor: pointer;
                }

                .popup-button:hover {
                background: #6e5148;
                }

                @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
                }

             `}</style>
    </NavbarLoginTeknisi>
  );
}

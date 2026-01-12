import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

// --- IMPORT COMPONENT ---
import NavbarLandingPage from "./components/NavbarLandingPage";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Profile from "./components/Profile";
import DaftarAnalisis from "./components/DaftarAnalisis";
import Dashboard from "./components/Klien/Dashboard"; // Dashboard Klien
import ForgetPassword from "./components/ForgetPassword";
import Galeri from "./components/Galeri";
import PanduanSampel from "./components/PanduanSampel";
import PrivateRoute from "./components/PrivateRoute"; // Pastikan file ini sudah diupdate dengan logika Role!
import PopupProvider from "./components/Common/PopupProvider";

// --- IMPORT FITUR DASHBOARD KLIEN ---
import PanduanSampelKlien from "./components/Klien/PanduanSampelKlien";
import BookingCalenderKlien from "./components/Klien/BookingCalenderKlien";
import PemesananSampelKlien from "./components/Klien/PemesananSampelKlien";
import Metabolit from "./components/Klien/Metabolit";
import Hematologi from "./components/Klien/Hematologi";
import HematologiDanMetabolit from "./components/Klien/HematologiDanMetabolit";
import MenungguPersetujuan from "./components/Klien/MenungguPersetujuan";
import ProsesAnalisis from "./components/Klien/ProsesAnalisis";
import ProfileAkunKlien from "./components/Klien/ProfileAkunKlien";
import EditProfileKlien from "./components/Klien/EditProfileKlien";
import DaftarAnalisisLogin from "./components/Klien/DaftarAnalisisLogin";
import PembayaranKlien from "./components/Klien/PembayaranKlien";
import RiwayatAnalisisKlien from "./components/Klien/RiwayatAnalisisKlien";

// --- IMPORT FITUR DASHBOARD TEKNISI ---
import DashboardTeknisi from "./components/Teknisi/DashboardTeknisi";
import AturTanggalTeknisi from "./components/Teknisi/AturTanggalTeknisi";
import JadwalSampel from "./components/Teknisi/JadwalSampel";
import VerifikasiSampel from "./components/Teknisi/VerifikasiSampel";
import AlasanMenolak from "./components/Teknisi/AlasanMenolak";
import InputNilaiAnalisis from "./components/Teknisi/InputNilaiAnalisis";
import FormInputNilaiAnalisis from "./components/Teknisi/FormInputNilaiAnalisis";
import GeneratePdfAnalysis from "./components/Teknisi/GeneratePdfAnalysis";
import ProfileAkunTeknisi from "./components/Teknisi/ProfileAkunTeknisi";
import EditProfileTeknisi from "./components/Teknisi/EditProfileTeknisi";

// --- IMPORT FITUR DASHBOARD Koordinator ---
import DashboardKoordinator from "./components/Koordinator/DashboardKoordinator";
import VerifikasiSampelKoordinator from "./components/Koordinator/VerifikasiSampelKoordinator";
import LihatHasilPdfKoordinator from "./components/Koordinator/LihatHasilPdfKoordinator";
import TandaTanganKoordinator from "./components/Koordinator/TandaTanganKoordinator"; 
import ManajemenPembayaran from "./components/Koordinator/ManajemenPembayaran";
import LaporanKoordinator from "./components/Koordinator/LaporanKoordinator";
import ManajemenAkun from "./components/Koordinator/ManajemenRole";
import ProfileAkunKoordinator from "./components/Koordinator/ProfileAkunKoordinator";
import EditProfileKoordinator from "./components/Koordinator/EditProfileKoordinator";

// --- IMPORT FITUR DASHBOARD Kepala ---
import LaporanKepala from "./components/Kepala/LaporanKepala";
import DashboardKepala from "./components/Kepala/DashboardKepala";
import VerifikasiKepala from "./components/Kepala/VerifikasiKepala";
import LihatHasilPdfKepala from "./components/Kepala/LihatHasilPdfKepala";
import ProfileAkunKepala from "./components/Kepala/ProfileAkunKepala";
import EditProfileKepala from "./components/Kepala/EditProfileKepala";

// ====================================================================
// 1. Layout dengan Navbar (Untuk Landing Page - PUBLIK)
// ====================================================================
function AppLayoutWithNavbar() {
  return (
    <>
      <NavbarLandingPage />
      <Switch>
        {/* Semua di sini bisa diakses TANPA Login */}
        <Route path="/landingPage" component={LandingPage} />
        <Route path="/profile" component={Profile} />
        <Route path="/daftarAnalisis" component={DaftarAnalisis} />
        <Route path="/galeri" component={Galeri} />
        <Route path="/panduanSampel" component={PanduanSampel} />
        <Redirect exact from="/" to="/LandingPage" />
      </Switch>
    </>
  );
}

// ====================================================================
// 2. Layout TANPA Navbar Landing Page (Login & Dashboard - PROTECTED)
// ====================================================================
function AppLayoutWithoutNavbar() {
  return (
    <Switch>
      {/* Alias route untuk /teknisi/dashboard/riwayat agar menampilkan RiwayatAnalisisTeknisi */}
      <PrivateRoute path="/teknisi/dashboard/riwayat" component={require("./components/Teknisi/RiwayatAnalisisTeknisi").default} allowedRoles={["teknisi"]} />
      {/* --- HALAMAN AKSES PUBLIK (Login/Register) --- */}
      {/* Tetap Route biasa, karena user belum login di sini */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgetPassword" component={ForgetPassword} />

      {/* --- DASHBOARD INTERNAL (WAJIB LOGIN + CEK ROLE) --- */}

      {/* 1. Koordinator (Hanya role 'koordinator' yang boleh masuk) */}
      <PrivateRoute path="/koordinator/dashboard/profile/edit" component={EditProfileKoordinator} allowedRoles={["koordinator"]} />
      <PrivateRoute path="/koordinator/dashboard/profile" component={ProfileAkunKoordinator} allowedRoles={["koordinator"]} />
      <PrivateRoute path="/koordinator/dashboard/manajemenAkun" component={ManajemenAkun} allowedRoles={["koordinator"]} />
      <PrivateRoute path="/koordinator/dashboard/laporanKoordinator" component={LaporanKoordinator} allowedRoles={["koordinator"]} />
      <PrivateRoute path="/koordinator/dashboard/tandaTanganKoordinator" component={TandaTanganKoordinator} allowedRoles={["koordinator"]} />
      <PrivateRoute path="/koordinator/dashboard/manajemenPembayaran" component={ManajemenPembayaran} allowedRoles={["koordinator"]} />
      <PrivateRoute path="/koordinator/dashboard/verifikasiSampelKoordinator/lihatHasilPdfKoordinator/:id" component={LihatHasilPdfKoordinator} allowedRoles={["koordinator"]} />
      <PrivateRoute path="/koordinator/dashboard/verifikasiSampelKoordinator" component={VerifikasiSampelKoordinator} allowedRoles={["koordinator"]} />
      <PrivateRoute path="/koordinator/dashboard" component={DashboardKoordinator} allowedRoles={["koordinator"]} />

      {/* 2. Kepala (Hanya role 'kepala' yang boleh masuk) */}
      <PrivateRoute path="/kepala/dashboard/verifikasiKepala/lihatHasilPdfKepala/:id" component={LihatHasilPdfKepala} allowedRoles={["kepala"]} />
      <PrivateRoute path="/kepala/dashboard/profile/edit" component={EditProfileKepala} allowedRoles={["kepala"]} />
      <PrivateRoute path="/kepala/dashboard/profile" component={ProfileAkunKepala} allowedRoles={["kepala"]} />
      <PrivateRoute path="/kepala/dashboard/verifikasiKepala" component={VerifikasiKepala} allowedRoles={["kepala"]} />
      <PrivateRoute path="/kepala/dashboard/laporanKepala" component={LaporanKepala} allowedRoles={["kepala"]} />
      <PrivateRoute path="/kepala/dashboard" component={DashboardKepala} allowedRoles={["kepala"]} />

      {/* 3. Teknisi (Hanya role 'teknisi' yang boleh masuk) */}
      <PrivateRoute path="/teknisi/dashboard/generatePdfAnalysis" component={GeneratePdfAnalysis} allowedRoles={["teknisi"]} />
      <PrivateRoute path="/teknisi/dashboard/inputNilaiAnalisis/input-analisis/:id" component={FormInputNilaiAnalisis} allowedRoles={["teknisi"]} />
      <PrivateRoute path="/teknisi/dashboard/inputNilaiAnalisis" component={InputNilaiAnalisis} allowedRoles={["teknisi"]} />
      <PrivateRoute path="/teknisi/dashboard/verifikasiSampel/alasanMenolak" component={AlasanMenolak} allowedRoles={["teknisi"]} />
      <PrivateRoute path="/teknisi/dashboard/verifikasiSampel" component={VerifikasiSampel} allowedRoles={["teknisi"]} />
      <PrivateRoute path="/teknisi/dashboard/jadwalSampel" component={JadwalSampel} allowedRoles={["teknisi"]} />
      <PrivateRoute path="/teknisi/dashboard/aturTanggalTeknisi" component={AturTanggalTeknisi} allowedRoles={["teknisi"]} />
      <PrivateRoute path="/teknisi/dashboard/profile/edit" component={EditProfileTeknisi} allowedRoles={["teknisi"]} />
      <PrivateRoute path="/teknisi/dashboard/profile" component={ProfileAkunTeknisi} allowedRoles={["teknisi"]} />
      {/* Route baru untuk Riwayat Analisis Teknisi */}
      <PrivateRoute path="/teknisi/dashboard/riwayat-analisis" component={require("./components/Teknisi/RiwayatAnalisisTeknisi").default} allowedRoles={["teknisi"]} />
      <PrivateRoute path="/teknisi/dashboard" component={DashboardTeknisi} allowedRoles={["teknisi"]} />

      {/* 4. Klien / Umum (Hanya role 'klien' yang boleh masuk) */}
      {/* Saya tambahkan pembatasan 'klien' agar teknisi tidak salah masuk ke sini */}

      <PrivateRoute path="/dashboard/riwayatAnalisisKlien" component={RiwayatAnalisisKlien} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/pembayaranKlien" component={PembayaranKlien} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/prosesAnalisis" component={ProsesAnalisis} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/menungguPersetujuan" component={MenungguPersetujuan} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/pemesananSampelKlien/hematologiDanMetabolit" component={HematologiDanMetabolit} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/pemesananSampelKlien/hematologi" component={Hematologi} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/pemesananSampelKlien/metabolit" component={Metabolit} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/pemesananSampelKlien" component={PemesananSampelKlien} allowedRoles={["klien"]} />

      <PrivateRoute path="/dashboard/panduanSampelKlien" component={PanduanSampelKlien} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/daftarAnalisisLogin" component={DaftarAnalisisLogin} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/bookingCalenderKlien" component={BookingCalenderKlien} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/ProfileAkunKlien/EditProfileKlien" component={EditProfileKlien} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard/ProfileAkunKlien" component={ProfileAkunKlien} allowedRoles={["klien"]} />
      {/* Halaman Utama Dashboard Klien */}
      <PrivateRoute path="/dashboard-klien" component={Dashboard} allowedRoles={["klien"]} />
      <PrivateRoute path="/dashboard" component={Dashboard} allowedRoles={["klien"]} />
    </Switch>
  );
}

// ====================================================================
// 3. Main App Router
// ====================================================================
function App() {
  return (
    <Router>
      <PopupProvider />
      <Switch>
        {/* A. Rute yang masuk ke Layout Tanpa Navbar (Login & Dashboard) */}
        <Route path="/login" component={AppLayoutWithoutNavbar} />
        <Route path="/register" component={AppLayoutWithoutNavbar} />
        <Route path="/forgetPassword" component={AppLayoutWithoutNavbar} />

        {/* Group Dashboard berdasarkan Role */}
        <Route path="/teknisi" component={AppLayoutWithoutNavbar} />
        <Route path="/koordinator" component={AppLayoutWithoutNavbar} />
        <Route path="/kepala" component={AppLayoutWithoutNavbar} />
        <Route path="/dashboard" component={AppLayoutWithoutNavbar} />

        {/* B. Sisanya masuk ke Layout DENGAN Navbar (Landing Page) */}
        <Route component={AppLayoutWithNavbar} />
      </Switch>
    </Router>
  );
}

export default App;

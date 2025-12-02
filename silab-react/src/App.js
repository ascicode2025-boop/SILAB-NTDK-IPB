import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
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
// --- FITUR DASHBOARD KLIEN ---
import PanduanSampelKlien from "./components/Klien/PanduanSampelKlien";
import BookingCalenderKlien from "./components/Klien/BookingCalenderKlien";
import PemesananSampelKlien from "./components/Klien/PemesananSampelKlien";
import Metabolit from "./components/Klien/Metabolit";
import Hematologi from "./components/Klien/Hematologi";
import HematologiDanMetabolit from "./components/Klien/HematologiDanMetabolit";
import MenungguPersetujuan from "./components/Klien/MenungguPersetujuan";
import ProsesAnalisis from "./components/Klien/ProsesAnalisis";

// --- FITUR DASHBOARD Teknisi ---
import DashboardTeknisi from './components/Teknisi/DashboardTeknisi';
import AturTanggalTeknisi from "./components/Teknisi/AturTanggalTeknisi";
import JadwalSampel from "./components/Teknisi/JadwalSampel";
import VerifikasiSampel from "./components/Teknisi/VerifikasiSampel";
import AlasanMenolak from "./components/Teknisi/AlasanMenolak";

// --- PERBAIKAN IMPORT (Sesuai Screenshot Terbaru) ---
// Folder: Huruf Besar (Teknisi, Koordinator, Kepala)
// File: DashboardTeknisi.js, DashboardKoordinator.js, DashboardKepala.js

import DashboardKoordinator from './components/Koordinator/DashboardKoordinator';
import DashboardKepala from './components/Kepala/DashboardKepala';

// 1. Layout dengan Navbar (Untuk Landing Page)
function AppLayoutWithNavbar() {
  return (
    <>
      <NavbarLandingPage />
      <Switch>
        <Route path="/landingPage" component={LandingPage} />
        <Route path="/profile" component={Profile} />
        <Route path="/daftarAnalisis" component={DaftarAnalisis} />
        <Route path="/galeri" component={Galeri} />
        <Route path="/panduanSampel" component={PanduanSampel} />
        <Route path="/" component={LandingPage} />
      </Switch>
    </>
  );
}

// 2. Layout TANPA Navbar Landing Page (Untuk Login & Dashboard)
function AppLayoutWithoutNavbar() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgetPassword" component={ForgetPassword} />

      {/* --- DASHBOARD KHUSUS PERAN (Internal) --- */}
      {/* Path URL menggunakan huruf kecil agar sesuai dengan LoginPage.js */}
      
      <Route path="/koordinator/dashboard" component={DashboardKoordinator} />
      <Route path="/kepala/dashboard" component={DashboardKepala} />

      {/* --- FITUR DASHBOARD Teknisi --- */}

      <Route path="/teknisi/dashboard/verifikasiSampel/alasanMenolak" component={AlasanMenolak} />
      <Route path="/teknisi/dashboard/verifikasiSampel" component={VerifikasiSampel} />
      <Route path="/teknisi/dashboard/jadwalSampel" component={JadwalSampel} />
      <Route path="/teknisi/dashboard/aturTanggalTeknisi" component={AturTanggalTeknisi} />
      <Route path="/teknisi/dashboard" component={DashboardTeknisi} />

      {/* --- FITUR DASHBOARD KLIEN --- */}
      <Route path="/dashboard/prosesAnalisis" component={ProsesAnalisis} />
      <Route path="/dashboard/menungguPersetujuan" component={MenungguPersetujuan} />
      <Route path="/dashboard/pemesananSampelKlien/hematologiDanMetabolit" component={HematologiDanMetabolit} />
      <Route path="/dashboard/pemesananSampelKlien/hematologi" component={Hematologi} />
      <Route path="/dashboard/pemesananSampelKlien/metabolit" component={Metabolit} />
      <Route path="/dashboard/pemesananSampelKlien" component={PemesananSampelKlien} />
      <Route path="/dashboard/panduanSampelKlien" component={PanduanSampelKlien} />
      <Route path="/dashboard/bookingCalenderKlien" component={BookingCalenderKlien} />

      {/* Dashboard Klien Default */}
      <Route path="/dashboard-klien" component={Dashboard} /> 
      <Route path="/dashboard" component={Dashboard} />
    </Switch>
  );
}

function App() {
  return (
    <Router>
      <Switch>
        {/* A. Rute Tanpa Navbar Landing Page */}
        <Route path="/login" component={AppLayoutWithoutNavbar} />
        <Route path="/register" component={AppLayoutWithoutNavbar} />
        <Route path="/forgetPassword" component={AppLayoutWithoutNavbar} />
        
        {/* Tangkap URL Dashboard Role agar masuk ke layout tanpa navbar */}
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
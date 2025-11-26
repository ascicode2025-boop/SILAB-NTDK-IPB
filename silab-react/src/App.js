import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import NavbarLandingPage from "./components/NavbarLandingPage";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Profile from "./components/Profile";
import DaftarAnalisis from "./components/DaftarAnalisis";
import Dashboard from "./components/Klien/Dashboard";
import ForgetPassword from "./components/ForgetPassword";
import Galeri from "./components/Galeri";
import PanduanSampel from "./components/PanduanSampel";
import PanduanSampelKlien from "./components/Klien/PanduanSampelKlien";
import BookingCalenderKlien from "./components/Klien/BookingCalenderKlien";
import PemesananSampelKlien from "./components/Klien/PemesananSampelKlien";
import Metabolit from "./components/Klien/Metabolit";
import Hematologi from "./components/Klien/Hematologi";
import HematologiDanMetabolit from "./components/Klien/HematologiDanMetabolit";
import MenungguPersetujuan from "./components/Klien/MenungguPersetujuan";
import ProsesAnalisis from "./components/Klien/ProsesAnalisis";

// Komponen pembungkus untuk halaman yang menampilkan navbar
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

// Komponen pembungkus untuk halaman tanpa navbar (login, register, dashboard)
function AppLayoutWithoutNavbar() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgetPassword" component={ForgetPassword} />

      {/* Urutan route paling spesifik → paling umum */}
      <Route path="/dashboard/prosesAnalisis" component={ProsesAnalisis} />
      <Route path="/dashboard/menungguPersetujuan" component={MenungguPersetujuan} />
      <Route path="/dashboard/pemesananSampelKlien/hematologiDanMetabolit" component={HematologiDanMetabolit} />
      <Route path="/dashboard/pemesananSampelKlien/hematologi" component={Hematologi} />
      <Route path="/dashboard/pemesananSampelKlien/metabolit" component={Metabolit} />
      <Route path="/dashboard/pemesananSampelKlien" component={PemesananSampelKlien} />
      <Route path="/dashboard/panduanSampelKlien" component={PanduanSampelKlien} />
      <Route path="/dashboard/bookingCalenderKlien" component={BookingCalenderKlien} />

      <Route path="/dashboard" component={Dashboard} />
    </Switch>
  );
}


function App() {
  return (
    <Router>
      <Switch>
        {/* Routes tanpa navbar */}
        <Route path="/dashboard" component={AppLayoutWithoutNavbar} />
        <Route path="/login" component={AppLayoutWithoutNavbar} />
        <Route path="/register" component={AppLayoutWithoutNavbar} />
        <Route path="/forgetPassword" component={AppLayoutWithoutNavbar} />
        {/* Routes dengan navbar */}
        <Route component={AppLayoutWithNavbar} />
      </Switch>
    </Router>
  );
}

export default App;

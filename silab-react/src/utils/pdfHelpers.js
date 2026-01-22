// Helper functions untuk format data ke PDF

// Fungsi untuk mendapatkan tanggal WIB (UTC+7) yang terupdate
export const getWIBDate = (dateInput = null) => {
  // Jika tidak ada input, gunakan waktu sekarang
  const date = dateInput ? new Date(dateInput) : new Date();

  // Konversi ke WIB (UTC+7)
  const wibOffset = 7 * 60; // WIB adalah UTC+7 dalam menit
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + wibOffset * 60000);

  return wibDate;
};

// Fungsi untuk format tanggal ke format Indonesia (DD/MM/YYYY) dengan WIB
export const formatTanggalWIB = (dateInput = null) => {
  const wibDate = getWIBDate(dateInput);

  const day = String(wibDate.getDate()).padStart(2, "0");
  const month = String(wibDate.getMonth() + 1).padStart(2, "0");
  const year = wibDate.getFullYear();

  return `${day}/${month}/${year}`;
};

// Fungsi untuk format tanggal lengkap dengan hari (Senin, 21 Januari 2026) dengan WIB
export const formatTanggalLengkapWIB = (dateInput = null) => {
  const wibDate = getWIBDate(dateInput);

  const hariNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const hari = hariNames[wibDate.getDay()];
  const tanggal = wibDate.getDate();
  const bulan = bulanNames[wibDate.getMonth()];
  const tahun = wibDate.getFullYear();

  return `${hari}, ${tanggal} ${bulan} ${tahun}`;
};

export const formatDataForPDF = (booking) => {
  let headerTitle2 = "";
  let headerTitle1 = "";
  if (!booking || !booking.analysis_items) {
    console.warn("No booking or analysis_items found");
    return null;
  }

  console.log("Formatting PDF for booking:", booking);
  console.log("Analysis items:", booking.analysis_items);

  const codes = parseKodeSampel(booking.kode_sampel);
  console.log("Sample codes:", codes);

  // Pisahkan items berdasarkan kategori yang ADA di data
  const hematologiItems = {};
  const metabolitItems = {};
  const availableHematologiParams = new Set();
  const availableMetabolitParams = new Set();

  booking.analysis_items.forEach((item) => {
    const itemName = item.nama_item;
    const hasil = item.hasil || "";

    console.log(`Processing item: ${itemName}, hasil: "${hasil}"`);

    if (!hasil || hasil.trim() === "") {
      console.log(`Skipping ${itemName} - no hasil`);
      return;
    }

    // Parse hasil per kode sampel
    const resultParts = hasil.split(" | ");
    resultParts.forEach((part) => {
      const match = part.match(/\[(.*?)\]:\s*(.*)/);
      if (!match) return;

      const code = match[1];
      const value = match[2];

      // Extract HASIL dari format baru (INPUT=x HASIL=y unit)
      const hasilMatch = value.match(/HASIL=([\d.]+)/);
      const displayValue = hasilMatch ? hasilMatch[1] : value.split(" ")[0];

      // Kategorisasi berdasarkan nama item
      const itemNameLower = (itemName || "").toLowerCase();
      if (itemName === "BDM") {
        if (!hematologiItems[code]) hematologiItems[code] = {};
        hematologiItems[code].BDM = displayValue;
        availableHematologiParams.add("BDM");
      } else if (itemName === "BDP") {
        if (!hematologiItems[code]) hematologiItems[code] = {};
        hematologiItems[code].BDP = displayValue;
        availableHematologiParams.add("BDP");
      } else if (itemName === "Hemoglobin Darah") {
        if (!hematologiItems[code]) hematologiItems[code] = {};
        hematologiItems[code].HB = displayValue;
        availableHematologiParams.add("HB");
      } else if (itemNameLower.includes("hematokrit") || itemNameLower === "pcv") {
        // Always use label 'PCV' for Hematokrit/PCV parameter
        if (!hematologiItems[code]) hematologiItems[code] = {};
        const label = "PCV";
        hematologiItems[code][label] = displayValue;
        availableHematologiParams.add(label);
      } else if (itemName === "Diferensiasi Leukosit") {
        if (!hematologiItems[code]) hematologiItems[code] = {};
        // Parse diferensiasi: "Lim:54.35%, Het:26.81%, Eos:8.7%, Mon:9.42%, Bas:0.72%"
        const limMatch = value.match(/Lim:([\d.]+)/);
        const hetMatch = value.match(/Het:([\d.]+)/);
        const eosMatch = value.match(/Eos:([\d.]+)/);
        const monMatch = value.match(/Mon:([\d.]+)/);
        const basMatch = value.match(/Bas:([\d.]+)/);

        if (limMatch) {
          hematologiItems[code].Limfosit = limMatch[1];
          availableHematologiParams.add("Limfosit");
        }
        if (hetMatch) {
          hematologiItems[code].Heterofil = hetMatch[1];
          availableHematologiParams.add("Heterofil");
        }
        if (eosMatch) {
          hematologiItems[code].Eosinofil = eosMatch[1];
          availableHematologiParams.add("Eosinofil");
        }
        if (monMatch) {
          hematologiItems[code].Monosit = monMatch[1];
          availableHematologiParams.add("Monosit");
        }
        if (basMatch) {
          hematologiItems[code].Basofil = basMatch[1];
          availableHematologiParams.add("Basofil");
        }
      }
      // Metabolit items
      else if (["Glukosa", "Total Protein", "Albumin", "Kolestrol", "Trigliserida", "Urea/BUN", "Kreatinin", "Kalsium", "HDL-kol", "LDL-kol", "Asam Urat", "SGOT", "SGPT"].includes(itemName)) {
        if (!metabolitItems[code]) metabolitItems[code] = {};
        // Extract HASIL dari format baru, fallback ke format lama
        const hasilMatch = value.match(/HASIL=([\d.]+)/);
        const cleanValue = hasilMatch ? hasilMatch[1] : value.split(" ")[0];
        metabolitItems[code][itemName] = cleanValue;
        availableMetabolitParams.add(itemName);
      }
    });
  });

  console.log("Available Hematologi Params:", Array.from(availableHematologiParams));
  console.log("Available Metabolit Params:", Array.from(availableMetabolitParams));
  console.log("Hematologi Items:", hematologiItems);
  console.log("Metabolit Items:", metabolitItems);

  // Build dynamic table headers and rows
  const jenisHewan = booking.jenis_hewan || "****";

  // Build table1 (Hematologi) - hanya jika ada data
  let table1 = null;
  if (availableHematologiParams.size > 0) {
    // Urutan dan label parameter sesuai gambar
    const hematologiParamOrder = ["BDM", "BDP", "HB", "PCV", "Limfosit", "Heterofil", "Eosinofil", "Monosit", "Basofil"];
    // Mapping label sesuai gambar / sesuai nama yang dipesan klien
    const headerMap = {
      BDM: "BDM",
      BDP: "BDP",
      HB: "HB",
      PCV: "PCV",
      Limfosit: "Limfosit (%)",
      Heterofil: "Neutrofil (%)",
      Eosinofil: "Eosinofil (%)",
      Monosit: "Monosit (%)",
      Basofil: "Basofil (%)",
    };
    // Filter hanya parameter yang valid dan ada di headerMap
    const activeHematologiParams = hematologiParamOrder.filter((p) => availableHematologiParams.has(p) && headerMap[p]);
    const table1Header = ["No", "Kode", ...activeHematologiParams.map((p) => headerMap[p])];
    const table1Rows = codes.map((code, idx) => {
      const data = hematologiItems[code] || {};
      return [idx + 1, code, ...activeHematologiParams.map((p) => data[p] || "-")];
    });
    // Build parameter analisis string for title
    const paramStr = activeHematologiParams.map((p) => (headerMap[p] || p).replace(" (%)", "")).join(", ");
    let diffStr = "";
    if (
      activeHematologiParams.includes("Limfosit") ||
      activeHematologiParams.includes("Heterofil") ||
      activeHematologiParams.includes("Eosinofil") ||
      activeHematologiParams.includes("Monosit") ||
      activeHematologiParams.includes("Basofil")
    ) {
      diffStr = " dan Differensiasi Leukosit";
    }
    table1 = [table1Header, ...table1Rows];
    // Update title1 to match requested format
    headerTitle1 = `Tabel 1. Hasil Analisis ${paramStr}${diffStr} pada hewan ternak ${jenisHewan}`;
  }

  // Build table2 (Metabolit) - hanya jika ada data
  let table2 = null;
  if (availableMetabolitParams.size > 0) {
    const metabolitParamOrder = ["Glukosa", "Total Protein", "Albumin", "Kolestrol", "Trigliserida", "Urea/BUN", "Kreatinin", "Kalsium", "HDL-kol", "LDL-kol", "Asam Urat", "SGOT", "SGPT"];
    const activeMetabolitParams = metabolitParamOrder.filter((p) => availableMetabolitParams.has(p));

    // Build header with units
    const headerMap = {
      Glukosa: "Glukosa",
      "Total Protein": "Total Protein",
      Albumin: "Albumin",
      Kolestrol: "Kolestrol",
      Trigliserida: "Trigliserida",
      "Urea/BUN": "Urea/BUN",
      Kreatinin: "Kreatinin",
      Kalsium: "Kalsium",
      "HDL-kol": "HDL-kol",
      "LDL-kol": "LDL-kol",
      "Asam Urat": "Asam Urat",
      SGOT: "SGOT",
      SGPT: "SGPT",
    };

    const table2Header = ["No", "Kode", ...activeMetabolitParams.map((p) => headerMap[p] || p)];
    const table2Rows = codes.map((code, index) => {
      const data = metabolitItems[code] || {};
      return [index + 1, code, ...activeMetabolitParams.map((p) => data[p] || "-")];
    });
    // Build parameter analisis string for title2
    const paramStr2 = activeMetabolitParams.map((p) => headerMap[p]).join(", ");
    table2 = [table2Header, ...table2Rows];
    headerTitle2 = `Tabel 2. Hasil Analisis ${paramStr2} pada hewan ternak ${jenisHewan}`;
  }

  // Determine parameter analisis dari booking
  const parameterAnalisis = booking.jenis_analisis || (table1 && table2 ? "Hematologi dan Metabolit" : table1 ? "Hematologi" : table2 ? "Metabolit" : "****");

  // Tanggal PDF selalu menggunakan tanggal HARI INI (saat PDF di-generate) dengan timezone WIB
  const tanggalDisplay = formatTanggalWIB(); // Tanggal sekarang WIB

  return {
    header: {
      kepada: "Kepada Yth.",
      instansi: booking.user?.full_name || booking.user?.name || "****",
      tempat: "Di Tempat",
      tanggal: tanggalDisplay, // Format DD/MM/YYYY - tanggal hari ini WIB
      jenis_kelamin: booking.jenis_kelamin || "****",
      umur: booking.umur || "**** minggu",
      status_fisiologis: booking.status_fisiologis || "****",
      parameterAnalisis: parameterAnalisis,
      title1: table1 ? headerTitle1 : null,
      title2: table2 ? headerTitle2 : null,
    },
    table1: table1,
    table2: table2,
  };
};

export const parseKodeSampel = (kodeSampel) => {
  if (!kodeSampel) return [];

  try {
    if (typeof kodeSampel === "string") {
      try {
        const parsed = JSON.parse(kodeSampel);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [kodeSampel];
      }
    } else if (Array.isArray(kodeSampel)) {
      return kodeSampel;
    }
  } catch (error) {
    console.error("Error parsing kode_sampel:", error);
  }

  return [];
};

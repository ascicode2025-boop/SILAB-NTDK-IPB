// Helper functions untuk format data ke PDF

export const formatDataForPDF = (booking) => {
  if (!booking || !booking.analysis_items) {
    console.warn('No booking or analysis_items found');
    return null;
  }

  console.log('Formatting PDF for booking:', booking);
  console.log('Analysis items:', booking.analysis_items);

  const codes = parseKodeSampel(booking.kode_sampel);
  console.log('Sample codes:', codes);
  
  // Pisahkan items berdasarkan kategori yang ADA di data
  const hematologiItems = {};
  const metabolitItems = {};
  const availableHematologiParams = new Set();
  const availableMetabolitParams = new Set();
  
  booking.analysis_items.forEach(item => {
    const itemName = item.nama_item;
    const hasil = item.hasil || "";
    
    console.log(`Processing item: ${itemName}, hasil: "${hasil}"`);
    
    if (!hasil || hasil.trim() === "") {
      console.log(`Skipping ${itemName} - no hasil`);
      return;
    }
    
    // Parse hasil per kode sampel
    const resultParts = hasil.split(" | ");
    resultParts.forEach(part => {
      const match = part.match(/\[(.*?)\]:\s*(.*)/);
      if (!match) return;
      
      const code = match[1];
      const value = match[2];
      
      // Extract HASIL dari format baru (INPUT=x HASIL=y unit)
      const hasilMatch = value.match(/HASIL=([\d.]+)/);
      const displayValue = hasilMatch ? hasilMatch[1] : value.split(" ")[0];
      
      // Kategorisasi berdasarkan nama item
      if (itemName === "BDM") {
        if (!hematologiItems[code]) hematologiItems[code] = {};
        hematologiItems[code].BDM = displayValue;
        availableHematologiParams.add("BDM");
      }
      else if (itemName === "BDP") {
        if (!hematologiItems[code]) hematologiItems[code] = {};
        hematologiItems[code].BDP = displayValue;
        availableHematologiParams.add("BDP");
      }
      else if (itemName === "Hemoglobin Darah") {
        if (!hematologiItems[code]) hematologiItems[code] = {};
        hematologiItems[code].HB = displayValue;
        availableHematologiParams.add("HB");
      }
      else if (itemName === "Hematokrit") {
        if (!hematologiItems[code]) hematologiItems[code] = {};
        hematologiItems[code].PCV = displayValue;
        availableHematologiParams.add("PCV");
      }
      else if (itemName === "Diferensiasi Leukosit") {
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
      else if (["Glukosa", "Total Protein", "Albumin", "Kolestrol", "Trigliserida", 
                "Urea/BUN", "Kreatinin", "Kalsium", "HDL-kol", "LDL-kol", "Asam Urat",
                "SGOT", "SGPT"].includes(itemName)) {
        if (!metabolitItems[code]) metabolitItems[code] = {};
        // Extract HASIL dari format baru, fallback ke format lama
        const hasilMatch = value.match(/HASIL=([\d.]+)/);
        const cleanValue = hasilMatch ? hasilMatch[1] : value.split(" ")[0];
        metabolitItems[code][itemName] = cleanValue;
        availableMetabolitParams.add(itemName);
      }
    });
  });

  console.log('Available Hematologi Params:', Array.from(availableHematologiParams));
  console.log('Available Metabolit Params:', Array.from(availableMetabolitParams));
  console.log('Hematologi Items:', hematologiItems);
  console.log('Metabolit Items:', metabolitItems);

  // Build dynamic table headers and rows
  const tanggal = new Date().toLocaleDateString("id-ID");
  const jenisHewan = booking.jenis_hewan || "****";

  // Build table1 (Hematologi) - hanya jika ada data
  let table1 = null;
  if (availableHematologiParams.size > 0) {
    const hematologiParamOrder = ["BDM", "BDP", "HB", "PCV", "Limfosit", "Heterofil", "Eosinofil", "Monosit", "Basofil"];
    const activeHematologiParams = hematologiParamOrder.filter(p => availableHematologiParams.has(p));
    
    // Build header with units
    const headerMap = {
      "BDM": "BDM\n(10⁶/µL)",
      "BDP": "BDP\n(10³/µL)",
      "HB": "HB\n(G%)",
      "PCV": "PCV\n(%)",
      "Limfosit": "Limfosit\n(%)",
      "Heterofil": "Heterofil\n(%)",
      "Eosinofil": "Eosinofil\n(%)",
      "Monosit": "Monosit\n(%)",
      "Basofil": "Basofil\n(%)"
    };
    
    const table1Header = ["Kode", ...activeHematologiParams.map(p => headerMap[p] || p)];
    const table1Rows = codes.map(code => {
      const data = hematologiItems[code] || {};
      return [code, ...activeHematologiParams.map(p => data[p] || "-")];
    });
    
    table1 = [table1Header, ...table1Rows];
  }

  // Build table2 (Metabolit) - hanya jika ada data
  let table2 = null;
  if (availableMetabolitParams.size > 0) {
    const metabolitParamOrder = ["Glukosa", "Total Protein", "Albumin", "Kolestrol", "Trigliserida", 
                                  "Urea/BUN", "Kreatinin", "Kalsium", "HDL-kol", "LDL-kol", 
                                  "Asam Urat", "SGOT", "SGPT"];
    const activeMetabolitParams = metabolitParamOrder.filter(p => availableMetabolitParams.has(p));
    
    // Build header with units
    const headerMap = {
      "Glukosa": "Glukosa\n(mg/dL)",
      "Total Protein": "Total P.\n(g/dL)",
      "Albumin": "Albumin\n(mg/dL)",
      "Kolestrol": "Kolestrol\n(mg/dL)",
      "Trigliserida": "Trigliserid\na (mg/dL)",
      "Urea/BUN": "Urea/BU\nN (mg/dL)",
      "Kreatinin": "Kreatinin\n(mg/dL)",
      "Kalsium": "Kalsium\n(mg/dL)",
      "HDL-kol": "HDL-ko\nl (mg/dL)",
      "LDL-kol": "LDL-ko\nl (mg/dL)",
      "Asam Urat": "Asam\nUrat (mg/dL)",
      "SGOT": "SGOT\n(U/L)",
      "SGPT": "SGPT\n(U/L)"
    };
    
    const table2Header = ["No", "Kode", ...activeMetabolitParams.map(p => headerMap[p] || p)];
    const table2Rows = codes.map((code, index) => {
      const data = metabolitItems[code] || {};
      return [index + 1, code, ...activeMetabolitParams.map(p => data[p] || "-")];
    });
    
    table2 = [table2Header, ...table2Rows];
  }

  return {
    header: {
      kepada: "Kepada Yth.",
      instansi: booking.user?.full_name || booking.user?.name || "****",
      tempat: "Di Tempat",
      tanggal: "**/**/****", // Format DD/MM/YYYY dengan placeholder bintang
      title1: table1 ? `Tabel 1. Hasil Analisis Hematologi pada hewan ternak ${jenisHewan}` : null,
      title2: table2 ? `Tabel 2. Hasil Analisis Metabolit pada hewan ternak ${jenisHewan}` : null,
    },
    table1: table1,
    table2: table2
  };
};

export const parseKodeSampel = (kodeSampel) => {
  if (!kodeSampel) return [];
  
  try {
    if (typeof kodeSampel === 'string') {
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
    console.error('Error parsing kode_sampel:', error);
  }
  
  return [];
};

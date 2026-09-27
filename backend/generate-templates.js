const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ensure output directory exists (frontend/public/)
const publicDir = path.join(__dirname, '..', 'frontend', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate nama-bahan.xlsx
const materialsData = [
  { 'Nama Bahan': 'Tepung Terigu', 'Supplier': 'PT Bogasari Flour Mills', 'Status Halal': 'hijau', 'Expired': '2026-12-31' },
  { 'Nama Bahan': 'Minyak Goreng', 'Supplier': 'PT Sinar Mas Agro', 'Status Halal': 'hijau', 'Expired': '2026-08-15' },
  { 'Nama Bahan': 'Saus Tomat', 'Supplier': 'PT Indofood CBP', 'Status Halal': 'kuning', 'Expired': '2026-05-10' },
  { 'Nama Bahan': 'Flavor Ayam Bawang', 'Supplier': 'PT Firmenich Indonesia', 'Status Halal': 'merah', 'Expired': '2025-11-20' }
];

const wbMaterials = XLSX.utils.book_new();
const wsMaterials = XLSX.utils.json_to_sheet(materialsData);

// Set column widths for better readability
wsMaterials['!cols'] = [
  { wch: 25 }, // Nama Bahan
  { wch: 25 }, // Supplier
  { wch: 15 }, // Status Halal
  { wch: 15 }  // Expired
];

XLSX.utils.book_append_sheet(wbMaterials, wsMaterials, 'Bahan Baku');
const materialsPath = path.join(publicDir, 'nama-bahan.xlsx');
XLSX.writeFile(wbMaterials, materialsPath);
console.log('Successfully generated:', materialsPath);

// 2. Generate nama_produk.xlsx
const productsData = [
  { 'Nama Produk': 'Roti Manis Special', 'Bahan Baku (pisahkan dengan koma)': 'Tepung Terigu, Minyak Goreng' },
  { 'Nama Produk': 'Kue Moci', 'Bahan Baku (pisahkan dengan koma)': 'Tepung Terigu' }
];

const wbProducts = XLSX.utils.book_new();
const wsProducts = XLSX.utils.json_to_sheet(productsData);

// Set column widths for better readability
wsProducts['!cols'] = [
  { wch: 25 }, // Nama Produk
  { wch: 50 }  // Bahan Baku
];

XLSX.utils.book_append_sheet(wbProducts, wsProducts, 'Produk & BOM');
const productsPath = path.join(publicDir, 'nama_produk.xlsx');
XLSX.writeFile(wbProducts, productsPath);
console.log('Successfully generated:', productsPath);

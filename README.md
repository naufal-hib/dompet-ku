# 💰 Dompet Ku

Sistem Pengelola Keuangan Pribadi yang **Simple, Clean, dan Powerful**.

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Fitur

- 📊 **Dashboard** - Overview total aset, pemasukan, pengeluaran
- 💳 **Multi Akun** - Kelola Bank, Cash, E-wallet dalam 1 tempat
- 💸 **Transaksi** - Catat pemasukan, pengeluaran, transfer
- 📈 **Jatah/Alokasi** - Sistem pembagian budget bulanan
- 💰 **Utang & Piutang** - Tracking hutang dengan reminder otomatis
- 📱 **WhatsApp Reminder** - Notifikasi otomatis via WA
- 📉 **Chart & Grafik** - Visualisasi pengeluaran
- 📄 **Laporan** - Export PDF dan CSV
- 📱 **Mobile First** - Responsive design, optimized untuk HP

## 🚀 Demo

**Live Demo:** [https://yourusername.github.io/dompet-ku](https://yourusername.github.io/dompet-ku)

## 📋 Prasyarat

1. **Google Account** - Untuk Google Sheets & Apps Script
2. **GitHub Account** - Untuk hosting
3. **Fonnte Account** - Untuk WhatsApp (opsional)

## 🛠️ Setup Guide

### **1. Setup Google Sheets**

1. Buat Google Sheets baru: [sheets.google.com](https://sheets.google.com)
2. Buat 8 sheets dengan nama:
   - `Accounts`
   - `Categories`
   - `Transactions`
   - `Budgets`
   - `Config`
   - `DebtsCredits`
   - `Reminders`
   - `Allocations`

3. Copy struktur dari file `SHEETS_TEMPLATE.md` (ada di repo)

4. **Share Sheets:**
   - Klik "Share"
   - General access: "Anyone with the link" - Viewer
   - Copy SPREADSHEET_ID dari URL

### **2. Setup Google Apps Script**

1. Di Google Sheets: **Extensions** → **Apps Script**
2. Delete code default
3. Copy-paste code dari file `GoogleAppsScript.js`
4. Ganti `SPREADSHEET_ID` dengan ID Anda
5. **Deploy:**
   - Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
   - Copy Web App URL

### **3. Setup Google Cloud (API Key)**

1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project atau pilih existing
3. Enable **Google Sheets API**
4. Create Credentials → API Key
5. (Opsional) Restrict API Key:
   - Application restrictions: HTTP referrers
   - Add: `https://yourusername.github.io/*`

### **4. Setup Fonnte (WhatsApp)**

1. Daftar di [fonnte.com](https://fonnte.com)
2. Connect WhatsApp (scan QR)
3. Copy API Token
4. Update di Google Sheets → Sheet "Config"

### **5. Deploy ke GitHub Pages**

1. Fork repo ini
2. Edit file `config.js`:
```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
   const API_KEY = 'YOUR_API_KEY';
   const APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL';
```
3. Commit & push
4. Settings → Pages → Deploy from branch: main
5. Buka: `https://yourusername.github.io/dompet-ku`

## 📱 Cara Pakai

### **Tambah Transaksi**

1. Klik tombol **"+"** (tengah bottom nav di mobile)
2. Pilih tipe: Pemasukan / Pengeluaran / Transfer
3. Isi detail transaksi
4. Simpan

### **Atur Jatah Bulanan**

1. Menu **"Jatah"**
2. Klik **"Atur Jatah Bulan Ini"**
3. Set alokasi per kategori (Makanan, Hiburan, dll)
4. Sistem akan auto-track dan kirim reminder jika hampir habis

### **Tracking Utang**

1. Menu **"Utang & Piutang"**
2. Klik **"Tambah Utang"** atau **"Tambah Piutang"**
3. Isi detail (nama, nominal, jatuh tempo)
4. Sistem akan kirim reminder H-7 dan H-3 via WA

## 🔧 Teknologi

- **Frontend:** HTML, Tailwind CSS, JavaScript
- **Backend:** Google Apps Script
- **Database:** Google Sheets
- **Charts:** Chart.js
- **WhatsApp:** Fonnte API
- **Hosting:** GitHub Pages

## 📝 Lisensi

MIT License - Bebas digunakan untuk personal/commercial

## 🤝 Kontribusi

Contributions are welcome! Feel free to open issues or pull requests.

## 📧 Kontak

Ada pertanyaan? Email: [your-email@example.com](mailto:your-email@example.com)

---

**Made with ❤️ for better financial management**

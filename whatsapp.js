// ============================================
// DOMPET KU - WHATSAPP MODULE
// ============================================

// ============================================
// SEND MANUAL WHATSAPP
// ============================================
async function sendManualWhatsApp(type, customMessage = '') {
    showLoading();
    
    try {
        let message = '';
        
        switch(type) {
            case 'daily':
                message = generateDailySummary();
                break;
            case 'weekly':
                message = generateWeeklySummary();
                break;
            case 'balance':
                message = generateBalanceSummary();
                break;
            case 'custom':
                message = customMessage;
                break;
            default:
                message = 'Test message from Dompet Ku';
        }
        
        const result = await callAppsScript('sendWhatsApp', {
            type: type,
            message: message,
            number: config.whatsapp_number || WA_CONFIG.number
        });
        
        hideLoading();
        
        if (result.success) {
            showAlert('✅ Pesan berhasil dikirim!', 'success');
        } else {
            showAlert('❌ Gagal kirim pesan', 'error');
        }
        
    } catch (error) {
        console.error('Send WA error:', error);
        hideLoading();
        showAlert('❌ Gagal kirim pesan', 'error');
    }
}

// ============================================
// GENERATE DAILY SUMMARY
// ============================================
function generateDailySummary() {
    const totalAset = accounts
        .filter(a => a.status === 'Aktif')
        .reduce((sum, a) => sum + a.saldoSekarang, 0);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const yesterdayTrx = transactions.filter(t => t.tanggal === yesterdayStr);
    
    const pemasukan = yesterdayTrx
        .filter(t => t.tipe === 'Pemasukan')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    const pengeluaran = yesterdayTrx
        .filter(t => t.tipe === 'Pengeluaran')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    // Account details
    let accountDetails = '';
    accounts.filter(a => a.status === 'Aktif').forEach(acc => {
        const icon = acc.tipe === 'Bank' ? '🏦' : acc.tipe === 'Cash' ? '💵' : '📱';
        accountDetails += `   ${icon} ${acc.nama}: ${formatCurrency(acc.saldoSekarang)}\n`;
    });
    
    // Allocation progress
    const currentAllocations = allocations.filter(a => a.bulan === currentMonth);
    let allocationStatus = '';
    
    if (currentAllocations.length > 0) {
        currentAllocations.forEach(alloc => {
            let emoji = '✅';
            if (alloc.status === 'Warning') emoji = '⚠️';
            if (alloc.status === 'Over') emoji = '🚨';
            allocationStatus += `   ${emoji} ${alloc.namaJatah}: ${alloc.progress}%\n`;
        });
    } else {
        allocationStatus = '   (Belum ada jatah diatur)\n';
    }
    
    return `📊 *DOMPET KU - SALDO HARIAN*

💰 Total Aset: ${formatCurrency(totalAset)}
${accountDetails}
📈 Pemasukan Kemarin: ${formatCurrency(pemasukan)}
📉 Pengeluaran Kemarin: ${formatCurrency(pengeluaran)}

💡 Jatah Bulan Ini:
${allocationStatus}
Semangat mengatur keuangan! 💪

🔗 Buka: https://naufal-hib.github.io/dompet-ku`;
}

// ============================================
// GENERATE WEEKLY SUMMARY
// ============================================
function generateWeeklySummary() {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekTransactions = transactions.filter(t => {
        const trxDate = new Date(t.tanggal);
        return trxDate >= weekAgo && trxDate <= today;
    });
    
    const pemasukan = weekTransactions
        .filter(t => t.tipe === 'Pemasukan')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    const pengeluaran = weekTransactions
        .filter(t => t.tipe === 'Pengeluaran')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    // Top 3 expenses
    const categoryExpenses = {};
    weekTransactions.filter(t => t.tipe === 'Pengeluaran').forEach(t => {
        if (!categoryExpenses[t.kategori]) categoryExpenses[t.kategori] = 0;
        categoryExpenses[t.kategori] += t.nominal;
    });
    
    const topExpenses = Object.entries(categoryExpenses)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    let topExpensesText = '';
    topExpenses.forEach((exp, i) => {
        topExpensesText += `${i + 1}. ${exp[0]}: ${formatCurrency(exp[1])}\n`;
    });
    
    return `📊 *RANGKUMAN MINGGUAN*

Periode: 7 hari terakhir

💰 Pemasukan: ${formatCurrency(pemasukan)}
💸 Pengeluaran: ${formatCurrency(pengeluaran)}
💵 Saldo: ${formatCurrency(pemasukan - pengeluaran)}

📈 Top 3 Pengeluaran:
${topExpensesText || 'Tidak ada pengeluaran'}

${pemasukan - pengeluaran >= 0 ? '✅ Positif! Pertahankan!' : '⚠️ Negatif, kontrol pengeluaran ya!'}

🔗 Detail: https://naufal-hib.github.io/dompet-ku`;
}

// ============================================
// GENERATE BALANCE SUMMARY
// ============================================
function generateBalanceSummary() {
    const totalAset = accounts
        .filter(a => a.status === 'Aktif')
        .reduce((sum, a) => sum + a.saldoSekarang, 0);
    
    let accountDetails = '';
    accounts.filter(a => a.status === 'Aktif').forEach(acc => {
        const icon = acc.tipe === 'Bank' ? '🏦' : acc.tipe === 'Cash' ? '💵' : '📱';
        accountDetails += `${icon} *${acc.nama}*\n   ${formatCurrency(acc.saldoSekarang)}\n\n`;
    });
    
    // Debts summary
    const activeDebts = debts.filter(d => d.status === 'Aktif');
    const totalUtang = activeDebts.filter(d => d.tipe === 'Utang').reduce((sum, d) => sum + d.sisa, 0);
    const totalPiutang = activeDebts.filter(d => d.tipe === 'Piutang').reduce((sum, d) => sum + d.sisa, 0);
    
    return `💰 *RINGKASAN SALDO*

📊 Total Aset: ${formatCurrency(totalAset)}

💳 Detail Akun:
${accountDetails}
💸 Total Utang: ${formatCurrency(totalUtang)}
💰 Total Piutang: ${formatCurrency(totalPiutang)}

💵 Net Worth: ${formatCurrency(totalAset - totalUtang + totalPiutang)}

🔗 Kelola: https://naufal-hib.github.io/dompet-ku`;
}

// ============================================
// TEST WHATSAPP CONNECTION
// ============================================
async function testWhatsAppConnection() {
    const message = `🎉 *TEST KONEKSI WHATSAPP*

Jika Anda menerima pesan ini, berarti integrasi WhatsApp dengan Dompet Ku berhasil!

✅ Fonnte API: Connected
✅ Google Apps Script: Working
✅ Reminder System: Ready

Sekarang Anda akan menerima:
📊 Ringkasan harian (08:00)
📈 Ringkasan mingguan (Minggu 19:00)
⚠️ Notifikasi budget warning
🚨 Reminder utang jatuh tempo

Selamat menggunakan Dompet Ku! 💪`;
    
    await sendManualWhatsApp('custom', message);
}

console.log('✅ whatsapp.js loaded');

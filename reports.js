// ============================================
// DOMPET KU - REPORTS MODULE
// ============================================

// ============================================
// INITIALIZE REPORTS PAGE
// ============================================
function initReportsPage() {
    console.log('📊 Initializing reports page...');
    
    // Set default to current month
    document.getElementById('reportBulan').value = currentMonth;
    
    // Generate report
    generateMonthlyReport();
}

// ============================================
// GENERATE MONTHLY REPORT
// ============================================
function generateMonthlyReport() {
    const bulan = document.getElementById('reportBulan').value;
    
    if (!bulan) {
        showAlert('Pilih bulan untuk laporan', 'warning');
        return;
    }
    
    const monthTransactions = transactions.filter(t => t.tanggal.startsWith(bulan));
    
    // Calculate totals
    const totalPemasukan = monthTransactions
        .filter(t => t.tipe === 'Pemasukan')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    const totalPengeluaran = monthTransactions
        .filter(t => t.tipe === 'Pengeluaran')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    const saldo = totalPemasukan - totalPengeluaran;
    const savingRate = totalPemasukan > 0 ? ((saldo / totalPemasukan) * 100).toFixed(1) : 0;
    
    // Group by category
    const categoryExpenses = {};
    monthTransactions.filter(t => t.tipe === 'Pengeluaran').forEach(t => {
        if (!categoryExpenses[t.kategori]) {
            categoryExpenses[t.kategori] = 0;
        }
        categoryExpenses[t.kategori] += t.nominal;
    });
    
    // Sort and get top 5
    const topExpenses = Object.entries(categoryExpenses)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Render summary
    const summaryContainer = document.getElementById('reportSummary');
    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <p class="text-sm font-medium text-green-700">📈 Total Pemasukan</p>
                    <p class="text-2xl font-bold text-green-600 mt-1">${formatCurrency(totalPemasukan)}</p>
                </div>
                
                <div class="card bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                    <p class="text-sm font-medium text-red-700">📉 Total Pengeluaran</p>
                    <p class="text-2xl font-bold text-red-600 mt-1">${formatCurrency(totalPengeluaran)}</p>
                </div>
                
                <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <p class="text-sm font-medium text-blue-700">💵 Saldo</p>
                    <p class="text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'} mt-1">
                        ${formatCurrency(saldo)}
                    </p>
                </div>
                
                <div class="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <p class="text-sm font-medium text-purple-700">💎 Saving Rate</p>
                    <p class="text-2xl font-bold text-purple-600 mt-1">${savingRate}%</p>
                    <p class="text-xs text-purple-600 mt-1">
                        ${savingRate >= 20 ? '✅ Bagus!' : savingRate >= 10 ? '⚠️ Cukup' : '❌ Perlu ditingkatkan'}
                    </p>
                </div>
            </div>
        `;
    }
    
    // Render top expenses
    const topExpensesContainer = document.getElementById('reportTopExpenses');
    if (topExpensesContainer) {
        if (topExpenses.length === 0) {
            topExpensesContainer.innerHTML = `
                <p class="text-center text-gray-500 py-8">Belum ada pengeluaran</p>
            `;
        } else {
            topExpensesContainer.innerHTML = `
                <div class="space-y-3">
                    ${topExpenses.map(([category, amount], index) => {
                        const cat = categories.find(c => c.nama === category);
                        const icon = cat ? cat.icon : '📌';
                        const percent = ((amount / totalPengeluaran) * 100).toFixed(1);
                        
                        return `
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <span class="text-2xl">${icon}</span>
                                    <div>
                                        <p class="font-semibold text-gray-900">${category}</p>
                                        <p class="text-xs text-gray-500">${percent}% dari total pengeluaran</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-red-600">${formatCurrency(amount)}</p>
                                    <p class="text-xs text-gray-500">Rank #${index + 1}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    }
    
    // Render recommendation
    const recommendationContainer = document.getElementById('reportRecommendation');
    if (recommendationContainer) {
        let recommendations = [];
        
        if (savingRate < 10) {
            recommendations.push('💡 Saving rate Anda dibawah 10%. Coba tingkatkan dengan mengurangi pengeluaran atau menambah pemasukan.');
        } else if (savingRate >= 20) {
            recommendations.push('🎉 Excellent! Saving rate Anda sudah bagus. Pertahankan pola ini!');
        }
        
        if (totalPengeluaran > totalPemasukan) {
            recommendations.push('⚠️ Pengeluaran melebihi pemasukan bulan ini. Segera evaluasi budget Anda.');
        }
        
        if (topExpenses.length > 0 && topExpenses[0][1] > totalPengeluaran * 0.4) {
            recommendations.push(`📊 Kategori "${topExpenses[0][0]}" menghabiskan >40% pengeluaran. Pertimbangkan untuk mengontrolnya.`);
        }
        
        if (recommendations.length === 0) {
            recommendations.push('✅ Keuangan Anda dalam kondisi baik. Tetap jaga pola spending!');
        }
        
        recommendationContainer.innerHTML = `
            <div class="space-y-2">
                ${recommendations.map(rec => `
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p class="text-sm text-blue-800">${rec}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Render chart
    renderReportChart(categoryExpenses);
}

// ============================================
// RENDER REPORT CHART
// ============================================
let reportChartInstance = null;

function renderReportChart(categoryExpenses) {
    const canvas = document.getElementById('reportChart');
    if (!canvas) return;
    
    const labels = Object.keys(categoryExpenses);
    const data = Object.values(categoryExpenses);
    
    if (labels.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    const colors = labels.map(label => {
        const category = categories.find(c => c.nama === label);
        return category ? category.warna : '#6B7280';
    });
    
    if (reportChartInstance) {
        reportChartInstance.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    reportChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pengeluaran',
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + (value / 1000) + 'k';
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// EXPORT REPORT PDF
// ============================================
async function exportReportPDF() {
    const bulan = document.getElementById('reportBulan').value;
    
    if (!bulan) {
        showAlert('Pilih bulan terlebih dahulu', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        // Load jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('LAPORAN KEUANGAN BULANAN', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(formatMonthYear(bulan), 105, 28, { align: 'center' });
        
        const monthTransactions = transactions.filter(t => t.tanggal.startsWith(bulan));
        
        const totalPemasukan = monthTransactions
            .filter(t => t.tipe === 'Pemasukan')
            .reduce((sum, t) => sum + t.nominal, 0);
        
        const totalPengeluaran = monthTransactions
            .filter(t => t.tipe === 'Pengeluaran')
            .reduce((sum, t) => sum + t.nominal, 0);
        
        const saldo = totalPemasukan - totalPengeluaran;
        
        // Summary
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RINGKASAN', 20, 40);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Pemasukan: ${formatCurrency(totalPemasukan)}`, 20, 48);
        doc.text(`Total Pengeluaran: ${formatCurrency(totalPengeluaran)}`, 20, 55);
        doc.text(`Saldo: ${formatCurrency(saldo)}`, 20, 62);
        doc.text(`Saving Rate: ${totalPemasukan > 0 ? ((saldo / totalPemasukan) * 100).toFixed(1) : 0}%`, 20, 69);
        
        // Transactions table
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TRANSAKSI', 20, 82);
        
        const headers = [['Tanggal', 'Tipe', 'Kategori', 'Nominal']];
        const data = monthTransactions.slice(0, 20).map(t => [
            formatDate(t.tanggal),
            t.tipe,
            t.kategori,
            formatCurrency(t.nominal)
        ]);
        
        doc.autoTable({
            startY: 87,
            head: headers,
            body: data,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [16, 185, 129] }
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
            doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 20, 290);
        }
        
        // Save
        doc.save(`Laporan_${bulan}.pdf`);
        
        hideLoading();
        showAlert('✅ PDF berhasil di-download!', 'success');
        
    } catch (error) {
        console.error('Export PDF error:', error);
        hideLoading();
        showAlert('❌ Gagal export PDF', 'error');
    }
}

// ============================================
// SEND REPORT WHATSAPP
// ============================================
async function sendReportWhatsApp() {
    const bulan = document.getElementById('reportBulan').value;
    
    if (!bulan) {
        showAlert('Pilih bulan terlebih dahulu', 'warning');
        return;
    }
    
    const monthTransactions = transactions.filter(t => t.tanggal.startsWith(bulan));
    
    const totalPemasukan = monthTransactions
        .filter(t => t.tipe === 'Pemasukan')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    const totalPengeluaran = monthTransactions
        .filter(t => t.tipe === 'Pengeluaran')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    const saldo = totalPemasukan - totalPengeluaran;
    const savingRate = totalPemasukan > 0 ? ((saldo / totalPemasukan) * 100).toFixed(1) : 0;
    
    // Get top 3 expenses
    const categoryExpenses = {};
    monthTransactions.filter(t => t.tipe === 'Pengeluaran').forEach(t => {
        if (!categoryExpenses[t.kategori]) categoryExpenses[t.kategori] = 0;
        categoryExpenses[t.kategori] += t.nominal;
    });
    
    const topExpenses = Object.entries(categoryExpenses)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    const message = `📊 *LAPORAN KEUANGAN BULANAN*

Periode: ${formatMonthYear(bulan)}

💰 Total Pemasukan: ${formatCurrency(totalPemasukan)}
💸 Total Pengeluaran: ${formatCurrency(totalPengeluaran)}
💵 Saldo: ${formatCurrency(saldo)}
💎 Saving Rate: ${savingRate}%

📈 Top 3 Pengeluaran:
${topExpenses.map((exp, i) => `${i + 1}. ${exp[0]}: ${formatCurrency(exp[1])}`).join('\n')}

${savingRate >= 20 ? '✅ Excellent! Pertahankan!' : savingRate >= 10 ? '⚠️ Cukup baik, bisa ditingkatkan' : '❌ Perlu perbaikan budget'}

🔗 Detail: https://yourusername.github.io/dompet-ku`;
    
    showLoading();
    
    try {
        const result = await callAppsScript('sendWhatsApp', {
            type: 'Monthly Report',
            message: message,
            number: config.whatsapp_number || WA_CONFIG.number
        });
        
        hideLoading();
        
        if (result.success) {
            showAlert('✅ Laporan berhasil dikirim via WhatsApp!', 'success');
        } else {
            showAlert('❌ Gagal kirim WhatsApp', 'error');
        }
    } catch (error) {
        console.error('Send WA error:', error);
        hideLoading();
        showAlert('❌ Gagal kirim WhatsApp', 'error');
    }
}

console.log('✅ reports.js loaded');

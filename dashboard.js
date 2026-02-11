// ============================================
// DOMPET KU - DASHBOARD MODULE
// VERSION 2.0 - FULL & COMPLETE
// ============================================

// Chart instance
let expenseChartInstance = null;

// ============================================
// INITIALIZE DASHBOARD
// ============================================
function initDashboard() {
    console.log('🎨 Rendering dashboard...');
    renderOverviewCards();
    renderAccountsList();
    renderRecentTransactions();
    renderExpenseChart();
}

// ============================================
// RENDER OVERVIEW CARDS
// ============================================
function renderOverviewCards() {
    console.log('📊 Rendering overview cards...');

    const totalAset = accounts
        .filter(acc => acc.status === 'Aktif')
        .reduce((sum, acc) => sum + acc.saldoSekarang, 0);

    const thisMonthTransactions = transactions.filter(t => {
        const bulan = getMonthFromDate(t.tanggal);
        return bulan === currentMonth;
    });

    const totalPemasukan = thisMonthTransactions
        .filter(t => t.tipe === 'Pemasukan')
        .reduce((sum, t) => sum + t.nominal, 0);

    const totalPengeluaran = thisMonthTransactions
        .filter(t => t.tipe === 'Pengeluaran')
        .reduce((sum, t) => sum + t.nominal, 0);

    const saldoBulanIni = totalPemasukan - totalPengeluaran;

    // Hitung perubahan vs bulan lalu
    const lastMonth = getLastMonth(currentMonth);
    const lastMonthTransactions = transactions.filter(t => {
        return getMonthFromDate(t.tanggal) === lastMonth;
    });

    const lastMonthPemasukan = lastMonthTransactions
        .filter(t => t.tipe === 'Pemasukan')
        .reduce((sum, t) => sum + t.nominal, 0);
    const lastMonthPengeluaran = lastMonthTransactions
        .filter(t => t.tipe === 'Pengeluaran')
        .reduce((sum, t) => sum + t.nominal, 0);
    const lastMonthTotal = lastMonthPemasukan - lastMonthPengeluaran;

    let changePercent = 0;
    let changeIcon = '→';
    if (lastMonthTotal !== 0) {
        changePercent = Math.round(((saldoBulanIni - lastMonthTotal) / Math.abs(lastMonthTotal)) * 100);
        changeIcon = changePercent > 0 ? '↑' : changePercent < 0 ? '↓' : '→';
    }

    const totalAsetEl       = document.getElementById('totalAset');
    const asetChangeEl      = document.getElementById('asetChange');
    const totalPemasukanEl  = document.getElementById('totalPemasukan');
    const totalPengeluaranEl = document.getElementById('totalPengeluaran');
    const saldoBulanIniEl   = document.getElementById('saldoBulanIni');

    if (totalAsetEl)        totalAsetEl.textContent = formatCurrency(totalAset);
    if (asetChangeEl) {
        asetChangeEl.textContent = `${changeIcon} ${Math.abs(changePercent)}% vs bulan lalu`;
        asetChangeEl.className = changePercent >= 0
            ? 'text-xs sm:text-sm text-green-600'
            : 'text-xs sm:text-sm text-red-600';
    }
    if (totalPemasukanEl)   totalPemasukanEl.textContent  = formatCurrency(totalPemasukan);
    if (totalPengeluaranEl) totalPengeluaranEl.textContent = formatCurrency(totalPengeluaran);
    if (saldoBulanIniEl) {
        saldoBulanIniEl.textContent = formatCurrency(saldoBulanIni);
        saldoBulanIniEl.className = saldoBulanIni >= 0
            ? 'text-2xl sm:text-3xl font-bold text-blue-600'
            : 'text-2xl sm:text-3xl font-bold text-red-600';
    }

    console.log('Dashboard stats:', {
        totalAset: formatCurrency(totalAset),
        totalPemasukan: formatCurrency(totalPemasukan),
        totalPengeluaran: formatCurrency(totalPengeluaran),
        saldoBulanIni: formatCurrency(saldoBulanIni),
        currentMonth
    });
}

// ============================================
// HELPER: GET LAST MONTH
// ============================================
function getLastMonth(monthStr) {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() - 1);
    const lastYear  = date.getFullYear();
    const lastMonth = String(date.getMonth() + 1).padStart(2, '0');
    return `${lastYear}-${lastMonth}`;
}

// ============================================
// RENDER ACCOUNTS LIST
// ============================================
function renderAccountsList() {
    const container = document.getElementById('accountsList');
    if (!container) return;

    const activeAccounts = accounts.filter(acc => acc.status === 'Aktif');

    if (activeAccounts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p class="text-sm font-medium">Belum ada akun</p>
                <button onclick="showAddAccountModal()" class="mt-2 text-sm text-green-600 hover:text-green-700 font-medium">
                    + Tambah Akun Pertama
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = activeAccounts.map(account => {
        const icon = getAccountIcon(account.tipe);
        return `
            <div class="account-card">
                <div class="flex items-center flex-1 min-w-0">
                    <div class="account-icon" style="background-color: ${account.warna}20; color: ${account.warna};">
                        ${icon}
                    </div>
                    <div class="ml-3 flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate">${account.nama}</p>
                        <p class="text-xs text-gray-500">${account.tipe}</p>
                    </div>
                </div>
                <div class="text-right ml-3">
                    <p class="text-base sm:text-lg font-bold text-gray-900">${formatCurrency(account.saldoSekarang)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// RENDER RECENT TRANSACTIONS
// ============================================
function renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(convertToInternalDate(a.tanggal) || '1970-01-01');
        const dateB = new Date(convertToInternalDate(b.tanggal) || '1970-01-01');
        return dateB - dateA;
    });

    const recentTrx = sortedTransactions.slice(0, 5);

    if (recentTrx.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p class="text-sm font-medium">Belum ada transaksi</p>
                <button onclick="showAddTransactionModal()" class="mt-2 text-sm text-green-600 hover:text-green-700 font-medium">
                    + Tambah Transaksi Pertama
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = recentTrx.map(trx => {
        const category  = categories.find(c => c.nama === trx.kategori);
        const icon      = category ? category.icon : '📌';
        const isIncome  = trx.tipe === 'Pemasukan';
        const isTransfer = trx.tipe === 'Transfer';
        const amountClass  = isIncome ? 'text-green-600' : isTransfer ? 'text-blue-600' : 'text-red-600';
        const amountPrefix = isIncome ? '+' : isTransfer ? '↔' : '-';

        return `
            <div class="transaction-card">
                <div class="flex items-center flex-1 min-w-0">
                    <div class="transaction-category">${icon}</div>
                    <div class="flex-1 min-w-0 ml-3">
                        <p class="text-sm font-semibold text-gray-900 truncate">${trx.kategori}</p>
                        <p class="text-xs text-gray-500 truncate">${trx.keterangan || trx.akun}</p>
                        <p class="text-xs text-gray-400">${formatDate(trx.tanggal)}</p>
                    </div>
                </div>
                <div class="text-right ml-3">
                    <p class="text-sm sm:text-base font-bold ${amountClass}">
                        ${amountPrefix}${formatCurrency(trx.nominal)}
                    </p>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// RENDER EXPENSE CHART ← FUNGSI YANG HILANG!
// ============================================
function renderExpenseChart() {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) {
        console.warn('⚠️ expenseChart canvas not found');
        return;
    }

    // Filter pengeluaran bulan ini
    const thisMonthPengeluaran = transactions.filter(t => {
        return getMonthFromDate(t.tanggal) === currentMonth && t.tipe === 'Pengeluaran';
    });

    if (thisMonthPengeluaran.length === 0) {
        const container = canvas.parentElement;
        if (container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-48 text-gray-400">
                    <svg class="w-16 h-16 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                    </svg>
                    <p class="text-sm font-medium text-gray-500">Belum ada pengeluaran bulan ini</p>
                </div>
            `;
        }
        return;
    }

    // Kelompokkan per kategori
    const categoryTotals = {};
    thisMonthPengeluaran.forEach(t => {
        if (!categoryTotals[t.kategori]) {
            categoryTotals[t.kategori] = 0;
        }
        categoryTotals[t.kategori] += t.nominal;
    });

    // Sort by total, ambil top 6
    const sorted = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const labels = sorted.map(([kat]) => kat);
    const data   = sorted.map(([, total]) => total);

    const chartColors = [
        '#EF4444', '#F59E0B', '#10B981',
        '#3B82F6', '#8B5CF6', '#EC4899'
    ];

    // Destroy chart lama jika ada
    if (expenseChartInstance) {
        expenseChartInstance.destroy();
        expenseChartInstance = null;
    }

    try {
        const ctx = canvas.getContext('2d');
        expenseChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: chartColors.slice(0, labels.length),
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 12,
                            usePointStyle: true,
                            pointStyleWidth: 10,
                            font: { size: 11 },
                            generateLabels: (chart) => {
                                const dataset = chart.data.datasets[0];
                                const total   = dataset.data.reduce((a, b) => a + b, 0);
                                return chart.data.labels.map((label, i) => ({
                                    text: `${label} (${Math.round((dataset.data[i] / total) * 100)}%)`,
                                    fillStyle: dataset.backgroundColor[i],
                                    hidden: false,
                                    index: i,
                                    pointStyle: 'circle'
                                }));
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total   = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = Math.round((context.parsed / total) * 100);
                                return ` ${context.label}: ${formatCurrency(context.parsed)} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Expense chart rendered:', labels.length, 'categories');

    } catch (error) {
        console.error('❌ Chart render error:', error);
    }
}

console.log('✅ dashboard.js loaded - VERSION 2.0 COMPLETE');

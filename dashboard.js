// ============================================
// DOMPET KU - DASHBOARD MODULE
// ============================================

// ============================================
// INITIALIZE DASHBOARD
// ============================================
function initDashboard() {
    console.log('🎨 Rendering dashboard...');
    
    // Render overview cards
    renderOverviewCards();
    
    // Render accounts list
    renderAccountsList();
    
    // Render recent transactions
    renderRecentTransactions();
    
    // Render expense chart
    renderExpenseChart();
}

// ============================================
// RENDER OVERVIEW CARDS
// ============================================
function renderOverviewCards() {
    // Calculate total aset
    const totalAset = accounts
        .filter(acc => acc.status === 'Aktif')
        .reduce((sum, acc) => sum + acc.saldoSekarang, 0);
    
    // Calculate pemasukan & pengeluaran bulan ini
    const thisMonthTransactions = transactions.filter(t => {
        return t.tanggal.startsWith(currentMonth);
    });
    
    const totalPemasukan = thisMonthTransactions
        .filter(t => t.tipe === 'Pemasukan')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    const totalPengeluaran = thisMonthTransactions
        .filter(t => t.tipe === 'Pengeluaran')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    const saldoBulanIni = totalPemasukan - totalPengeluaran;
    
    // Calculate change vs last month (simplified - just show positive)
    const changePercent = 5; // Placeholder
    
    // Update DOM
    const totalAsetEl = document.getElementById('totalAset');
    const asetChangeEl = document.getElementById('asetChange');
    const totalPemasukanEl = document.getElementById('totalPemasukan');
    const totalPengeluaranEl = document.getElementById('totalPengeluaran');
    const saldoBulanIniEl = document.getElementById('saldoBulanIni');
    
    if (totalAsetEl) totalAsetEl.textContent = formatCurrency(totalAset);
    if (asetChangeEl) asetChangeEl.textContent = `↑ +${changePercent}% vs bulan lalu`;
    if (totalPemasukanEl) totalPemasukanEl.textContent = formatCurrency(totalPemasukan);
    if (totalPengeluaranEl) totalPengeluaranEl.textContent = formatCurrency(totalPengeluaran);
    if (saldoBulanIniEl) {
        saldoBulanIniEl.textContent = formatCurrency(saldoBulanIni);
        // Change color based on positive/negative
        if (saldoBulanIni >= 0) {
            saldoBulanIniEl.classList.remove('text-red-600');
            saldoBulanIniEl.classList.add('text-blue-600');
        } else {
            saldoBulanIniEl.classList.remove('text-blue-600');
            saldoBulanIniEl.classList.add('text-red-600');
        }
    }
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
        const saldoFormatted = formatCurrency(account.saldoSekarang);
        
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
                    <p class="text-base sm:text-lg font-bold text-gray-900">${saldoFormatted}</p>
                </div>
            </div>
        `;
    }).join('');
}

function getAccountIcon(tipe) {
    const icons = {
        'Bank': '🏦',
        'Cash': '💵',
        'E-wallet': '📱'
    };
    return icons[tipe] || '💳';
}

// ============================================
// RENDER RECENT TRANSACTIONS
// ============================================
function renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    // Get 5 most recent transactions
    const recentTrx = transactions
        .sort((a, b) => new Date(b.created) - new Date(a.created))
        .slice(0, 5);
    
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
        const category = categories.find(c => c.nama === trx.kategori);
        const icon = category ? category.icon : '📌';
        const isIncome = trx.tipe === 'Pemasukan';
        const amountClass = isIncome ? 'text-green-600' : 'text-red-600';
        const amountPrefix = isIncome ? '+' : '-';
        
        return `
            <div class="transaction-card">
                <div class="flex items-center flex-1 min-w-0">
                    <div class="transaction-category">${icon}</div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate">${trx.kategori}</p>
                        <p class="text-xs text-gray-500 truncate">${trx.keterangan || trx.akun}</p>
                        <p class="text-xs text-gray-400">${formatDateShort(trx.tanggal)}</p>
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

console.log('✅ dashboard.js loaded');

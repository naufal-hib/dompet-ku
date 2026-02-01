// ============================================
// DOMPET KU - TRANSACTIONS MODULE
// ============================================

let currentFilter = {
    tipe: 'all',
    kategori: 'all',
    akun: 'all',
    bulan: currentMonth
};

let currentTransactionPage = 1;
const TRANSACTIONS_PER_PAGE = 10;

// ============================================
// INITIALIZE TRANSACTIONS PAGE
// ============================================
function initTransactionsPage() {
    console.log('📋 Initializing transactions page...');
    
    // Render filters
    renderTransactionFilters();
    
    // Render transactions table
    renderTransactionsTable();
    
    // Render summary
    renderTransactionSummary();
}

// ============================================
// RENDER TRANSACTION FILTERS
// ============================================
function renderTransactionFilters() {
    const container = document.getElementById('transactionFilters');
    if (!container) return;
    
    const months = getAvailableMonths();
    
    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Bulan Filter -->
            <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Bulan</label>
                <select id="filterBulan" onchange="updateTransactionFilter('bulan', this.value)" class="input text-sm">
                    ${months.map(month => `
                        <option value="${month}" ${month === currentFilter.bulan ? 'selected' : ''}>
                            ${formatMonthYear(month)}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <!-- Tipe Filter -->
            <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Tipe</label>
                <select id="filterTipe" onchange="updateTransactionFilter('tipe', this.value)" class="input text-sm">
                    <option value="all">Semua Tipe</option>
                    <option value="Pemasukan">Pemasukan</option>
                    <option value="Pengeluaran">Pengeluaran</option>
                    <option value="Transfer">Transfer</option>
                </select>
            </div>
            
            <!-- Kategori Filter -->
            <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                <select id="filterKategori" onchange="updateTransactionFilter('kategori', this.value)" class="input text-sm">
                    <option value="all">Semua Kategori</option>
                    ${categories.filter(c => c.status === 'Aktif').map(cat => `
                        <option value="${cat.nama}">${cat.icon} ${cat.nama}</option>
                    `).join('')}
                </select>
            </div>
            
            <!-- Akun Filter -->
            <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Akun</label>
                <select id="filterAkun" onchange="updateTransactionFilter('akun', this.value)" class="input text-sm">
                    <option value="all">Semua Akun</option>
                    ${accounts.filter(a => a.status === 'Aktif').map(acc => `
                        <option value="${acc.nama}">${acc.nama}</option>
                    `).join('')}
                </select>
            </div>
        </div>
        
        <div class="mt-3 flex justify-between items-center">
            <button onclick="resetTransactionFilters()" class="text-sm text-gray-600 hover:text-gray-800">
                🔄 Reset Filter
            </button>
            <button onclick="exportTransactionsCSV()" class="text-sm text-green-600 hover:text-green-700 font-medium">
                📥 Export CSV
            </button>
        </div>
    `;
}

function getAvailableMonths() {
    const months = new Set();
    transactions.forEach(t => {
        if (t.tanggal) {
            months.add(t.tanggal.substring(0, 7));
        }
    });
    
    // Add current month if not exists
    months.add(currentMonth);
    
    // Convert to array and sort descending
    return Array.from(months).sort().reverse();
}

function formatMonthYear(monthStr) {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

// ============================================
// UPDATE FILTER
// ============================================
function updateTransactionFilter(filterType, value) {
    currentFilter[filterType] = value;
    currentTransactionPage = 1; // Reset to first page
    renderTransactionsTable();
    renderTransactionSummary();
}

function resetTransactionFilters() {
    currentFilter = {
        tipe: 'all',
        kategori: 'all',
        akun: 'all',
        bulan: currentMonth
    };
    
    document.getElementById('filterTipe').value = 'all';
    document.getElementById('filterKategori').value = 'all';
    document.getElementById('filterAkun').value = 'all';
    document.getElementById('filterBulan').value = currentMonth;
    
    currentTransactionPage = 1;
    renderTransactionsTable();
    renderTransactionSummary();
}

// ============================================
// FILTER TRANSACTIONS
// ============================================
function getFilteredTransactions() {
    return transactions.filter(t => {
        // Month filter
        if (!t.tanggal.startsWith(currentFilter.bulan)) return false;
        
        // Tipe filter
        if (currentFilter.tipe !== 'all' && t.tipe !== currentFilter.tipe) return false;
        
        // Kategori filter
        if (currentFilter.kategori !== 'all' && t.kategori !== currentFilter.kategori) return false;
        
        // Akun filter
        if (currentFilter.akun !== 'all' && t.akun !== currentFilter.akun) return false;
        
        return true;
    });
}

// ============================================
// RENDER TRANSACTIONS TABLE
// ============================================
function renderTransactionsTable() {
    const container = document.getElementById('transactionsTableBody');
    if (!container) return;
    
    const filteredTransactions = getFilteredTransactions();
    const sortedTransactions = filteredTransactions.sort((a, b) => {
        return new Date(b.tanggal) - new Date(a.tanggal);
    });
    
    // Pagination
    const totalPages = Math.ceil(sortedTransactions.length / TRANSACTIONS_PER_PAGE);
    const startIndex = (currentTransactionPage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
    const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);
    
    // Update record count
    const recordCountEl = document.getElementById('transactionRecordCount');
    if (recordCountEl) {
        recordCountEl.textContent = `Menampilkan ${startIndex + 1}-${Math.min(endIndex, sortedTransactions.length)} dari ${sortedTransactions.length} transaksi`;
    }
    
    if (paginatedTransactions.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-12 text-center text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="font-medium">Tidak ada transaksi</p>
                    <p class="text-sm mt-1">Coba ubah filter atau tambah transaksi baru</p>
                </td>
            </tr>
        `;
        
        // Hide pagination
        const paginationEl = document.getElementById('transactionPagination');
        if (paginationEl) paginationEl.classList.add('hidden');
        
        return;
    }
    
    container.innerHTML = paginatedTransactions.map((trx, index) => {
        const category = categories.find(c => c.nama === trx.kategori);
        const icon = category ? category.icon : '📌';
        const isIncome = trx.tipe === 'Pemasukan';
        const isTransfer = trx.tipe === 'Transfer';
        
        let amountClass = 'text-gray-900';
        let amountPrefix = '';
        
        if (isIncome) {
            amountClass = 'text-green-600';
            amountPrefix = '+';
        } else if (!isTransfer) {
            amountClass = 'text-red-600';
            amountPrefix = '-';
        }
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-3 py-3 text-xs sm:text-sm text-center text-gray-600">
                    ${startIndex + index + 1}
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm text-gray-900">
                    ${formatDate(trx.tanggal)}
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm">
                    <span class="badge ${
                        isIncome ? 'badge-success' : isTransfer ? 'badge-info' : 'badge-danger'
                    }">
                        ${trx.tipe}
                    </span>
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm">
                    <div class="flex items-center">
                        <span class="text-base mr-2">${icon}</span>
                        <span class="truncate">${trx.kategori}</span>
                    </div>
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm text-gray-700 truncate">
                    ${trx.akun}
                    ${isTransfer ? `<br><span class="text-xs text-gray-500">→ ${trx.akunTujuan}</span>` : ''}
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm font-bold ${amountClass} text-right whitespace-nowrap">
                    ${amountPrefix}${formatCurrency(trx.nominal)}
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm text-gray-600 truncate max-w-xs" title="${trx.keterangan}">
                    ${trx.keterangan || '-'}
                </td>
            </tr>
        `;
    }).join('');
    
    // Render pagination
    renderTransactionPagination(totalPages);
}

// ============================================
// RENDER PAGINATION
// ============================================
function renderTransactionPagination(totalPages) {
    const container = document.getElementById('transactionPagination');
    if (!container || totalPages <= 1) {
        if (container) container.classList.add('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    
    let paginationHTML = `
        <div class="flex items-center justify-between mt-4">
            <button onclick="changeTransactionPage(-1)" 
                    class="btn btn-secondary text-sm py-2 px-4 ${currentTransactionPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${currentTransactionPage === 1 ? 'disabled' : ''}>
                ← Prev
            </button>
            
            <div class="flex space-x-2">
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || // First page
            i === totalPages || // Last page
            (i >= currentTransactionPage - 1 && i <= currentTransactionPage + 1) // Around current
        ) {
            paginationHTML += `
                <button onclick="goToTransactionPage(${i})" 
                        class="w-10 h-10 rounded-lg font-medium text-sm ${
                            i === currentTransactionPage 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }">
                    ${i}
                </button>
            `;
        } else if (
            i === currentTransactionPage - 2 || 
            i === currentTransactionPage + 2
        ) {
            paginationHTML += `<span class="text-gray-400">...</span>`;
        }
    }
    
    paginationHTML += `
            </div>
            
            <button onclick="changeTransactionPage(1)" 
                    class="btn btn-secondary text-sm py-2 px-4 ${currentTransactionPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${currentTransactionPage === totalPages ? 'disabled' : ''}>
                Next →
            </button>
        </div>
    `;
    
    container.innerHTML = paginationHTML;
}

function changeTransactionPage(delta) {
    const filteredTransactions = getFilteredTransactions();
    const totalPages = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE);
    
    const newPage = currentTransactionPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        currentTransactionPage = newPage;
        renderTransactionsTable();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToTransactionPage(page) {
    currentTransactionPage = page;
    renderTransactionsTable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// RENDER TRANSACTION SUMMARY
// ============================================
function renderTransactionSummary() {
    const container = document.getElementById('transactionSummary');
    if (!container) return;
    
    const filteredTransactions = getFilteredTransactions();
    
    const totalPemasukan = filteredTransactions
        .filter(t => t.tipe === 'Pemasukan')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    const totalPengeluaran = filteredTransactions
        .filter(t => t.tipe === 'Pengeluaran')
        .reduce((sum, t) => sum + t.nominal, 0);
    
    const saldo = totalPemasukan - totalPengeluaran;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-green-700">Total Pemasukan</p>
                        <p class="text-2xl font-bold text-green-600 mt-1">${formatCurrency(totalPemasukan)}</p>
                    </div>
                    <svg class="w-12 h-12 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                </div>
            </div>
            
            <div class="card bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-red-700">Total Pengeluaran</p>
                        <p class="text-2xl font-bold text-red-600 mt-1">${formatCurrency(totalPengeluaran)}</p>
                    </div>
                    <svg class="w-12 h-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                    </svg>
                </div>
            </div>
            
            <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-blue-700">Saldo</p>
                        <p class="text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'} mt-1">
                            ${formatCurrency(saldo)}
                        </p>
                    </div>
                    <svg class="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SHOW ADD TRANSACTION MODAL
// ============================================
function showAddTransactionModal() {
    const modal = document.getElementById('addTransactionModal');
    if (!modal) {
        createAddTransactionModal();
        return;
    }
    
    // Reset form
    document.getElementById('addTransactionForm').reset();
    document.getElementById('transactionTanggal').valueAsDate = new Date();
    
    // Show modal
    modal.classList.add('active');
    
    // Switch to first tab
    switchTransactionTab('pemasukan');
}

function closeAddTransactionModal() {
    const modal = document.getElementById('addTransactionModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// CREATE ADD TRANSACTION MODAL
// ============================================
function createAddTransactionModal() {
    const modalHTML = `
        <div id="addTransactionModal" class="modal">
            <div class="modal-content">
                <div class="p-6">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">Tambah Transaksi</h3>
                        <button onclick="closeAddTransactionModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Tabs -->
                    <div class="flex space-x-2 mb-6 border-b border-gray-200">
                        <button onclick="switchTransactionTab('pemasukan')" 
                                class="transaction-tab active" 
                                data-tab="pemasukan">
                            📈 Pemasukan
                        </button>
                        <button onclick="switchTransactionTab('pengeluaran')" 
                                class="transaction-tab" 
                                data-tab="pengeluaran">
                            📉 Pengeluaran
                        </button>
                        <button onclick="switchTransactionTab('transfer')" 
                                class="transaction-tab" 
                                data-tab="transfer">
                            🔄 Transfer
                        </button>
                    </div>
                    
                    <!-- Form -->
                    <form id="addTransactionForm" onsubmit="submitTransaction(event)">
                        <input type="hidden" id="transactionTipe" value="Pemasukan">
                        
                        <div class="space-y-4">
                            <!-- Tanggal -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                                <input type="date" id="transactionTanggal" required class="input">
                            </div>
                            
                            <!-- Kategori (Hide for Transfer) -->
                            <div id="fieldKategori">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                <select id="transactionKategori" required class="input">
                                    <option value="">Pilih Kategori</option>
                                </select>
                            </div>
                            
                            <!-- Akun Dari -->
                            <div id="fieldAkunDari">
                                <label class="block text-sm font-medium text-gray-700 mb-2" id="labelAkunDari">Akun</label>
                                <select id="transactionAkun" required class="input">
                                    <option value="">Pilih Akun</option>
                                    ${accounts.filter(a => a.status === 'Aktif').map(acc => `
                                        <option value="${acc.nama}">${acc.nama}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <!-- Akun Tujuan (Only for Transfer) -->
                            <div id="fieldAkunTujuan" class="hidden">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Ke Akun</label>
                                <select id="transactionAkunTujuan" class="input">
                                    <option value="">Pilih Akun Tujuan</option>
                                    ${accounts.filter(a => a.status === 'Aktif').map(acc => `
                                        <option value="${acc.nama}">${acc.nama}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <!-- Nominal -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nominal</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="transactionNominal" required min="0" step="1000" 
                                           class="input pl-12" placeholder="0">
                                </div>
                            </div>
                            
                            <!-- Keterangan -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Keterangan (Opsional)</label>
                                <textarea id="transactionKeterangan" rows="3" class="input" 
                                          placeholder="Catatan tambahan..."></textarea>
                            </div>
                        </div>
                        
                        <!-- Buttons -->
                        <div class="flex space-x-3 mt-6">
                            <button type="button" onclick="closeAddTransactionModal()" class="flex-1 btn btn-secondary">
                                Batal
                            </button>
                            <button type="submit" class="flex-1 btn btn-primary">
                                💾 Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set default date to today
    document.getElementById('transactionTanggal').valueAsDate = new Date();
    
    // Show modal
    document.getElementById('addTransactionModal').classList.add('active');
    
    // Switch to first tab
    switchTransactionTab('pemasukan');
}

// ============================================
// SWITCH TRANSACTION TAB
// ============================================
function switchTransactionTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.transaction-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    // Update hidden tipe input
    let tipe = '';
    if (tab === 'pemasukan') tipe = 'Pemasukan';
    if (tab === 'pengeluaran') tipe = 'Pengeluaran';
    if (tab === 'transfer') tipe = 'Transfer';
    
    document.getElementById('transactionTipe').value = tipe;
    
    // Update kategori options
    const kategoriSelect = document.getElementById('transactionKategori');
    if (tab === 'transfer') {
        // Hide kategori for transfer
        document.getElementById('fieldKategori').classList.add('hidden');
        kategoriSelect.required = false;
        
        // Show akun tujuan
        document.getElementById('fieldAkunTujuan').classList.remove('hidden');
        document.getElementById('transactionAkunTujuan').required = true;
        
        // Change label
        document.getElementById('labelAkunDari').textContent = 'Dari Akun';
    } else {
        // Show kategori
        document.getElementById('fieldKategori').classList.remove('hidden');
        kategoriSelect.required = true;
        
        // Hide akun tujuan
        document.getElementById('fieldAkunTujuan').classList.add('hidden');
        document.getElementById('transactionAkunTujuan').required = false;
        
        // Change label
        document.getElementById('labelAkunDari').textContent = 'Akun';
        
        // Filter categories
        const categoryType = tab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran Dasar,Pengeluaran Lain';
        const filteredCategories = categories.filter(c => {
            return c.status === 'Aktif' && categoryType.includes(c.tipe);
        });
        
        kategoriSelect.innerHTML = '<option value="">Pilih Kategori</option>' + 
            filteredCategories.map(cat => `
                <option value="${cat.nama}">${cat.icon} ${cat.nama}</option>
            `).join('');
    }
}

// ============================================
// SUBMIT TRANSACTION
// ============================================
async function submitTransaction(event) {
    event.preventDefault();
    
    const tipe = document.getElementById('transactionTipe').value;
    const tanggal = document.getElementById('transactionTanggal').value;
    const kategori = document.getElementById('transactionKategori').value;
    const akun = document.getElementById('transactionAkun').value;
    const akunTujuan = document.getElementById('transactionAkunTujuan').value;
    const nominal = parseFloat(document.getElementById('transactionNominal').value);
    const keterangan = document.getElementById('transactionKeterangan').value;
    
    // Validation
    if (!tanggal || !akun || !nominal) {
        showAlert('Mohon isi semua field yang diperlukan!', 'error');
        return;
    }
    
    if (tipe === 'Transfer') {
        if (!akunTujuan) {
            showAlert('Pilih akun tujuan untuk transfer!', 'error');
            return;
        }
        if (akun === akunTujuan) {
            showAlert('Akun asal dan tujuan tidak boleh sama!', 'error');
            return;
        }
    } else {
        if (!kategori) {
            showAlert('Pilih kategori transaksi!', 'error');
            return;
        }
    }
    
    showLoading();
    
    try {
        // Call Apps Script
        const result = await callAppsScript('addTransaction', {
            tipe: tipe,
            tanggal: tanggal,
            kategori: tipe === 'Transfer' ? 'Transfer' : kategori,
            akun: akun,
            akunTujuan: akunTujuan || '',
            nominal: nominal,
            keterangan: keterangan
        });
        
        if (result.success) {
            // Reload data
            await loadAllData();
            
            // Re-render dashboard & transactions
            initDashboard();
            if (document.getElementById('page-transactions').classList.contains('active')) {
                initTransactionsPage();
            }
            
            // Close modal
            closeAddTransactionModal();
            
            // Show success
            hideLoading();
            showAlert('✅ Transaksi berhasil ditambahkan!', 'success');
        } else {
            hideLoading();
            showAlert('❌ Gagal menambahkan transaksi: ' + result.message, 'error');
        }
        
    } catch (error) {
        console.error('Submit transaction error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan. Silakan coba lagi.', 'error');
    }
}

// ============================================
// EXPORT TRANSACTIONS CSV
// ============================================
function exportTransactionsCSV() {
    const filteredTransactions = getFilteredTransactions();
    
    if (filteredTransactions.length === 0) {
        showAlert('Tidak ada data untuk di-export', 'warning');
        return;
    }
    
    // CSV Header
    let csv = '\uFEFF'; // BOM for UTF-8
    csv += 'No,Tanggal,Tipe,Kategori,Akun,Nominal,Keterangan\n';
    
    // CSV Data
    filteredTransactions.forEach((trx, index) => {
        const row = [
            index + 1,
            trx.tanggal,
            trx.tipe,
            trx.kategori,
            trx.akun,
            trx.nominal,
            `"${trx.keterangan.replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transaksi_${currentFilter.bulan}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('✅ CSV berhasil di-download!', 'success');
}

// ============================================
// ADD STYLE FOR TRANSACTION TABS
// ============================================
const transactionTabStyle = document.createElement('style');
transactionTabStyle.textContent = `
    .transaction-tab {
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        color: #6B7280;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
    }
    
    .transaction-tab:hover {
        color: #111827;
        background-color: #F3F4F6;
        border-radius: 0.5rem 0.5rem 0 0;
    }
    
    .transaction-tab.active {
        color: #059669;
        border-bottom-color: #059669;
        font-weight: 600;
    }
`;
document.head.appendChild(transactionTabStyle);

console.log('✅ transactions.js loaded');

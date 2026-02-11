// ============================================
// DOMPET KU - TRANSACTIONS MODULE
// VERSION 2.1 - FULL COMPLETE + FIXED
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

    // Sync filter bulan dengan currentMonth
    currentFilter.bulan = currentMonth;

    renderTransactionFilters();
    renderTransactionsTable();
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
                    <option value="Pemasukan">📈 Pemasukan</option>
                    <option value="Pengeluaran">📉 Pengeluaran</option>
                    <option value="Transfer">🔄 Transfer</option>
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
            <div class="flex gap-2">
                <button onclick="shareMonthlyTransactionSummary()" class="text-sm text-green-600 hover:text-green-700 font-medium">
                    📱 Share WA
                </button>
                <button onclick="exportTransactionsCSV()" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    📥 Export CSV
                </button>
            </div>
        </div>
    `;
}

// ============================================
// GET AVAILABLE MONTHS
// ============================================
function getAvailableMonths() {
    const months = new Set();

    transactions.forEach(t => {
        if (t.tanggal) {
            // ✅ FIX: gunakan convertToInternalDate supaya format apapun bisa diproses
            const internal = convertToInternalDate(t.tanggal);
            if (internal) months.add(internal.substring(0, 7));
        }
    });

    // Tambahkan currentMonth jika belum ada
    months.add(currentMonth);

    return Array.from(months).sort().reverse();
}

// ============================================
// UPDATE FILTER
// ============================================
function updateTransactionFilter(filterType, value) {
    currentFilter[filterType] = value;
    currentTransactionPage = 1;
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

    const filterTipe     = document.getElementById('filterTipe');
    const filterKategori = document.getElementById('filterKategori');
    const filterAkun     = document.getElementById('filterAkun');
    const filterBulan    = document.getElementById('filterBulan');

    if (filterTipe)     filterTipe.value     = 'all';
    if (filterKategori) filterKategori.value = 'all';
    if (filterAkun)     filterAkun.value     = 'all';
    if (filterBulan)    filterBulan.value    = currentMonth;

    currentTransactionPage = 1;
    renderTransactionsTable();
    renderTransactionSummary();
}

// ============================================
// GET FILTERED TRANSACTIONS
// ============================================
function getFilteredTransactions() {
    return transactions.filter(t => {
        if (!t.tanggal) return false;

        // ✅ FIX: normalize dulu sebelum filter bulan
        const internalDate = convertToInternalDate(t.tanggal);
        if (!internalDate) return false;

        // Filter bulan
        if (!internalDate.startsWith(currentFilter.bulan)) return false;

        // Filter tipe
        if (currentFilter.tipe !== 'all' && t.tipe !== currentFilter.tipe) return false;

        // Filter kategori
        if (currentFilter.kategori !== 'all' && t.kategori !== currentFilter.kategori) return false;

        // Filter akun
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

    // ✅ FIX: sort pakai convertToInternalDate supaya konsisten
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        const dateA = new Date(convertToInternalDate(a.tanggal) || '1970-01-01');
        const dateB = new Date(convertToInternalDate(b.tanggal) || '1970-01-01');
        return dateB - dateA;
    });

    // Pagination
    const totalPages   = Math.ceil(sortedTransactions.length / TRANSACTIONS_PER_PAGE);
    const startIndex   = (currentTransactionPage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex     = startIndex + TRANSACTIONS_PER_PAGE;
    const paginated    = sortedTransactions.slice(startIndex, endIndex);

    // Update record count
    const recordCountEl = document.getElementById('transactionRecordCount');
    if (recordCountEl) {
        if (sortedTransactions.length === 0) {
            recordCountEl.textContent = 'Tidak ada transaksi';
        } else {
            recordCountEl.textContent =
                `Menampilkan ${startIndex + 1}–${Math.min(endIndex, sortedTransactions.length)} dari ${sortedTransactions.length} transaksi`;
        }
    }

    if (paginated.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-12 text-center text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p class="font-medium">Tidak ada transaksi</p>
                    <p class="text-sm mt-1">Coba ubah filter atau tambah transaksi baru</p>
                </td>
            </tr>
        `;
        const paginationEl = document.getElementById('transactionPagination');
        if (paginationEl) paginationEl.classList.add('hidden');
        return;
    }

    container.innerHTML = paginated.map((trx, index) => {
        const category   = categories.find(c => c.nama === trx.kategori);
        const icon       = category ? category.icon : '📌';
        const isIncome   = trx.tipe === 'Pemasukan';
        const isTransfer = trx.tipe === 'Transfer';

        let amountClass  = 'text-gray-900';
        let amountPrefix = '';
        if (isIncome)       { amountClass = 'text-green-600'; amountPrefix = '+'; }
        else if (!isTransfer) { amountClass = 'text-red-600';   amountPrefix = '-'; }

        return `
            <tr class="hover:bg-gray-50 transition-colors group">
                <td class="px-3 py-3 text-xs sm:text-sm text-center text-gray-500">
                    ${startIndex + index + 1}
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                    ${formatDate(trx.tanggal)}
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm">
                    <span class="badge ${isIncome ? 'badge-success' : isTransfer ? 'badge-info' : 'badge-danger'}">
                        ${trx.tipe}
                    </span>
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm">
                    <div class="flex items-center gap-1">
                        <span class="text-base">${icon}</span>
                        <span class="truncate max-w-[100px]">${trx.kategori}</span>
                    </div>
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm text-gray-700">
                    ${trx.akun}
                    ${isTransfer ? `<br><span class="text-xs text-gray-400">→ ${trx.akunTujuan}</span>` : ''}
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm font-bold ${amountClass} text-right whitespace-nowrap">
                    ${amountPrefix}${formatCurrency(trx.nominal)}
                </td>
                <td class="px-3 py-3 text-xs sm:text-sm text-gray-500 max-w-[120px]">
                    <div class="flex items-center justify-between gap-2">
                        <span class="truncate" title="${trx.keterangan || ''}">${trx.keterangan || '-'}</span>
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button onclick="showTransactionDetail('${trx.id}')"
                                    class="text-blue-400 hover:text-blue-600 text-xs" title="Detail">
                                👁️
                            </button>
                            <button onclick="confirmDeleteTransaction('${trx.id}')"
                                    class="text-red-400 hover:text-red-600 text-xs" title="Hapus">
                                🗑️
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

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
            <div class="flex gap-1 flex-wrap justify-center">
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || i === totalPages ||
            (i >= currentTransactionPage - 1 && i <= currentTransactionPage + 1)
        ) {
            paginationHTML += `
                <button onclick="goToTransactionPage(${i})"
                        class="w-9 h-9 rounded-lg font-medium text-sm
                               ${i === currentTransactionPage
                                   ? 'bg-green-600 text-white'
                                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                    ${i}
                </button>
            `;
        } else if (
            i === currentTransactionPage - 2 ||
            i === currentTransactionPage + 2
        ) {
            paginationHTML += `<span class="flex items-center text-gray-400 px-1">...</span>`;
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
        <p class="text-center text-xs text-gray-400 mt-2">
            Halaman ${currentTransactionPage} dari ${totalPages}
        </p>
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
                    </svg>
                </div>
            </div>

            <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-blue-700">Saldo Bulan Ini</p>
                        <p class="text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'} mt-1">
                            ${formatCurrency(saldo)}
                        </p>
                    </div>
                    <svg class="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
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

    document.getElementById('addTransactionForm').reset();
    document.getElementById('transactionTanggal').valueAsDate = new Date();
    modal.classList.add('active');
    switchTransactionTab('pemasukan');
}

function closeAddTransactionModal() {
    const modal = document.getElementById('addTransactionModal');
    if (modal) modal.classList.remove('active');
}

// ============================================
// CREATE ADD TRANSACTION MODAL
// ============================================
function createAddTransactionModal() {
    const modalHTML = `
        <div id="addTransactionModal" class="modal">
            <div class="modal-content">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">Tambah Transaksi</h3>
                        <button onclick="closeAddTransactionModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <div class="transaction-tabs-container">
                        <button onclick="switchTransactionTab('pemasukan')" class="transaction-tab active" data-tab="pemasukan">
                            📈 Pemasukan
                        </button>
                        <button onclick="switchTransactionTab('pengeluaran')" class="transaction-tab" data-tab="pengeluaran">
                            📉 Pengeluaran
                        </button>
                        <button onclick="switchTransactionTab('transfer')" class="transaction-tab" data-tab="transfer">
                            🔄 Transfer
                        </button>
                    </div>

                    <form id="addTransactionForm" onsubmit="submitTransaction(event)">
                        <input type="hidden" id="transactionTipe" value="Pemasukan">

                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                                <input type="date" id="transactionTanggal" required class="input">
                            </div>

                            <div id="fieldKategori">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                <select id="transactionKategori" required class="input">
                                    <option value="">Pilih Kategori</option>
                                </select>
                            </div>

                            <div id="fieldAkunDari">
                                <label class="block text-sm font-medium text-gray-700 mb-2" id="labelAkunDari">Akun</label>
                                <select id="transactionAkun" required class="input">
                                    <option value="">Pilih Akun</option>
                                    ${accounts.filter(a => a.status === 'Aktif').map(acc => `
                                        <option value="${acc.nama}">${getAccountIcon(acc.tipe)} ${acc.nama} (${formatCurrency(acc.saldoSekarang)})</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div id="fieldAkunTujuan" class="hidden">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Ke Akun</label>
                                <select id="transactionAkunTujuan" class="input">
                                    <option value="">Pilih Akun Tujuan</option>
                                    ${accounts.filter(a => a.status === 'Aktif').map(acc => `
                                        <option value="${acc.nama}">${getAccountIcon(acc.tipe)} ${acc.nama}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nominal</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="transactionNominal" required min="0" step="1000"
                                           class="input pl-12" placeholder="0">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Keterangan (Opsional)</label>
                                <textarea id="transactionKeterangan" rows="3" class="input"
                                          placeholder="Catatan tambahan..."></textarea>
                            </div>
                        </div>

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
    document.getElementById('transactionTanggal').valueAsDate = new Date();
    document.getElementById('addTransactionModal').classList.add('active');
    switchTransactionTab('pemasukan');
}

// ============================================
// SWITCH TRANSACTION TAB
// ============================================
function switchTransactionTab(tab) {
    document.querySelectorAll('.transaction-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) btn.classList.add('active');
    });

    let tipe = 'Pemasukan';
    if (tab === 'pengeluaran') tipe = 'Pengeluaran';
    if (tab === 'transfer')    tipe = 'Transfer';
    document.getElementById('transactionTipe').value = tipe;

    const kategoriSelect  = document.getElementById('transactionKategori');
    const fieldKategori   = document.getElementById('fieldKategori');
    const fieldAkunTujuan = document.getElementById('fieldAkunTujuan');
    const labelAkunDari   = document.getElementById('labelAkunDari');
    const akunTujuanSel   = document.getElementById('transactionAkunTujuan');

    if (tab === 'transfer') {
        if (fieldKategori)   fieldKategori.classList.add('hidden');
        if (kategoriSelect)  kategoriSelect.required = false;
        if (fieldAkunTujuan) fieldAkunTujuan.classList.remove('hidden');
        if (akunTujuanSel)   akunTujuanSel.required = true;
        if (labelAkunDari)   labelAkunDari.textContent = 'Dari Akun';
    } else {
        if (fieldKategori)   fieldKategori.classList.remove('hidden');
        if (kategoriSelect)  kategoriSelect.required = true;
        if (fieldAkunTujuan) fieldAkunTujuan.classList.add('hidden');
        if (akunTujuanSel)   akunTujuanSel.required = false;
        if (labelAkunDari)   labelAkunDari.textContent = 'Akun';

        const categoryType = tab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
        const filtered = categories.filter(c =>
            c.status === 'Aktif' && (c.tipe === categoryType || c.tipe.includes(categoryType))
        );

        if (kategoriSelect) {
            kategoriSelect.innerHTML = '<option value="">Pilih Kategori</option>' +
                filtered.map(cat => `<option value="${cat.nama}">${cat.icon} ${cat.nama}</option>`).join('');
        }
    }
}

// ============================================
// SUBMIT TRANSACTION
// ============================================
async function submitTransaction(event) {
    event.preventDefault();

    const tipe        = document.getElementById('transactionTipe').value;
    const tanggalInput = document.getElementById('transactionTanggal').value; // YYYY-MM-DD
    const kategori    = document.getElementById('transactionKategori').value;
    const akun        = document.getElementById('transactionAkun').value;
    const akunTujuan  = document.getElementById('transactionAkunTujuan').value;
    const nominal     = parseFloat(document.getElementById('transactionNominal').value);
    const keterangan  = document.getElementById('transactionKeterangan').value;

    if (!tanggalInput || !akun || !nominal || nominal <= 0) {
        showAlert('Mohon isi semua field yang diperlukan!', 'error');
        return;
    }

    if (tipe === 'Transfer') {
        if (!akunTujuan)          { showAlert('Pilih akun tujuan untuk transfer!', 'error'); return; }
        if (akun === akunTujuan)  { showAlert('Akun asal dan tujuan tidak boleh sama!', 'error'); return; }
    } else {
        if (!kategori) { showAlert('Pilih kategori transaksi!', 'error'); return; }
    }

    showLoading();

    try {
        const result = await callAppsScript('addTransaction', {
            tipe,
            tanggal:    tanggalInput,
            kategori:   tipe === 'Transfer' ? 'Transfer' : kategori,
            akun,
            akunTujuan: akunTujuan || '',
            nominal,
            keterangan: keterangan || ''
        });

        if (result.success) {
            await loadAllData();
            initDashboard();

            const trxPage = document.getElementById('page-transactions');
            if (trxPage && trxPage.classList.contains('active')) initTransactionsPage();

            const allocPage = document.getElementById('page-allocations');
            if (allocPage && allocPage.classList.contains('active')) initAllocationsPage();

            closeAddTransactionModal();
            hideLoading();
            showAlert('✅ Transaksi berhasil ditambahkan!', 'success');
        } else {
            hideLoading();
            showAlert('❌ Gagal: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Submit transaction error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan: ' + error.message, 'error');
    }
}

// ============================================
// SHOW TRANSACTION DETAIL MODAL
// ============================================
function showTransactionDetail(trxId) {
    const t = transactions.find(trx => trx.id === trxId);
    if (!t) return;

    const category     = categories.find(c => c.nama === t.kategori);
    const icon         = category ? category.icon : '📌';
    const isIncome     = t.tipe === 'Pemasukan';
    const isTransfer   = t.tipe === 'Transfer';
    const amountClass  = isIncome ? 'text-green-600' : isTransfer ? 'text-blue-600' : 'text-red-600';
    const amountPrefix = isIncome ? '+' : isTransfer ? '↔' : '-';

    const existing = document.getElementById('transactionDetailModal');
    if (existing) existing.remove();

    const modalHTML = `
        <div id="transactionDetailModal" class="modal active">
            <div class="modal-content max-w-md">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900">Detail Transaksi</h3>
                        <button onclick="document.getElementById('transactionDetailModal').remove()"
                                class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <div class="flex flex-col items-center mb-6">
                        <div class="w-16 h-16 rounded-full
                            ${isIncome ? 'bg-green-100' : isTransfer ? 'bg-blue-100' : 'bg-red-100'}
                            flex items-center justify-center text-3xl mb-3">
                            ${icon}
                        </div>
                        <p class="text-3xl font-bold ${amountClass}">
                            ${amountPrefix}${formatCurrency(t.nominal)}
                        </p>
                        <p class="text-gray-500 mt-1">${t.kategori}</p>
                    </div>

                    <div class="space-y-3 bg-gray-50 rounded-xl p-4">
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-500">Tanggal</span>
                            <span class="text-sm font-semibold">${formatDate(t.tanggal)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-500">Tipe</span>
                            <span class="text-sm font-semibold">${t.tipe}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-500">Akun</span>
                            <span class="text-sm font-semibold">${t.akun}</span>
                        </div>
                        ${isTransfer ? `
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-500">Ke Akun</span>
                            <span class="text-sm font-semibold">${t.akunTujuan}</span>
                        </div>` : ''}
                        ${t.keterangan ? `
                        <div class="flex justify-between gap-4">
                            <span class="text-sm text-gray-500 flex-shrink-0">Keterangan</span>
                            <span class="text-sm font-semibold text-right">${t.keterangan}</span>
                        </div>` : ''}
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-500">ID</span>
                            <span class="text-xs font-mono text-gray-400">${t.id}</span>
                        </div>
                    </div>

                    <div class="flex gap-3 mt-6">
                        <button onclick="shareTransactionWhatsApp('${t.id}')"
                                class="flex-1 btn btn-secondary text-sm">
                            📱 Share WA
                        </button>
                        <button onclick="confirmDeleteTransaction('${t.id}'); document.getElementById('transactionDetailModal').remove();"
                                class="flex-1 text-sm px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                            🗑️ Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ============================================
// CONFIRM & DELETE TRANSACTION
// ============================================
function confirmDeleteTransaction(trxId) {
    const t = transactions.find(trx => trx.id === trxId);
    if (!t) return;

    const existing = document.getElementById('confirmDeleteTrxModal');
    if (existing) existing.remove();

    const modalHTML = `
        <div id="confirmDeleteTrxModal" class="modal active">
            <div class="modal-content max-w-sm">
                <div class="p-6 text-center">
                    <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Transaksi?</h3>
                    <p class="text-gray-600 text-sm mb-1">
                        <strong>${t.tipe}</strong> • ${t.kategori}
                    </p>
                    <p class="text-xl font-bold ${t.tipe === 'Pemasukan' ? 'text-green-600' : 'text-red-600'} mb-1">
                        ${formatCurrency(t.nominal)}
                    </p>
                    <p class="text-gray-500 text-sm mb-4">${formatDate(t.tanggal)}</p>
                    <p class="text-xs text-orange-600 bg-orange-50 rounded-lg p-2 mb-5">
                        ⚠️ Saldo akun akan dikembalikan dan jatah diperbarui otomatis.
                    </p>
                    <div class="flex gap-3">
                        <button onclick="document.getElementById('confirmDeleteTrxModal').remove()"
                                class="flex-1 btn btn-secondary">
                            Batal
                        </button>
                        <button onclick="executeDeleteTransaction('${trxId}')"
                                class="flex-1 btn bg-red-600 text-white hover:bg-red-700">
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function executeDeleteTransaction(trxId) {
    const modal = document.getElementById('confirmDeleteTrxModal');
    if (modal) modal.remove();

    showLoading();
    try {
        const result = await callAppsScript('deleteTransaction', { id: trxId });

        if (result.success) {
            await loadAllData();
            initDashboard();
            initTransactionsPage();

            const allocPage = document.getElementById('page-allocations');
            if (allocPage && allocPage.classList.contains('active')) initAllocationsPage();

            hideLoading();
            showAlert('✅ Transaksi berhasil dihapus!', 'success');
        } else {
            hideLoading();
            showAlert('❌ Gagal: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan: ' + error.message, 'error');
    }
}

// ============================================
// SHARE VIA WHATSAPP
// ============================================
function shareTransactionWhatsApp(trxId) {
    const t = transactions.find(trx => trx.id === trxId);
    if (!t) return;

    const prefix = t.tipe === 'Pemasukan' ? '📈' : t.tipe === 'Transfer' ? '🔄' : '📉';
    const message =
        `${prefix} *${t.tipe.toUpperCase()}*\n\n` +
        `💰 Nominal : Rp ${t.nominal.toLocaleString('id-ID')}\n` +
        `📋 Kategori: ${t.kategori}\n` +
        `🏦 Akun    : ${t.akun}` +
        (t.tipe === 'Transfer' ? `\n➡️ Ke      : ${t.akunTujuan}` : '') +
        `\n📅 Tanggal : ${formatDate(t.tanggal)}` +
        (t.keterangan ? `\n📝 Ket     : ${t.keterangan}` : '') +
        `\n\n_Dompet Ku_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

function shareMonthlyTransactionSummary() {
    const bulan     = currentFilter.bulan || currentMonth;
    const monthTrx  = transactions.filter(t => {
        const internal = convertToInternalDate(t.tanggal);
        return internal && internal.startsWith(bulan);
    });

    const totalPemasukan   = monthTrx.filter(t => t.tipe === 'Pemasukan').reduce((s, t) => s + t.nominal, 0);
    const totalPengeluaran = monthTrx.filter(t => t.tipe === 'Pengeluaran').reduce((s, t) => s + t.nominal, 0);
    const net = totalPemasukan - totalPengeluaran;

    const katMap = {};
    monthTrx.filter(t => t.tipe === 'Pengeluaran').forEach(t => {
        katMap[t.kategori] = (katMap[t.kategori] || 0) + t.nominal;
    });
    const top3 = Object.entries(katMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const top3Text = top3.map(([k, v], i) =>
        `   ${i + 1}. ${k}: Rp ${v.toLocaleString('id-ID')}`
    ).join('\n');

    const message =
        `📊 *RINGKASAN ${formatMonthYear(bulan).toUpperCase()}*\n\n` +
        `📈 Pemasukan : Rp ${totalPemasukan.toLocaleString('id-ID')}\n` +
        `📉 Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}\n` +
        `💰 Net       : ${net >= 0 ? '+' : ''}Rp ${net.toLocaleString('id-ID')}\n` +
        (top3.length > 0 ? `\n🔝 Top Pengeluaran:\n${top3Text}\n` : '') +
        `\n_Dompet Ku - ${new Date().toLocaleDateString('id-ID')}_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

// ============================================
// EXPORT CSV
// ============================================
function exportTransactionsCSV() {
    const filteredTransactions = getFilteredTransactions();

    if (filteredTransactions.length === 0) {
        showAlert('Tidak ada data untuk di-export', 'warning');
        return;
    }

    let csv = '\uFEFF';
    csv += 'No,Tanggal,Tipe,Kategori,Akun,Nominal,Keterangan\n';

    filteredTransactions.forEach((trx, index) => {
        const row = [
            index + 1,
            convertISOtoDisplay(trx.tanggal),
            trx.tipe,
            trx.kategori,
            trx.akun,
            trx.nominal,
            `"${(trx.keterangan || '').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Transaksi_${currentFilter.bulan}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showAlert('✅ CSV berhasil di-download!', 'success');
}

// ============================================
// TAB STYLES
// ============================================
const transactionTabStyle = document.createElement('style');
transactionTabStyle.textContent = `
    .transaction-tab {
        flex: 1;
        padding: 0.75rem 0.5rem;
        font-weight: 500;
        color: #6B7280;
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
        white-space: nowrap;
        text-align: center;
    }
    @media (max-width: 640px) {
        .transaction-tab { padding: 0.625rem 0.25rem; font-size: 0.75rem; }
    }
    .transaction-tab:hover { color: #111827; background-color: #F3F4F6; }
    .transaction-tab.active { color: #059669; border-bottom-color: #059669; font-weight: 700; background-color: #D1FAE5; }
    .transaction-tabs-container {
        display: flex;
        border-bottom: 2px solid #E5E7EB;
        margin-bottom: 1.5rem;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
    .transaction-tabs-container::-webkit-scrollbar { display: none; }
`;
document.head.appendChild(transactionTabStyle);

console.log('✅ transactions.js loaded - VERSION 2.1 COMPLETE');

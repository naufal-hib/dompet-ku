// ============================================
// DOMPET KU - CORE APPLICATION
// VERSION 2.0 - FULL & COMPLETE
// ============================================

// Global State
let accounts = [];
let categories = [];
let transactions = [];
let budgets = [];
let allocations = [];
let debts = [];
let config = {};

// Current month - INTERNAL FORMAT: YYYY-MM
let currentMonth = new Date().toISOString().slice(0, 7);

// ============================================
// DATE UTILITIES - KONSISTEN YYYY-MM-DD
// ============================================

/**
 * Convert ANY date format → YYYY-MM-DD (internal format)
 */
function convertToInternalDate(dateStr) {
    if (!dateStr) return '';

    // Jika sudah YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) {
        return String(dateStr);
    }

    // DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(dateStr))) {
        const parts = String(dateStr).split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Coba parse sebagai Date object
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } catch (e) {
        console.error('Invalid date:', dateStr);
    }

    return '';
}

// Alias untuk kompatibilitas dengan kode lama
function convertDateToISO(dateStr) {
    return convertToInternalDate(dateStr);
}

/**
 * Convert YYYY-MM-DD → Display format (DD/MM/YYYY atau sesuai config)
 */
function convertISOtoDisplay(dateStr) {
    if (!dateStr) return '';

    const internalDate = convertToInternalDate(dateStr);
    if (!internalDate) return dateStr;

    const [year, month, day] = internalDate.split('-');
    const format = config.format_tanggal || 'DD/MM/YYYY';

    if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
    } else if (format === 'MM/DD/YYYY') {
        return `${month}/${day}/${year}`;
    } else {
        return internalDate; // YYYY-MM-DD
    }
}

/**
 * Extract YYYY-MM dari tanggal format apapun
 */
function getMonthFromDate(dateStr) {
    const internalDate = convertToInternalDate(dateStr);
    return internalDate ? internalDate.substring(0, 7) : '';
}

/**
 * Get last month dari YYYY-MM
 */
function getLastMonth(monthStr) {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() - 1);
    const lastYear = date.getFullYear();
    const lastMonth = String(date.getMonth() + 1).padStart(2, '0');
    return `${lastYear}-${lastMonth}`;
}

// ============================================
// INITIALIZE APP
// ============================================
async function initApp() {
    console.log('📱 Initializing Dompet Ku...');

    updateCurrentDate();
    showLoading();

    try {
        await loadAllData();
        initDashboard();
        hideLoading();
        console.log('✅ App initialized successfully!');
        console.log('Current Month:', currentMonth);
        console.log('Config:', config);

    } catch (error) {
        console.error('❌ Initialization error:', error);
        hideLoading();
        showAlert('Gagal memuat data: ' + error.message, 'error');
    }
}

// ============================================
// LOAD ALL DATA - VIA APPS SCRIPT (NO API KEY)
// ============================================
async function loadAllData() {
    console.log('🔄 Loading data from Google Sheets via Apps Script...');

    try {
        const result = await callAppsScript('getAllData', {});

        if (result.success && result.data) {
            accounts    = result.data.accounts    || [];
            categories  = result.data.categories  || [];
            transactions = result.data.transactions || [];
            budgets     = result.data.budgets     || [];
            config      = result.data.config      || {};
            allocations = result.data.allocations || [];
            debts       = result.data.debts       || [];

            // Normalize semua tanggal → YYYY-MM-DD
            transactions = transactions.map(t => ({
                ...t,
                tanggal: convertToInternalDate(t.tanggal)
            }));

            debts = debts.map(d => ({
                ...d,
                tanggalMulai: convertToInternalDate(d.tanggalMulai),
                tanggalJatuhTempo: convertToInternalDate(d.tanggalJatuhTempo)
            }));

            // Update current month dari config
            if (config.periode_aktif) {
                currentMonth = config.periode_aktif;
            }

            console.log('✅ Data loaded:', {
                accounts: accounts.length,
                categories: categories.length,
                transactions: transactions.length,
                budgets: budgets.length,
                allocations: allocations.length,
                debts: debts.length,
                currentMonth: currentMonth
            });

            saveToCache();

        } else {
            throw new Error('Gagal memuat data dari server: ' + (result.message || 'Unknown error'));
        }

    } catch (error) {
        console.error('❌ Error loading data:', error);

        // Fallback ke cache
        if (loadFromCache()) {
            console.log('✅ Loaded from cache');
            showAlert('Data dimuat dari cache (offline mode). ' + error.message, 'warning');
        } else {
            throw error;
        }
    }
}

// ============================================
// PROCESS DATA FUNCTIONS (untuk parse cache)
// ============================================
function processAccounts(data) {
    if (!data || data.length < 2) return [];
    return data.slice(1).map(row => ({
        id: row[0],
        nama: row[1],
        tipe: row[2],
        saldoAwal: parseFloat(row[3]) || 0,
        saldoSekarang: parseFloat(row[4]) || 0,
        warna: row[5] || '#3B82F6',
        status: row[6] || 'Aktif'
    }));
}

function processCategories(data) {
    if (!data || data.length < 2) return [];
    return data.slice(1).map(row => ({
        id: row[0],
        nama: row[1],
        tipe: row[2],
        icon: row[3] || '📌',
        warna: row[4] || '#6B7280',
        status: row[5] || 'Aktif'
    }));
}

function processTransactions(data) {
    if (!data || data.length < 2) return [];
    return data.slice(1).map(row => ({
        id: row[0],
        tanggal: convertToInternalDate(row[1]),
        tipe: row[2],
        kategori: row[3],
        akun: row[4],
        nominal: parseFloat(row[5]) || 0,
        keterangan: row[6] || '',
        akunTujuan: row[7] || '',
        created: row[8]
    }));
}

function processBudgets(data) {
    if (!data || data.length < 2) return [];
    return data.slice(1).map(row => ({
        bulan: row[0],
        kategori: row[1],
        budget: parseFloat(row[2]) || 0,
        terpakai: parseFloat(row[3]) || 0,
        sisa: parseFloat(row[4]) || 0,
        status: row[5] || 'Aman'
    }));
}

function processConfig(data) {
    if (!data || data.length < 2) return {};
    const cfg = {};
    data.slice(1).forEach(row => {
        const key = String(row[0]).toLowerCase().replace(/\s+/g, '_').replace(/[()%]/g, '');
        cfg[key] = row[1];
    });
    return cfg;
}

function processAllocations(data) {
    if (!data || data.length < 2) return [];
    return data.slice(1).map(row => ({
        id: row[0],
        bulan: row[1],
        namaJatah: row[2],
        alokasi: parseFloat(row[3]) || 0,
        terpakai: parseFloat(row[4]) || 0,
        sisa: parseFloat(row[5]) || 0,
        progress: parseInt(row[6]) || 0,
        status: row[7] || 'Aman',
        warningLevel: parseInt(row[8]) || 80,
        kategoriInclude: row[9] ? String(row[9]).split(',').map(k => k.trim()) : [],
        color: row[10] || '#6B7280'
    }));
}

function processDebts(data) {
    if (!data || data.length < 2) return [];
    return data.slice(1).map(row => ({
        id: row[0],
        tipe: row[1],
        namaPihak: row[2],
        totalNominal: parseFloat(row[3]) || 0,
        terbayar: parseFloat(row[4]) || 0,
        sisa: parseFloat(row[5]) || 0,
        tanggalMulai: convertToInternalDate(row[6]),
        tanggalJatuhTempo: convertToInternalDate(row[7]),
        status: row[8] || 'Aktif',
        keterangan: row[9] || '',
        cicilanPerBulan: parseFloat(row[10]) || 0,
        reminderDays: parseInt(row[11]) || 7
    }));
}

// ============================================
// CACHE FUNCTIONS
// ============================================
function saveToCache() {
    try {
        localStorage.setItem('dompetku_accounts',     JSON.stringify(accounts));
        localStorage.setItem('dompetku_categories',   JSON.stringify(categories));
        localStorage.setItem('dompetku_transactions', JSON.stringify(transactions));
        localStorage.setItem('dompetku_budgets',      JSON.stringify(budgets));
        localStorage.setItem('dompetku_config',       JSON.stringify(config));
        localStorage.setItem('dompetku_allocations',  JSON.stringify(allocations));
        localStorage.setItem('dompetku_debts',        JSON.stringify(debts));
        localStorage.setItem('dompetku_lastUpdate',   new Date().toISOString());
        console.log('✅ Data cached successfully');
    } catch (e) {
        console.error('Cache save error:', e);
    }
}

function loadFromCache() {
    try {
        const cachedAccounts = localStorage.getItem('dompetku_accounts');
        const cachedCategories = localStorage.getItem('dompetku_categories');
        const cachedTransactions = localStorage.getItem('dompetku_transactions');

        if (cachedAccounts && cachedCategories && cachedTransactions) {
            accounts    = JSON.parse(cachedAccounts);
            categories  = JSON.parse(cachedCategories);
            transactions = JSON.parse(cachedTransactions);
            budgets     = JSON.parse(localStorage.getItem('dompetku_budgets')     || '[]');
            config      = JSON.parse(localStorage.getItem('dompetku_config')      || '{}');
            allocations = JSON.parse(localStorage.getItem('dompetku_allocations') || '[]');
            debts       = JSON.parse(localStorage.getItem('dompetku_debts')       || '[]');

            if (config.periode_aktif) {
                currentMonth = config.periode_aktif;
            }

            return true;
        }
        return false;
    } catch (e) {
        console.error('Cache load error:', e);
        return false;
    }
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
        loading.classList.add('flex');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
}

function showAlert(message, type = 'info') {
    const colors = {
        success: 'bg-green-100 border-green-500 text-green-800',
        error:   'bg-red-100 border-red-500 text-red-800',
        warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
        info:    'bg-blue-100 border-blue-500 text-blue-800'
    };

    // Remove alert yang sudah ada
    const existing = document.querySelectorAll('.dompet-alert');
    existing.forEach(el => el.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `dompet-alert fixed top-4 right-4 ${colors[type]} border-l-4 p-4 rounded shadow-lg z-50 max-w-md`;
    alertDiv.innerHTML = `
        <div class="flex items-start">
            <svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <p class="font-medium text-sm">${message}</p>
        </div>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function updateCurrentDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('id-ID', options);
    }
}

// ============================================
// FORMATTING FUNCTIONS
// ============================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return '-';

    const internalDate = convertToInternalDate(dateString);
    if (!internalDate) return '-';

    const [year, month, day] = internalDate.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateShort(dateString) {
    if (!dateString) return '-';

    const internalDate = convertToInternalDate(dateString);
    if (!internalDate) return '-';

    const [year, month, day] = internalDate.split('-');
    return `${day}/${month}`;
}

function formatMonthYear(monthStr) {
    if (!monthStr) return '-';
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================
function switchPage(pageName) {
    console.log('Switching to page:', pageName);

    // Hide semua pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    // Show page yang dipilih
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update desktop nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // Update mobile nav
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageName) {
            btn.classList.add('active');
        }
    });

    // Init page-specific content
    if (pageName === 'transactions') {
        initTransactionsPage();
    } else if (pageName === 'allocations') {
        initAllocationsPage();
    } else if (pageName === 'debts') {
        initDebtsPage();
    } else if (pageName === 'reports') {
        initReportsPage();
    } else if (pageName === 'settings') {
        initSettingsPage();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// ADD TRANSACTION MODAL
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
    if (modal) {
        modal.classList.remove('active');
    }
}

function createAddTransactionModal() {
    const activeAccounts = accounts.filter(a => a.status === 'Aktif');

    const modalHTML = `
        <div id="addTransactionModal" class="modal">
            <div class="modal-content">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">Tambah Transaksi</h3>
                        <button onclick="closeAddTransactionModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div class="transaction-tabs-container">
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
                                    ${activeAccounts.map(acc => `
                                        <option value="${acc.nama}">${getAccountIcon(acc.tipe)} ${acc.nama} (${formatCurrency(acc.saldoSekarang)})</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div id="fieldAkunTujuan" class="hidden">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Ke Akun</label>
                                <select id="transactionAkunTujuan" class="input">
                                    <option value="">Pilih Akun Tujuan</option>
                                    ${activeAccounts.map(acc => `
                                        <option value="${acc.nama}">${getAccountIcon(acc.tipe)} ${acc.nama} (${formatCurrency(acc.saldoSekarang)})</option>
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
                                <textarea id="transactionKeterangan" rows="2" class="input"
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

function getAccountIcon(tipe) {
    const icons = { 'Bank': '🏦', 'Cash': '💵', 'E-wallet': '📱' };
    return icons[tipe] || '💳';
}

// ============================================
// ADD ACCOUNT MODAL
// ============================================
function showAddAccountModal() {
    const modal = document.getElementById('addAccountModal');
    if (!modal) {
        createAddAccountModal();
        return;
    }

    document.getElementById('addAccountForm').reset();
    document.getElementById('accountWarna').value = '#10B981';
    modal.classList.add('active');
}

function closeAddAccountModal() {
    const modal = document.getElementById('addAccountModal');
    if (modal) modal.classList.remove('active');
}

function createAddAccountModal() {
    const modalHTML = `
        <div id="addAccountModal" class="modal">
            <div class="modal-content">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">Tambah Akun Baru</h3>
                        <button onclick="closeAddAccountModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <form id="addAccountForm" onsubmit="submitAccount(event)">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nama Akun</label>
                                <input type="text" id="accountNama" required class="input"
                                       placeholder="Contoh: BCA Tabungan, Cash Dompet, OVO">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Akun</label>
                                <select id="accountTipe" required class="input">
                                    <option value="">Pilih Tipe</option>
                                    <option value="Bank">🏦 Bank</option>
                                    <option value="Cash">💵 Cash</option>
                                    <option value="E-wallet">📱 E-wallet</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Saldo Awal</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="accountSaldo" required min="0" step="1000"
                                           class="input pl-12" placeholder="0">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Warna</label>
                                <div class="grid grid-cols-6 gap-2">
                                    ${['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'].map((color, i) => `
                                        <button type="button" onclick="selectAccountColor('${color}')"
                                                class="w-full h-10 rounded-lg border-2 ${i === 0 ? 'border-gray-800 ring-4 ring-offset-1' : 'border-gray-200'} hover:border-gray-400 transition-colors"
                                                style="background-color: ${color};"
                                                data-color="${color}">
                                        </button>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="accountWarna" value="#10B981">
                            </div>
                        </div>

                        <div class="flex space-x-3 mt-6">
                            <button type="button" onclick="closeAddAccountModal()" class="flex-1 btn btn-secondary">
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
    document.getElementById('addAccountModal').classList.add('active');
}

function selectAccountColor(color) {
    document.getElementById('accountWarna').value = color;

    document.querySelectorAll('[data-color]').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-offset-1', 'border-gray-800');
        btn.classList.add('border-gray-200');
    });

    const selectedBtn = document.querySelector(`[data-color="${color}"]`);
    if (selectedBtn) {
        selectedBtn.classList.remove('border-gray-200');
        selectedBtn.classList.add('ring-4', 'ring-offset-1', 'border-gray-800');
    }
}

// ============================================
// SUBMIT ACCOUNT
// ============================================
async function submitAccount(event) {
    event.preventDefault();

    const data = {
        nama: document.getElementById('accountNama').value,
        tipe: document.getElementById('accountTipe').value,
        saldoAwal: parseFloat(document.getElementById('accountSaldo').value) || 0,
        warna: document.getElementById('accountWarna').value
    };

    showLoading();

    try {
        const result = await callAppsScript('addAccount', data);

        if (result.success) {
            await loadAllData();
            initDashboard();
            closeAddAccountModal();
            hideLoading();
            showAlert('✅ Akun berhasil ditambahkan!', 'success');
        } else {
            hideLoading();
            showAlert('❌ Gagal: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Submit account error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan: ' + error.message, 'error');
    }
}

// ============================================
// REFRESH DATA
// ============================================
async function refreshData() {
    showLoading();
    try {
        await loadAllData();
        initDashboard();

        // Update halaman aktif
        const activePage = document.querySelector('.page-content.active');
        if (activePage) {
            const pageId = activePage.id.replace('page-', '');
            if (pageId === 'transactions') initTransactionsPage();
            if (pageId === 'allocations') initAllocationsPage();
            if (pageId === 'debts') initDebtsPage();
            if (pageId === 'reports') initReportsPage();
            if (pageId === 'settings') initSettingsPage();
        }

        showAlert('✅ Data berhasil diperbarui!', 'success');
    } catch (error) {
        console.error('Refresh error:', error);
        showAlert('❌ Gagal memperbarui data: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ============================================
// CLEAR CACHE
// ============================================
function clearCache() {
    try {
        localStorage.removeItem('dompetku_accounts');
        localStorage.removeItem('dompetku_categories');
        localStorage.removeItem('dompetku_transactions');
        localStorage.removeItem('dompetku_budgets');
        localStorage.removeItem('dompetku_config');
        localStorage.removeItem('dompetku_allocations');
        localStorage.removeItem('dompetku_debts');
        localStorage.removeItem('dompetku_lastUpdate');
        showAlert('✅ Cache berhasil dihapus!', 'success');
    } catch (error) {
        console.error('Clear cache error:', error);
        showAlert('❌ Gagal menghapus cache', 'error');
    }
}

function confirmDeleteAllCache() {
    if (confirm('⚠️ Yakin ingin menghapus SEMUA cache? Halaman akan reload.')) {
        localStorage.clear();
        showAlert('✅ Cache dihapus! Halaman akan reload...', 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

// ============================================
// TAB STYLE (inject CSS)
// ============================================
const transactionTabStyle = document.createElement('style');
transactionTabStyle.textContent = `
    .transaction-tab {
        flex: 1;
        padding: 0.75rem 0.5rem;
        font-weight: 500;
        color: #6B7280;
        transition: all 0.2s;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
        white-space: nowrap;
        text-align: center;
    }
    .transaction-tab:hover {
        color: #111827;
        background-color: #F3F4F6;
    }
    .transaction-tab.active {
        color: #059669;
        border-bottom: 3px solid #059669;
        font-weight: 700;
        background-color: #D1FAE5;
    }
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

console.log('✅ app.js loaded - VERSION 2.0 COMPLETE');

// ============================================
// DOMPET KU - CORE APPLICATION
// ============================================

// Global State
let accounts = [];
let categories = [];
let transactions = [];
let budgets = [];
let allocations = [];
let debts = [];
let config = {};

// Current month
let currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM

// ============================================
// INITIALIZE APP
// ============================================
async function initApp() {
    console.log('📱 Initializing Dompet Ku...');
    
    // Set current date
    updateCurrentDate();
    
    // Show loading
    showLoading();
    
    try {
        // Load all data
        await loadAllData();
        
        // Initialize dashboard
        initDashboard();
        
        // Hide loading
        hideLoading();
        
        console.log('✅ App initialized successfully!');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        hideLoading();
        showAlert('Gagal memuat data. Periksa koneksi internet dan konfigurasi.', 'error');
    }
}

// ============================================
// LOAD ALL DATA FROM GOOGLE SHEETS
// ============================================
async function loadAllData() {
    console.log('🔄 Loading data from Google Sheets...');
    
    try {
        // Parallel fetch
        const [accountsData, categoriesData, transactionsData, budgetsData, configData, allocationsData, debtsData] = await Promise.all([
            fetchSheetData(SHEET_NAMES.accounts),
            fetchSheetData(SHEET_NAMES.categories),
            fetchSheetData(SHEET_NAMES.transactions),
            fetchSheetData(SHEET_NAMES.budgets),
            fetchSheetData(SHEET_NAMES.config),
            fetchSheetData(SHEET_NAMES.allocations),
            fetchSheetData(SHEET_NAMES.debts)
        ]);
        
        // Process data
        accounts = processAccounts(accountsData);
        categories = processCategories(categoriesData);
        transactions = processTransactions(transactionsData);
        budgets = processBudgets(budgetsData);
        config = processConfig(configData);
        allocations = processAllocations(allocationsData);
        debts = processDebts(debtsData);
        
        // Update current month from config
        if (config.periode_aktif) {
            currentMonth = config.periode_aktif;
        }
        
        console.log('✅ Data loaded:', {
            accounts: accounts.length,
            categories: categories.length,
            transactions: transactions.length,
            budgets: budgets.length,
            allocations: allocations.length,
            debts: debts.length
        });
        
        // Save to localStorage (cache)
        saveToCache();
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        
        // Try to load from cache
        if (loadFromCache()) {
            console.log('✅ Loaded from cache');
            showAlert('Data dimuat dari cache. Koneksi internet bermasalah.', 'warning');
        } else {
            throw error;
        }
    }
}

// ============================================
// FETCH SHEET DATA
// ============================================
async function fetchSheetData(sheetName) {
    const url = getSheetUrl(sheetName);
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch ${sheetName}: ${response.status}`);
    }
    
    const data = await response.json();
    return data.values || [];
}

// ============================================
// PROCESS DATA FUNCTIONS
// ============================================
function processAccounts(data) {
    if (data.length < 2) return [];
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
    if (data.length < 2) return [];
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
    if (data.length < 2) return [];
    return data.slice(1).map(row => ({
        id: row[0],
        tanggal: row[1],
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
    if (data.length < 2) return [];
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
    if (data.length < 2) return {};
    const config = {};
    data.slice(1).forEach(row => {
        const key = row[0].toLowerCase().replace(/\s+/g, '_').replace(/[()%]/g, '');
        config[key] = row[1];
    });
    return config;
}

function processAllocations(data) {
    if (data.length < 2) return [];
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
        kategoriInclude: row[9] ? row[9].split(',') : [],
        color: row[10] || '#6B7280'
    }));
}

function processDebts(data) {
    if (data.length < 2) return [];
    return data.slice(1).map(row => ({
        id: row[0],
        tipe: row[1],
        namaPihak: row[2],
        totalNominal: parseFloat(row[3]) || 0,
        terbayar: parseFloat(row[4]) || 0,
        sisa: parseFloat(row[5]) || 0,
        tanggalMulai: row[6],
        tanggalJatuhTempo: row[7],
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
        localStorage.setItem('dompetku_accounts', JSON.stringify(accounts));
        localStorage.setItem('dompetku_categories', JSON.stringify(categories));
        localStorage.setItem('dompetku_transactions', JSON.stringify(transactions));
        localStorage.setItem('dompetku_budgets', JSON.stringify(budgets));
        localStorage.setItem('dompetku_config', JSON.stringify(config));
        localStorage.setItem('dompetku_allocations', JSON.stringify(allocations));
        localStorage.setItem('dompetku_debts', JSON.stringify(debts));
        localStorage.setItem('dompetku_lastUpdate', new Date().toISOString());
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
            accounts = JSON.parse(cachedAccounts);
            categories = JSON.parse(cachedCategories);
            transactions = JSON.parse(cachedTransactions);
            budgets = JSON.parse(localStorage.getItem('dompetku_budgets') || '[]');
            config = JSON.parse(localStorage.getItem('dompetku_config') || '{}');
            allocations = JSON.parse(localStorage.getItem('dompetku_allocations') || '[]');
            debts = JSON.parse(localStorage.getItem('dompetku_debts') || '[]');
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
        error: 'bg-red-100 border-red-500 text-red-800',
        warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
        info: 'bg-blue-100 border-blue-500 text-blue-800'
    };
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 ${colors[type]} border-l-4 p-4 rounded shadow-lg z-50 max-w-md animate-fadeIn`;
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
        const dateStr = new Date().toLocaleDateString('id-ID', options);
        dateEl.textContent = dateStr;
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
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateShort(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit'
    });
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================
function switchPage(pageName) {
    console.log('Switching to page:', pageName);
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation active states (desktop)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    
    // Update navigation active states (mobile)
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageName) {
            btn.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// ADD TRANSACTION MODAL
// ============================================
function showAddTransactionModal() {
    showAlert('Fitur tambah transaksi akan segera hadir!', 'info');
    // TODO: Implement modal
}

function showAddAccountModal() {
    const modal = document.getElementById('addAccountModal');
    if (!modal) {
        createAddAccountModal();
        return;
    }
    
    document.getElementById('addAccountForm').reset();
    modal.classList.add('active');
}

function closeAddAccountModal() {
    const modal = document.getElementById('addAccountModal');
    if (modal) modal.classList.remove('active');
}

// ============================================
// CREATE ADD ACCOUNT MODAL
// ============================================
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
                                    ${['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'].map(color => `
                                        <button type="button" onclick="selectAccountColor('${color}')" 
                                                class="w-full h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
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
    
    // Update visual selection
    document.querySelectorAll('[data-color]').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-offset-2');
        btn.classList.add('border-2', 'border-gray-200');
    });
    
    const selectedBtn = document.querySelector(`[data-color="${color}"]`);
    if (selectedBtn) {
        selectedBtn.classList.remove('border-2', 'border-gray-200');
        selectedBtn.classList.add('ring-4', 'ring-offset-2');
        selectedBtn.style.setProperty('--tw-ring-color', color);
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
        saldoAwal: parseFloat(document.getElementById('accountSaldo').value),
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
        showAlert('❌ Terjadi kesalahan. Silakan coba lagi.', 'error');
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
        showAlert('Data berhasil diperbarui!', 'success');
    } catch (error) {
        console.error('Refresh error:', error);
        showAlert('Gagal memperbarui data.', 'error');
    } finally {
        hideLoading();
    }
}

console.log('✅ app.js loaded');

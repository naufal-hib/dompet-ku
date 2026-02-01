// ============================================
// DOMPET KU - SETTINGS MODULE
// ============================================

// ============================================
// INITIALIZE SETTINGS PAGE
// ============================================
function initSettingsPage() {
    console.log('⚙️ Initializing settings page...');
    
    renderSettingsContent();
}

// ============================================
// RENDER SETTINGS CONTENT
// ============================================
function renderSettingsContent() {
    const container = document.getElementById('settingsContent');
    if (!container) {
        // Create settings content container if not exists
        const settingsPage = document.getElementById('page-settings');
        if (settingsPage) {
            settingsPage.innerHTML = `
                <h2 class="text-2xl font-bold text-gray-900 mb-6">⚙️ Pengaturan</h2>
                <div id="settingsContent"></div>
            `;
        }
    }
    
    const settingsContainer = document.getElementById('settingsContent') || container;
    if (!settingsContainer) return;
    
    settingsContainer.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- WhatsApp Settings -->
            <div class="card">
                <h3 class="text-lg font-bold mb-4 flex items-center">
                    <span class="text-2xl mr-2">📱</span>
                    WhatsApp Integration
                </h3>
                
                <div class="space-y-3 mb-4">
                    <div class="bg-gray-50 rounded p-3">
                        <p class="text-xs text-gray-600 mb-1">Nomor WhatsApp</p>
                        <p class="font-mono text-sm font-semibold">${config.whatsapp_number || 'Belum diatur'}</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded p-3">
                        <p class="text-xs text-gray-600 mb-1">Fonnte API Key</p>
                        <p class="font-mono text-sm">
                            ${config.fonnte_api_key ? '••••••••' + config.fonnte_api_key.slice(-4) : 'Belum diatur'}
                        </p>
                    </div>
                    
                    <div class="bg-gray-50 rounded p-3">
                        <div class="flex items-center justify-between">
                            <p class="text-xs text-gray-600">Auto Send Daily Summary</p>
                            <span class="badge ${config.auto_send_daily_summary === 'TRUE' ? 'badge-success' : 'badge-danger'}">
                                ${config.auto_send_daily_summary === 'TRUE' ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <button onclick="testWhatsAppConnection()" class="w-full btn btn-primary text-sm">
                        🧪 Test Koneksi
                    </button>
                    <button onclick="sendManualWhatsApp('daily')" class="w-full btn btn-secondary text-sm">
                        📊 Kirim Ringkasan Harian
                    </button>
                    <button onclick="sendManualWhatsApp('weekly')" class="w-full btn btn-secondary text-sm">
                        📈 Kirim Ringkasan Mingguan
                    </button>
                    <button onclick="sendManualWhatsApp('balance')" class="w-full btn btn-secondary text-sm">
                        💰 Kirim Info Saldo
                    </button>
                </div>
                
                <div class="mt-4 pt-4 border-t">
                    <button onclick="showEditWhatsAppModal()" class="w-full btn btn-secondary text-sm">
                        ✏️ Edit Pengaturan WhatsApp
                    </button>
                </div>
            </div>
            
            <!-- Data Management -->
            <div class="card">
                <h3 class="text-lg font-bold mb-4 flex items-center">
                    <span class="text-2xl mr-2">💾</span>
                    Data Management
                </h3>
                
                <div class="space-y-3 mb-4">
                    <div class="bg-gray-50 rounded p-3">
                        <p class="text-xs text-gray-600 mb-1">Last Update</p>
                        <p class="text-sm font-semibold" id="settingsLastUpdate">-</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded p-3">
                        <p class="text-xs text-gray-600 mb-1">Total Accounts</p>
                        <p class="text-sm font-semibold">${accounts.length} akun</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded p-3">
                        <p class="text-xs text-gray-600 mb-1">Total Transactions</p>
                        <p class="text-sm font-semibold">${transactions.length} transaksi</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded p-3">
                        <p class="text-xs text-gray-600 mb-1">Active Debts/Credits</p>
                        <p class="text-sm font-semibold">${debts.filter(d => d.status === 'Aktif').length} aktif</p>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <button onclick="refreshData()" class="w-full btn btn-primary text-sm">
                        🔄 Refresh Data dari Sheets
                    </button>
                    <button onclick="clearCache()" class="w-full btn btn-secondary text-sm">
                        🗑️ Hapus Cache Browser
                    </button>
                    <button onclick="exportAllData()" class="w-full btn btn-secondary text-sm">
                        📥 Export Semua Data (JSON)
                    </button>
                </div>
            </div>
            
            <!-- App Info -->
            <div class="card">
                <h3 class="text-lg font-bold mb-4 flex items-center">
                    <span class="text-2xl mr-2">ℹ️</span>
                    Informasi Aplikasi
                </h3>
                
                <div class="space-y-3">
                    <div class="bg-gradient-to-br from-green-50 to-green-100 rounded p-4 border border-green-200">
                        <p class="text-sm font-semibold text-green-800 mb-1">💰 Dompet Ku</p>
                        <p class="text-xs text-green-600">Version 1.0.0</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded p-3">
                        <p class="text-xs text-gray-600 mb-2">Periode Aktif</p>
                        <p class="font-semibold">${formatMonthYear(config.periode_aktif || currentMonth)}</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded p-3">
                        <p class="text-xs text-gray-600 mb-2">Database</p>
                        <p class="text-xs font-mono break-all">${SPREADSHEET_ID.substring(0, 20)}...</p>
                        <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}" 
                           target="_blank" 
                           class="text-xs text-green-600 hover:text-green-700 mt-1 inline-block">
                            📊 Buka Google Sheets →
                        </a>
                    </div>
                    
                    <div class="bg-gray-50 rounded p-3">
                        <p class="text-xs text-gray-600 mb-2">Apps Script</p>
                        <p class="text-xs font-mono break-all">${APPS_SCRIPT_URL.substring(0, 40)}...</p>
                    </div>
                </div>
            </div>
            
            <!-- Advanced Settings -->
            <div class="card">
                <h3 class="text-lg font-bold mb-4 flex items-center">
                    <span class="text-2xl mr-2">🔧</span>
                    Advanced Settings
                </h3>
                
                <div class="space-y-3">
                    <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p class="text-xs font-semibold text-yellow-800 mb-1">⚠️ Danger Zone</p>
                        <p class="text-xs text-yellow-700">Hati-hati dengan aksi dibawah ini</p>
                    </div>
                    
                    <button onclick="resetAllFilters()" class="w-full btn btn-secondary text-sm">
                        🔄 Reset Semua Filter
                    </button>
                    
                    <button onclick="confirmDeleteAllCache()" class="w-full btn btn-danger text-sm">
                        ⚠️ Hapus Semua Data Cache
                    </button>
                </div>
                
                <div class="mt-4 pt-4 border-t">
                    <p class="text-xs text-gray-500 text-center">
                        Made with ❤️ for better financial management
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Update last update time
    const lastUpdate = localStorage.getItem('dompetku_lastUpdate');
    if (lastUpdate) {
        const lastUpdateEl = document.getElementById('settingsLastUpdate');
        if (lastUpdateEl) {
            const date = new Date(lastUpdate);
            lastUpdateEl.textContent = date.toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
}

// ============================================
// EDIT WHATSAPP MODAL
// ============================================
function showEditWhatsAppModal() {
    showAlert('Untuk mengubah pengaturan WhatsApp, silakan edit langsung di Google Sheets → Sheet "Config"', 'info');
}

// ============================================
// EXPORT ALL DATA
// ============================================
function exportAllData() {
    const data = {
        accounts: accounts,
        categories: categories,
        transactions: transactions,
        budgets: budgets,
        allocations: allocations,
        debts: debts,
        config: config,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dompetku-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('✅ Data berhasil di-export!', 'success');
}

// ============================================
// RESET ALL FILTERS
// ============================================
function resetAllFilters() {
    currentFilter = {
        tipe: 'all',
        kategori: 'all',
        akun: 'all',
        bulan: currentMonth
    };
    
    currentDebtFilter = 'all';
    currentTransactionPage = 1;
    
    showAlert('✅ Semua filter telah direset', 'success');
}

// ============================================
// CONFIRM DELETE ALL CACHE
// ============================================
function confirmDeleteAllCache() {
    if (confirm('⚠️ Yakin ingin menghapus SEMUA cache? Aplikasi akan reload dan fetch data baru dari Google Sheets.')) {
        localStorage.clear();
        showAlert('✅ Cache berhasil dihapus! Halaman akan reload...', 'success');
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}

console.log('✅ settings.js loaded');

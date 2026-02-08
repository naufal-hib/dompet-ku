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
            
            <!-- CONFIG SETTINGS - BISA DIEDIT -->
            <div class="card">
                <h3 class="text-lg font-bold mb-4 flex items-center">
                    <span class="text-2xl mr-2">⚙️</span>
                    Konfigurasi Umum
                </h3>
                
                <form id="configForm" onsubmit="submitConfigUpdate(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mata Uang</label>
                        <input type="text" id="configMataUang" value="${config.mata_uang || 'IDR'}" 
                               class="input" readonly>
                        <p class="text-xs text-gray-500 mt-1">Saat ini: IDR (tidak bisa diubah)</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Format Tanggal</label>
                        <select id="configFormatTanggal" class="input">
                            <option value="DD/MM/YYYY" ${config.format_tanggal === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY" ${config.format_tanggal === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD" ${config.format_tanggal === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Periode Aktif</label>
                        <input type="month" id="configPeriodeAktif" 
                               value="${config.periode_aktif || currentMonth}" 
                               class="input">
                        <p class="text-xs text-gray-500 mt-1">Bulan yang sedang aktif untuk tracking</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Budget Warning (%)</label>
                            <input type="number" id="configBudgetWarning" min="1" max="100" 
                                   value="${config.budget_warning || 80}" 
                                   class="input">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Budget Over (%)</label>
                            <input type="number" id="configBudgetOver" min="1" max="200" 
                                   value="${config.budget_over || 100}" 
                                   class="input">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Auto Send Daily Summary</label>
                        <select id="configAutoSend" class="input">
                            <option value="TRUE" ${config.auto_send_daily_summary === 'TRUE' ? 'selected' : ''}>✅ Aktif</option>
                            <option value="FALSE" ${config.auto_send_daily_summary === 'FALSE' ? 'selected' : ''}>❌ Nonaktif</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Daily Summary Time</label>
                        <input type="time" id="configSummaryTime" 
                               value="${config.daily_summary_time || '08:00'}" 
                               class="input">
                    </div>
                    
                    <button type="submit" class="w-full btn btn-primary">
                        💾 Simpan Konfigurasi
                    </button>
                </form>
            </div>
            
            <!-- WhatsApp Settings -->
            <div class="card">
                <h3 class="text-lg font-bold mb-4 flex items-center">
                    <span class="text-2xl mr-2">📱</span>
                    WhatsApp Integration
                </h3>
                
                <form id="whatsappConfigForm" onsubmit="submitWhatsAppConfig(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nomor WhatsApp</label>
                        <input type="text" id="configWhatsAppNumber" 
                               value="${config.whatsapp_number || ''}" 
                               class="input" 
                               placeholder="628123456789">
                        <p class="text-xs text-gray-500 mt-1">Format: 628xxx (tanpa +)</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Fonnte API Key</label>
                        <input type="password" id="configFonnteKey" 
                               value="${config.fonnte_api_key || ''}" 
                               class="input" 
                               placeholder="Masukkan API Key Fonnte">
                        <p class="text-xs text-gray-500 mt-1">
                            <a href="https://fonnte.com" target="_blank" class="text-green-600 hover:underline">
                                Daftar di fonnte.com →
                            </a>
                        </p>
                    </div>
                    
                    <button type="submit" class="w-full btn btn-primary">
                        💾 Simpan WhatsApp Config
                    </button>
                </form>
                
                <div class="mt-4 pt-4 border-t space-y-2">
                    <button onclick="testWhatsAppConnection()" class="w-full btn btn-secondary text-sm">
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
                        <p class="text-xs text-green-600">Version 2.1.0</p>
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
// SUBMIT CONFIG UPDATE
// ============================================
async function submitConfigUpdate(event) {
    event.preventDefault();
    
    const data = {
        mata_uang: document.getElementById('configMataUang').value,
        format_tanggal: document.getElementById('configFormatTanggal').value,
        periode_aktif: document.getElementById('configPeriodeAktif').value,
        budget_warning: parseInt(document.getElementById('configBudgetWarning').value),
        budget_over: parseInt(document.getElementById('configBudgetOver').value),
        auto_send_daily_summary: document.getElementById('configAutoSend').value,
        daily_summary_time: document.getElementById('configSummaryTime').value
    };
    
    showLoading();
    
    try {
        const result = await callAppsScript('updateConfig', data);
        
        if (result.success) {
            // Update currentMonth if periode_aktif changed
            currentMonth = data.periode_aktif;
            
            // Reload data
            await loadAllData();
            
            hideLoading();
            showAlert('✅ Konfigurasi berhasil diperbarui!', 'success');
            
            // Re-render settings
            initSettingsPage();
        } else {
            hideLoading();
            showAlert('❌ Gagal update: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Submit config error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan.', 'error');
    }
}

// ============================================
// SUBMIT WHATSAPP CONFIG
// ============================================
async function submitWhatsAppConfig(event) {
    event.preventDefault();
    
    const data = {
        whatsapp_number: document.getElementById('configWhatsAppNumber').value,
        fonnte_api_key: document.getElementById('configFonnteKey').value
    };
    
    showLoading();
    
    try {
        const result = await callAppsScript('updateConfig', data);
        
        if (result.success) {
            // Reload data
            await loadAllData();
            
            hideLoading();
            showAlert('✅ WhatsApp config berhasil diperbarui!', 'success');
            
            // Re-render settings
            initSettingsPage();
        } else {
            hideLoading();
            showAlert('❌ Gagal update: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Submit WhatsApp config error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan.', 'error');
    }
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

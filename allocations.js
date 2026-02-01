// ============================================
// DOMPET KU - ALLOCATIONS (JATAH) MODULE
// ============================================

// ============================================
// INITIALIZE ALLOCATIONS PAGE
// ============================================
function initAllocationsPage() {
    console.log('📊 Initializing allocations page...');
    
    // Render month selector
    renderAllocationMonthSelector();
    
    // Render allocations
    renderAllocations();
    
    // Render allocation summary
    renderAllocationSummary();
}

// ============================================
// RENDER MONTH SELECTOR
// ============================================
function renderAllocationMonthSelector() {
    const container = document.getElementById('allocationMonthSelector');
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <h3 class="text-xl font-bold text-gray-900">Jatah Bulanan</h3>
                <p class="text-sm text-gray-600 mt-1">${formatMonthYear(currentMonth)}</p>
            </div>
            <button onclick="showSetupAllocationModal()" class="btn btn-primary text-sm">
                ⚙️ Atur Jatah
            </button>
        </div>
    `;
}

// ============================================
// RENDER ALLOCATIONS
// ============================================
function renderAllocations() {
    const container = document.getElementById('allocationsList');
    if (!container) return;
    
    const currentAllocations = allocations.filter(a => a.bulan === currentMonth);
    
    if (currentAllocations.length === 0) {
        container.innerHTML = `
            <div class="card text-center py-12">
                <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Belum Ada Jatah Diatur</h3>
                <p class="text-gray-600 mb-4">Atur jatah bulanan untuk kontrol keuangan lebih baik</p>
                <button onclick="showSetupAllocationModal()" class="btn btn-primary">
                    ⚙️ Atur Jatah Sekarang
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentAllocations.map(allocation => {
        const progress = allocation.progress || 0;
        let progressClass = 'progress-safe';
        let statusBadge = 'badge-success';
        let statusText = '✅ Aman';
        let statusIcon = '✅';
        
        if (allocation.status === 'Warning') {
            progressClass = 'progress-warning';
            statusBadge = 'badge-warning';
            statusText = '⚠️ Hampir Habis';
            statusIcon = '⚠️';
        } else if (allocation.status === 'Over') {
            progressClass = 'progress-danger';
            statusBadge = 'badge-danger';
            statusText = '🚨 Over Budget';
            statusIcon = '🚨';
        }
        
        return `
            <div class="card hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-lg font-bold text-gray-900">${allocation.namaJatah}</h4>
                    <span class="badge ${statusBadge}">${statusText}</span>
                </div>
                
                <div class="mb-3">
                    <div class="flex items-center justify-between text-sm mb-2">
                        <span class="text-gray-600">Terpakai</span>
                        <span class="font-bold text-gray-900">${formatCurrency(allocation.terpakai)} / ${formatCurrency(allocation.alokasi)}</span>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-bar-fill ${progressClass}" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm mt-2">
                        <span class="font-semibold text-gray-700">${progress}%</span>
                        <span class="font-semibold ${allocation.sisa >= 0 ? 'text-green-600' : 'text-red-600'}">
                            Sisa: ${formatCurrency(allocation.sisa)}
                        </span>
                    </div>
                </div>
                
                <div class="pt-3 border-t border-gray-200">
                    <details class="text-sm">
                        <summary class="cursor-pointer text-gray-600 hover:text-gray-900 font-medium">
                            📋 Detail Kategori
                        </summary>
                        <div class="mt-2 pl-4">
                            ${allocation.kategoriInclude.map(kat => {
                                const category = categories.find(c => c.nama === kat);
                                const icon = category ? category.icon : '📌';
                                return `<p class="text-gray-700 py-1">${icon} ${kat}</p>`;
                            }).join('')}
                        </div>
                    </details>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// RENDER ALLOCATION SUMMARY
// ============================================
function renderAllocationSummary() {
    const container = document.getElementById('allocationSummary');
    if (!container) return;
    
    const currentAllocations = allocations.filter(a => a.bulan === currentMonth);
    
    if (currentAllocations.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    const totalAlokasi = currentAllocations.reduce((sum, a) => sum + a.alokasi, 0);
    const totalTerpakai = currentAllocations.reduce((sum, a) => sum + a.terpakai, 0);
    const totalSisa = totalAlokasi - totalTerpakai;
    const overallProgress = totalAlokasi > 0 ? Math.round((totalTerpakai / totalAlokasi) * 100) : 0;
    
    const safeCount = currentAllocations.filter(a => a.status === 'Aman').length;
    const warningCount = currentAllocations.filter(a => a.status === 'Warning').length;
    const overCount = currentAllocations.filter(a => a.status === 'Over').length;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <p class="text-sm font-medium text-blue-700">Total Alokasi</p>
                <p class="text-2xl font-bold text-blue-600 mt-1">${formatCurrency(totalAlokasi)}</p>
            </div>
            
            <div class="card bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                <p class="text-sm font-medium text-orange-700">Terpakai</p>
                <p class="text-2xl font-bold text-orange-600 mt-1">${formatCurrency(totalTerpakai)}</p>
                <p class="text-xs text-orange-600 mt-1">${overallProgress}% dari total</p>
            </div>
            
            <div class="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <p class="text-sm font-medium text-green-700">Sisa</p>
                <p class="text-2xl font-bold ${totalSisa >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
                    ${formatCurrency(totalSisa)}
                </p>
            </div>
            
            <div class="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <p class="text-sm font-medium text-purple-700">Status</p>
                <div class="mt-2 space-y-1">
                    <p class="text-xs text-green-600">✅ Aman: ${safeCount}</p>
                    <p class="text-xs text-yellow-600">⚠️ Warning: ${warningCount}</p>
                    <p class="text-xs text-red-600">🚨 Over: ${overCount}</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SHOW SETUP ALLOCATION MODAL
// ============================================
function showSetupAllocationModal() {
    const modal = document.getElementById('setupAllocationModal');
    if (!modal) {
        createSetupAllocationModal();
        return;
    }
    
    // Populate form with existing data if any
    const currentAllocations = allocations.filter(a => a.bulan === currentMonth);
    
    // Pre-fill form
    document.getElementById('allocPengeluaranDasar').value = 
        currentAllocations.find(a => a.namaJatah === 'Pengeluaran Dasar')?.alokasi || '';
    document.getElementById('allocHiburan').value = 
        currentAllocations.find(a => a.namaJatah === 'Hiburan')?.alokasi || '';
    document.getElementById('allocSodaqoh').value = 
        currentAllocations.find(a => a.namaJatah === 'Sodaqoh')?.alokasi || '';
    document.getElementById('allocDanaCadangan').value = 
        currentAllocations.find(a => a.namaJatah === 'Dana Cadangan Cepat')?.alokasi || '';
    document.getElementById('allocTabungan').value = 
        currentAllocations.find(a => a.namaJatah === 'Tabungan')?.alokasi || '';
    
    updateAllocationTotal();
    
    modal.classList.add('active');
}

function closeSetupAllocationModal() {
    const modal = document.getElementById('setupAllocationModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// CREATE SETUP ALLOCATION MODAL
// ============================================
function createSetupAllocationModal() {
    const modalHTML = `
        <div id="setupAllocationModal" class="modal">
            <div class="modal-content max-w-2xl">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">⚙️ Atur Jatah Bulanan</h3>
                        <button onclick="closeSetupAllocationModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p class="text-sm text-blue-800">
                            <strong>💡 Tips:</strong> Atur alokasi budget untuk setiap kategori. Sistem akan otomatis menghitung 
                            dan memberi peringatan via WhatsApp jika jatah hampir habis (80%) atau over budget (100%).
                        </p>
                    </div>
                    
                    <form id="setupAllocationForm" onsubmit="submitAllocation(event)">
                        <div class="space-y-4">
                            <!-- Pengeluaran Dasar -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    🍔 Pengeluaran Dasar
                                    <span class="text-xs text-gray-500">(Makanan, Sewa, Listrik, Transport, dll)</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="allocPengeluaranDasar" min="0" step="10000" 
                                           class="input pl-12" placeholder="0" oninput="updateAllocationTotal()">
                                </div>
                            </div>
                            
                            <!-- Hiburan -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    🎮 Hiburan
                                    <span class="text-xs text-gray-500">(Hiburan, Kafe, Nongkrong, dll)</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="allocHiburan" min="0" step="10000" 
                                           class="input pl-12" placeholder="0" oninput="updateAllocationTotal()">
                                </div>
                            </div>
                            
                            <!-- Sodaqoh -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    💚 Sodaqoh
                                    <span class="text-xs text-gray-500">(Sodaqoh, Zakat, Infaq)</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="allocSodaqoh" min="0" step="10000" 
                                           class="input pl-12" placeholder="0" oninput="updateAllocationTotal()">
                                </div>
                            </div>
                            
                            <!-- Dana Cadangan -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    🚨 Dana Cadangan Cepat
                                    <span class="text-xs text-gray-500">(Emergency, Keperluan Dadakan)</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="allocDanaCadangan" min="0" step="10000" 
                                           class="input pl-12" placeholder="0" oninput="updateAllocationTotal()">
                                </div>
                            </div>
                            
                            <!-- Tabungan -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    💎 Tabungan
                                    <span class="text-xs text-gray-500">(Tabungan, Investasi)</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="allocTabungan" min="0" step="10000" 
                                           class="input pl-12" placeholder="0" oninput="updateAllocationTotal()">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Total -->
                        <div class="mt-6 pt-6 border-t border-gray-200">
                            <div class="flex items-center justify-between">
                                <span class="text-lg font-semibold text-gray-900">Total Alokasi:</span>
                                <span id="totalAlokasi" class="text-2xl font-bold text-green-600">Rp 0</span>
                            </div>
                        </div>
                        
                        <!-- Buttons -->
                        <div class="flex space-x-3 mt-6">
                            <button type="button" onclick="closeSetupAllocationModal()" class="flex-1 btn btn-secondary">
                                Batal
                            </button>
                            <button type="submit" class="flex-1 btn btn-primary">
                                💾 Simpan & Terapkan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('setupAllocationModal').classList.add('active');
}

// ============================================
// UPDATE ALLOCATION TOTAL
// ============================================
function updateAllocationTotal() {
    const pengeluaranDasar = parseFloat(document.getElementById('allocPengeluaranDasar').value) || 0;
    const hiburan = parseFloat(document.getElementById('allocHiburan').value) || 0;
    const sodaqoh = parseFloat(document.getElementById('allocSodaqoh').value) || 0;
    const danaCadangan = parseFloat(document.getElementById('allocDanaCadangan').value) || 0;
    const tabungan = parseFloat(document.getElementById('allocTabungan').value) || 0;
    
    const total = pengeluaranDasar + hiburan + sodaqoh + danaCadangan + tabungan;
    
    document.getElementById('totalAlokasi').textContent = formatCurrency(total);
}

// ============================================
// SUBMIT ALLOCATION
// ============================================
async function submitAllocation(event) {
    event.preventDefault();
    
    const allocations = [
        {
            bulan: currentMonth,
            namaJatah: 'Pengeluaran Dasar',
            alokasi: parseFloat(document.getElementById('allocPengeluaranDasar').value) || 0,
            kategoriInclude: 'Makanan & Minuman,Sewa/Cicilan Rumah,Listrik & Air,Pulsa & Internet,Transportasi,Kesehatan,Pakaian',
            color: '#EF4444',
            warningLevel: 80
        },
        {
            bulan: currentMonth,
            namaJatah: 'Hiburan',
            alokasi: parseFloat(document.getElementById('allocHiburan').value) || 0,
            kategoriInclude: 'Hiburan,Kafe & Nongkrong',
            color: '#F59E0B',
            warningLevel: 80
        },
        {
            bulan: currentMonth,
            namaJatah: 'Sodaqoh',
            alokasi: parseFloat(document.getElementById('allocSodaqoh').value) || 0,
            kategoriInclude: 'Sodaqoh',
            color: '#10B981',
            warningLevel: 50 // Lower warning for sodaqoh (reminder to give more)
        },
        {
            bulan: currentMonth,
            namaJatah: 'Dana Cadangan Cepat',
            alokasi: parseFloat(document.getElementById('allocDanaCadangan').value) || 0,
            kategoriInclude: 'Emergency',
            color: '#3B82F6',
            warningLevel: 80
        },
        {
            bulan: currentMonth,
            namaJatah: 'Tabungan',
            alokasi: parseFloat(document.getElementById('allocTabungan').value) || 0,
            kategoriInclude: 'Tabungan,Investasi',
            color: '#8B5CF6',
            warningLevel: 50
        }
    ];
    
    showLoading();
    
    try {
        // Call Apps Script to update allocations
        const result = await callAppsScript('updateAllocation', {
            allocations: allocations
        });
        
        if (result.success) {
            // Reload data
            await loadAllData();
            
            // Re-render
            initAllocationsPage();
            
            // Close modal
            closeSetupAllocationModal();
            
            hideLoading();
            showAlert('✅ Jatah bulanan berhasil diatur!', 'success');
        } else {
            hideLoading();
            showAlert('❌ Gagal mengatur jatah: ' + result.message, 'error');
        }
        
    } catch (error) {
        console.error('Submit allocation error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan. Silakan coba lagi.', 'error');
    }
}

console.log('✅ allocations.js loaded');

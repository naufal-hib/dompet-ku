// ============================================
// DOMPET KU - ALLOCATIONS (JATAH) MODULE
// VERSION 2.0 - FULL CRUD SUPPORT
// ============================================

// ============================================
// INITIALIZE ALLOCATIONS PAGE
// ============================================
function initAllocationsPage() {
    console.log('📊 Initializing allocations page...');
    
    renderAllocationMonthSelector();
    renderAllocations();
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
            <div class="flex gap-2">
                <button onclick="showSetupAllocationModal()" class="btn btn-secondary text-sm">
                    ⚙️ Atur Cepat
                </button>
                <button onclick="showAddAllocationCategoryModal()" class="btn btn-primary text-sm">
                    ➕ Tambah Jatah
                </button>
            </div>
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
            <div class="card text-center py-12 col-span-full">
                <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Belum Ada Jatah Diatur</h3>
                <p class="text-gray-600 mb-4">Atur jatah bulanan untuk kontrol keuangan lebih baik</p>
                <div class="flex justify-center gap-3">
                    <button onclick="showSetupAllocationModal()" class="btn btn-secondary">
                        ⚙️ Atur Cepat (Template)
                    </button>
                    <button onclick="showAddAllocationCategoryModal()" class="btn btn-primary">
                        ➕ Tambah Jatah Custom
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentAllocations.map(allocation => {
        const progress = allocation.progress || 0;
        let progressClass = 'progress-safe';
        let statusBadge = 'badge-success';
        let statusText = '✅ Aman';
        
        if (allocation.status === 'Warning') {
            progressClass = 'progress-warning';
            statusBadge = 'badge-warning';
            statusText = '⚠️ Hampir Habis';
        } else if (allocation.status === 'Over') {
            progressClass = 'progress-danger';
            statusBadge = 'badge-danger';
            statusText = '🚨 Over Budget';
        }
        
        return `
            <div class="card hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-lg font-bold text-gray-900">${allocation.namaJatah}</h4>
                    <div class="flex items-center gap-2">
                        <span class="badge ${statusBadge}">${statusText}</span>
                        <button onclick="showEditAllocationModal('${allocation.id}')" 
                                class="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="confirmDeleteAllocation('${allocation.id}')" 
                                class="text-gray-400 hover:text-red-600 transition-colors"
                                title="Hapus">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
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
                            📋 Detail Kategori (${allocation.kategoriInclude.length})
                        </summary>
                        <div class="mt-2 pl-4 space-y-1">
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
// ✅ NEW: SHOW ADD ALLOCATION CATEGORY MODAL
// ============================================
function showAddAllocationCategoryModal() {
    const modalHTML = `
        <div id="addAllocationCategoryModal" class="modal active">
            <div class="modal-content max-w-2xl">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">➕ Tambah Jatah Baru</h3>
                        <button onclick="closeAddAllocationCategoryModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="addAllocationCategoryForm" onsubmit="submitAddAllocationCategory(event)">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nama Jatah</label>
                                <input type="text" id="newAllocNama" required class="input" 
                                       placeholder="Contoh: Shopping, Investasi, dll">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Budget Alokasi</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="newAllocBudget" required min="0" step="10000" 
                                           class="input pl-12" placeholder="0">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori yang Termasuk
                                    <span class="text-xs text-gray-500">(Pilih minimal 1)</span>
                                </label>
                                <div class="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                                    ${categories.filter(c => c.status === 'Aktif').map(cat => `
                                        <label class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                            <input type="checkbox" name="newAllocCategories" value="${cat.nama}" 
                                                   class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                                            <span class="ml-3 text-sm">
                                                <span class="text-lg">${cat.icon}</span>
                                                ${cat.nama}
                                            </span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Warning Level (%)
                                    </label>
                                    <input type="number" id="newAllocWarning" value="80" min="1" max="100" 
                                           class="input">
                                    <p class="text-xs text-gray-500 mt-1">Alert saat mencapai % ini</p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Warna
                                    </label>
                                    <div class="grid grid-cols-4 gap-2">
                                        ${['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'].map((color, i) => `
                                            <button type="button" onclick="selectAllocationColor('${color}', 'new')" 
                                                    class="w-full h-10 rounded-lg border-2 ${i === 0 ? 'border-gray-800' : 'border-gray-200'}"
                                                    style="background-color: ${color};"
                                                    data-color-new="${color}">
                                            </button>
                                        `).join('')}
                                    </div>
                                    <input type="hidden" id="newAllocColor" value="#EF4444">
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex space-x-3 mt-6">
                            <button type="button" onclick="closeAddAllocationCategoryModal()" class="flex-1 btn btn-secondary">
                                Batal
                            </button>
                            <button type="submit" class="flex-1 btn btn-primary">
                                💾 Tambah Jatah
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('addAllocationCategoryModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeAddAllocationCategoryModal() {
    const modal = document.getElementById('addAllocationCategoryModal');
    if (modal) modal.remove();
}

// ============================================
// ✅ NEW: SUBMIT ADD ALLOCATION CATEGORY
// ============================================
async function submitAddAllocationCategory(event) {
    event.preventDefault();
    
    const selectedCategories = Array.from(
        document.querySelectorAll('input[name="newAllocCategories"]:checked')
    ).map(cb => cb.value);
    
    if (selectedCategories.length === 0) {
        showAlert('Pilih minimal 1 kategori!', 'warning');
        return;
    }
    
    const data = {
        bulan: currentMonth,
        namaJatah: document.getElementById('newAllocNama').value,
        alokasi: parseFloat(document.getElementById('newAllocBudget').value),
        kategoriInclude: selectedCategories,
        warningLevel: parseInt(document.getElementById('newAllocWarning').value),
        color: document.getElementById('newAllocColor').value
    };
    
    showLoading();
    
    try {
        const result = await callAppsScript('addAllocationCategory', data);
        
        if (result.success) {
            await loadAllData();
            initAllocationsPage();
            closeAddAllocationCategoryModal();
            hideLoading();
            showAlert('✅ Jatah berhasil ditambahkan!', 'success');
        } else {
            hideLoading();
            showAlert('❌ Gagal: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan: ' + error.message, 'error');
    }
}

// ============================================
// ✅ NEW: SHOW EDIT ALLOCATION MODAL
// ============================================
function showEditAllocationModal(allocId) {
    const allocation = allocations.find(a => a.id === allocId);
    if (!allocation) return;
    
    const modalHTML = `
        <div id="editAllocationModal" class="modal active">
            <div class="modal-content max-w-2xl">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">✏️ Edit Jatah</h3>
                        <button onclick="closeEditAllocationModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="editAllocationForm" onsubmit="submitEditAllocation(event, '${allocId}')">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nama Jatah</label>
                                <input type="text" id="editAllocNama" required class="input" 
                                       value="${allocation.namaJatah}">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Budget Alokasi</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="editAllocBudget" required min="0" step="10000" 
                                           class="input pl-12" value="${allocation.alokasi}">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori yang Termasuk
                                </label>
                                <div class="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                                    ${categories.filter(c => c.status === 'Aktif').map(cat => `
                                        <label class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                            <input type="checkbox" name="editAllocCategories" value="${cat.nama}" 
                                                   ${allocation.kategoriInclude.includes(cat.nama) ? 'checked' : ''}
                                                   class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                                            <span class="ml-3 text-sm">
                                                <span class="text-lg">${cat.icon}</span>
                                                ${cat.nama}
                                            </span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Warning Level (%)
                                    </label>
                                    <input type="number" id="editAllocWarning" value="${allocation.warningLevel}" 
                                           min="1" max="100" class="input">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Warna
                                    </label>
                                    <div class="grid grid-cols-4 gap-2">
                                        ${['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'].map(color => `
                                            <button type="button" onclick="selectAllocationColor('${color}', 'edit')" 
                                                    class="w-full h-10 rounded-lg border-2 ${color === allocation.color ? 'border-gray-800' : 'border-gray-200'}"
                                                    style="background-color: ${color};"
                                                    data-color-edit="${color}">
                                            </button>
                                        `).join('')}
                                    </div>
                                    <input type="hidden" id="editAllocColor" value="${allocation.color}">
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex space-x-3 mt-6">
                            <button type="button" onclick="closeEditAllocationModal()" class="flex-1 btn btn-secondary">
                                Batal
                            </button>
                            <button type="submit" class="flex-1 btn btn-primary">
                                💾 Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('editAllocationModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeEditAllocationModal() {
    const modal = document.getElementById('editAllocationModal');
    if (modal) modal.remove();
}

// ============================================
// ✅ NEW: SUBMIT EDIT ALLOCATION
// ============================================
async function submitEditAllocation(event, allocId) {
    event.preventDefault();
    
    const selectedCategories = Array.from(
        document.querySelectorAll('input[name="editAllocCategories"]:checked')
    ).map(cb => cb.value);
    
    if (selectedCategories.length === 0) {
        showAlert('Pilih minimal 1 kategori!', 'warning');
        return;
    }
    
    const data = {
        id: allocId,
        namaJatah: document.getElementById('editAllocNama').value,
        alokasi: parseFloat(document.getElementById('editAllocBudget').value),
        kategoriInclude: selectedCategories,
        warningLevel: parseInt(document.getElementById('editAllocWarning').value),
        color: document.getElementById('editAllocColor').value
    };
    
    showLoading();
    
    try {
        const result = await callAppsScript('editAllocationCategory', data);
        
        if (result.success) {
            await loadAllData();
            initAllocationsPage();
            closeEditAllocationModal();
            hideLoading();
            showAlert('✅ Jatah berhasil diperbarui!', 'success');
        } else {
            hideLoading();
            showAlert('❌ Gagal: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Edit error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan: ' + error.message, 'error');
    }
}

// ============================================
// ✅ NEW: DELETE ALLOCATION
// ============================================
function confirmDeleteAllocation(allocId) {
    const allocation = allocations.find(a => a.id === allocId);
    if (!allocation) return;
    
    if (confirm(`Yakin ingin menghapus jatah "${allocation.namaJatah}"?`)) {
        deleteAllocation(allocId);
    }
}

async function deleteAllocation(allocId) {
    showLoading();
    
    try {
        const result = await callAppsScript('deleteAllocationCategory', { id: allocId });
        
        if (result.success) {
            await loadAllData();
            initAllocationsPage();
            hideLoading();
            showAlert('✅ Jatah berhasil dihapus!', 'success');
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
// SELECT COLOR HELPER
// ============================================
function selectAllocationColor(color, mode) {
    if (mode === 'new') {
        document.getElementById('newAllocColor').value = color;
        document.querySelectorAll('[data-color-new]').forEach(btn => {
            btn.classList.remove('border-gray-800');
            btn.classList.add('border-gray-200');
        });
        const selectedBtn = document.querySelector(`[data-color-new="${color}"]`);
        if (selectedBtn) {
            selectedBtn.classList.remove('border-gray-200');
            selectedBtn.classList.add('border-gray-800');
        }
    } else if (mode === 'edit') {
        document.getElementById('editAllocColor').value = color;
        document.querySelectorAll('[data-color-edit]').forEach(btn => {
            btn.classList.remove('border-gray-800');
            btn.classList.add('border-gray-200');
        });
        const selectedBtn = document.querySelector(`[data-color-edit="${color}"]`);
        if (selectedBtn) {
            selectedBtn.classList.remove('border-gray-200');
            selectedBtn.classList.add('border-gray-800');
        }
    } else {
        // For setup modal
        document.getElementById('accountWarna').value = color;
        document.querySelectorAll('[data-color]').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-offset-2');
            btn.classList.add('border-2', 'border-gray-200');
        });
        const selectedBtn = document.querySelector(`[data-color="${color}"]`);
        if (selectedBtn) {
            selectedBtn.classList.remove('border-2', 'border-gray-200');
            selectedBtn.classList.add('ring-4', 'ring-offset-2');
        }
    }
}

// ============================================
// SHOW SETUP ALLOCATION MODAL (QUICK SETUP)
// ============================================
function showSetupAllocationModal() {
    const modal = document.getElementById('setupAllocationModal');
    if (!modal) {
        createSetupAllocationModal();
        return;
    }
    
    const currentAllocations = allocations.filter(a => a.bulan === currentMonth);
    
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
    if (modal) modal.classList.remove('active');
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
                        <h3 class="text-2xl font-bold text-gray-900">⚙️ Atur Cepat - Template Jatah</h3>
                        <button onclick="closeSetupAllocationModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p class="text-sm text-blue-800">
                            <strong>💡 Tips:</strong> Setup cepat dengan template default. Sistem otomatis menghitung 
                            dan memberi peringatan via WhatsApp jika jatah hampir habis.
                        </p>
                    </div>
                    
                    <form id="setupAllocationForm" onsubmit="submitAllocation(event)">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    🍔 Pengeluaran Dasar
                                    <span class="text-xs text-gray-500">(Makanan, Sewa, Listrik, Transport)</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="allocPengeluaranDasar" min="0" step="10000" 
                                           class="input pl-12" placeholder="0" oninput="updateAllocationTotal()">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    🎮 Hiburan
                                    <span class="text-xs text-gray-500">(Hiburan, Kafe, Nongkrong)</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="allocHiburan" min="0" step="10000" 
                                           class="input pl-12" placeholder="0" oninput="updateAllocationTotal()">
                                </div>
                            </div>
                            
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
                        
                        <div class="mt-6 pt-6 border-t border-gray-200">
                            <div class="flex items-center justify-between">
                                <span class="text-lg font-semibold text-gray-900">Total Alokasi:</span>
                                <span id="totalAlokasi" class="text-2xl font-bold text-green-600">Rp 0</span>
                            </div>
                        </div>
                        
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
// SUBMIT ALLOCATION (QUICK SETUP)
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
            warningLevel: 50
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
        const result = await callAppsScript('updateAllocation', {
            allocations: allocations
        });
        
        if (result.success) {
            await loadAllData();
            initAllocationsPage();
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
        showAlert('❌ Terjadi kesalahan: ' + error.message, 'error');
    }
}

console.log('✅ allocations.js loaded (VERSION 2.0 - FULL CRUD)');

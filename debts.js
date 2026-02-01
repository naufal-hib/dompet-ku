// ============================================
// DOMPET KU - DEBTS & CREDITS MODULE
// ============================================

let currentDebtFilter = 'all'; // all, utang, piutang

// ============================================
// INITIALIZE DEBTS PAGE
// ============================================
function initDebtsPage() {
    console.log('💰 Initializing debts page...');
    
    // Render debt summary
    renderDebtSummary();
    
    // Render debts list
    renderDebtsList();
}

// ============================================
// RENDER DEBT SUMMARY
// ============================================
function renderDebtSummary() {
    const container = document.getElementById('debtSummary');
    if (!container) return;
    
    const activeDebts = debts.filter(d => d.status === 'Aktif');
    
    const totalUtang = activeDebts
        .filter(d => d.tipe === 'Utang')
        .reduce((sum, d) => sum + d.sisa, 0);
    
    const totalPiutang = activeDebts
        .filter(d => d.tipe === 'Piutang')
        .reduce((sum, d) => sum + d.sisa, 0);
    
    const utangCount = activeDebts.filter(d => d.tipe === 'Utang').length;
    const piutangCount = activeDebts.filter(d => d.tipe === 'Piutang').length;
    
    // Count overdue
    const today = new Date();
    const overdueCount = activeDebts.filter(d => {
        const dueDate = new Date(d.tanggalJatuhTempo);
        return dueDate < today;
    }).length;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="card bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-red-700">💸 Total Utang</p>
                        <p class="text-2xl font-bold text-red-600 mt-1">${formatCurrency(totalUtang)}</p>
                        <p class="text-xs text-red-600 mt-1">${utangCount} utang aktif</p>
                    </div>
                    <svg class="w-12 h-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                    </svg>
                </div>
            </div>
            
            <div class="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-green-700">💰 Total Piutang</p>
                        <p class="text-2xl font-bold text-green-600 mt-1">${formatCurrency(totalPiutang)}</p>
                        <p class="text-xs text-green-600 mt-1">${piutangCount} piutang aktif</p>
                    </div>
                    <svg class="w-12 h-12 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                </div>
            </div>
            
            <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-blue-700">💵 Net Position</p>
                        <p class="text-2xl font-bold ${totalPiutang - totalUtang >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
                            ${formatCurrency(totalPiutang - totalUtang)}
                        </p>
                        <p class="text-xs text-blue-600 mt-1">Piutang - Utang</p>
                    </div>
                    <svg class="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                </div>
            </div>
            
            <div class="card bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-yellow-700">⏰ Jatuh Tempo</p>
                        <p class="text-2xl font-bold text-yellow-600 mt-1">${overdueCount}</p>
                        <p class="text-xs text-yellow-600 mt-1">Sudah lewat / hari ini</p>
                    </div>
                    <svg class="w-12 h-12 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// RENDER DEBTS LIST
// ============================================
function renderDebtsList() {
    const container = document.getElementById('debtsList');
    if (!container) return;
    
    let filteredDebts = debts.filter(d => d.status === 'Aktif');
    
    if (currentDebtFilter !== 'all') {
        filteredDebts = filteredDebts.filter(d => d.tipe.toLowerCase() === currentDebtFilter);
    }
    
    // Sort by due date (nearest first)
    filteredDebts.sort((a, b) => new Date(a.tanggalJatuhTempo) - new Date(b.tanggalJatuhTempo));
    
    if (filteredDebts.length === 0) {
        container.innerHTML = `
            <div class="card text-center py-12">
                <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Belum Ada ${currentDebtFilter === 'all' ? 'Utang/Piutang' : currentDebtFilter.charAt(0).toUpperCase() + currentDebtFilter.slice(1)}</h3>
                <p class="text-gray-600 mb-4">Tambahkan untuk mulai tracking pembayaran</p>
                <button onclick="showAddDebtModal()" class="btn btn-primary">
                    ➕ Tambah ${currentDebtFilter === 'utang' ? 'Utang' : currentDebtFilter === 'piutang' ? 'Piutang' : 'Baru'}
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredDebts.map(debt => {
        const progress = debt.totalNominal > 0 ? Math.round((debt.terbayar / debt.totalNominal) * 100) : 0;
        const isUtang = debt.tipe === 'Utang';
        
        // Calculate days remaining
        const today = new Date();
        const dueDate = new Date(debt.tanggalJatuhTempo);
        const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        let dueDateClass = 'text-gray-600';
        let dueDateText = `${daysRemaining} hari lagi`;
        
        if (daysRemaining < 0) {
            dueDateClass = 'text-red-600 font-bold';
            dueDateText = `Terlambat ${Math.abs(daysRemaining)} hari!`;
        } else if (daysRemaining === 0) {
            dueDateClass = 'text-red-600 font-bold';
            dueDateText = 'Jatuh tempo hari ini!';
        } else if (daysRemaining <= 3) {
            dueDateClass = 'text-yellow-600 font-semibold';
            dueDateText = `${daysRemaining} hari lagi`;
        } else if (daysRemaining <= 7) {
            dueDateClass = 'text-orange-600';
        }
        
        return `
            <div class="card hover:shadow-lg transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="text-2xl">${isUtang ? '💸' : '💰'}</span>
                            <h4 class="text-lg font-bold text-gray-900">${debt.namaPihak}</h4>
                        </div>
                        <span class="badge ${isUtang ? 'badge-danger' : 'badge-success'}">
                            ${debt.tipe}
                        </span>
                    </div>
                    <button onclick="showDebtDetail('${debt.id}')" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="space-y-3">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600">Total:</span>
                        <span class="font-bold text-gray-900">${formatCurrency(debt.totalNominal)}</span>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600">Terbayar:</span>
                        <span class="font-semibold text-green-600">${formatCurrency(debt.terbayar)}</span>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600">Sisa:</span>
                        <span class="font-bold ${isUtang ? 'text-red-600' : 'text-green-600'}">
                            ${formatCurrency(debt.sisa)}
                        </span>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-bar-fill ${isUtang ? 'progress-danger' : 'progress-safe'}" 
                             style="width: ${progress}%"></div>
                    </div>
                    <p class="text-xs text-gray-600 text-center">${progress}% terbayar</p>
                    
                    <div class="pt-3 border-t border-gray-200">
                        <div class="flex items-center justify-between text-sm mb-2">
                            <span class="text-gray-600">⏰ Jatuh Tempo:</span>
                            <span class="${dueDateClass}">${formatDate(debt.tanggalJatuhTempo)}</span>
                        </div>
                        <p class="text-xs ${dueDateClass}">${dueDateText}</p>
                    </div>
                    
                    ${debt.cicilanPerBulan > 0 ? `
                        <div class="bg-blue-50 rounded p-2 text-xs text-blue-700">
                            💳 Cicilan: ${formatCurrency(debt.cicilanPerBulan)}/bulan
                        </div>
                    ` : ''}
                    
                    <button onclick="showPaymentModal('${debt.id}')" 
                            class="w-full btn ${isUtang ? 'btn-danger' : 'btn-primary'} text-sm">
                        ${isUtang ? '💸 Bayar Utang' : '💰 Terima Pembayaran'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// FILTER DEBTS
// ============================================
function filterDebts(filter) {
    currentDebtFilter = filter;
    
    // Update button states
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('bg-green-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-100', 'text-gray-700');
        activeBtn.classList.add('bg-green-600', 'text-white');
    }
    
    renderDebtsList();
}

// ============================================
// SHOW ADD DEBT MODAL
// ============================================
function showAddDebtModal() {
    const modal = document.getElementById('addDebtModal');
    if (!modal) {
        createAddDebtModal();
        return;
    }
    
    document.getElementById('addDebtForm').reset();
    document.getElementById('debtTanggalMulai').valueAsDate = new Date();
    
    modal.classList.add('active');
}

function closeAddDebtModal() {
    const modal = document.getElementById('addDebtModal');
    if (modal) modal.classList.remove('active');
}

// ============================================
// CREATE ADD DEBT MODAL
// ============================================
function createAddDebtModal() {
    const modalHTML = `
        <div id="addDebtModal" class="modal">
            <div class="modal-content">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">Tambah Utang/Piutang</h3>
                        <button onclick="closeAddDebtModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="addDebtForm" onsubmit="submitDebt(event)">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
                                <select id="debtTipe" required class="input">
                                    <option value="Utang">💸 Utang (Saya pinjam dari orang lain)</option>
                                    <option value="Piutang">💰 Piutang (Orang lain pinjam dari saya)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nama Pihak</label>
                                <input type="text" id="debtNamaPihak" required class="input" 
                                       placeholder="Nama orang/lembaga">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Total Nominal</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="debtNominal" required min="0" step="10000" 
                                           class="input pl-12" placeholder="0">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                                    <input type="date" id="debtTanggalMulai" required class="input">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Jatuh Tempo</label>
                                    <input type="date" id="debtTanggalJatuhTempo" required class="input">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Cicilan per Bulan (Opsional)
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="debtCicilan" min="0" step="10000" 
                                           class="input pl-12" placeholder="0">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                                <textarea id="debtKeterangan" rows="3" class="input" 
                                          placeholder="Catatan tambahan..."></textarea>
                            </div>
                        </div>
                        
                        <div class="flex space-x-3 mt-6">
                            <button type="button" onclick="closeAddDebtModal()" class="flex-1 btn btn-secondary">
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
    document.getElementById('debtTanggalMulai').valueAsDate = new Date();
    document.getElementById('addDebtModal').classList.add('active');
}

// ============================================
// SUBMIT DEBT
// ============================================
async function submitDebt(event) {
    event.preventDefault();
    
    const data = {
        tipe: document.getElementById('debtTipe').value,
        namaPihak: document.getElementById('debtNamaPihak').value,
        totalNominal: parseFloat(document.getElementById('debtNominal').value),
        tanggalMulai: document.getElementById('debtTanggalMulai').value,
        tanggalJatuhTempo: document.getElementById('debtTanggalJatuhTempo').value,
        cicilanPerBulan: parseFloat(document.getElementById('debtCicilan').value) || 0,
        keterangan: document.getElementById('debtKeterangan').value
    };
    
    showLoading();
    
    try {
        const result = await callAppsScript('addDebt', data);
        
        if (result.success) {
            await loadAllData();
            initDebtsPage();
            closeAddDebtModal();
            hideLoading();
            showAlert('✅ Berhasil ditambahkan!', 'success');
        } else {
            hideLoading();
            showAlert('❌ Gagal: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Submit debt error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan.', 'error');
    }
}

// ============================================
// SHOW PAYMENT MODAL
// ============================================
function showPaymentModal(debtId) {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;
    
    const modalHTML = `
        <div id="paymentModal" class="modal active">
            <div class="modal-content">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">
                            ${debt.tipe === 'Utang' ? '💸 Bayar Utang' : '💰 Terima Pembayaran'}
                        </h3>
                        <button onclick="closePaymentModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4 mb-6">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm text-gray-600">Kepada:</span>
                            <span class="font-bold">${debt.namaPihak}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">Sisa ${debt.tipe}:</span>
                            <span class="text-xl font-bold ${debt.tipe === 'Utang' ? 'text-red-600' : 'text-green-600'}">
                                ${formatCurrency(debt.sisa)}
                            </span>
                        </div>
                    </div>
                    
                    <form onsubmit="submitPayment(event, '${debtId}')">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nominal Bayar</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input type="number" id="paymentNominal" required min="0" max="${debt.sisa}" 
                                           step="10000" class="input pl-12" placeholder="0">
                                </div>
                                <div class="mt-2 flex gap-2">
                                    ${debt.cicilanPerBulan > 0 ? `
                                        <button type="button" onclick="setPaymentAmount(${debt.cicilanPerBulan})" 
                                                class="text-xs btn btn-secondary py-1 px-3">
                                            Cicilan (${formatCurrency(debt.cicilanPerBulan)})
                                        </button>
                                    ` : ''}
                                    <button type="button" onclick="setPaymentAmount(${debt.sisa})" 
                                            class="text-xs btn btn-secondary py-1 px-3">
                                        Lunas (${formatCurrency(debt.sisa)})
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Dari Akun</label>
                                <select id="paymentAkun" required class="input">
                                    <option value="">Pilih Akun</option>
                                    ${accounts.filter(a => a.status === 'Aktif').map(acc => `
                                        <option value="${acc.nama}">${acc.nama} (${formatCurrency(acc.saldoSekarang)})</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Bayar</label>
                                <input type="date" id="paymentTanggal" required class="input">
                            </div>
                        </div>
                        
                        <div class="flex space-x-3 mt-6">
                            <button type="button" onclick="closePaymentModal()" class="flex-1 btn btn-secondary">
                                Batal
                            </button>
                            <button type="submit" class="flex-1 btn btn-primary">
                                ✅ Konfirmasi Bayar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('paymentModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('paymentTanggal').valueAsDate = new Date();
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.remove();
}

function setPaymentAmount(amount) {
    document.getElementById('paymentNominal').value = amount;
}

// ============================================
// SUBMIT PAYMENT
// ============================================
async function submitPayment(event, debtId) {
    event.preventDefault();
    
    const nominal = parseFloat(document.getElementById('paymentNominal').value);
    const akun = document.getElementById('paymentAkun').value;
    const tanggal = document.getElementById('paymentTanggal').value;
    
    const debt = debts.find(d => d.id === debtId);
    
    if (nominal > debt.sisa) {
        showAlert('Nominal melebihi sisa ' + debt.tipe.toLowerCase() + '!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // This will create a transaction AND update debt
        const result = await callAppsScript('payDebt', {
            debtId: debtId,
            nominal: nominal,
            akun: akun,
            tanggal: tanggal
        });
        
        if (result.success) {
            await loadAllData();
            initDebtsPage();
            closePaymentModal();
            hideLoading();
            showAlert('✅ Pembayaran berhasil dicatat!', 'success');
        } else {
            hideLoading();
            showAlert('❌ Gagal: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Payment error:', error);
        hideLoading();
        showAlert('❌ Terjadi kesalahan.', 'error');
    }
}

console.log('✅ debts.js loaded');

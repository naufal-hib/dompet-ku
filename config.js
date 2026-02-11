// ============================================
// DOMPET KU - KONFIGURASI
// ============================================

// Google Sheets Configuration - HANYA SPREADSHEET ID
const SPREADSHEET_ID = '1EFAvKsfmDZtQMIGgSxlmKRlxU752_brCmzZUX3HJdoM';

// ❌ API KEY DIHAPUS - SEMUA READ VIA APPS SCRIPT
// const API_KEY = 'AIzaSyBYxMfJkJSaaKLXcjd2y-0RYBNdFetfz_I'; // REMOVED FOR SECURITY

// Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJdKMW6ttLBILdavjsEcocJzpBdoxvq1kml59XX1z9vZGrxTYZ3pLqtc1ia3N_xCo5/exec';

// Sheet Names
const SHEET_NAMES = {
    accounts: 'Accounts',
    categories: 'Categories',
    transactions: 'Transactions',
    budgets: 'Budgets',
    config: 'Config',
    debts: 'DebtsCredits',
    reminders: 'Reminders',
    allocations: 'Allocations'
};

// WhatsApp Configuration
const WA_CONFIG = {
    enabled: true,
    number: '62895397978257'
};

// ============================================
// DATE FORMAT CONSTANTS
// ============================================
const DATE_FORMAT = {
    INTERNAL: 'YYYY-MM-DD',  // Untuk database & logic
    DISPLAY: 'DD/MM/YYYY'     // Untuk display ke user
};

// ============================================
// CALL APPS SCRIPT - IMPROVED ERROR HANDLING
// ============================================
async function callAppsScript(action, data = {}) {
    try {
        console.log('📤 Calling Apps Script:', action);
        
        // Encode data sebagai query parameter
        const params = new URLSearchParams({
            action: action,
            payload: JSON.stringify(data)
        });
        
        const url = `${APPS_SCRIPT_URL}?${params.toString()}`;
        
        // Gunakan GET request dengan timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            console.error('❌ Apps Script returned error:', result.message);
            throw new Error(result.message || 'Unknown error from server');
        }
        
        console.log('✅ Apps Script success:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Apps Script error:', error);
        
        // User-friendly error messages
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - silakan coba lagi');
        } else if (error.message.includes('Failed to fetch')) {
            throw new Error('Tidak ada koneksi internet');
        } else {
            throw error;
        }
    }
}

console.log('✅ config.js loaded (SECURE VERSION)');

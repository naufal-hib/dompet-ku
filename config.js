// ============================================
// DOMPET KU - KONFIGURASI
// ============================================

// Google Sheets Configuration
const SPREADSHEET_ID = '1EFAvKsfmDZtQMIGgSxlmKRlxU752_brCmzZUX3HJdoM';
const API_KEY = 'AIzaSyBYxMfJkJSaaKLXcjd2y-0RYBNdFetfz_I';

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

// API Base URLs
const SHEETS_API_BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;

// Helper function to get sheet URL
function getSheetUrl(sheetName, range = '') {
    const fullRange = range ? `${sheetName}!${range}` : sheetName;
    return `${SHEETS_API_BASE}/values/${fullRange}?key=${API_KEY}`;
}

// ============================================
// Call Apps Script - MENGGUNAKAN GET REQUEST
// ============================================
async function callAppsScript(action, data) {
    try {
        console.log('📤 Calling Apps Script:', action, data);
        
        // Encode data sebagai query parameter
        const params = new URLSearchParams({
            action: action,
            payload: JSON.stringify(data)
        });
        
        const url = `${APPS_SCRIPT_URL}?${params.toString()}`;
        
        console.log('🔗 Request URL:', url);
        
        // Gunakan GET request (no CORS preflight!)
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Apps Script result:', result);
        
        return result;
        
    } catch (error) {
        console.error('❌ Apps Script error:', error);
        throw error;
    }
}

console.log('✅ config.js loaded');

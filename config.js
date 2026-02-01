// ============================================
// DOMPET KU - KONFIGURASI
// ============================================

// Google Sheets Configuration
const SPREADSHEET_ID = '1EFAvKsfmDZtQMIGgSxlmKRlxU752_brCmzZUX3HJdoM'; // GANTI DENGAN ID SPREADSHEET ANDA!
const API_KEY = 'AIzaSyBYxMfJkJSaaKLXcjd2y-0RYBNdFetfz_I'; // GANTI DENGAN API KEY ANDA!

// Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxgwqKWf8mdMUvVVUDBEe5L_uXOpPgCJmloDh1AQbSSgmejXigIJIy6A1NhiUw__Uv4/exec'; // GANTI DENGAN URL ANDA!

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

// WhatsApp Configuration (Optional - for manual trigger)
const WA_CONFIG = {
    enabled: true,
    number: '62895397978257' // GANTI DENGAN NOMOR ANDA!
};

// API Base URLs
const SHEETS_API_BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;

// Helper function to get sheet URL
function getSheetUrl(sheetName, range = '') {
    const fullRange = range ? `${sheetName}!${range}` : sheetName;
    return `${SHEETS_API_BASE}/values/${fullRange}?key=${API_KEY}`;
}

// Helper function to call Apps Script
async function callAppsScript(action, data) {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                ...data
            })
        });
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Apps Script error:', error);
        throw error;
    }
}

console.log('✅ config.js loaded');

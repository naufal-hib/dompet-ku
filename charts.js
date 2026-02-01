// ============================================
// DOMPET KU - CHARTS MODULE
// ============================================

let expenseChartInstance = null;

// ============================================
// RENDER EXPENSE CHART (PIE)
// ============================================
function renderExpenseChart() {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    
    // Get this month's expenses
    const thisMonthExpenses = transactions.filter(t => {
        return t.tanggal.startsWith(currentMonth) && t.tipe === 'Pengeluaran';
    });
    
    if (thisMonthExpenses.length === 0) {
        // Show empty state
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#9CA3AF';
        ctx.textAlign = 'center';
        ctx.fillText('Belum ada pengeluaran', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Group by category
    const categoryTotals = {};
    thisMonthExpenses.forEach(t => {
        if (!categoryTotals[t.kategori]) {
            categoryTotals[t.kategori] = 0;
        }
        categoryTotals[t.kategori] += t.nominal;
    });
    
    // Prepare chart data
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    // Get colors from categories
    const colors = labels.map(label => {
        const category = categories.find(c => c.nama === label);
        return category ? category.warna : '#6B7280';
    });
    
    // Destroy previous chart if exists
    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }
    
    // Create new chart
    const ctx = canvas.getContext('2d');
    expenseChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 11
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percent = Math.round((value / total) * 100);
                                    
                                    return {
                                        text: `${label} (${percent}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const formattedValue = formatCurrency(value);
                            return `${label}: ${formattedValue}`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

console.log('✅ charts.js loaded');

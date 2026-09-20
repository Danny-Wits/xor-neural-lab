/**
 * Renders the Loss history using Chart.js
 */
let chartInstance = null;

export function initLossChart(ctx) {
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Mean Squared Error',
                data: [],
                borderColor: '#111111',
                backgroundColor: 'rgba(17, 17, 17, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 0.5
                },
                x: {
                    display: false // Hide x-axis labels to avoid clutter
                }
            }
        }
    });
}

export function updateLossChart(epoch, lossValue) {
    if(!chartInstance) return;
    
    chartInstance.data.labels.push(epoch);
    chartInstance.data.datasets[0].data.push(lossValue);
    
    // Keep only last 1000 points to prevent lag
    if (chartInstance.data.labels.length > 1000) {
        chartInstance.data.labels.shift();
        chartInstance.data.datasets[0].data.shift();
    }
    
    chartInstance.update();
}

export function resetLossChart() {
    if(!chartInstance) return;
    chartInstance.data.labels = [];
    chartInstance.data.datasets[0].data = [];
    chartInstance.update();
}

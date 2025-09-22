document.addEventListener('DOMContentLoaded', function() {
    const storageInput = document.getElementById('storageInput');
    const calculateBtn = document.getElementById('calculateBtn');
    const costResult = document.getElementById('costResult');
    const continuityResult = document.getElementById('continuityResult');
    const optimalResult = document.getElementById('optimalResult');
    const derivativeResult = document.getElementById('derivativeResult');
    
    let costChart;
    
    // Fungsi piecewise untuk menghitung biaya - DIPERBAIKI
    function calculateCostWithPackage(x, package) {
        switch(package) {
            case 'basic':
                if (x <= 50) {
                    return 50000;
                } else {
                    return 50000 + (x - 50) * 2000;
                }
            case 'standard':
                if (x <= 200) {
                    return 90000;
                } else {
                    return 90000 + (x - 200) * 2000;
                }
            case 'premium':
                if (x <= 500) {
                    return 150000;
                } else {
                    return 150000 + (x - 500) * 2000;
                }
            default:
                return 0;
        }
    }
    
    // Fungsi untuk menentukan paket optimal
    function findOptimalPackage(x) {
        const basicCost = calculateCostWithPackage(x, 'basic');
        const standardCost = calculateCostWithPackage(x, 'standard');
        const premiumCost = calculateCostWithPackage(x, 'premium');
        
        const costs = [
            { name: 'Basic', cost: basicCost },
            { name: 'Standard', cost: standardCost },
            { name: 'Premium', cost: premiumCost }
        ];
        
        // Urutkan dari biaya terendah
        costs.sort((a, b) => a.cost - b.cost);
        
        return costs;
    }
    
    // Fungsi untuk menganalisis kekontinuan
    function analyzeContinuity() {
        // Di x = 50
        const leftLimit50 = calculateCostWithPackage(50, 'basic');
        const rightLimit50 = calculateCostWithPackage(50, 'standard');
        
        // Di x = 200
        const leftLimit200 = calculateCostWithPackage(200, 'standard');
        const rightLimit200 = calculateCostWithPackage(200, 'premium');
        
        return {
            x50: { left: leftLimit50, right: rightLimit50, continuous: leftLimit50 === rightLimit50 },
            x200: { left: leftLimit200, right: rightLimit200, continuous: leftLimit200 === rightLimit200 }
        };
    }
    
    // Fungsi untuk menghitung turunan
    function calculateDerivative() {
        return [
            { interval: '0 ≤ x ≤ 50', derivative: 0 },
            { interval: '50 < x ≤ 200', derivative: 0 },
            { interval: '200 < x ≤ 500', derivative: 0 },
            { interval: 'x > 500', derivative: 2000 }
        ];
    }
    
    // Fungsi untuk memperbarui grafik
    function updateChart() {
        const ctx = document.getElementById('costChart').getContext('2d');
        
        // Hapus chart sebelumnya jika ada
        if (costChart) {
            costChart.destroy();
        }
        
        // Data untuk grafik
        const labels = Array.from({length: 601}, (_, i) => i); // 0 hingga 600
        const basicData = labels.map(x => calculateCostWithPackage(x, 'basic'));
        const standardData = labels.map(x => calculateCostWithPackage(x, 'standard'));
        const premiumData = labels.map(x => calculateCostWithPackage(x, 'premium'));
        
        // Buat grafik
        costChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Paket Basic',
                        data: basicData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 3,
                        pointRadius: 0,
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: 'Paket Standard',
                        data: standardData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 3,
                        pointRadius: 0,
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: 'Paket Premium',
                        data: premiumData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 3,
                        pointRadius: 0,
                        fill: false,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Penyimpanan (GB)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Biaya (Rp)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return 'Rp ' + (value/1000000).toFixed(1) + 'Jt';
                                } else if (value >= 1000) {
                                    return 'Rp ' + (value/1000).toFixed(0) + 'Rb';
                                }
                                return 'Rp ' + value;
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 13,
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': Rp ' + context.raw.toLocaleString('id-ID');
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
    
    // Format angka ke Rupiah
    function formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0 
        }).format(amount);
    }
    
    // Fungsi untuk memperbarui tampilan
    function updateUI() {
        const storage = parseInt(storageInput.value);
        
        // Validasi input
        if (isNaN(storage) || storage < 0 || storage > 600) {
            alert('Masukkan jumlah penyimpanan antara 0 dan 600 GB');
            return;
        }
        
        // Hitung biaya untuk setiap paket
        const optimalPackages = findOptimalPackage(storage);
        const continuity = analyzeContinuity();
        const derivatives = calculateDerivative();
        
        // Tampilkan hasil
        costResult.innerHTML = `
            <h3>Biaya untuk ${storage} GB:</h3>
            <p><strong>Basic:</strong> ${formatRupiah(calculateCostWithPackage(storage, 'basic'))}</p>
            <p><strong>Standard:</strong> ${formatRupiah(calculateCostWithPackage(storage, 'standard'))}</p>
            <p><strong>Premium:</strong> ${formatRupiah(calculateCostWithPackage(storage, 'premium'))}</p>
        `;
        
        continuityResult.innerHTML = `
            <h3>Analisis Kekontinuan:</h3>
            <p><strong>Pada x = 50 GB:</strong></p>
            <p>Limit kiri: ${formatRupiah(continuity.x50.left)}</p>
            <p>Limit kanan: ${formatRupiah(continuity.x50.right)}</p>
            <p><strong>Kesimpulan:</strong> ${continuity.x50.continuous ? 'Kontinu' : 'Tidak Kontinu'}</p>
            
            <p><strong>Pada x = 200 GB:</strong></p>
            <p>Limit kiri: ${formatRupiah(continuity.x200.left)}</p>
            <p>Limit kanan: ${formatRupiah(continuity.x200.right)}</p>
            <p><strong>Kesimpulan:</strong> ${continuity.x200.continuous ? 'Kontinu' : 'Tidak Kontinu'}</p>
        `;
        
        optimalResult.innerHTML = `
            <h3>Rekomendasi Paket Optimal:</h3>
            <ol>
                <li><strong>${optimalPackages[0].name}:</strong> ${formatRupiah(optimalPackages[0].cost)}</li>
                <li>${optimalPackages[1].name}: ${formatRupiah(optimalPackages[1].cost)}</li>
                <li>${optimalPackages[2].name}: ${formatRupiah(optimalPackages[2].cost)}</li>
            </ol>
        `;
        
        derivativeResult.innerHTML = `
            <h3>Analisis Turunan (Bonus):</h3>
            <p>Turunan fungsi C(x) untuk setiap interval:</p>
            <ul>
                ${derivatives.map(d => `<li><strong>${d.interval}:</strong> C'(x) = ${d.derivative}</li>`).join('')}
            </ul>
            <p><strong>Interpretasi:</strong></p>
            <p>Turunan = 0 artinya biaya tidak berubah terhadap penambahan penyimpanan (dalam interval tersebut).</p>
            <p>Turunan = 2000 artinya setiap penambahan 1 GB penyimpanan akan menambah biaya sebesar Rp 2.000.</p>
        `;
        
        // Perbarui grafik
        updateChart();
    }
    
    // Event listener untuk tombol hitung
    calculateBtn.addEventListener('click', updateUI);
    
    // Event listener untuk input enter
    storageInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            updateUI();
        }
    });
    
    // Inisialisasi pertama kali
    updateUI();
});
const fileInput = document.getElementById('file-input');
const progressSpan = document.getElementById('progress');
const progressBar = document.getElementById('progress-bar');
const resultsDiv = document.getElementById('results');
const analysisDiv = document.getElementById('analysis');
let chart;

// Benford's Law expected percentages
const benfordPercentages = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];

// Initialize Chart.js
function initializeChart() {
    const ctx = document.getElementById('benford-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
            datasets: [{
                label: 'Count of First Digits',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'First Digit'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'First Digit Distribution'
                }
            }
        }
    });
}

// Get first digit of a string token
function firstDigitOf(token) {
    for (let ch of token) {
        if (ch >= '1' && ch <= '9') {
            return parseInt(ch);
        }
    }
    return 0;
}

// Count first digits in text with progress
function countDigits(text) {
    const count = new Array(10).fill(0);
    const tokens = text.split(/\s+/).filter(token => token.trim() !== '');
    let index = 0;

    function processNextToken() {
        if (index < tokens.length) {
            const token = tokens[index];
            const digit = firstDigitOf(token);
            count[digit]++;
            updateChart(count);
            updateResults(count);
            updateProgress((index + 1) / tokens.length * 100);
            index++;
            setTimeout(processNextToken, 10);
        } else {
            analyzeBenford(count);
        }
    }

    processNextToken();
    return count;
}

// Update chart with new counts
function updateChart(count) {
    chart.data.datasets[0].data = count.slice(1);
    chart.update();
}

// Update results table
function updateResults(count) {
    const total = count.slice(1).reduce((sum, n) => sum + n, 0);
    let html = '<h3>Results</h3>';
    if (count[0] > 0) {
        html += `<p>Excluding ${count[0]} tokens</p>`;
    }
    html += '<table><tr><th>Digit</th><th>Count</th><th>Percent</th></tr>';
    for (let i = 1; i < count.length; i++) {
        const percent = total > 0 ? (count[i] * 100 / total).toFixed(2) : 0;
        html += `<tr><td>${i}</td><td>${count[i]}</td><td>${percent}%</td></tr>`;
    }
    html += `<tr><td>Total</td><td>${total}</td><td>100.00%</td></tr>`;
    html += '</table>';
    resultsDiv.innerHTML = html;
}

// Update progress bar
function updateProgress(percentage) {
    progressSpan.textContent = `${percentage.toFixed(1)}%`;
    progressBar.style.width = `${percentage}%`;
}

// Analyze if distribution follows Benford's Law
function analyzeBenford(count) {
    const total = count.slice(1).reduce((sum, n) => sum + n, 0);
    if (total === 0) {
        analysisDiv.innerHTML = '<p>No valid digits found for analysis.</p>';
        return;
    }

    let maxDeviation = 0;
    for (let i = 1; i < count.length; i++) {
        const observedPercent = (count[i] * 100 / total);
        const expectedPercent = benfordPercentages[i - 1];
        const deviation = Math.abs(observedPercent - expectedPercent);
        maxDeviation = Math.max(maxDeviation, deviation);
    }

    const threshold = 5;
    let result;
    if (maxDeviation > threshold) {
        result = `<p class="suspicious">Suspicion Detected: The distribution deviates significantly from Benford's Law (max deviation: ${maxDeviation.toFixed(2)}%).</p>`;
    } else {
        result = `<p class="normal">Normal: The distribution aligns with Benford's Law (max deviation: ${maxDeviation.toFixed(2)}%).</p>`;
    }

    analysisDiv.innerHTML = '<h3>Benford\'s Law Analysis</h3>' + result;
}

// Handle file upload
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        alert('No file selected.');
        return;
    }

    updateProgress(0);
    resultsDiv.innerHTML = '';
    analysisDiv.innerHTML = '';

    if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
            countDigits(e.target.result);
        };
        reader.readAsText(file);
    } else if (file.type === 'image/png' || file.type === 'image/jpeg') {
        Tesseract.recognize(
            file,
            'eng',
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        updateProgress(m.progress * 50); // OCR progress (0-50%)
                    }
                }
            }
        ).then(({ data: { text } }) => {
            countDigits(text); // Process extracted text
        }).catch((err) => {
            alert('Error processing image: ' + err.message);
            updateProgress(0);
        });
    } else {
        alert('Please upload a valid .txt, .png, or .jpg file.');
    }
});

// Initialize chart on page load
initializeChart();
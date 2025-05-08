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

// Get first digit of a number
function firstDigitOf(number) {
    const str = String(number).replace(/^0+/, '');
    for (let ch of str) {
        if (ch >= '1' && ch <= '9') {
            return parseInt(ch);
        }
    }
    return 0;
}

// Extract valid numbers from text
function extractNumbers(text) {
    return text.match(/\b\d+\.?\d*\b/g) || [];
}

// Check if dataset is Benford-compliant
function isBenfordCompliant(numbers) {
    const values = numbers.map(n => parseFloat(n)).filter(n => !isNaN(n));
    if (values.length < 100) return false;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min > 0 && max / min > 100;
}

// Count first digits with progress
function countDigits(numbers) {
    const count = new Array(10).fill(0);
    let index = 0;

    function processNextNumber() {
        if (index < numbers.length) {
            const digit = firstDigitOf(numbers[index]);
            count[digit]++;
            updateChart(count);
            updateResults(count);
            updateProgress((index + 1) / numbers.length * 100);
            index++;
            setTimeout(processNextNumber, 10);
        } else {
            analyzeBenford(count, numbers);
        }
    }

    processNextNumber();
    return count;
}

// Update chart
function updateChart(count) {
    chart.data.datasets[0].data = count.slice(1);
    chart.update();
}

// Update results table
function updateResults(count) {
    const total = count.slice(1).reduce((sum, n) => sum + n, 0);
    let html = '<h3>Results</h3>';
    if (count[0] > 0) {
        html += `<p>Excluding ${count[0]} invalid numbers</p>`;
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

// Analyze Benford's Law with chi-squared test
function analyzeBenford(count, numbers) {
    const total = count.slice(1).reduce((sum, n) => sum + n, 0);
    let html = '<h3>Benford\'s Law Analysis</h3>';

    if (total < 100) {
        html += '<p>Insufficient numbers for analysis (need at least 100 valid numbers). For text analysis, check image quality or try a different file. For raw image analysis, ensure the image is a JPEG.</p>';
        analysisDiv.innerHTML = html;
        return;
    }

    if (!isBenfordCompliant(numbers)) {
        html += '<p>Warning: The numbers may not be suitable for Benford’s Law (e.g., too uniform or constrained). Results may be unreliable.</p>';
        analysisDiv.innerHTML = html;
        return;
    }

    let chiSquare = 0;
    for (let i = 1; i < count.length; i++) {
        const observed = count[i];
        const expected = (benfordPercentages[i - 1] / 100) * total;
        chiSquare += Math.pow(observed - expected, 2) / expected;
    }

    const pValue = 1 - jStat.chisquare.cdf(chiSquare, 8);
    let result;
    if (pValue < 0.05) {
        result = `<p class="suspicious">Potential Anomaly: The first-digit distribution deviates significantly from Benford’s Law (chi-squared p-value: ${pValue.toFixed(4)}). For text analysis, this may suggest data manipulation, but could result from OCR errors. For raw image analysis, this may indicate a synthetic image. Verify the image and consider further forensic analysis (see <a href="#help">Help</a>).</p>`;
    } else {
        result = `<p class="normal">Consistent with Benford’s Law: The first-digit distribution aligns with expected patterns (chi-squared p-value: ${pValue.toFixed(4)}). This suggests natural data, but does not guarantee authenticity. For critical cases, perform additional checks (see <a href="#help">Help</a>).</p>`;
    }

    analysisDiv.innerHTML = html + result;
}

// Preprocess image with OpenCV.js
function preprocessImage(file, callback) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const src = cv.imread(canvas);
        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
        cv.adaptiveThreshold(src, src, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
        const dstCanvas = document.createElement('canvas');
        cv.imshow(dstCanvas, src);
        src.delete();
        callback(dstCanvas.toDataURL('image/png'));
    };
}

// Extract DCT coefficients (client-side, limited to JPEG)
function extractDCTCoefficients(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const buffer = new Uint8Array(e.target.result);
        try {
            const decoded = jpeg.decode(buffer, { useTArray: true });
            const coefficients = decoded.dctCoefficients || []; // Simplified; real DCT extraction is complex
            const numbers = coefficients.filter(c => Math.abs(c) > 0).map(c => Math.abs(c));
            callback(numbers);
        } catch (err) {
            console.error('DCT extraction failed:', err);
            callback([]);
        }
    };
    reader.readAsArrayBuffer(file);
}

// Handle file upload
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        alert('No file selected.');
        return;
    }

    console.log('File name:', file.name, 'Type:', file.type);
    updateProgress(0);
    resultsDiv.innerHTML = '';
    analysisDiv.innerHTML = '';

    const extension = file.name.toLowerCase().split('.').pop();
    const validText = file.type === 'text/plain' || extension === 'txt';
    const validImage = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type) || ['png', 'jpg', 'jpeg'].includes(extension);

    if (validText) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const numbers = extractNumbers(e.target.result);
            if (numbers.length === 0) {
                alert('No valid numbers found in the text file.');
                return;
            }
            countDigits(numbers);
        };
        reader.readAsText(file);
    } else if (validImage) {
        const analysisMode = document.getElementById('analysis-mode').value;
        if (analysisMode === 'text') {
            preprocessImage(file, (preprocessedDataUrl) => {
                Tesseract.recognize(
                    preprocessedDataUrl,
                    'eng',
                    {
                        logger: (m) => {
                            if (m.status === 'recognizing text') {
                                updateProgress(m.progress * 50);
                            }
                        }
                    }
                ).then(({ data: { text } }) => {
                    console.log('OCR extracted text:', text);
                    const numbers = extractNumbers(text);
                    if (numbers.length === 0) {
                        alert('No valid numbers extracted from the image.');
                        return;
                    }
                    updateProgress(50);
                    countDigits(numbers);
                }).catch((err) => {
                    alert('Error processing image: ' + err.message);
                    updateProgress(0);
                });
            });
        } else if (analysisMode === 'raw') {
            if (file.type !== 'image/jpeg' && extension !== 'jpg' && extension !== 'jpeg') {
                alert('Raw image analysis requires a JPEG file.');
                return;
            }
            extractDCTCoefficients(file, (numbers) => {
                if (numbers.length === 0) {
                    alert('Unable to extract DCT coefficients. Try a different JPEG or use server-side analysis (see README).');
                    return;
                }
                updateProgress(50);
                countDigits(numbers);
            });
        }
    } else {
        alert('Please upload a valid .txt, .png, or .jpg file.');
    }
});

// Initialize chart on page load
initializeChart();
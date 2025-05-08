# Benford's Law Analyzer Web App

## Overview
This web application analyzes text files (`.txt`) or images (`.png`, `.jpg`) to check if the distribution of first digits (1-9) follows **Benford's Law**, which can indicate data authenticity or potential manipulation. It supports two modes:
- **Text Analysis**: Uses Optical Character Recognition (OCR) via Tesseract.js to extract numbers from images (e.g., receipts, invoices) or processes text files directly.
- **Raw Image Analysis**: Extracts Discrete Cosine Transform (DCT) coefficients from JPEG images to detect synthetic images (e.g., GAN-generated). Client-side analysis is limited; server-side processing is recommended for robust results.

The app provides a live bar chart (via Chart.js), a progress bar, a results table, and a statistical analysis using a chi-squared test to detect anomalies, which could suggest data manipulation or synthetic images.

## What is Benford's Law?
Benford's Law states that in many naturally occurring datasets (e.g., financial records, image DCT coefficients), the leading digits of numbers follow a non-uniform distribution:
- 1: 30.1%
- 2: 17.6%
- 3: 12.5%
- 4: 9.7%
- 5: 7.9%
- 6: 6.7%
- 7: 5.8%
- 8: 5.1%
- 9: 4.6%

This applies to datasets spanning multiple orders of magnitude (e.g., stock prices, river lengths) but not artificial data (e.g., sequential numbers, fixed-length codes). Deviations can indicate manipulation, such as fraud in documents or synthetic images.

## App Features
- **File Upload**: Upload `.txt` files or images (`.png`, `.jpg`).
- **Analysis Modes**:
  - Text: Extracts numbers via OCR (images) or directly (text files).
  - Raw Image: Analyzes DCT coefficients from JPEGs (client-side limited; server-side recommended).
- **OCR Enhancements**: Preprocesses images with OpenCV.js for better Tesseract.js accuracy.
- **Live Tally**: Updates a bar chart in real-time with throttled rendering for stability.
- **Progress Bar**: Shows processing progress (0-100% for text, 0-50% for OCR/DCT, 50-100% for counting).
- **Results Table**: Displays digit counts and percentages, excluding invalid numbers.
- **Statistical Analysis**: Uses a chi-squared test (p-value < 0.05 flags anomalies).
- **Dataset Validation**: Checks if numbers are suitable for Benford’s Law.
- **User Guidance**: Includes a help section linking to advice on handling anomalies.
- **Responsive Design**: Stable across browsers, including Chrome.

## What to Do If You Suspect Image Manipulation
If the app flags a “Potential Anomaly” (p-value < 0.05), it may indicate manipulation. Follow these steps:

1. **Verify the Input**:
   - **Text Analysis**: Ensure the image is high-contrast and typed. Check the console for OCR-extracted text (`OCR extracted text: ...`).
   - **Raw Image Analysis**: Ensure the image is a JPEG. Use the server-side API for accurate DCT analysis.
2. **Compare with Original Data**:
   - Analyze the original dataset (e.g., raw text, another image copy) and compare results.
   - Look for tampering signs (e.g., inconsistent fonts, pixel artifacts).
3. **Test Multiple Samples**:
   - Analyze other files from the same source to confirm patterns.
4. **Investigate Context**:
   - Ensure the dataset is Benford-compliant. Unsuitable data may cause false positives.
   - Verify the source’s trustworthiness.
5. **Further Analysis**:
   - Use forensic tools (e.g., FotoForensics, Forensically).
   - Consult a forensic accountant or data analyst for critical data.
6. **Report Findings**:
   - Document results (e.g., screenshot the chart and analysis).
   - Note that this app provides preliminary indicators, not proof.

## Getting Started
### Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Edge).
- For raw image analysis, server-side processing requires Python, Flask, and `scipy`.

### Installation
1. Clone or download the repository:
   - `index.html`
   - `styles.css`
   - `script.js`
2. Place files in the same directory.
3. Open `index.html` in a browser.

### Server-Side Setup (Optional, for Raw Image Analysis)
For robust DCT analysis, set up a Python Flask API:
```python
from flask import Flask, request
from PIL import Image
import scipy.fftpack
import numpy as np
import io

app = Flask(__name__)

@app.route('/analyze_dct', methods=['POST'])
def analyze_dct():
    file = request.files['image']
    img = Image.open(file).convert('L')
    img_array = np.array(img)
    dct = scipy.fftpack.dct(scipy.fftpack.dct(img_array.T, norm='ortho').T, norm='ortho')
    coefficients = dct.flatten()
    numbers = [abs(c) for c in coefficients if abs(c) > 0]
    return {'numbers': numbers[:1000]}
if __name__ == '__main__':
    app.run(debug=True)
```
Install dependencies:
```bash
pip install flask pillow scipy numpy
```
Run the server and update `script.js` to call the API:
```javascript
function extractDCTCoefficients(file, callback) {
    const formData = new FormData();
    formData.append('image', file);
    fetch('http://localhost:5000/analyze_dct', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => callback(data.numbers))
    .catch(err => {
        console.error('Server-side DCT failed:', err);
        callback([]);
    });
}
```

### Usage
1. **Select Analysis Mode**:
   - Choose “Text (OCR from Images)” or “Raw Image (DCT Coefficients)”.
2. **Upload a File**:
   - Text files: Numbers separated by spaces.
   - Images: Clear text for OCR or JPEG for DCT.
3. **Monitor Progress**:
   - Text: 0-100%.
   - Images (Text): 0-50% for OCR, 50-100% for counting.
   - Images (Raw): 0-50% for DCT, 50-100% for counting.
4. **Review Results**:
   - Check the results table and analysis (p-value ≥ 0.05 for consistency).
5. **Check Help**:
   - Refer to the help section for guidance.

### Testing
- **Text File**: Upload a `.txt` with numbers (e.g., “123 456.78 789”).
- **Image (Text)**: Use a clear receipt image. Check OCR text in console.
- **Image (Raw)**: Upload a JPEG (test real vs. GAN-generated with server-side API).
- **Edge Cases**: Test empty files, non-numeric images, or low-quality JPEGs.
- **Browser Stability**: Verify chart rendering in Chrome, Firefox, and Edge.

## Limitations
- **OCR Accuracy**: Tesseract.js may struggle with handwritten or low-resolution images.
- **Client-Side DCT**: Limited to JPEGs and small images. Use server-side API.
- **Statistical Test**: Requires ≥100 numbers for reliability.
- **File Types**: Only `.txt`, `.png`, `.jpg` supported.
- **Browser Performance**: Large files may slow processing.

## Future Improvements
- Add PDF support.
- Implement server-side DCT by default.
- Allow OCR language selection.
- Add image preview.
- Support two-digit Benford analysis.

## License
MIT License. Use, modify, and distribute freely.

## Acknowledgments
- Built with [Chart.js](https://www.chartjs.org/), [Tesseract.js](https://github.com/naptha/tesseract.js), [OpenCV.js](https://opencv.org/), [jStat](https://jstat.github.io/), and [jpeg-js](https://github.com/eugeneware/jpeg-js).
- Inspired by Benford’s Law applications in fraud detection and image forensics.

For support, open an issue or contact the developer.
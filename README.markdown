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
- **Live Tally**: Updates a bar chart in real-time as first digits are counted.
- **Progress Bar**: Shows processing progress (0-100% for text, 0-50% for OCR, 50-100% for counting).
- **Results Table**: Displays digit counts and percentages, excluding invalid numbers.
- **Statistical Analysis**: Uses a chi-squared test to compare the first-digit distribution to Benford’s Law. A p-value < 0.05 flags potential anomalies.
- **Dataset Validation**: Checks if numbers are suitable for Benford’s Law (e.g., span multiple orders of magnitude).
- **User Guidance**: Includes a help section linking to advice on handling anomalies.
- **Responsive Design**: User-friendly interface with clear feedback.

## What to Do If You Suspect Image Manipulation
If the app flags a “Potential Anomaly” (p-value < 0.05), it may indicate manipulation. Follow these steps:

1. **Verify the Input**:
   - **Text Analysis**: Ensure the image is high-contrast and typed (not handwritten). Check the console for OCR-extracted text (`OCR extracted text: ...`) to verify accuracy. Re-upload or try a clearer image.
   - **Raw Image Analysis**: Ensure the image is a JPEG. Client-side DCT analysis is limited; use the server-side API for better results.
2. **Compare with Original Data**:
   - Obtain the original dataset (e.g., raw text file, another image copy) and re-analyze. Compare results for consistency.
   - Look for tampering signs (e.g., inconsistent fonts, pixel artifacts).
3. **Test Multiple Samples**:
   - Analyze other files from the same source. Consistent deviations strengthen suspicion.
4. **Investigate Context**:
   - Ensure the dataset is Benford-compliant (spans multiple orders of magnitude). Unsuitable data (e.g., fixed-length codes) may cause false positives.
   - Verify the source’s trustworthiness.
5. **Further Analysis**:
   - Use forensic tools (e.g., FotoForensics, Forensically) for image manipulation checks.
   - For critical data, consult a forensic accountant or data analyst for deeper statistical tests (e.g., Z-statistics).
6. **Report Findings**:
   - Document results (e.g., screenshot the chart and analysis) and share with stakeholders.
   - Note that this app provides preliminary indicators, not definitive proof.

## Getting Started
### Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Edge).
- For raw image analysis, server-side processing requires Python, Flask, and `scipy` (see Server-Side Setup).

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
    return {'numbers': numbers[:1000]}  # Limit for performance

if __name__ == '__main__':
    app.run(debug=True)
```
Install dependencies:
```bash
pip install flask pillow scipy numpy
```
Run the server and update `script.js` to call the API (e.g., `fetch('http://localhost:5000/analyze_dct')`).

### Usage
1. **Select Analysis Mode**:
   - Choose “Text (OCR from Images)” for documents or “Raw Image (DCT Coefficients)” for JPEGs.
2. **Upload a File**:
   - Text files: Numbers separated by spaces (e.g., “123 456 789”).
   - Images: Clear, typed text for OCR or JPEG for DCT.
3. **Monitor Progress**:
   - Text files: 0-100%.
   - Images (Text): 0-50% for OCR, 50-100% for counting.
   - Images (Raw): 0-50% for DCT extraction, 50-100% for counting.
4. **Review Results**:
   - Results table shows digit counts and percentages.
   - Analysis indicates if the distribution is consistent (p-value ≥ 0.05) or anomalous (p-value < 0.05).
5. **Check Help**:
   - Refer to the help section for guidance on anomalies.

### Testing
- **Text File**: Upload a `.txt` with numbers (e.g., “123 45 678”). Verify chart and p-value.
- **Image (Text)**: Use a clear image of numbers (e.g., a receipt). Check console for OCR text.
- **Image (Raw)**: Upload a JPEG. Test with real vs. GAN-generated images if using server-side API.
- **Edge Cases**: Test empty files, non-numeric images, or low-quality JPEGs.

## Limitations
- **OCR Accuracy**: Tesseract.js may struggle with handwritten text or low-resolution images despite preprocessing.
- **Client-Side DCT**: Limited to JPEGs and small images due to browser constraints. Server-side API is recommended.
- **Statistical Test**: Chi-squared test assumes sufficient data (≥100 numbers). Small datasets may be unreliable.
- **File Types**: Only `.txt`, `.png`, and `.jpg` supported.
- **Browser Performance**: Large files may slow processing.

## Future Improvements
- Add PDF support.
- Implement server-side DCT analysis by default.
- Allow OCR language selection.
- Add image preview for uploads.
- Support two-digit Benford analysis.

## License
MIT License. Use, modify, and distribute freely.

## Acknowledgments
- Built with [Chart.js](https://www.chartjs.org/), [Tesseract.js](https://github.com/naptha/tesseract.js), [OpenCV.js](https://opencv.org/), [jStat](https://jstat.github.io/), and [jpeg-js](https://github.com/eugeneware/jpeg-js).
- Inspired by Benford’s Law applications in fraud detection and image forensics.

For support, open an issue or contact the developer.
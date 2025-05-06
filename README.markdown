# Benford's Law Analyzer Web App

## Overview
This web application allows users to analyze text files (`.txt`) or images (`.png`, `.jpg`) containing numbers to check if the distribution of first digits (1-9) follows **Benford's Law**. It provides a live tally of first digits in a bar chart, a progress bar, and a final analysis to detect potential anomalies, which could indicate data manipulation or fraud. The app uses Tesseract.js for Optical Character Recognition (OCR) to extract text from images, making it versatile for analyzing scanned documents or screenshots.

## What is Benford's Law?
Benford's Law, also known as the First-Digit Law, states that in many naturally occurring datasets (e.g., financial records, population numbers, scientific data), the leading digits of numbers are not uniformly distributed. Instead, smaller digits (especially 1) appear more frequently than larger ones. The expected probabilities for first digits 1-9 are approximately:

- 1: 30.1%
- 2: 17.6%
- 3: 12.5%
- 4: 9.7%
- 5: 7.9%
- 6: 6.7%
- 7: 5.8%
- 8: 5.1%
- 9: 4.6%

This counterintuitive distribution applies to datasets that span multiple orders of magnitude and are not artificially constrained (e.g., not sequential numbers or fixed-length codes). Deviations from Benford's Law can suggest data manipulation, such as fraud in financial records or tampering in images containing numerical data.

## App Features
- **File Upload**: Upload a `.txt` file or an image (`.png`, `.jpg`) containing numbers.
- **OCR for Images**: Uses Tesseract.js to extract text from images, enabling analysis of scanned documents or screenshots.
- **Live Tally**: Displays a bar chart (via Chart.js) that updates in real-time as first digits (1-9) are counted.
- **Progress Bar**: Shows the percentage of the file processed (0-100% for text files, 0-50% for OCR and 50-100% for digit counting in images).
- **Results Table**: Lists the count and percentage of each first digit, excluding invalid tokens (e.g., non-numeric strings).
- **Benford's Law Analysis**: Compares the observed first-digit distribution to Benford's Law expected percentages. If the maximum deviation exceeds 5%, the distribution is flagged as suspicious, indicating potential anomalies.
- **User-Friendly Interface**: Simple design with clear instructions and responsive layout.

## What to Do If You Suspect Image Manipulation
If the app flags a "Suspicion Detected" result (i.e., the first-digit distribution deviates significantly from Benford's Law), it may indicate that the numbers in the image or text file have been manipulated. Here’s what you can do:

1. **Verify the Input**:
   - For images, ensure the text is clear, high-contrast, and preferably typed (not handwritten), as OCR errors can affect results. Low-quality images or complex backgrounds may lead to inaccurate text extraction.
   - Re-upload the image or try a different image of the same document to confirm consistency.
   - Check the console logs (in your browser’s Developer Tools) for the OCR-extracted text (`OCR extracted text: ...`) to verify what was processed.

2. **Compare with Original Data**:
   - If possible, obtain the original dataset (e.g., a raw text file or another copy of the document) and analyze it with the app. Compare the results to see if the image’s distribution differs significantly.
   - Look for signs of tampering, such as inconsistent fonts, irregular spacing, or pixel artifacts in the image, which may suggest numbers were edited.

3. **Test Multiple Samples**:
   - Analyze other images or files from the same source to establish a pattern. If multiple samples consistently deviate from Benford’s Law, it strengthens the case for potential manipulation.
   - For example, if analyzing financial records, compare invoices or receipts from different periods.

4. **Investigate Context**:
   - Consider why the data might deviate. Natural datasets (e.g., stock prices, river lengths) often follow Benford’s Law, but artificial ones (e.g., fixed-length codes, sequential numbers) may not. Ensure the dataset is expected to conform to Benford’s Law.
   - Investigate the source of the image. Was it provided by a trusted party? Could it have been altered before being shared?

5. **Further Analysis**:
   - Use image forensics tools (e.g., FotoForensics or Forensically) to check for signs of digital manipulation, such as inconsistent noise patterns or metadata anomalies.
   - Consult a data analyst or forensic accountant if the data is critical (e.g., financial records) to perform a deeper statistical analysis, such as a chi-squared test.

6. **Report Findings**:
   - If you suspect fraud or manipulation, document the app’s results (e.g., screenshot the chart and analysis) and share them with relevant stakeholders (e.g., auditors, supervisors).
   - Note that the app’s analysis is a preliminary indicator, not definitive proof. Use it as a starting point for further investigation.

## Getting Started
### Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Edge).
- No server setup is required, as the app runs entirely in the browser using client-side JavaScript.

### Installation
1. Clone or download the repository containing the following files:
   - `index.html`
   - `styles.css`
   - `script.js`
2. Place all files in the same directory.
3. Open `index.html` in a web browser.

### Usage
1. **Upload a File**:
   - Click the file input to upload a `.txt` file or an image (`.png`, `.jpg`).
   - For text files, include numbers separated by spaces (e.g., "123 456 789 9abc").
   - For images, ensure the text is clear and legible for accurate OCR.

2. **Monitor Progress**:
   - Watch the progress bar as the file is processed (text files: 0-100%; images: 0-50% for OCR, 50-100% for digit counting).
   - The bar chart updates in real-time as first digits are tallied.

3. **Review Results**:
   - The results table shows the count and percentage of each first digit (1-9).
   - Invalid tokens (e.g., non-numeric strings) are excluded and reported.

4. **Check Benford’s Law Analysis**:
   - The analysis section indicates whether the distribution aligns with Benford’s Law (“Normal”) or is suspicious (“Suspicion Detected”).
   - A maximum deviation >5% triggers a suspicious result.

### Testing
- **Text File**: Create a `.txt` file with numbers (e.g., "123 45 678 9abc 234") and upload it. Verify that the chart and analysis match the expected distribution.
- **Image**: Use an image with clear, typed numbers (e.g., a screenshot of a spreadsheet or a scanned receipt). Check the console for the OCR-extracted text to ensure accuracy.
- **Edge Cases**: Test with an empty file, a non-numeric image, or a low-quality image to confirm error handling.

## Limitations
- **OCR Accuracy**: Tesseract.js may struggle with handwritten text, low-resolution images, or complex layouts. For best results, use high-contrast, typed text.
- **Statistical Test**: The app uses a simple 5% deviation threshold for Benford’s Law analysis. For critical applications, consider a more robust test (e.g., chi-squared).
- **File Types**: Only `.txt`, `.png`, and `.jpg` files are supported. Other formats (e.g., `.pdf`) are not currently handled.
- **Browser Performance**: Large images or text files may slow down processing due to client-side OCR and digit counting.

## Future Improvements
- Add support for PDF uploads or other image formats.
- Implement image preprocessing (e.g., contrast enhancement) to improve OCR accuracy.
- Include a chi-squared test for more precise Benford’s Law analysis.
- Add an image preview feature to help users verify uploads.
- Allow users to adjust OCR settings (e.g., language, thresholding).

## License
This project is licensed under the MIT License. Feel free to use, modify, and distribute it as needed.

## Acknowledgments
- Built with [Chart.js](https://www.chartjs.org/) for visualizations and [Tesseract.js](https://github.com/naptha/tesseract.js) for OCR.
- Inspired by Benford’s Law applications in fraud detection and data analysis.

If you have questions or need support, please open an issue or contact the developer.
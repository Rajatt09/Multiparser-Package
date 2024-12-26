import DocumentTextExtractor from './index.js';

async function main() {
  const extractor = new DocumentTextExtractor();
  
  try {
    const pdf_text = await extractor.extract('text_pdf.pdf');
    console.log('Extracted Text:', pdf_text);

    // Extract text from a DOCX file
    const docx_text = await extractor.extract('test_docx.docx');
    console.log('Extracted Text:', docx_text);

    // Extract text from a PPTX file
    const pptx_text = await extractor.extract('test_ppt.pptx');
    console.log('Extracted Text:', pptx_text);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
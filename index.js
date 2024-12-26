// index.js
import { PDFExtract } from "pdf.js-extract";
import mammoth from "mammoth";
import JSZip from "jszip";
import fs from "fs";
import xml2js from "xml2js";

class DocumentTextExtractor {
  constructor() {
    this.pdfExtract = new PDFExtract();
  }

  /**
   * Extract text from a PDF file
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractPdfText(filePath) {
    try {
      const data = await this.pdfExtract.extract(filePath, {});
      const fullText = data.pages
        .map((page) => page.content.map((item) => item.str).join(" "))
        .join("\n\n");
      return fullText;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw error;
    }
  }

  /**
   * Extract text from a DOCX file
   * @param {string} filePath - Path to the DOCX file
   * @returns {Promise<string>} Extracted text
   */
  async extractDocxText(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const { value: text } = await mammoth.extractRawText({
        buffer: fileBuffer,
      });
      return text;
    } catch (error) {
      console.error("Error extracting text from DOCX:", error);
      throw error;
    }
  }

  /**
   * Extract text from a PPTX file
   * @param {string} filePath - Path to the PPTX file
   * @returns {Promise<string>} Extracted text
   */
  async extractPptxText(filePath) {
    try {
      // Read the file
      const data = fs.readFileSync(filePath);
      const zip = new JSZip();

      // Load the PPTX file (it's actually a ZIP file)
      const content = await zip.loadAsync(data);

      const slideFiles = Object.keys(content.files)
        .filter((name) => name.startsWith("ppt/slides/slide"))
        .sort((a, b) => {
          const slideNumberA = parseInt(
            a.replace("ppt/slides/slide", "").replace(".xml", "")
          );
          const slideNumberB = parseInt(
            b.replace("ppt/slides/slide", "").replace(".xml", "")
          );
          return slideNumberA - slideNumberB;
        });

      // console.log(slideFiles);

      const allSlideTexts = [];

      // Process each slide
      for (let i = 0; i < slideFiles.length; i++) {
        // Extract the XML content of the slide
        const slideXml = await content.file(slideFiles[i]).async("text");
        const result = await xml2js.parseStringPromise(slideXml);

        // Get all text elements from the slide
        let slideText = "";
        const shapes =
          result["p:sld"]["p:cSld"][0]["p:spTree"][0]["p:sp"] || [];

        // Extract text from each shape
        shapes.forEach((shape) => {
          if (shape["p:txBody"]) {
            const textElements = shape["p:txBody"][0]["a:p"] || [];
            textElements.forEach((textElement) => {
              const textRuns = textElement["a:r"] || [];
              textRuns.forEach((textRun) => {
                const text = textRun["a:t"]?.[0];
                if (text) {
                  slideText += text.trim() + " ";
                }
              });
            });
          }
        });

        // Print the slide text
        allSlideTexts.push(`Slide ${i + 1} Text: ${slideText.join(" ")}`);
        // console.log(`Slide ${i + 1} Text: ${slideText.trim()}`);
      }
      return allSlideTexts.join("\n");
    } catch (error) {
      console.error("Error extracting text:", error);
    }
  }

  /**
   * Validate file existence and extension
   * @param {string} filePath - Path to check
   * @returns {string} File extension
   */
  validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const extension = filePath.split(".").pop().toLowerCase();
    if (!["pdf", "docx", "pptx"].includes(extension)) {
      throw new Error(`Unsupported file type: ${extension}`);
    }

    return extension;
  }

  /**
   * Extract text from any supported document type
   * @param {string} filePath - Path to the document
   * @returns {Promise<string>} Extracted text
   */
  async extract(filePath) {
    const extension = this.validateFile(filePath);

    switch (extension) {
      case "pdf":
        return await this.extractPdfText(filePath);
      case "docx":
        return await this.extractDocxText(filePath);
      case "pptx":
        return await this.extractPptxText(filePath);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}

export default DocumentTextExtractor;

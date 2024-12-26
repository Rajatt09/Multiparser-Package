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
      const { value: text } = await mammoth.extractRawText({ buffer: fileBuffer });
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
      const data = fs.readFileSync(filePath);
      const zip = new JSZip();
      const content = await zip.loadAsync(data);

      const slideFiles = Object.keys(content.files).filter((name) =>
        name.startsWith("ppt/slides/slide")
      );

      const allSlideTexts = [];
      for (let i = 0; i < slideFiles.length; i++) {
        const slideXml = await content.file(slideFiles[i]).async("text");
        const result = await xml2js.parseStringPromise(slideXml);
        const texts = [];

        const shapes = result["p:sld"]["p:cSld"][0]["p:spTree"][0]["p:sp"] || [];
        shapes.forEach((shape) => {
          const textContent = shape["p:txBody"]?.[0]?.["a:p"]
            ?.map((p) => p["a:r"]?.map((r) => r["a:t"]?.[0]).join(""))
            .join(" ");
          if (textContent) texts.push(textContent);
        });

        allSlideTexts.push(`Slide ${i + 1}: ${texts.join(" ")}`);
      }

      return allSlideTexts.join("\n");
    } catch (error) {
      console.error("Error extracting text from PPTX:", error);
      throw error;
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
# ppt-pdf-docs-parser

A powerful npm package for parsing text from PowerPoint, PDF, and Word documents. This tool seamlessly extracts text, making it easier to analyze, process, and integrate with your applications.

## Features

- Parse text from PPT, PDF, and DOCX files
- Easy-to-use API
- High performance and accuracy
- Supports multiple file formats
- Lightweight and fast

## Installation

Install the package via npm:

```bash
npm install ppt-pdf-docs-parser
```

## Usage

Here's how to use the package in your project:

```bash
import parser from 'ppt-pdf-docs-parser';

// Parse PPT file
parser.parsePPT('path/to/presentation.ppt').then((text) => {
    console.log(text);
});
```

# API

## parse(filePath)

- filePath: The path to the file (PPT, PDF, or DOCX) to be parsed.
- Returns: A promise that resolves to the extracted text.

# Examples

```bash
import parser from 'ppt-pdf-docs-parser';

// Example for parsing PPT
parser.parse('example.ppt').then((text) => {
    console.log('PPT Text:', text);
});

// Example for parsing PDF
parser.parse('example.pdf').then((text) => {
    console.log('PDF Text:', text);
});

// Example for parsing DOCX
parser.parse('example.docx').then((text) => {
    console.log('DOCX Text:', text);
});
```

# Contributing

We welcome contributions! Please read our contributing guidelines before getting started.

# Acknowledgements

Thank you to all the contributors and users for their support!

# Contributors

- Harsh Sharma

- Yash Mittal

- Rajat Bhati

// src/app/api/parse-cv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

// For PDF parsing
async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // Using pdf-parse (need to install: npm install pdf-parse)
    const pdf = require('pdf-parse');
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

// For DOCX parsing
async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    // Using mammoth (need to install: npm install mammoth)
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    let extractedText = '';

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      extractedText = await parsePDF(buffer);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    ) {
      extractedText = await parseDOCX(buffer);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF or DOCX' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: extractedText,
      fileName: file.name,
      fileType: fileType,
    });

  } catch (error) {
    console.error('Error parsing CV:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse CV file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

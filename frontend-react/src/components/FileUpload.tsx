import { Upload } from 'lucide-react';
import { useRef } from 'react';
// @ts-ignore
import mammoth from 'mammoth';
import Papa from 'papaparse';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
}

export default function FileUpload({ onTextExtracted }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let extractedText = '';

      if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        extractedText = await extractWordText(file);
      } else if (file.name.endsWith('.csv')) {
        extractedText = await extractCSVText(file);
      } else if (file.name.endsWith('.txt')) {
        extractedText = await extractTxtText(file);
      } else if (file.name.endsWith('.pdf')) {
        extractedText = await extractPDFText(file);
      } else {
        alert('Unsupported file format. Please use .docx, .csv, .txt, or .pdf files.');
        return;
      }

      onTextExtracted(extractedText);
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Failed to extract text from file.');
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const extractWordText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractCSVText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          const text = results.data
            .map((row: any) => {
              if (Array.isArray(row)) {
                return row.join(' ');
              }
              return Object.values(row).join(' ');
            })
            .join('\n');
          resolve(text);
        },
        error: (error: Error) => reject(error),
      });
    });
  };

  const extractTxtText = async (file: File): Promise<string> => {
    return await file.text();
  };

  const extractPDFText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Сортируем элементы по позиции (сверху вниз, слева направо)
      const items = textContent.items.sort((a: any, b: any) => {
        // Сначала сортируем по Y-координате (сверху вниз)
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 5) return yDiff > 0 ? 1 : -1;
        // Если на одной строке, сортируем по X-координате (слева направо)
        return a.transform[4] - b.transform[4];
      });

      let lastY = -1;
      let pageText = '';

      items.forEach((item: any, index: number) => {
        const currentY = item.transform[5];
        const text = item.str;

        // Если это новая строка (Y-координата изменилась значительно)
        if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
          pageText += '\n';
        } else if (index > 0 && !text.startsWith(' ') && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          // Добавляем пробел между словами на одной строке
          pageText += ' ';
        }

        pageText += text;
        lastY = currentY;
      });

      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.doc,.csv,.txt,.pdf"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
      >
        <Upload className="w-4 h-4" />
        Upload File
      </label>
    </div>
  );
}

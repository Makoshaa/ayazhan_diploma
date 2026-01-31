import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import type { PIIResult } from '../types';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  piiResults: PIIResult[];
}

export default function TextInput({ value, onChange, piiResults }: TextInputProps) {
  const editableRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const isUserTypingRef = useRef(false);

  // Обновление содержимого при изменении value или piiResults
  useEffect(() => {
    const editable = editableRef.current;
    if (!editable || isComposing) return;

    const currentText = editable.innerText;
    
    // Не обновляем, если пользователь печатает и текст совпадает
    if (isUserTypingRef.current && currentText === value) {
      isUserTypingRef.current = false;
      return;
    }

    // Сохраняем позицию курсора
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const cursorOffset = range ? getCursorOffset(editable, range) : null;

    // Обновляем содержимое
    updateContent(editable, value, piiResults);

    // Восстанавливаем позицию курсора
    if (cursorOffset !== null) {
      restoreCursorPosition(editable, cursorOffset);
    }
    
    isUserTypingRef.current = false;
  }, [value, piiResults, isComposing]);
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    isUserTypingRef.current = true;
    const text = e.currentTarget.innerText;
    onChange(text);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    
    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    
    // Перемещаем курсор в конец вставленного текста
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    
    const newText = editableRef.current?.innerText || '';
    onChange(newText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow overflow-hidden flex flex-col min-h-[500px]"
    >
      <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
        <h2 className="text-base font-semibold">Original Text</h2>
        {piiResults.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-primary-light text-primary px-3 py-1 rounded-full text-xs font-semibold"
          >
            Found: {piiResults.length}
          </motion.span>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div
          ref={editableRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          data-placeholder="Enter or paste text for analysis...

Example (EN):
My name is Maria Anders and my phone number is (206) 555-0100.

Example (RU):
Меня зовут Иван Петров, мой телефон +7 (999) 123-45-67."
          className="w-full h-full p-4 font-mono text-sm leading-relaxed focus:outline-none overflow-auto whitespace-pre-wrap break-words empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:whitespace-pre-wrap"
          suppressContentEditableWarning
        />
      </div>
    </motion.div>
  );
}

function getCursorOffset(element: HTMLElement, range: Range): number {
  const preRange = range.cloneRange();
  preRange.selectNodeContents(element);
  preRange.setEnd(range.endContainer, range.endOffset);
  return preRange.toString().length;
}

function restoreCursorPosition(element: HTMLElement, offset: number) {
  const selection = window.getSelection();
  if (!selection) return;

  let currentOffset = 0;
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const nodeLength = textNode.length;

    if (currentOffset + nodeLength >= offset) {
      const range = document.createRange();
      range.setStart(textNode, offset - currentOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    currentOffset += nodeLength;
  }

  // Если не нашли позицию, ставим в конец
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function updateContent(element: HTMLElement, text: string, piiResults: PIIResult[]) {
  element.innerHTML = '';

  if (!piiResults.length) {
    element.textContent = text;
    return;
  }

  // Сортируем и фильтруем перекрывающиеся результаты
  const sortedResults = [...piiResults].sort((a, b) => a.start - b.start);
  const filteredResults: PIIResult[] = [];

  sortedResults.forEach((current) => {
    const lastResult = filteredResults[filteredResults.length - 1];

    if (!lastResult || current.start >= lastResult.end) {
      filteredResults.push(current);
    } else if (current.end > lastResult.end) {
      const currentLength = current.end - current.start;
      const lastLength = lastResult.end - lastResult.start;

      if (currentLength > lastLength) {
        filteredResults[filteredResults.length - 1] = current;
      }
    }
  });

  let lastIndex = 0;

  filteredResults.forEach((item) => {
    // Добавляем текст до PII
    if (lastIndex < item.start) {
      element.appendChild(document.createTextNode(text.substring(lastIndex, item.start)));
    }

    // Добавляем подсвеченный PII
    const span = document.createElement('span');
    const className = getHighlightClass(item.entity_type);
    span.className = className;
    span.setAttribute('data-type', item.entity_type);
    span.textContent = text.substring(item.start, item.end);
    element.appendChild(span);

    lastIndex = item.end;
  });

  // Добавляем оставшийся текст
  if (lastIndex < text.length) {
    element.appendChild(document.createTextNode(text.substring(lastIndex)));
  }
}

function getHighlightClass(entityType: string): string {
  const baseClass = 'pii-highlight';
  const typeClass = {
    PERSON: 'pii-highlight-person',
    PHONE_NUMBER: 'pii-highlight-phone',
    EMAIL_ADDRESS: 'pii-highlight-email',
    LOCATION: 'pii-highlight-location',
    DATE_TIME: 'pii-highlight-date',
    IIN: 'pii-highlight-iin',
    BIN: 'pii-highlight-bin',
    ID_CARD: 'pii-highlight-id-card',
    SSN: 'pii-highlight-ssn',
    CREDIT_CARD: 'pii-highlight-credit-card',
  }[entityType] || 'pii-highlight-default';

  return clsx(baseClass, typeClass);
}

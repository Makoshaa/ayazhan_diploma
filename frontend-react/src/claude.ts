import Anthropic from '@anthropic-ai/sdk';
import type { PIIResult } from './types';

// Читаем ключ из переменных окружения Vite
const DEFAULT_CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || '';

export function getClaudeApiKey(): string {
  // Приоритет: 1) localStorage (Settings), 2) env переменная
  return localStorage.getItem('claudeApiKey') || DEFAULT_CLAUDE_API_KEY;
}

export function setClaudeApiKey(key: string) {
  localStorage.setItem('claudeApiKey', key);
}

export async function validatePIIWithClaude(
  text: string,
  piiResults: PIIResult[],
  language: 'en' | 'ru'
): Promise<PIIResult[]> {
  try {
    const apiKey = getClaudeApiKey();
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Для работы в браузере
    });
    
    console.log('Using Claude model: claude-sonnet-4-20250514');

    const languageName = language === 'en' ? 'English' : 'Russian';
    
    const prompt = `You are a PII (Personal Identifiable Information) detection expert specializing in Kazakhstan, Russian, and international data formats. Analyze the following ${languageName} text and validate the detected PII entities.

Text: "${text}"

Detected PII entities:
${piiResults.map((item, idx) => `${idx + 1}. Type: ${item.entity_type}, Text: "${text.substring(item.start, item.end)}", Position: ${item.start}-${item.end}, Confidence: ${(item.score * 100).toFixed(1)}%`).join('\n')}

IMPORTANT CONTEXT - Kazakhstan & Regional PII Formats:
1. ИИН (IIN/Individual Identification Number) - 12 digits (e.g., 900101300123)
   - Format: YYMMDDCXXXXX where C=century (1-6), X=sequence
   - Birth date encoded in first 6 digits
   
2. БИН (BIN/Business Identification Number) - 12 digits for organizations

3. Kazakhstan Phone Numbers:
   - Format: +7 7XX XXX XX XX or +7 (7XX) XXX-XX-XX
   - Mobile operators: 700-778 (Kcell, Activ, Beeline, Tele2)
   
4. Russian Phone Numbers:
   - Format: +7 XXX XXX XX XX or 8 XXX XXX XX XX
   - Different from Kazakhstan (starts with 9XX, not 7XX)

5. Kazakhstan ID Documents:
   - Удостоверение личности (ID card): N XXXXXXXX (N + 9 digits)
   - Passport numbers: N XXXXXXX or XXXXXXX (7-8 digits)

6. Names (Kazakh/Russian/International):
   - Kazakh names: Often ending with -ov/-ova, -ev/-eva, -uly/-kyzy
   - Russian names: Standard Slavic patronymics
   - Full name formats: Surname Name Patronymic

7. Kazakhstan Addresses:
   - Cities: Астана/Nur-Sultan, Алматы, Шымкент, Караганда, etc.
   - Street formats: ул./көше, пр./даңғылы, мкр./шағын аудан
   - Region codes: Oblast/Oblys names

Task:
1. Validate each detected PII entity - is it truly PII?
2. Pay SPECIAL ATTENTION to Kazakhstan-specific formats (ИИН, БИН, local phone numbers)
3. Identify any MISSED PII entities in the text that were not detected
4. For each entity, determine the exact character positions (start and end index)
5. Consider cultural context - Kazakh and Russian naming conventions

Return ONLY a valid JSON array in this exact format, no markdown, no explanations:
[
  {
    "start": <number>,
    "end": <number>,
    "entity_type": "<PERSON|PHONE_NUMBER|EMAIL_ADDRESS|LOCATION|DATE_TIME|CREDIT_CARD|SSN|IIN|BIN|ID_CARD|IP_ADDRESS>",
    "score": <0.0-1.0>,
    "validated": <true|false>
  }
]

Rules:
- Include ALL valid PII (both originally detected and newly found)
- Set "validated": true for confirmed PII, false for false positives
- Use entity types: PERSON, PHONE_NUMBER, EMAIL_ADDRESS, LOCATION, DATE_TIME, CREDIT_CARD, SSN (for non-KZ), IIN (for ИИН), BIN (for БИН), ID_CARD, IP_ADDRESS
- For ИИН/БИН, validate the 12-digit format and date logic
- Distinguish between Kazakhstan (+7 7XX) and Russian (+7 9XX) phone numbers
- Ensure start/end positions are accurate character indices
- Return empty array [] if no PII found`;

    console.log('Sending prompt to Claude...');
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    console.log('Claude raw response:', message);

    // Получаем текст ответа
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    console.log('Claude response text:', responseText);

    // Парсим ответ
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('Claude: Unable to parse response, using original results');
      console.warn('Response was:', responseText);
      return piiResults;
    }

    const claudeResults: Array<{
      start: number;
      end: number;
      entity_type: string;
      score: number;
      validated: boolean;
    }> = JSON.parse(jsonMatch[0]);

    // Фильтруем только валидированные результаты
    const validatedResults = claudeResults
      .filter(item => item.validated)
      .map(item => ({
        start: item.start,
        end: item.end,
        entity_type: item.entity_type,
        score: Math.max(item.score, 0.85), // Повышаем confidence для Claude-подтвержденных
      }));

    // Объединяем с оригинальными результатами (убираем дубликаты)
    const mergedResults = [...validatedResults];
    
    piiResults.forEach(original => {
      const isDuplicate = validatedResults.some(
        validated => 
          Math.abs(validated.start - original.start) <= 2 && 
          Math.abs(validated.end - original.end) <= 2
      );
      
      if (!isDuplicate) {
        // Проверяем, не был ли отмечен как false positive
        const isFalsePositive = claudeResults.some(
          claude => 
            Math.abs(claude.start - original.start) <= 2 && 
            Math.abs(claude.end - original.end) <= 2 &&
            !claude.validated
        );
        
        if (!isFalsePositive) {
          mergedResults.push(original);
        }
      }
    });

    // Сортируем по позиции
    return mergedResults.sort((a, b) => a.start - b.start);

  } catch (error: any) {
    console.error('Claude validation error:', error);
    
    if (error?.message) {
      console.error('Error message:', error.message);
    }
    
    if (error?.response) {
      console.error('Error response:', error.response);
    }
    
    // Показываем пользователю информативное сообщение
    const errorMsg = error?.message || 'Unknown error';
    
    let userMessage = 'Claude validation failed. ';
    
    if (errorMsg.includes('401') || errorMsg.includes('authentication')) {
      userMessage += 'Invalid API key. Please check your Claude API key in Settings.';
      console.error('Claude API Error: Invalid API key.');
    } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
      userMessage += 'Rate limit exceeded. Please try again later.';
      console.error('Claude API Error: Rate limit exceeded.');
    } else if (errorMsg.includes('overloaded') || errorMsg.includes('500')) {
      userMessage += 'Claude API is overloaded. Please try again in a moment.';
      console.error('Claude API Error: Service overloaded.');
    } else {
      userMessage += 'Please check your API key and internet connection.';
    }
    
    // Пробрасываем ошибку с понятным сообщением
    throw new Error(userMessage);
  }
}

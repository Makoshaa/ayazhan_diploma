import type { PIIResult, AnonymizeResponse, AnalyzeRequest, AnonymizeRequest } from './types';

const ANALYZER_URL = 'http://localhost:3000';
const ANONYMIZER_URL = 'http://localhost:3001';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function analyzeText(request: AnalyzeRequest): Promise<PIIResult[]> {
  const response = await fetch(`${ANALYZER_URL}/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Ошибка анализа: ${response.status}`);
  }

  const data = await response.json();
  return data.map((item: any) => ({
    start: item.start,
    end: item.end,
    score: item.score,
    entity_type: item.entity_type,
  }));
}

export async function anonymizeText(request: AnonymizeRequest): Promise<string> {
  const response = await fetch(`${ANONYMIZER_URL}/anonymize`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Ошибка обезличивания: ${response.status}`);
  }

  const data: AnonymizeResponse = await response.json();
  return data.text || '';
}

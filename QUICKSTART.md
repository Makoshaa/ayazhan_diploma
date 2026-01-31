# Presidio - Быстрый старт

## Установка (один раз)

```bash
# Установить зависимости
pip install presidio-analyzer presidio-anonymizer flask flask-cors

# Скачать языковые модели
python -m spacy download en_core_web_lg
python -m spacy download ru_core_news_lg
```

## Запуск проекта

### Вариант 1: Автоматический запуск (Windows)

Просто запустите файл:
```
start.bat
```

### Вариант 2: Ручной запуск

Откройте 3 терминала и выполните:

**Терминал 1 - Analyzer:**
```bash
cd presidio-analyzer
python app.py
```

**Терминал 2 - Anonymizer:**
```bash
cd presidio-anonymizer
python app.py
```

**Терминал 3 - Frontend (React):**
```bash
cd frontend-react
npm install     # первый раз
npm run dev     # запуск сервера разработки
```

Или для production build:
```bash
cd frontend-react
npm run build
# Затем откройте dist/index.html в браузере
```

## Использование

Откройте в браузере: **http://localhost:5173** (для dev сервера)

Или откройте: **frontend-react/dist/index.html** (для production build)

### Возможности:
- Анализ текста на английском (en) и русском (ru) языках
- Автоматическое определение персональных данных (PII)
- Обезличивание найденных данных
- **Загрузка файлов** (Word .docx, CSV, TXT)
- **🤖 Claude AI валидация** (встроено) - улучшенная точность с Claude 4 Sonnet
  - Специальная поддержка казахстанских данных (ИИН, БИН)
  - Находит пропущенные PII
  - Уменьшает ложные срабатывания
  - Самая точная AI модель на рынке

### 🤖 Claude AI Enhancement (Встроено!)

**Claude 4 Sonnet уже включен!** API ключ встроен в приложение.

Для использования:
1. Откройте Settings (⚙️) в приложении
2. Включите "Enable Claude AI Validation"
3. Готово! Claude автоматически улучшит детекцию PII

**Опционально:** Можете использовать свой API ключ от https://console.anthropic.com/

### API Endpoints:

**Analyzer** (http://localhost:3000):
- `GET /health` - проверка работоспособности
- `POST /analyze` - анализ текста

**Anonymizer** (http://localhost:3001):
- `GET /health` - проверка работоспособности
- `POST /anonymize` - обезличивание текста
- `POST /deanonymize` - деобезличивание текста

## Остановка сервисов

Нажмите `Ctrl+C` в каждом терминале или закройте окна терминалов.

## Используемые модели

- **en_core_web_lg** - Английская модель spaCy (400 MB)
- **ru_core_news_lg** - Русская модель spaCy (513 MB)

## Поддерживаемые типы PII

- PERSON - Имена людей
- PHONE_NUMBER - Телефоны
- EMAIL_ADDRESS - Email адреса
- CREDIT_CARD - Номера кредитных карт
- LOCATION - Географические локации
- DATE_TIME - Даты и время
- IP_ADDRESS - IP адреса
- IBAN_CODE - Банковские счета
- CRYPTO - Криптовалютные кошельки
- И многое другое...

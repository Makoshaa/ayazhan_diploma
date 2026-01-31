1. Установка зависимостей (один раз)
# Установить библиотеки Presidio
pip install presidio-analyzer presidio-anonymizer flask flask-cors

# Скачать языковые модели spaCy
python -m spacy download en_core_web_lg
python -m spacy download ru_core_news_lg

2. Запуск сервисов (каждый раз)
Терминал 1 - Analyzer (порт 3000):
cd presidio-analyzer
python app.py
Терминал 2 - Anonymizer (порт 3001):
cd presidio-anonymizer
python app.py
Терминал 3 - Frontend (порт 8080):
cd frontend-react
npm run dev


cd auth-service
..\.venv\Scripts\activate
python app.py

3. Открыть в браузере
http://localhost:8080


python -m venv .venv
.venv\Scripts\activate
python -m spacy download en_core_web_lg
python -m spacy download ru_core_news_lg
# Инструкция по установке проекта

## Требования
- Python 3.10-3.13 (у вас установлен Python 3.12.10 ✓)
- Node.js и npm (для frontend-react)

## Про папку .venv

**ОСТАВЬТЕ папку .venv** - это виртуальное окружение Python, которое изолирует зависимости проекта.
Если её удалить, вам придется создавать новую и переустанавливать все пакеты.

### Почему .venv нужен:
- Изолирует зависимости проекта от системных пакетов Python
- Позволяет использовать специфичные версии библиотек для этого проекта
- Не загрязняет глобальное окружение Python

## Установка - Шаг за шагом

### 1. Активация виртуального окружения

#### На Windows (cmd):
```cmd
.venv\Scripts\activate
```

#### На Windows (PowerShell):
```powershell
.venv\Scripts\Activate.ps1
```

После активации вы увидите `(.venv)` в начале командной строки.

### 2. Обновление pip (рекомендуется)
```cmd
python -m pip install --upgrade pip
```

### 3. Установка Python зависимостей
```cmd
pip install -r requirements.txt
```

### 4. Установка Spacy языковой модели
После установки пакетов, установите английскую языковую модель для spacy:
```cmd
python -m spacy download en_core_web_lg
```

### 5. Установка Presidio пакетов локально
Установите presidio-analyzer и presidio-anonymizer в режиме разработки:

```cmd
cd presidio-analyzer
pip install -e .
cd ..

cd presidio-anonymizer
pip install -e .
cd ..
```

Флаг `-e` (editable mode) позволяет редактировать код без переустановки пакета.

### 6. Установка зависимостей для Frontend

```cmd
cd frontend-react
npm install
cd ..
```

## Проверка установки

Проверьте, что все работает:

```cmd
python -c "import presidio_analyzer; import presidio_anonymizer; print('OK')"
```

Если видите "OK" - всё установлено правильно!

## Запуск проекта

### Вариант 1: Автоматический запуск (Windows)
```cmd
start.bat
```

### Вариант 2: Ручной запуск

1. **Запуск Analyzer** (терминал 1):
```cmd
.venv\Scripts\activate
cd presidio-analyzer
python app.py
```

2. **Запуск Anonymizer** (терминал 2):
```cmd
.venv\Scripts\activate
cd presidio-anonymizer
python app.py
```

3. **Запуск Frontend** (терминал 3):
```cmd
cd frontend-react
npm run dev
```

## URLs сервисов

- Analyzer: http://localhost:3000
- Anonymizer: http://localhost:3001
- Frontend: http://localhost:5173 (Vite dev server)

## Деактивация виртуального окружения

Когда закончите работу:
```cmd
deactivate
```

## Возможные проблемы

### Ошибка "spacy.cli not found"
Решение: Убедитесь что виртуальное окружение активировано перед установкой модели.

### Ошибка при установке cryptography на Windows
Решение: Установите Microsoft C++ Build Tools с https://visualstudio.microsoft.com/downloads/

### Port already in use
Решение: Закройте процессы, использующие порты 3000, 3001, или измените порты в переменных окружения.

## Дополнительные зависимости (опционально)

Если нужны дополнительные возможности, установите:

### Для transformers support:
```cmd
pip install transformers accelerate huggingface_hub spacy_huggingface_pipelines
```

### Для stanza support:
```cmd
pip install stanza>=1.10.1,<2.0.0
```

## Создание нового .venv (если удалили старый)

Если вы всё-таки удалили .venv, создайте новый:

```cmd
python -m venv .venv
.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
python -m spacy download en_core_web_lg
cd presidio-analyzer && pip install -e . && cd ..
cd presidio-anonymizer && pip install -e . && cd ..
cd frontend-react && npm install && cd ..
```

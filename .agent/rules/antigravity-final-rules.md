---
trigger: always_on
---

# Antigravity Agent Rules - Windows Development

You are working on a Windows system with a developer who values clean, scalable, and modular code.

---

## 🔴 CRITICAL RULES - НИКОГДА НЕ НАРУШАЙ

### 1. SCOPE PROTECTION (Защита существующего кода)
* **ТОЛЬКО изменяй файлы которые пользователь явно попросил изменить**
* **НЕ трогай** другие файлы без явного согласия
* **НЕ рефакторь** код вне scope задачи
* **НЕ оптимизируй** без просьбы
* Перед КАЖДЫМ изменением: спроси подтверждение и перечисли ВСЕ файлы которые будут затронуты

### 2. ОБЯЗАТЕЛЬНОЕ ПОДТВЕРЖДЕНИЕ
* Перед изменением файла: покажи diff/preview и получи "да"
* Перед созданием файла: покажи структуру и содержимое
* Перед execute_command: покажи какая команда будет выполнена
* При сомнениях: спрашивай явно

### 3. СПОСОБ КОММУНИКАЦИИ
* Будь прямым и to-the-point
* **НЕ начинай** с "Great", "Certainly", "Okay", "Sure"
* Делай информативный анализ перед действиями
* Указывай на проблемы/ошибки прямо

### 4. ПРЕДЛОЖЕНИЯ УЛУЧШЕНИЙ
* Предлагай улучшения ТОЛЬКО если видишь проблему
* Спроси перед внесением изменений
* **НЕ выполняй** без получения "да"

---

## 📋 WORKFLOW ПРОЦЕСС

### ПЕРЕД изменениями:
1. **Analyze Scope**: Какие файлы затрагивает задача?
2. **Impact Assessment**: Какой код зависит от этих файлов?
3. **Ask Confirmation**: Перечисли ВСЕ файлы которые будут изменены
4. **Wait for Approval**: Обязательно дожди "окей"

### ВО ВРЕМЯ выполнения:
1. **Read First**: Всегда читай файл перед изменением
2. **Show Diff**: Покажи что меняется
3. **One Task at a Time**: Одно изменение за раз
4. **Wait for Result**: Жди результата перед следующим шагом

### ПОСЛЕ выполнения:
1. **Confirm Success**: Убедись что всё работает
2. **Show Output**: Покажи полный вывод
3. **Ask for Feedback**: "Все работает как надо?"

---

## 📏 FILE SIZE MANAGEMENT (Размеры файлов)

### ⚠️ РЕКОМЕНДУЕМЫЕ ОГРАНИЧЕНИЯ

| Тип файла | Комфортный размер | Жёлтая зона | Действие |
|-----------|-------------------|-------------|----------|
| **React Компонент** | 150–300 строк | 300–500 строк | Можно, но следи за сложностью |
| **Кастомный хук** | 40–120 строк | 120–200 строк | Предложи вынести логику |
| **Утилита** | 80–250 строк | 250–400 строк | Разбивать по функциям |
| **Service/API** | 150–350 строк | 350–500 строк | Делить по ресурсам |
| **Types** | 50–200 строк | 200–350 строк | Разнести по доменам |

### Принцип гибкости:

* **До ~400 строк** для компонента — нормально.
* **400–500 строк** — допустимо, можно предложить разбиение.
* **Больше 500 строк** — спроси: «Хочешь, предложу как разбить, или оставляем так?»
* **700–800 строк** — исключительный случай, только если ты согласишься.

---

## 🏗️ ОБЯЗАТЕЛЬНАЯ СТРУКТУРА ПРОЕКТА

### ❌ НЕПРАВИЛЬНО:
```
src/
├── components/
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── ...500 компонентов...
├── utils.ts          (500+ функций)
├── hooks.ts          (все хуки)
└── types.ts          (все типы)
```

### ✅ ПРАВИЛЬНО (Feature-Based):
```
src/
├── features/
│   ├── auth/
│   │   ├── components/LoginForm/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.types.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── types.ts
│   │   └── index.ts       # PUBLIC API
│   ├── products/
│   └── cart/
│
├── shared/
│   ├── components/
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useFetch.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── api.ts
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── common.ts
│   │   ├── api.ts
│   │   └── index.ts
│   └── styles/
│
├── core/
│   ├── api/
│   ├── auth/
│   └── config/
│
└── app/
    ├── App.tsx
    └── Layout.tsx
```

### KEY ПРАВИЛА:
* **1 компонент = 1 папка** (если >50 строк)
* **Barrel exports** (index.ts) для импортов
* **Path aliases** (@/shared, @/features)
* **Максимум 2–3 уровня вложенности**

**Пример правильного импорта:**
```typescript
// ✅ Хорошо
import { Button, Modal } from '@/shared/components';
import { LoginForm } from '@/features/auth';

// ❌ Плохо
import Button from '@/shared/components/Button/Button.tsx';
```

---

## 🚫 ЗАВИСИМОСТИ И ЦИКЛИЧЕСКИЕ ИМПОРТЫ

### ❌ ЗАПРЕЩЕНО - Циклические импорты:
```
components → hooks → services → components (ЦИКЛ!)
```

### ✅ ПРАВИЛЬНО - Однонаправленная зависимость:
```
Components → Hooks → Services → Utils → Types
```

---

## 🔧 DRY ПРИНЦИП - Не копируй код!

### ❌ ПЛОХО:
```typescript
// Button.tsx
const isDisabled = !email || !password;

// LoginForm.tsx
const isDisabled = !email || !password;

// RegisterForm.tsx
const isDisabled = !email || !password;
```

### ✅ ХОРОШО:
```typescript
// shared/utils/validators.ts
export const isFormValid = (email: string, password: string) => {
  return email.length > 0 && password.length >= 8;
};

// Везде используй:
import { isFormValid } from '@/shared/utils';
const isDisabled = !isFormValid(email, password);
```

---

## 💬 COMMENTS И ДОКУМЕНТАЦИЯ

**Пиши комментарии только для complex логики:**
```typescript
// ✅ Хорошо - complex logic
const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff

// ✅ Хорошо - JSDoc
/**
 * Валидирует email
 * @param email - email для проверки
 * @returns объект с isValid и error
 */
export const validateEmail = (email: string) => { /* ... */ };

// ❌ Плохо - очевидное
// увеличиваем счетчик
setCount(count + 1);
```

---

## ⚠️ ERROR HANDLING

### При ошибках:
* Показывай ПОЛНЫЙ output
* Объясни что произошло (анализируй)
* Предложи КОНКРЕТНОЕ решение
* Спроси подтверждение перед исправлением
* Максимум 3 попытки

### Типичные Windows ошибки:
* `is not recognized` → Установи инструмент
* `Access denied` → Нужны права администратора
* `Cannot find path` → Проверь пути
* `ENOENT` → Файл/папка не существует

---

## 🛡️ SECURITY CONSTRAINTS

### НИКОГДА:
* **НЕ выполняй** destructive команды без подтверждения (rm -rf, del)
* **НЕ используй** hardcoded credentials
* **НЕ выключай** security проверки

### ВСЕГДА:
* Валидируй пользовательский input
* Используй environment variables для secrets
* Проверяй типы (TypeScript strict mode)

**Пример .env:**
```
API_KEY=your_secret
DATABASE_URL=postgresql://localhost/db
NODE_ENV=development
```

---

## 🐍 DEVELOPMENT ENVIRONMENTS

### Node.js на Windows
```bash
node --version
npm install
npm run dev
npm run build
```

### Python на Windows
```bash
python -m venv venv
venv\Scripts\activate        # CMD
venv\Scripts\Activate.ps1    # PowerShell
pip install -r requirements.txt
```

### Git на Windows
```bash
git config core.autocrlf true
# .gitignore: node_modules/, venv/, dist/, .env
```

---

## 💻 WINDOWS-SPECIFIC BEST PRACTICES

### Path Handling:
* ✅ Используй forward slashes: `./data/file.json`
* ✅ Используй `path.join()` в Node.js
* ❌ Избегай: `C:\\Users\\...`

### Terminal Commands:
* **PowerShell**: `Get-ChildItem`, `Stop-Process -Name node`
* **CMD**: `dir /B`, `taskkill /IM node.exe /F`
* **Cross-platform**: `npm scripts`, `npx`, `cross-env`

---

## 📝 FINAL CHECKLIST

**ПЕРЕД КАЖДЫМ ДЕЙСТВИЕМ:**
- [ ] Это файлы которые попросил пользователь?
- [ ] Я показал diff/preview?
- [ ] Я получил подтверждение?
- [ ] Я не сломаю другой код?
- [ ] Файлы в правильной структуре?
- [ ] Размеры файлов приемлемы?
- [ ] Я показал полный output?

---

## 🎯 FINAL SUMMARY

### ✅ ВСЕГДА ДЕЛАЮ:
- Жду подтверждения перед изменением
- Показываю diff/preview
- Защищаю существующий код
- Создаю масштабируемую архитектуру
- Слежу за размерами файлов (компоненты до 300–400 строк OK, после 500 спрашиваю)
- Использую feature-based структуру
- Применяю DRY принцип
- Использую barrel exports и path aliases
- Пишу JSDoc для публичных функций

### ❌ НИКОГДА:
- Не меняю файлы без просьбы
- Не рефакторю чужой код
- Не добавляю фичи без запроса
- Не начинаю с "Great", "Okay", "Sure"
- Не выполняю опасные команды без подтверждения
- Не копирую код (DRY!)
- Не создаю циклические импорты
- Не делаю deep imports
- Не игнорирую безопасность

**ПОМНИ: Лучший код — это код который другой разработчик может прочитать и понять за 5 минут!**

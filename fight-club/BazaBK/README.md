# BazaBK

Рабочая структура для локальной базы Battle Kings.

## Папки
- `raw/library_dump/` — исходный сохраненный дамп без правок.
- `pages/index/` — главная библиотечная HTML-страница.
- `pages/weapons/` — нормализованные HTML-страницы оружия.
- `pages/armor/` — нормализованные HTML-страницы брони и экипировки.
- `images/items/` — картинки предметов, разложенные по категориям.
- `images/ui/` — фоновые, рамочные и служебные изображения из дампа.

## Нейминг
- Страницы: lowercase + snake_case, например `weapons_swords.html`
- Картинки предметов: пока сохранены с исходными именами внутри своей категории, чтобы не потерять связь с HTML.
- Служебные картинки: вынесены отдельно в `images/ui/`

## Текущее покрытие
HTML-страницы:
- weapons: axes, blunts, knives, swords
- armor: boots, bracers, gloves, helms, legs, belts
- index: library_index

Картинки предметов:
- `images/items/gloves/` из `gloves*.gif`
- `images/items/bracers/` из `naruchi*.gif`

Следующий шаг:
1. прогнать `npm run baza:parse`
2. проверить `parsed/catalog.json` и `parsed/summary.json`
3. сопоставить item-строки и иконки
4. импортировать данные в runtime-пул предметов

## Парсер
- Команда: `npm run baza:parse`
- Скрипт: `scripts/parse-bazakbk-pages.mjs`
- Результат:
  - `parsed/catalog.json` — общий каталог
  - `parsed/summary.json` — сводка по категориям
  - `parsed/categories/*.json` — отдельные JSON по страницам

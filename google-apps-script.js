// ============================================================
// Google Apps Script для сайта прогнозов малыша
// ============================================================
// Как установить:
// 1. Открой Google Таблицу (создай новую)
// 2. Меню: Расширения → Apps Script
// 3. Вставь весь этот код вместо существующего
// 4. Нажми «Сохранить» (Ctrl+S)
// 5. Нажми «Развернуть» → «Новое развёртывание»
//    - Тип: Веб-приложение
//    - Выполнять как: Я (your account)
//    - Кто имеет доступ: Все
// 6. Скопируй полученный URL и вставь в:
//    - predict.html: строка  const SCRIPT_URL = 'ВОТ_СЮДА'
//    - results.html: при первом открытии страница попросит URL
// ============================================================

const SHEET_NAME = 'Прогнозы';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Имя', 'Email', 'Пол', 'Имя малыша',
      'Дата рождения', 'Время рождения',
      'Вес (г)', 'Рост (см)',
      'Цвет глаз', 'Цвет волос', 'Кол-во волос', 'Похож на',
      'Пожелание', 'Отправлено'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    sheet.appendRow([
      data.name || '',
      data.email || '',
      data.gender || '',
      data.babyName || '',
      data.birthDate || '',
      data.birthTime || '',
      data.weight || '',
      data.height || '',
      data.eyes || '',
      data.hairColor || '',
      data.hairAmount || '',
      data.looksLike || '',
      data.wish || '',
      data.submittedAt || new Date().toISOString(),
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (e.parameter.action === 'get') {
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const keyMap = {
      'Имя': 'name', 'Email': 'email', 'Пол': 'gender',
      'Имя малыша': 'babyName', 'Дата рождения': 'birthDate',
      'Время рождения': 'birthTime', 'Вес (г)': 'weight',
      'Рост (см)': 'height', 'Цвет глаз': 'eyes',
      'Цвет волос': 'hairColor', 'Кол-во волос': 'hairAmount',
      'Похож на': 'looksLike', 'Пожелание': 'wish',
      'Отправлено': 'submittedAt'
    };
    const tz = Session.getScriptTimeZone();
    const predictions = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const key = keyMap[h];
        if (!key) return;
        const val = row[i];
        if (val instanceof Date) {
          if (h === 'Дата рождения') {
            obj[key] = Utilities.formatDate(val, tz, 'yyyy-MM-dd');
          } else if (h === 'Время рождения') {
            obj[key] = Utilities.formatDate(val, tz, 'HH:mm');
          } else {
            obj[key] = val.toISOString();
          }
        } else {
          obj[key] = val;
        }
      });
      return obj;
    }).filter(p => p.name);

    return ContentService
      .createTextOutput(JSON.stringify({ predictions }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput('Baby predictions script is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}

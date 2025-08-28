// scripts/validate-translations.js
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../client/src/locales');
const LANGUAGES = ['en', 'uk', 'ru'];
const NAMESPACES = ['common', 'navigation', 'orders', 'products', 'users'];

// Функция для рекурсивного получения всех ключей из объекта
function getAllKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

// Функция для проверки интерполяционных переменных
function extractVariables(text) {
  if (typeof text !== 'string') return [];
  const matches = text.match(/\{\{(\w+)\}\}/g);
  return matches ? matches.map(match => match.slice(2, -2)) : [];
}

// Основная функция валидации
function validateTranslations() {
  console.log('🔍 Validating translations...\n');
  
  const issues = [];
  const translationData = {};
  
  // Загружаем все переводы
  LANGUAGES.forEach(lang => {
    translationData[lang] = {};
    NAMESPACES.forEach(ns => {
      const filePath = path.join(LOCALES_DIR, lang, `${ns}.json`);
      
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          translationData[lang][ns] = JSON.parse(content);
        } catch (error) {
          issues.push({
            type: 'PARSE_ERROR',
            language: lang,
            namespace: ns,
            message: `Failed to parse JSON: ${error.message}`
          });
        }
      } else {
        issues.push({
          type: 'MISSING_FILE',
          language: lang,
          namespace: ns,
          message: `Translation file not found: ${filePath}`
        });
      }
    });
  });
  
  // Проверяем консистентность ключей между языками
  const baseLanguage = 'en';
  NAMESPACES.forEach(ns => {
    if (!translationData[baseLanguage][ns]) return;
    
    const baseKeys = new Set(getAllKeys(translationData[baseLanguage][ns]));
    
    LANGUAGES.forEach(lang => {
      if (lang === baseLanguage || !translationData[lang][ns]) return;
      
      const langKeys = new Set(getAllKeys(translationData[lang][ns]));
      
      // Проверяем отсутствующие ключи
      baseKeys.forEach(key => {
        if (!langKeys.has(key)) {
          issues.push({
            type: 'MISSING_KEY',
            language: lang,
            namespace: ns,
            key,
            message: `Key "${key}" exists in ${baseLanguage} but missing in ${lang}`
          });
        }
      });
      
      // Проверяем лишние ключи
      langKeys.forEach(key => {
        if (!baseKeys.has(key)) {
          issues.push({
            type: 'EXTRA_KEY',
            language: lang,
            namespace: ns,
            key,
            message: `Key "${key}" exists in ${lang} but missing in ${baseLanguage}`
          });
        }
      });
    });
  });
  
  // Проверяем интерполяционные переменные
  NAMESPACES.forEach(ns => {
    const baseTranslation = translationData[baseLanguage]?.[ns];
    if (!baseTranslation) return;
    
    const baseKeys = getAllKeys(baseTranslation);
    
    baseKeys.forEach(key => {
      const baseValue = getNestedValue(baseTranslation, key);
      const baseVars = extractVariables(baseValue);
      
      if (baseVars.length === 0) return;
      
      LANGUAGES.forEach(lang => {
        if (lang === baseLanguage || !translationData[lang][ns]) return;
        
        const langValue = getNestedValue(translationData[lang][ns], key);
        const langVars = extractVariables(langValue);
        
        // Проверяем, что все переменные присутствуют
        baseVars.forEach(variable => {
          if (!langVars.includes(variable)) {
            issues.push({
              type: 'MISSING_VARIABLE',
              language: lang,
              namespace: ns,
              key,
              variable,
              message: `Variable "{{${variable}}}" missing in ${lang} translation`
            });
          }
        });
        
        // Проверяем лишние переменные
        langVars.forEach(variable => {
          if (!baseVars.includes(variable)) {
            issues.push({
              type: 'EXTRA_VARIABLE',
              language: lang,
              namespace: ns,
              key,
              variable,
              message: `Extra variable "{{${variable}}}" in ${lang} translation`
            });
          }
        });
      });
    });
  });
  
  // Проверяем пустые значения
  LANGUAGES.forEach(lang => {
    NAMESPACES.forEach(ns => {
      const translation = translationData[lang]?.[ns];
      if (!translation) return;
      
      const keys = getAllKeys(translation);
      keys.forEach(key => {
        const value = getNestedValue(translation, key);
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          issues.push({
            type: 'EMPTY_VALUE',
            language: lang,
            namespace: ns,
            key,
            message: `Empty or missing value for key "${key}"`
          });
        }
      });
    });
  });
  
  // Выводим результаты
  console.log('📊 Validation Results:\n');
  
  if (issues.length === 0) {
    console.log('✅ All translations are valid!');
    return true;
  }
  
  // Группируем проблемы по типам
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.type]) acc[issue.type] = [];
    acc[issue.type].push(issue);
    return acc;
  }, {});
  
  Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
    console.log(`\n❌ ${type} (${typeIssues.length} issues):`);
    typeIssues.forEach(issue => {
      console.log(`   ${issue.language}/${issue.namespace}: ${issue.message}`);
    });
  });
  
  console.log(`\n📈 Summary: Found ${issues.length} issues`);
  
  // Создаем отчет
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: issues.length,
    issuesByType: Object.entries(groupedIssues).map(([type, typeIssues]) => ({
      type,
      count: typeIssues.length,
      issues: typeIssues
    })),
    languages: LANGUAGES,
    namespaces: NAMESPACES
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../translation-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Detailed report saved to translation-report.json');
  
  return issues.length === 0;
}

// Вспомогательная функция для получения вложенного значения
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Запускаем валидацию
if (require.main === module) {
  const isValid = validateTranslations();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateTranslations };
// Merge 127 neonatal drugs from monographs.json into pediatric-dosing.json
// (K3 calculator). Извлекаем mg/kg patterns из dose text каждого
// препарата; где не парсится — добавляем drug с indications-as-comment
// (рассчитать нельзя, но видно справочно).

import fs from 'node:fs';

const monographsPath = './public/neonatal-monographs.json';
const pediatricPath = './public/pediatric-dosing.json';
const dPediatricPath = './data/pediatric-dosing.json';

const monographs = JSON.parse(fs.readFileSync(monographsPath, 'utf8'));
const pediatric = JSON.parse(fs.readFileSync(pediatricPath, 'utf8'));

const existingIds = new Set(pediatric.drugs.map((d) => d.id));

// Парсим dose pattern: "X mg/kg/dose q Y hrs; max Z mg/kg/day"
function parseIndications(drug) {
  const dose = drug.dose || drug.fullText || '';
  const indications = [];

  // Pattern для main dose: 5-10 mg/kg/dose q 6-8 hrs (или похожие варианты)
  const doseRe = /(\d+(?:\.\d+)?)\s*(?:-\s*\d+(?:\.\d+)?)?\s*(mg|mcg|microgram|units|U)\/kg(?:\/dose)?(?:\s*q\s*(\d+)(?:\s*-\s*\d+)?\s*(hr|hour))?/gi;
  const matches = [...dose.matchAll(doseRe)];

  if (matches.length === 0) return [];

  // Берём первое clean матч
  const m = matches[0];
  const mgPerKg = parseFloat(m[1]);
  const unit = (m[2] || 'mg').toLowerCase();
  const freqHours = m[3] ? parseInt(m[3]) : 24;

  // Конвертация: mcg → mg
  const mgPerKgFinal = (unit === 'mcg' || unit === 'microgram') ? mgPerKg / 1000 : mgPerKg;

  // Max dose: ищем "max X mg" или "max X mg/kg/day"
  const maxRe = /max(?:imum)?[.:]?\s*(\d+(?:\.\d+)?)\s*(mg|mcg)\b/i;
  const maxDailyRe = /max(?:imum)?[.:]?\s*(\d+(?:\.\d+)?)\s*mg\/kg\/day/i;
  const maxM = dose.match(maxRe);
  const maxDailyM = dose.match(maxDailyRe);

  // Route — короткий extract из 'PO', 'IV', 'IM' и т.д.
  const route = drug.route || (dose.match(/\b(PO|IV|IM|PR|SC|Inh|Inhalation|SL|ET)\b/g) || []).join('/') || '';

  indications.push({
    label: drug.indications || `${drug.name_ru} — стандартная доза`,
    age_min_months: 0,
    age_max_months: 1,
    mg_per_kg: mgPerKgFinal,
    frequency_hours: freqHours,
    max_per_dose_mg: maxM ? parseFloat(maxM[1]) : 0,
    max_per_day_mg_per_kg: maxDailyM ? parseFloat(maxDailyM[1]) : 0,
    max_per_day_mg: 0,
    route,
    comment: dose.slice(0, 800),
  });
  return indications;
}

let added = 0, parsed = 0, monographOnly = 0;

for (const m of monographs.drugs) {
  // Skip если уже есть в pediatric (например paracetamol)
  if (existingIds.has(m.id)) continue;

  const indications = parseIndications(m);

  if (indications.length === 0) {
    // Fallback: monograph-only entry без рассчитываемых indications
    pediatric.drugs.push({
      id: m.id,
      name_ru: m.name_ru,
      name_en: m.name_en,
      atc: '',
      class_ru: 'Неонатологический справочник',
      indications: [{
        label: 'Справочно (доза не рассчитывается)',
        age_min_months: 0,
        age_max_months: 1,
        mg_per_kg: 0,
        frequency_hours: 0,
        max_per_dose_mg: 0,
        max_per_day_mg_per_kg: 0,
        max_per_day_mg: 0,
        route: m.route || '',
        comment: (m.dose || m.fullText || '').slice(0, 800),
      }],
      population: 'neonatal',
    });
    monographOnly++;
  } else {
    pediatric.drugs.push({
      id: m.id,
      name_ru: m.name_ru,
      name_en: m.name_en,
      atc: '',
      class_ru: 'Неонатология',
      indications,
      population: 'neonatal',
    });
    parsed++;
  }
  added++;
}

pediatric.version = '1.2.0';
pediatric.lastUpdated = '2026-05-07';
if (!pediatric.sources.includes('Neonatal Dosage and Practical Guidelines Handbook 2nd Ed. (Saudi Arabia, 2016)')) {
  pediatric.sources.push('Neonatal Dosage and Practical Guidelines Handbook 2nd Ed. (Saudi Arabia, 2016)');
}

fs.writeFileSync(pediatricPath, JSON.stringify(pediatric, null, 2));
fs.writeFileSync(dPediatricPath, JSON.stringify(pediatric, null, 2));

console.log(`\n=== RESULT ===`);
console.log(`Added: ${added} neonatal drugs`);
console.log(`  with structured dose (calculable): ${parsed}`);
console.log(`  monograph-only (view only): ${monographOnly}`);
console.log(`Total in pediatric-dosing: ${pediatric.drugs.length}`);

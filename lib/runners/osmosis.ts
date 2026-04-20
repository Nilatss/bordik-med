// @ts-nocheck
/** Runner: osmosis — Osmosis.org medical video library */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США / Международный (Osmosis by Elsevier)',
  reference: 'Osmosis.org (by Elsevier). https://www.osmosis.org/ (> 2000 мед анимаций; используется в 400+ мед школах мира)',
  inputs: [
    {
      id: 'category',
      label: 'Категория контента',
      type: 'select',
      options: [
        { value: 'path', label: 'Патофизиология (Diseases A-Z)' },
        { value: 'pharm', label: 'Фармакология' },
        { value: 'anat', label: 'Анатомия' },
        { value: 'physio', label: 'Физиология' },
        { value: 'clinical', label: 'Клинические навыки / физикальное обследование' },
        { value: 'usmle', label: 'USMLE Step 1/2 подготовка' },
        { value: 'nursing', label: 'Nursing content' },
        { value: 'patient', label: 'Patient education (для пациентов)' },
      ],
    },
  ],
  presets: [
    { label: 'Патофизиология', values: { category: 'path' } },
    { label: 'Фармакология', values: { category: 'pharm' } },
    { label: 'USMLE', values: { category: 'usmle' } },
  ],
  compute: (v) => {
    const c = String(v.category || 'path');
    const map: Record<string, { title: string; count: string; format: string; tip: string }> = {
      path: { title: 'Патофизиология (Diseases A-Z)', count: '~900 disease videos', format: 'Каждое видео: Causes → Pathophys → Sx → Dx → Tx, 6-12 минут, whiteboard animation', tip: 'Структура videos параллельна клиническому мышлению — идеально для блоков по органам (CV, pulm, renal)' },
      pharm: { title: 'Фармакология', count: '~400 drug videos', format: 'По классам (β-blockers, ACEi, statins, etc.) + MoA + SE + indications + contraindications', tip: 'Лучший раздел для visual learners — механизмы показаны в 3D анимации' },
      anat: { title: 'Анатомия', count: '~300 anatomy videos', format: 'Regional + surface anatomy + clinical correlations', tip: 'Дополнение к Netter/Complete Anatomy — короче, но с clinical anchors' },
      physio: { title: 'Физиология', count: '~250 physiology videos', format: 'По системам (CV, pulm, GI, renal, endo) — на уровне USMLE Step 1', tip: 'Отлично для понимания механизмов перед патологией' },
      clinical: { title: 'Clinical skills / физикальное обследование', count: '~150 skill videos', format: 'Демонстрация с инструктажем (percussion, auscultation, neurological exam steps)', tip: 'Используется в OSCE preparation — showcase "правильной" техники' },
      usmle: { title: 'USMLE подготовка', count: 'Структурированная программа + Qbank', format: 'Osmosis Prime: видео по темам Step 1/2 + flashcards (SRS) + practice questions', tip: 'Комбинировать с First Aid USMLE + UWorld Qbank для максимальной эффективности' },
      nursing: { title: 'Nursing content', count: '~400 nursing videos', format: 'NCLEX-RN aligned: med-surg, pharmacology, pathology на уровне nursing', tip: 'Включает care plans, drug classes для nurses, pediatric + OB focus' },
      patient: { title: 'Patient education', count: '~200 patient videos', format: '2-4 минуты, простой язык, translated в 15+ языков', tip: 'Хорошо использовать в приёме врача — направить пациента смотреть дома' },
    };
    const e = map[c];
    return {
      value: e.title,
      unit: 'Osmosis',
      color: '#6B7280',
      interpretation: `Osmosis: ${e.title}`,
      details: `**Категория:** ${e.title}\n\n**Объём:** ${e.count}\n\n**Формат:** ${e.format}\n\n**Совет:** ${e.tip}\n\n**Osmosis learning methodology:**\n1. **Whiteboard-style animation** — упрощает сложные концепции\n2. **Spaced repetition** — flashcards с SRS алгоритмом (как Anki)\n3. **Practice questions** — USMLE/NCLEX-style с explanations\n4. **Notes** — структурированные конспекты к видео\n5. **Study groups** — peer learning features\n6. **Progress tracking** — адаптивные рекомендации\n\n**Partnership с Elsevier (2021):**\nOsmosis теперь часть Elsevier Learning — даёт доступ к Elsevier учебникам + ClinicalKey Student при подписке.`,
      actions: [
        'Открыть https://www.osmosis.org/ (бесплатные видео на YouTube — osmosisfromelsevier channel)',
        'Мобильное приложение Osmosis (iOS/Android) — offline download',
        'Osmosis Prime (подписка) — полный каталог + Qbank + flashcards',
        'Institutional access — во многих мед школах и больницах (проверить через библиотеку)',
        'YouTube: ~500 бесплатных видео на канале — хороший старт',
        'Osmosis for Patients (osmosis.org/patient-education) — контент для пациентов бесплатно',
      ],
      caveats: [
        'Большая часть контента — subscription (~$30-100/мес или через институт)',
        'Основной язык — English; subtitle 15+ языков; dubbed — ограниченно',
        'Контент ориентирован на USMLE/NCLEX — может не полностью соответствовать рос. программе',
        'Медицинская точность хорошая, но для clinical decisions — использовать UpToDate/guidelines',
        'Elsevier acquisition: некоторые ранее-бесплатные функции перешли в paid',
      ],
      related: [
        { id: 'amboss', title: 'Amboss (USMLE prep)' },
        { id: 'complete-anatomy', title: 'Complete Anatomy' },
        { id: 'netter', title: 'Netter\'s Atlas' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**Osmosis.org** (by Elsevier) — видеобиблиотека для медицинского образования. > 2000 анимированных видео по патофизиологии, фармакологии, анатомии, физиологии. Используется в 400+ медицинских школах мира. Основано в 2011 г. в Johns Hopkins, в 2021 г. куплено Elsevier.

### Ключевые функции
- **Whiteboard animations** — 6-12 минутные видео с hand-drawn стилем
- **Spaced repetition flashcards** — как Anki, интегрированы с видео
- **Practice questions** — USMLE Step 1/2/NCLEX-style
- **Notes** — структурированные конспекты
- **Progress tracking** — адаптивные рекомендации

### Каталог
- **Diseases A-Z** (~900 видео) — патофизиология по болезням
- **Pharmacology** (~400) — по классам препаратов
- **Anatomy** (~300)
- **Physiology** (~250)
- **Clinical skills** (~150) — демонстрации
- **USMLE Prep** — структурированная программа
- **Nursing** (~400) — NCLEX aligned
- **Patient education** (~200) — для пациентов

### Доступ
- **Free** — ~500 видео на YouTube (osmosisfromelsevier)
- **Osmosis Prime** — подписка ~$30-100/мес, полный каталог
- **Institutional** — через мед школу или больничную библиотеку
- **Patient Education** — бесплатно для всех

### Partnership с Elsevier
С 2021 Osmosis часть Elsevier Learning экосистемы — интеграция с ClinicalKey Student, Elsevier учебниками.`,
};
export default runner;

/**
 * Runner: neo-caffeine-dose — Кофеин цитрат для AOP (Apnea of Prematurity)
 *
 * NEONATOLOGY MODULE — neo Drug DB foundation.
 *
 * Расчёт дозы кофеина цитрата (caffeine citrate) для лечения апноэ
 * недоношенных. Стандарт ухода у GA < 32 нед (Schmidt CAP trial, NEJM 2007).
 *
 * Дозы (Caffeine Citrate, эквивалентно × 0.5 caffeine base):
 *   - Loading: 20 мг/кг IV в течение 30 мин ИЛИ PO (caffeine citrate)
 *   - Maintenance: 5-10 мг/кг q24h (стандартно 5-8; до 10 при breakthrough apnea)
 *   - High-dose protocol: loading 40 мг/кг, maintenance до 20 мг/кг q24h
 *
 * Старт: первые 24-72 ч жизни у GA < 32 нед или при apnea episodes
 * Прекращение: после 33-36 нед PMA если нет epdoзов > 5-7 дней
 *
 * Caffeine vs Theophylline:
 *   - Кофеин предпочтительнее: longer half-life (60-100 ч), меньше side effects
 *   - 1 мг кофеина цитрата = 0.5 мг кофеина base
 *
 * SOURCES:
 *   - Schmidt B et al. NEJM 2007;357:1893 (CAP trial)
 *   - Schmidt B et al. NEJM 2012;366:1893 (CAP follow-up)
 *   - AAP CFN Caffeine for AOP 2016
 *   - КР МЗ РФ "Апноэ недоношенных" (2024)
 *   - NeoFax / Neonatal Formulary 9th ed (Ainsworth)
 *   - Cochrane Caffeine for apnea of prematurity 2010
 *
 * Caffeine therapeutic level: 5-25 мкг/мл; toxicity > 40 мкг/мл
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (CAP NEJM 2007 / AAP / NeoFax) · РФ',
  reference: 'Schmidt B CAP trial NEJM 2007;357:1893. AAP CFN 2016. КР МЗ РФ "Апноэ недоношенных".',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.4,
      max: 5,
      step: 0.01,
    },
    {
      id: 'phase',
      label: 'Фаза терапии',
      type: 'select',
      options: [
        { value: 'load_standard', label: 'Loading standard (20 мг/кг)' },
        { value: 'load_high', label: 'Loading high-dose (40 мг/кг)' },
        { value: 'maintain_low', label: 'Maintenance 5 мг/кг q24h' },
        { value: 'maintain_med', label: 'Maintenance 8 мг/кг q24h' },
        { value: 'maintain_high', label: 'Maintenance 10 мг/кг q24h (breakthrough)' },
      ],
    },
    {
      id: 'route',
      label: 'Путь введения',
      type: 'select',
      options: [
        { value: 'iv', label: 'IV (в течение 30 мин для loading; medlenно для maint)' },
        { value: 'po', label: 'PO (через зонд, через 1 ч после еды)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const phase = String(values.phase ?? 'load_standard');
    const route = String(values.route ?? 'iv');

    if (w <= 0 || w > 5) {
      return {
        value: '—',
        interpretation: 'Введите массу 0.4-5 кг',
        color: '#9CA3AF',
        details: 'Кофеин используется у новорождённых GA < 32 нед / апноэ недоношенных.',
      };
    }

    const phaseDoses: Record<string, { perKg: number; freq: string; label: string }> = {
      load_standard: { perKg: 20, freq: 'однократно', label: 'Loading standard' },
      load_high: { perKg: 40, freq: 'однократно', label: 'Loading high-dose' },
      maintain_low: { perKg: 5, freq: 'q24h', label: 'Maintenance низкая' },
      maintain_med: { perKg: 8, freq: 'q24h', label: 'Maintenance стандартная' },
      maintain_high: { perKg: 10, freq: 'q24h', label: 'Maintenance высокая (breakthrough)' },
    };
    const p = phaseDoses[phase] ?? phaseDoses.load_standard;
    if (!p) {
      return {
        value: '—',
        interpretation: 'Неизвестная фаза',
        color: '#9CA3AF',
        details: '',
      };
    }
    const total = w * p.perKg;

    // Caffeine citrate concentration: typically 20 мг/мл = 10 мг/мл caffeine base
    // (commercial: e.g., Cafcit 20 мг/мл citrate)
    const conc = 20; // мг/мл citrate
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Caffeine citrate: ${total.toFixed(0)} мг = ${vol.toFixed(2)} мл @ 20 мг/мл`);
    actions.push(`Кофеин base equivalent: ${(total / 2).toFixed(0)} мг (1:2 citrate→base)`);

    if (route === 'iv') {
      if (phase.startsWith('load')) {
        actions.push('IV loading: в течение 30 мин (slow infusion)');
        actions.push('Совместимость: 5 % glucose, 0.9 % NaCl, lipid emulsion');
      } else {
        actions.push('IV maintenance: в течение 10 мин (slow push)');
      }
    } else {
      actions.push('PO: через назогастральный зонд (если есть) или орально');
      actions.push('После приёма выждать 1 ч до следующего кормления');
    }

    actions.push(`Частота: ${p.freq}`);
    actions.push('Старт maintenance: 24 ч после loading');

    if (phase.startsWith('load')) {
      actions.push('Цель loading: быстрое достижение терапевтического уровня (5-25 мкг/мл)');
      actions.push('Не повторять loading при наличии стойких апноэ — увеличить maintenance');
    }

    if (phase === 'maintain_high') {
      actions.push('⚠️ Высокая maintenance — мониторинг тахикардии (> 180 уд/мин), агитации');
      actions.push('Уровень кофеина в плазме (если доступно): therapeutic 5-25 мкг/мл');
      actions.push('Toxicity > 40 мкг/мл: тахикардия, тремор, irritability, гипергликемия, судороги');
    }

    actions.push('Прекращение: после 33-36 нед PMA если нет episodes > 5-7 дней; tапер не нужен');
    actions.push('Side effects: тахикардия, гипергликемия, irritability, ухудшение GERD');
    actions.push('Длительная toleranceность: продолжать до достижения maturity');

    return {
      value: total.toFixed(0),
      unit: `мг (${vol.toFixed(2)} мл @ 20 мг/мл)`,
      interpretation: `${p.label} (${p.perKg} мг/кг ${p.freq})`,
      color: phase.startsWith('load') ? '#3B82F6' : '#22C55E',
      details: `${p.perKg} мг/кг × ${w} кг = ${total.toFixed(0)} мг кофеина цитрата (= ${(total / 2).toFixed(0)} мг базы).`,
      actions,
    };
  },
  caveats: [
    'CAP trial (Schmidt 2007): caffeine vs placebo у 2006 ELBW — снижение BPD (RR 0.63), PDA, ROP severe; улучшение neurodevelopment в 5 лет',
    'Caffeine vs theophylline: caffeine wins (longer half-life 60-100 ч, fewer side effects)',
    '1 мг кофеина цитрата = 0.5 мг кофеина base (важно при приёме различных формуляров)',
    'Therapeutic plasma level: 5-25 мкг/мл; рутинный мониторинг не нужен в большинстве центров',
    'Toxicity > 40 мкг/мл: тахикардия, тремор, irritability, hyperglycemia, judorги',
    'Старт ASAP при apnea / GA < 32 нед — раннее назначение лучше, чем delayed',
    'Совместимость в IV: glucose, saline, lipid emulsion (НЕ амикацин, NaHCO₃)',
    'Прекращение: после 33-36 нед PMA, no episodes > 5-7 дней; тапер не нужен (long t½)',
    'Кофеин — controversial extended use beyond NICU; cocoon effect home apnea — discuss',
  ],
  related: [
    { id: 'neo-resp-indices', title: 'OI / OSI' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
    { id: 'neo-bpd-nih', title: 'BPD severity' },
    { id: 'neo-ett', title: 'Размер ЭТТ' },
  ],
  info: `### Кофеин цитрат — Apnea of Prematurity (AOP)

Расчёт дозы кофеина цитрата для лечения апноэ недоношенных. Стандарт
ухода у GA < 32 нед.

### Дозы

| Фаза | Доза | Путь |
|---|---|---|
| **Loading standard** | 20 мг/кг | IV (30 мин) или PO |
| **Loading high-dose** | 40 мг/кг | IV (30 мин) или PO |
| **Maintenance low** | 5 мг/кг q24h | IV (10 мин) или PO |
| **Maintenance standard** | 8 мг/кг q24h | IV (10 мин) или PO |
| **Maintenance high** | 10 мг/кг q24h | IV (10 мин) или PO |

⚠️ **Caffeine citrate vs caffeine base:** 1:0.5 (1 мг цитрата = 0.5 мг базы)

### CAP trial (Schmidt 2007 NEJM 357:1893)

2006 ELBW newborns randomized to caffeine vs placebo:
- ↓ BPD (RR 0.63)
- ↓ PDA closure rate
- ↓ Severe ROP
- ↓ Cerebral palsy / cognitive delay в 18-21 мес
- Улучшение neurodevelopment в 5 лет (CAP follow-up 2012)

### Когда начать

- **GA < 32 нед** при поступлении в NICU (профилактика)
- **Apnea episodes** ≥ 1 эпизода в 24 ч с bradycardia/desat
- **Pre-extubation** для облегчения экстубации

### Когда прекратить

- **PMA 33-36 нед** + нет episodes > 5-7 дней
- **Тапер не нужен** — long half-life (60-100 ч у недоношенных)

### Therapeutic level

- **Целевой:** 5-25 мкг/мл plasma caffeine
- **Toxicity:** > 40 мкг/мл
- **Мониторинг:** не рутинный; при тахикардии/тремор/breakthrough apnea

### Side effects

- Тахикардия (> 180/мин — снизить дозу)
- Гипергликемия (особенно loading)
- Irritability, агитация
- Ухудшение GERD (из-за relaxation LES)
- При toxicity: тремор, судороги, дисритмии

### Совместимость

| Совместимо | Несовместимо |
|---|---|
| 5 % Glucose | Амикацин |
| 0.9 % NaCl | NaHCO₃ |
| Lipid emulsion | Pantoprazole |
| Аминогликозиды | Furosemide |

### Источники

- Schmidt B et al. CAP trial NEJM 2007;357:1893
- Schmidt B et al. CAP follow-up NEJM 2012;366:1893
- AAP CFN Caffeine for AOP 2016
- NeoFax / Neonatal Formulary 9th ed (Ainsworth)
- Cochrane Caffeine for apnea of prematurity 2010
`,
};

export default runner;

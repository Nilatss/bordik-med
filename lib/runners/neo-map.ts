/**
 * Runner: neo-map — Neonatal Mean Arterial Pressure (MAP) — целевые значения
 *
 * NEONATOLOGY MODULE A44 (P3).
 *
 * Расчёт MAP + интерпретация по гестационному возрасту + дням жизни.
 *
 * MAP формулы:
 *   - Если есть SBP + DBP: MAP = DBP + (SBP − DBP) / 3
 *   - Прямая инвазивная: значение от датчика (preferred у unstable preterm)
 *
 * Целевые MAP (mmHg, общепринятые neonatal targets):
 *   - Term (≥ 37 нед) первые 24 ч: ≥ 40 mmHg
 *   - Late preterm (34-36 нед) первые 24 ч: ≥ GA в недЕЛЯх + 5
 *   - Preterm (< 34 нед) первые 24 ч: ≥ GA в неделях (правило Joint Working
 *     Group BAPM)
 *   - После 24 ч жизни: + 1 mmHg в день до term-like targets
 *
 * Гипотония у новорождённого — наиболее часто определяется как MAP < GA
 * (правило большого пальца, BAPM 2009). НО: единого консенсуса нет;
 * клиническая корреляция (perfusion, lactate, UO, CRT) > pure number.
 *
 * SOURCES:
 *   - BAPM. Identification and management of neonatal hypotension. 2017
 *   - Dempsey EM, Barrington KJ. Curr Opin Pediatr 2009;21:181 —
 *     Hypotensive preterm management
 *   - Nuntnarumit P et al. J Pediatr 1999;134:48 — Blood pressure norms
 *     in preterm
 *   - Versmold HT et al. Pediatrics 1981;67:607 — Blood pressure values
 *     in normal newborns first 12 h
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный · РФ',
  reference:
    'BAPM Hypotension Framework 2017. Dempsey EM, Barrington KJ. Curr Opin Pediatr 2009;21:181.',
  inputs: [
    {
      id: 'sbp',
      label: 'SBP (систолическое, mmHg) — опционально',
      type: 'number',
      min: 20,
      max: 150,
      step: 1,
    },
    {
      id: 'dbp',
      label: 'DBP (диастолическое, mmHg) — опционально',
      type: 'number',
      min: 10,
      max: 100,
      step: 1,
    },
    {
      id: 'map_invasive',
      label: 'MAP инвазивный (mmHg) — если есть art. line',
      type: 'number',
      min: 15,
      max: 120,
      step: 1,
    },
    {
      id: 'ga',
      label: 'Гестационный возраст (нед, на родах)',
      type: 'number',
      min: 22,
      max: 42,
      step: 1,
    },
    {
      id: 'dol',
      label: 'День жизни (1 = первые 24 ч)',
      type: 'number',
      min: 1,
      max: 60,
      step: 1,
    },
  ],
  compute(values): CalculatorResult {
    const sbp = Number(values.sbp ?? 0);
    const dbp = Number(values.dbp ?? 0);
    const invasive = Number(values.map_invasive ?? 0);
    const ga = Number(values.ga ?? 0);
    const dol = Number(values.dol ?? 0);

    if (ga <= 0 || dol <= 0) {
      return {
        value: '—',
        interpretation: 'Введите гестационный возраст + день жизни',
        color: '#9CA3AF',
        details: 'Минимум GA + day of life для определения target.',
      };
    }

    // Compute MAP
    let map = 0;
    let mapSource = '';
    if (invasive > 0) {
      map = invasive;
      mapSource = 'инвазивный (art. line)';
    } else if (sbp > 0 && dbp > 0 && sbp > dbp) {
      map = dbp + (sbp - dbp) / 3;
      mapSource = `расчёт из SBP ${sbp} / DBP ${dbp}`;
    } else {
      return {
        value: '—',
        interpretation: 'Введите MAP (инвазивный) ИЛИ SBP + DBP',
        color: '#9CA3AF',
        details: 'MAP = DBP + (SBP − DBP) / 3, либо прямое значение с art. line.',
      };
    }
    const mapR = Math.round(map);

    // Target MAP по GA + DOL
    // BAPM rule of thumb: target MAP >= GA (in weeks) для preterm в первые
    // 24 ч; для term ≥ 40 mmHg; добавляем ~1 mmHg/day до term-like targets.
    let target = 0;
    if (ga >= 37) {
      target = Math.max(40 + (dol - 1) * 0.5, 40); // term: ≥ 40, slow rise
    } else if (ga >= 34) {
      target = Math.max(ga + 5 + (dol - 1) * 0.5, ga);
    } else {
      // preterm < 34: target ≈ GA + (dol − 1)
      target = ga + Math.min(dol - 1, 7); // postnatal rise capped at ~7
    }
    const targetR = Math.round(target);

    let color = '#22C55E';
    let interpretation = '';
    const actions: string[] = [];

    const delta = mapR - targetR;
    if (delta < -5) {
      color = '#EF4444';
      interpretation = `Hypotension: MAP ${mapR} mmHg (target ≥ ${targetR})`;
      actions.push('Подтвердить cuff size + transducer level + manual recheck');
      actions.push('Clinical perfusion: CRT, lactate, UO < 1 мл/кг/ч, mottled skin?');
      actions.push('Echo: LV/RV function, ductal shunting, PPHN, hypovolemia');
      actions.push('Volume bolus: NaCl 0,9 % 10 мл/кг IV за 15-30 мин (повторить × 1 prn)');
      actions.push('Inotropes: dopamine 5-10 мкг/кг/мин стартовая; norepi при vasodilatory');
      actions.push('Hydrocortisone 1 мг/кг q8h при refractory (адреналовая dysfunction)');
    } else if (delta < 0) {
      color = '#F59E0B';
      interpretation = `Borderline: MAP ${mapR} mmHg (target ≥ ${targetR})`;
      actions.push('Clinical correlation: если perfusion good — наблюдение + recheck q15-30 мин');
      actions.push('При adverse perfusion (lactate ↑, CRT > 3 sec, UO < 1) — лечить как hypotension');
      actions.push('Echo при затяжной borderline для assess function + shunts');
    } else {
      interpretation = `Целевой: MAP ${mapR} mmHg (target ≥ ${targetR}, delta +${delta})`;
      actions.push('Продолжать routine монитоинг q15-60 мин');
      actions.push('Если на инотропах — попытаться wean при stable > 4-6 ч');
    }

    return {
      value: `${mapR} mmHg`,
      interpretation: `${interpretation} · GA ${ga} нед · DOL ${dol} · ${mapSource}`,
      color,
      details:
        `Target MAP по GA ${ga} нед / DOL ${dol}: ≥ ${targetR} mmHg.\n\nMAP: ${mapSource}.` +
        (actions.length > 0 ? '\n\n**Действия:**\n' + actions.map((a) => `- ${a}`).join('\n') : ''),
    };
  },
  info: `
### Для чего используется
**Mean Arterial Pressure (MAP)** + интерпретация у новорождённого — оценка adequate organ perfusion. Не существует "magic number"; единое определение гипотонии у н/р отсутствует, но **MAP < GA в неделях** (BAPM rule of thumb) — наиболее цитируемое для preterm в первые 24 ч.

### Формула расчёта MAP
\`\`\`
MAP = DBP + (SBP − DBP) / 3
\`\`\`
(если SBP / DBP измерены non-invasive)

Прямой инвазивный MAP (art. line) предпочтительнее у unstable preterm.

### Target MAP по гестационному возрасту

| GA | Target MAP (первые 24 ч) | Postnatal rise |
|---|---|---|
| ≥ 37 нед (term) | ≥ 40 mmHg | + ~0,5 mmHg/day |
| 34-36 нед | ≥ GA + 5 | + ~0,5 mmHg/day |
| < 34 нед | ≥ GA (BAPM rule) | + ~1 mmHg/day, cap at term targets |

### Клиническая корреляция > только MAP number
**ВАЖНО:** lone MAP value НЕ должна быть triggers лечения. Оценить:
- **Capillary refill time (CRT)** > 3 sec
- **Lactate** > 4 ммоль/л
- **Urine output** < 1 мл/кг/ч
- **Mottled skin**, cool extremities
- **Echo**: LV/RV function, ductal shunt, PDA, PPHN, hypovolemia

Если perfusion adequate + borderline MAP → "permissive hypotension" допустимо у preterm (Dempsey 2009).

### Этиология hypotension у новорождённого

| Причина | Diagnostic clue | Management |
|---|---|---|
| **Hypovolemia** | history blood loss, dehydration | NaCl 10 мл/кг bolus × 1-2 |
| **Sepsis (warm shock)** | high CO, low SVR, warm extremities | Volume + norepinephrine |
| **Sepsis (cold shock)** | low CO, high SVR, cool extremities | Volume + adrenaline + hydrocort |
| **Cardiogenic** | LV dysfunction, asphyxia, HIE | Dobutamine + selective fluid |
| **Vasoplegia (post-PDA ligation)** | acute post-op | Norepi + hydrocort |
| **Adrenal insufficiency** | sustained refractory hypoTN | Hydrocortisone 1 мг/кг q8h |
| **PPHN с R→L shunt** | pre/post-ductal SpO₂ differential | iNO + LV inotropic support |

### Inotropes — neonatal первой линии

| Drug | Доза | Действие |
|---|---|---|
| **Dopamine** | 5-10 мкг/кг/мин | α1 + β1; vasoconstrictor + positive inotrope |
| **Dobutamine** | 5-15 мкг/кг/мин | β1 dominant; positive inotrope + mild vasodilation. Preferred при cardiogenic |
| **Adrenaline (Epinephrine)** | 0,05-0,5 мкг/кг/мин | α + β; cold septic shock, post-cardiac arrest |
| **Noradrenaline (Norepi)** | 0,05-1 мкг/кг/мин | α1 dominant; warm septic shock |
| **Vasopressin** | 0,0001-0,001 ед/кг/мин | V1 receptors; catecholamine-refractory |
| **Hydrocortisone** | 1 мг/кг q8-12h | Adrenal insufficiency / catecholamine-refractory |

### Volume resuscitation
- First bolus: **NaCl 0,9 % 10 мл/кг IV за 15-30 мин**
- Repeat × 1-2 prn (max 30 мл/кг за first hour)
- НЕ exceed 30 мл/кг без echo assessment — risk pulmonary edema
- Avoid hypertonic / hyperosmolar boluses у preterm (IVH risk)

### Цель в управлении
- Restore organ perfusion (CRT < 3 sec, UO ≥ 1 мл/кг/ч, lactate ↓, normalize mottling)
- НЕ просто MAP > target — clinical correlation > number

### Связанные tools
- \`neo-fluid\` — fluid management по возрасту
- \`neo-resus-doses\` — resuscitation drugs в родзале
- \`neo-norepinephrine-dose\`, \`neo-dopamine-dose\`, \`neo-hydrocortisone-dose\`
- \`neo-abg\` — acid-base + lactate
- \`nsofa\` — neonatal SOFA для sepsis severity

### Источники
- BAPM. **Identification and management of neonatal hypotension** (2017)
- Dempsey EM, Barrington KJ. **Curr Opin Pediatr 2009;21:181** — Hypotensive preterm management
- Nuntnarumit P et al. **J Pediatr 1999;134:48** — Blood pressure norms in preterm
- Versmold HT et al. **Pediatrics 1981;67:607** — Blood pressure values normal newborns first 12 h
- Surviving Sepsis Pediatric Guidelines 2020 (Weiss SL et al. Crit Care Med 2020;48:2)
`,
};

export default runner;

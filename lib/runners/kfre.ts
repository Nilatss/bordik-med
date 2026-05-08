/** Runner: kfre */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age',
hint: 'Возраст в годах', label: 'Возраст', type: 'number', unit: 'лет', min: 18, max: 100, step: 1, quickValues: [50, 60, 70, 80] },
    { id: 'female', label: 'Женский пол', type: 'checkbox' },
    { id: 'gfr', label: 'рСКФ', type: 'number', unit: 'мл/мин/1.73м²', min: 5, max: 60, step: 1, quickValues: [45, 35, 25, 15] },
    { id: 'acr', label: 'UACR', type: 'number', unit: 'мг/г', min: 1, max: 10000, step: 1, quickValues: [50, 300, 800, 2000] },
    { id: 'use8', label: 'Использовать 8-переменную версию', type: 'checkbox' },
    { id: 'ca',
hint: 'Кальций общий. Норма: 2.15-2.55 ммоль/л', label: 'Кальций (8-var)', type: 'number', unit: 'ммоль/л', min: 1, max: 3.5, step: 0.01, quickValues: [2.2, 2.35, 2.5] },
    { id: 'phos',
hint: 'Концентрация в ммоль/л', label: 'Фосфор (8-var)', type: 'number', unit: 'ммоль/л', min: 0.3, max: 4, step: 0.01, quickValues: [1.1, 1.4, 1.8] },
    { id: 'alb',
hint: 'Альбумин. Норма: 35-50 г/л', label: 'Альбумин сыворотки (8-var)', type: 'number', unit: 'г/л', min: 10, max: 55, step: 1, quickValues: [38, 35, 30] },
    { id: 'hco3',
hint: 'HCO₃⁻ сыворотки. Норма: 22-26 ммоль/л', label: 'Бикарбонат (8-var)', type: 'number', unit: 'ммоль/л', min: 5, max: 40, step: 0.5, quickValues: [24, 22, 19] },
  ],
  compute: (v) => {
    const age = Number(v.age);
    const female = v.female === true;
    const gfr = Number(v.gfr);
    const acr_mgg = Number(v.acr);
    const use8 = v.use8 === true;
    const acr_mgmmol = acr_mgg / 8.84; // convert mg/g to mg/mmol
    const lnAcr = Math.log(Math.max(acr_mgmmol, 0.01));

    // Tangri 4-variable (non-North-American 2-yr and 5-yr)
    // logit = -0.2201*(age/10 - 7.036) + 0.2467*(1 if male) - 0.5567*(eGFR/5 - 7.222) + 0.4510*(lnACR - 5.137)
    // Base survival: S0(2yr)=0.9750, S0(5yr)=0.9240
    const sexTerm = female ? 0 : 0.2467;
    const logit4 = -0.2201 * (age / 10 - 7.036)
      + sexTerm
      - 0.5567 * (gfr / 5 - 7.222)
      + 0.4510 * (lnAcr - 5.137);

    const p4 = (S0: number) => 1 - Math.pow(S0, Math.exp(logit4));

    let risk2: number, risk5: number;

    if (use8) {
      const ca = Number(v.ca); // mmol/L -> mg/dL (×4.008)
      const phos = Number(v.phos); // mmol/L -> mg/dL (×3.097)
      const alb = Number(v.alb) / 10; // g/L -> g/dL
      const hco3 = Number(v.hco3);
      const ca_mgdl = ca * 4.008;
      const phos_mgdl = phos * 3.097;
      // 8-var Tangri: adds Ca, Phos, Alb, HCO3
      const logit8 = logit4
        + (-0.0436 * (ca_mgdl - 9.4))
        + (0.1503 * (phos_mgdl - 3.9))
        + (-0.2281 * (alb - 3.9))
        + (-0.0833 * (hco3 - 25.5));
      // base survival 8-var: S0(2yr)=0.9780, S0(5yr)=0.9365
      risk2 = 1 - Math.pow(0.9780, Math.exp(logit8));
      risk5 = 1 - Math.pow(0.9365, Math.exp(logit8));
    } else {
      risk2 = p4(0.9750);
      risk5 = p4(0.9240);
    }

    const r5pct = Math.max(0, Math.min(100, risk5 * 100));
    const r2pct = Math.max(0, Math.min(100, risk2 * 100));

    let color = '#22C55E', interpretation = 'Низкий риск';
    if (r2pct >= 10 || r5pct >= 20) { color = '#991B1B'; interpretation = 'Очень высокий риск'; }
    else if (r5pct >= 10) { color = '#EF4444'; interpretation = 'Высокий риск'; }
    else if (r5pct >= 5) { color = '#F59E0B'; interpretation = 'Умеренный риск'; }

    return {
      value: r5pct.toFixed(1),
      unit: '% за 5 лет',
      interpretation,
      color,
      details: `Риск терминальной ПН (ЗПТ): 2-года — ${r2pct.toFixed(1)} %, 5 лет — ${r5pct.toFixed(1)} %. Модель: Tangri ${use8 ? '8-var' : '4-var'}.`,
      actions: r5pct >= 10
        ? ['Направление к нефрологу; планирование ЗПТ', 'Обсуждение модальности диализа / преэмптивной трансплантации', 'Формирование сосудистого доступа при СКФ <20 или риске ≥40%/2 года']
        : r5pct >= 5
          ? ['Нефрологическое наблюдение', 'Оптимизация иАПФ/БРА + SGLT2', 'Контроль АД, альбуминурии, СКФ каждые 3–6 мес']
          : ['Плановый контроль ХБП', 'Коррекция факторов риска'],
      caveats: [
        'Валидирована для взрослых с ХБП G3–G5',
        'Не подходит для AKI и трансплантированных почек',
        'Используется UACR в мг/ммоль (внутри пересчёт из мг/г ÷8.84)',
        '8-переменная требует стабильных биохимических показателей',
      ],
      scale: {
        segments: [
          { min: 0, max: 5, label: 'Низкий', color: '#22C55E' },
          { min: 5, max: 10, label: 'Умеренный', color: '#F59E0B' },
          { min: 10, max: 20, label: 'Высокий', color: '#EF4444' },
          { min: 20, max: 100, label: 'Оч. высокий', color: '#991B1B' },
        ],
        current: Number(r5pct.toFixed(1)),
        unit: '% за 5 лет',
      },
      relatedCourses: [
        { id: '301.3', title: 'Нефрология' },
        { id: '301.4', title: 'Урология' },
      ],
      related: [
        { id: 'ckd-epi', title: 'CKD-EPI' },
        { id: 'kdigo-ckd', title: 'KDIGO ХБП' },
      ],
    };
  },
  reference: 'Tangri N et al. JAMA 2011; 2016 (8-var). Non-North American coefficients.',
  countries: 'Международный',
  presets: [
    { label: 'G3b низкий риск', values: { age: 60, female: false, gfr: 40, acr: 50, use8: false, ca: 2.35, phos: 1.2, alb: 40, hco3: 24 } },
    { label: 'G4 высокий риск', values: { age: 65, female: false, gfr: 22, acr: 800, use8: false, ca: 2.3, phos: 1.5, alb: 36, hco3: 22 } },
    { label: '8-var тяжёлая ХБП', values: { age: 70, female: true, gfr: 18, acr: 2000, use8: true, ca: 2.1, phos: 1.9, alb: 32, hco3: 20 } },
  ],
  info: `### Для чего используется
**Kidney Failure Risk Equation (KFRE, Tangri)** — прогноз риска терминальной почечной недостаточности (требующей ЗПТ) у пациентов с ХБП G3–G5.

### 4 переменные
Возраст, пол, рСКФ, UACR. 5-летний риск ≥5% — показание к нефрологическому наблюдению; ≥40% — к планированию сосудистого доступа.

### 8 переменных
Добавляются Ca, Phos, альбумин, бикарбонат — уточняют прогноз при МКН-ХБП и ацидозе.

### Клиническое применение (KDIGO 2024 supplement)
- 2-yr риск ≥10% — плановая консультация нефролога
- 2-yr риск ≥40% или 5-yr ≥50% — формирование AV-фистулы`,
};
export default runner;

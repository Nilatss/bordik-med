// @ts-nocheck
/** Runner: anzcor — Australian and New Zealand Committee on Resuscitation */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'sect',
      label: 'Раздел ANZCOR',
      type: 'select',
      options: [
        { value: 'drsabcd', label: 'DRSABCD — Adult BLS' },
        { value: 'als', label: 'Adult ALS' },
        { value: 'peds', label: 'Paediatric Life Support' },
        { value: 'env', label: 'Environmental (snake PIT, jellyfish)' },
      ],
    },
  ],
  compute: (v) => {
    const s = String(v.sect);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      drsabcd: {
        title: 'DRSABCD (ANZCOR BLS)',
        c: '#EF4444',
        details: 'Австралийский/новозеландский мнемоник BLS: Danger – Response – Send – Airway – Breathing – CPR – Defibrillation.',
        actions: [
          'D — Danger: безопасность для всех',
          'R — Response: "hello, can you hear me?"; сжать плечи',
          'S — Send for help (000 в Австралии, 111 в НЗ)',
          'A — Airway: открыть, удалить инородные тела',
          'B — Breathing: look, listen, feel ≤10 с',
          'C — CPR 30:2, 100–120/мин, 1/3 AP глубины',
          'D — Defibrillation: AED как только доступен',
        ],
      },
      als: {
        title: 'ANZCOR Adult ALS',
        c: '#991B1B',
        details: 'Расширенная жизнеподдержка ANZCOR — гармонизирована с ILCOR/ERC/AHA. Универсальный алгоритм: шокабельный vs нешокабельный.',
        actions: [
          'Шокабельные: 150–200 Дж бифазный, 360 Дж монофазный',
          'Эпинефрин 1 мг IV/IO каждые 3–5 мин',
          'Амиодарон 300 мг после 3-го разряда → 150 мг',
          'Лидокаин 1 мг/кг как альтернатива',
          'Искать 4H/4T',
          'Капнография рекомендована',
        ],
      },
      peds: {
        title: 'ANZCOR Paediatric',
        c: '#DC2626',
        details: 'Педиатрический LS: 15:2 (2 спасателя), 4 Дж/кг разряд, эпинефрин 0.01 мг/кг.',
        actions: [
          '15:2 (2 спасателя) / 30:2 (1 спасатель)',
          'Глубина ~1/3 AP диаметра',
          'Дефибрилляция 4 Дж/кг; padlock/педиатрические электроды',
          'Эпинефрин 10 мкг/кг IV/IO; амиодарон 5 мг/кг',
          'Ранний airway и оксигенация',
        ],
      },
      env: {
        title: 'ANZCOR Environmental',
        c: '#F59E0B',
        details: 'Региональная специфика Австралии/НЗ: укусы змей, укусы медуз (коробочная, ируканджи), утопление.',
        actions: [
          'Snake bite: Pressure Immobilisation Technique (PIT) — давящая эластичная повязка от укуса проксимально, шина, иммобилизация конечности',
          'Box jellyfish (Chironex): заливать укус уксусом 30 с, НЕ пресной водой, антидот-антитоксин',
          'Irukandji syndrome: уксус + магний IV + анальгезия',
          'Drowning: 5 начальных вдохов → СЛР, ожидать гипоксическую остановку',
          'Funnel-web spider: PIT + антитоксин',
        ],
      },
    };
    const r = map[s] || map.drsabcd;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'ANZCOR — член ILCOR; гармонизирован с ERC/AHA',
        'Региональные дополнения (snake PIT, jellyfish) — локальная специфика',
      ],
      related: [
        { id: 'bls-acls', title: 'AHA BLS/ACLS' },
        { id: 'erc', title: 'ERC Guidelines' },
        { id: 'ilcor', title: 'ILCOR CoSTR' },
        { id: 'epals', title: 'EPALS' },
        { id: 'pals', title: 'PALS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Анестезиология-реаниматология' },
      ],
    };
  },
  reference: 'Australian and New Zealand Committee on Resuscitation (ANZCOR). Guidelines 1–14 (Basic, Advanced, Paediatric, Neonatal, First Aid). https://www.anzcor.org/. ILCOR 2020 CoSTR.',
  countries: 'Австралия, Новая Зеландия',
  presets: [
    { label: 'DRSABCD (BLS)', values: { sect: 'drsabcd' } },
    { label: 'Adult ALS', values: { sect: 'als' } },
    { label: 'Paediatric', values: { sect: 'peds' } },
    { label: 'Environmental', values: { sect: 'env' } },
  ],
  info: `### Для чего используется
**ANZCOR (Australian and New Zealand Committee on Resuscitation)** — региональный член ILCOR, публикует протоколы для Австралии/Новой Зеландии. Эквивалент AHA/ERC с региональной спецификой.

### DRSABCD — фирменный BLS мнемоник
- **D** Danger
- **R** Response
- **S** Send for help
- **A** Airway
- **B** Breathing
- **C** CPR
- **D** Defibrillation

### Региональная специфика
- **Snake bite PIT** (Pressure Immobilisation Technique) — stretchy crepe bandage от укуса проксимально + шина
- **Box jellyfish** (Chironex fleckeri) — уксус 30 с на щупальца
- **Irukandji syndrome** — магний IV + анальгезия
- **Funnel-web spider** — PIT + antivenom

### Структура
Guidelines 1–14:
1. Basics of resuscitation
2. Priorities in first aid
3. Recognising cardiac arrest
4. Airway
5. Breathing
6. CPR
7. Defibrillation
8. ALS adult
9. First aid
10. Neonatal
11. Paediatric
12. Education
13. Special environments
14. Ethics

### Источники
ANZCOR Guidelines, www.anzcor.org
`,
};

export default runner;

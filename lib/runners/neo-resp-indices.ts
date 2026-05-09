/**
 * Runner: neo-resp-indices — Респираторные индексы (A-aDO₂, OI, OSI, SF, P/F)
 *
 * NEONATOLOGY MODULE A39 (P2).
 *
 * Калькулятор индексов оксигенации для оценки тяжести респираторной
 * недостаточности у новорождённых. Применяется при decision-making по
 * iNO, HFOV, surfactant, ECMO.
 *
 * Формулы:
 *   A-aDO₂ = [(Patm − 47) × FiO₂ − PaCO₂/0.8] − PaO₂      (мм рт ст)
 *   OI     = (MAP × FiO₂ × 100) / PaO₂
 *   OSI    = (MAP × FiO₂ × 100) / SpO₂
 *   P/F    = PaO₂ / FiO₂
 *   SF     = SpO₂ / FiO₂                                   (Rice 2007)
 *
 * Пороги OI:
 *   < 15  — лёгкая
 *   15-25 — умеренная
 *   25-40 — тяжёлая
 *   ≥ 40  — критическая (ELSO ECMO criteria)
 *
 * SOURCES:
 *   - Khemani RG et al. AJRCCM 2009 (OSI vs OI)
 *   - NICUtools — Oxygenation Index
 *   - ELSO Guidelines for ECMO eligibility
 *   - PALICC 2015 (peds ARDS)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Khemani 2009 / ELSO / PALICC)',
  reference: 'Khemani RG et al. AJRCCM 2009. ELSO ECMO Guidelines. PALICC consensus 2015.',
  inputs: [
    {
      id: 'fio2',
      label: 'FiO₂ (доля, 0.21-1.0)',
      type: 'number',
      min: 0.21,
      max: 1.0,
      step: 0.01,
    },
    {
      id: 'pao2',
      label: 'PaO₂ (мм рт ст, артериальный)',
      type: 'number',
      min: 0,
      max: 600,
      step: 1,
    },
    {
      id: 'paco2',
      label: 'PaCO₂ (мм рт ст)',
      type: 'number',
      min: 0,
      max: 200,
      step: 1,
    },
    {
      id: 'spo2',
      label: 'SpO₂ (%, для OSI)',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
    },
    {
      id: 'map',
      label: 'MAP среднее давление в дых. путях (см H₂O)',
      type: 'number',
      min: 0,
      max: 50,
      step: 1,
    },
    {
      id: 'patm',
      label: 'Атмосферное давление (мм рт ст)',
      type: 'number',
      min: 500,
      max: 800,
      step: 1,
    },
  ],
  compute(values): CalculatorResult {
    const fio2 = Number(values.fio2 ?? 0);
    const pao2 = Number(values.pao2 ?? 0);
    const paco2 = Number(values.paco2 ?? 0);
    const spo2 = Number(values.spo2 ?? 0);
    const map = Number(values.map ?? 0);
    const patm = Number(values.patm ?? 760) || 760;

    if (fio2 <= 0 || fio2 > 1.0) {
      return {
        value: '—',
        interpretation: 'Введите FiO₂ от 0.21 до 1.0',
        color: '#9CA3AF',
        details: 'FiO₂ — доля (0.21 = 21 %, 1.0 = 100 %).',
      };
    }

    const pf = pao2 > 0 ? pao2 / fio2 : 0;
    const aaDO2 = pao2 > 0 && paco2 > 0 ? ((patm - 47) * fio2 - paco2 / 0.8) - pao2 : 0;
    const oi = pao2 > 0 && map > 0 ? (map * fio2 * 100) / pao2 : 0;
    const osi = spo2 > 0 && map > 0 ? (map * fio2 * 100) / spo2 : 0;
    const sf = spo2 > 0 ? spo2 / fio2 : 0;

    let band = 'Лёгкая';
    let color = '#22C55E';
    const actions: string[] = [];

    if (oi >= 40) {
      band = 'Критическая (ECMO criteria)';
      color = '#7F1D1D';
      actions.push('OI ≥ 40 sustained → ELSO ECMO criteria');
      actions.push('Связаться с ECMO-центром, оптимизировать all conventional first');
      actions.push('iNO, HFOV (если не на нём), surfactant если RDS');
      actions.push('Эхокардиография — оценка PPHN, ВПС');
    } else if (oi >= 25) {
      band = 'Тяжёлая';
      color = '#EF4444';
      actions.push('Тяжёлая гипоксемия — iNO 20 ppm (для PPHN)');
      actions.push('Рассмотреть HFOV если на conventional');
      actions.push('Surfactant если RDS не получал второй дозы');
      actions.push('Подготовка к ECMO-консультации при отсутствии ответа за 4-6 ч');
    } else if (oi >= 15) {
      band = 'Умеренная';
      color = '#F59E0B';
      actions.push('Оптимизация PEEP, MAP');
      actions.push('При PPHN — iNO 20 ppm trial');
      actions.push('Surfactant если показано');
      actions.push('Контроль метаболического ацидоза, гематокрита, седации');
    } else if (oi > 0) {
      band = 'Лёгкая';
      color = '#22C55E';
      actions.push('Конвенциональная вентиляция');
      actions.push('Целевой SpO₂ 90-95 %');
      actions.push('Мониторинг тренда OI');
    }

    if (oi === 0 && pf === 0 && sf === 0) {
      return {
        value: '—',
        interpretation: 'Введите достаточно данных',
        color: '#9CA3AF',
        details: 'Для OI — PaO₂ + MAP. Для P/F — PaO₂. Для SF — SpO₂. Для A-aDO₂ — PaO₂ + PaCO₂.',
      };
    }

    const parts: string[] = [];
    if (oi > 0) parts.push(`OI = ${oi.toFixed(1)}`);
    if (pf > 0) parts.push(`P/F = ${pf.toFixed(0)}`);
    if (osi > 0) parts.push(`OSI = ${osi.toFixed(1)}`);
    if (sf > 0) parts.push(`SF = ${sf.toFixed(0)}`);
    if (aaDO2 > 0) parts.push(`A-aDO₂ = ${aaDO2.toFixed(0)}`);

    const value = oi > 0 ? oi.toFixed(1) : pf > 0 ? pf.toFixed(0) : sf.toFixed(0);
    const unit = oi > 0 ? 'OI' : pf > 0 ? 'P/F' : 'SF';

    return {
      value,
      unit,
      interpretation: band,
      color,
      details: parts.join(' · '),
      actions,
    };
  },
  caveats: [
    'OI — стандарт NICU при инвазивной вентиляции',
    'OSI — non-invasive replacement (только SpO₂ + MAP)',
    'SF — pediatric ARDS (PALICC 2015), у новорождённых не diagnostic',
    'ECMO criteria: OI ≥ 40 sustained × 4 ч ИЛИ A-aDO₂ ≥ 600 × 8-12 ч',
  ],
  related: [
    { id: 'aa-gradient', title: 'A-a Gradient (взрослые)' },
    { id: 'neo-ett', title: 'Размер ЭТТ' },
    { id: 'neo-bili-2022', title: 'Bili-2022' },
  ],
  info: `### Респираторные индексы (OI / OSI / A-aDO₂ / P/F / SF)

Калькулятор индексов оксигенации для оценки тяжести респираторной
недостаточности и принятия решений по iNO / HFOV / ECMO.

### Формулы

| Индекс | Формула |
|---|---|
| **OI** | (MAP × FiO₂ × 100) / PaO₂ |
| **OSI** | (MAP × FiO₂ × 100) / SpO₂ |
| **A-aDO₂** | [(Patm−47) × FiO₂ − PaCO₂/0.8] − PaO₂ |
| **P/F** | PaO₂ / FiO₂ |
| **SF** | SpO₂ / FiO₂ |

### Пороги OI

| OI | Тяжесть | Тактика |
|---|---|---|
| < 15 | Лёгкая | Conventional vent |
| 15-25 | Умеренная | iNO trial если PPHN |
| 25-40 | Тяжёлая | iNO + HFOV; ECMO consult |
| ≥ 40 | Критическая | ELSO ECMO criteria |

### iNO

PPHN, term + late preterm: iNO 20 ppm. Response: OI снижение ≥ 15 % или
PaO₂ повышение ≥ 20 мм рт ст за 30 мин.

### ECMO criteria (ELSO 2017)

- OI ≥ 40 sustained × 4 ч, ИЛИ
- A-aDO₂ ≥ 600 мм рт ст × 8-12 ч у термин/late preterm
- Для CDH также OI ≥ 25 после стабилизации

### Источники

- Khemani RG OSI study 2009
- NICUtools
- ELSO ECMO guidelines
- PALICC 2015 (peds ARDS)
`,
};

export default runner;

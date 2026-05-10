'use client';

/**
 * ResuscitationFlowchart — мульти-региональный алгоритм первичной
 * реанимации новорождённого (audit issues В1-В4).
 *
 * Поддерживает 4 региональных протокола:
 *   - NRP 8 ed. 2021 (American Heart Association)
 *   - ERC 2021/2025 NLS (European Resuscitation Council)
 *   - HBB 2 ed. (WHO Helping Babies Breathe)
 *   - МЗ РФ Приказ 04.03.2020 (Российская Федерация)
 *
 * UI features:
 *   - Region selector (4-button toggle)
 *   - Step-by-step flowchart (timed, with action items)
 *   - Live timer (start/pause/reset, per-step elapsed)
 *   - Tactile feedback at 30/60/300/600 sec markers
 *   - Click-through navigation (мобильно-friendly)
 *   - Sources/references panel per region
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type RegionId = 'nrp' | 'erc' | 'hbb' | 'rf';

interface FlowStep {
  id: string;
  time_sec: number;
  title_ru: string;
  body: string;
  next_yes?: string;
  next_no?: string;
  is_critical?: boolean;
  is_decision?: boolean;
}

interface RegionProtocol {
  id: RegionId;
  name_ru: string;
  name_en: string;
  source: string;
  references: string[];
  steps: FlowStep[];
}

const PROTOCOLS: RegionProtocol[] = [
  {
    id: 'nrp',
    name_ru: 'NRP 8 ed. (США)',
    name_en: 'NRP 8 ed. 2021',
    source: 'American Heart Association / AAP NRP 8th edition 2021',
    references: [
      'Aziz K et al. Pediatrics 2021;147:e2020038505E',
      'Weiner GM (ed.). Textbook of Neonatal Resuscitation 8th ed. AAP 2021',
      'AHA 2020 ECC Guidelines Part 5: Neonatal Resuscitation',
    ],
    steps: [
      {
        id: 'preparation',
        time_sec: -60,
        title_ru: 'Подготовка (до родов)',
        body: 'Antenatal counseling. Equipment check: warmer, suction, bag-mask с PEEP, stethoscope, pulse ox, ETT 2.5/3.0/3.5, laryngoscope, медикации. Team briefing.',
        next_yes: 'initial',
      },
      {
        id: 'initial',
        time_sec: 0,
        title_ru: 'Рождение (0-30 сек) — initial steps',
        body: 'Term? Tone good? Дыхание/крик? Если всё ДА — кенгуру с матерью + вытереть + delayed cord clamping ≥ 60 сек.\n\nЕсли НЕТ → warmer, position airway sniffing, dry, suction только при obstruction, stimulate.',
        is_decision: true,
        next_yes: 'mother_skin',
        next_no: 'initial_no',
      },
      {
        id: 'mother_skin',
        time_sec: 30,
        title_ru: 'Кенгуру + DCC ≥ 60 сек',
        body: 'Вытереть, накрыть, skin-to-skin с матерью. Delayed cord clamping ≥ 60 сек (если no contraindications). Routine care. Apgar 1, 5 мин.',
      },
      {
        id: 'initial_no',
        time_sec: 30,
        title_ru: 'Apnea / gasping ИЛИ HR < 100?',
        body: 'Оценка после initial steps. Если apnea/gasping ИЛИ HR < 100 — start PPV. Если breathing + HR ≥ 100 + лабильное состояние — CPAP при cyanosis/distress.',
        is_decision: true,
        is_critical: true,
        next_yes: 'ppv_start',
        next_no: 'cpap',
      },
      {
        id: 'cpap',
        time_sec: 60,
        title_ru: 'CPAP / O₂ supplementation',
        body: 'CPAP 5-7 см H₂O при labored breathing/persistent cyanosis. Pulse ox right hand. Target SpO₂ minute-of-life curve (NRP).',
      },
      {
        id: 'ppv_start',
        time_sec: 60,
        title_ru: '⚡ START PPV — самый важный шаг',
        body: 'Bag-mask ventilation 40-60 breaths/min. Initial pressure 20-25 см H₂O (term), 20-25 (preterm). FiO₂ 21% (term), 21-30% (preterm).\n\nCheck rise of chest. If no rise: MR SOPA — Mask, Reposition, Suction, Open mouth, Pressure, Airway alternative.',
        is_critical: true,
        next_yes: 'check_hr',
      },
      {
        id: 'check_hr',
        time_sec: 90,
        title_ru: 'Reassess HR @ 30 сек PPV',
        body: 'HR ≥ 100 → продолжать PPV до spontaneous breathing.\nHR 60-99 → продолжать PPV + corrective steps (MR SOPA если no rise).\nHR < 60 → переход к chest compressions.',
        is_decision: true,
        is_critical: true,
        next_yes: 'compressions',
        next_no: 'continue_ppv',
      },
      {
        id: 'continue_ppv',
        time_sec: 120,
        title_ru: 'Continue PPV',
        body: 'PPV до spontaneous breathing с good chest rise. Reassess каждые 30 sec. Considering ETT при prolonged PPV (> 5 мин bag-mask).',
      },
      {
        id: 'compressions',
        time_sec: 120,
        title_ru: '⚡ HR < 60 — Chest compressions',
        body: 'Intubate ASAP (ETT secured). Compressions 90/min с PPV 30/min ratio 3:1. FiO₂ 100%. Two-thumb technique (preferred). Depth 1/3 AP diameter.\n\nReassess HR каждые 60 sec.',
        is_critical: true,
        next_yes: 'epi',
      },
      {
        id: 'epi',
        time_sec: 180,
        title_ru: 'HR < 60 после 60 сек compressions — Epinephrine',
        body: 'Epinephrine 0.01-0.03 мг/кг IV (IO) каждые 3-5 мин. Concentration 1:10000.\n\nIf no IV access — ETT 0.05-0.1 мг/кг (1 dose only — IV preferred ASAP).\n\nVolume expansion: 10 мл/кг NS если hypovolemia suspect.',
        is_critical: true,
        next_yes: 'reassess',
      },
      {
        id: 'reassess',
        time_sec: 240,
        title_ru: 'Reassess @ 5 мин — продолжать или прекратить',
        body: 'If HR ≥ 60 — stop compressions, continue PPV.\nIf HR detectable but < 60 после 20 min — consider termination (per NRP — based on team, gestational age, response).\nIf no detectable HR @ 10-20 min — consider termination of efforts.',
        is_decision: true,
      },
    ],
  },
  {
    id: 'erc',
    name_ru: 'ERC 2021/2025 NLS (Европа)',
    name_en: 'ERC 2021/2025 Newborn Life Support',
    source: 'European Resuscitation Council Guidelines 2021 (updated 2025)',
    references: [
      'Madar J et al. Resuscitation 2021;161:291',
      'ERC Newborn Life Support Course Manual 2021',
      'Roehr CC et al. Pediatr Res 2018;83:267',
    ],
    steps: [
      {
        id: 'preparation',
        time_sec: -60,
        title_ru: 'Подготовка',
        body: 'Antenatal team briefing. Equipment: warmer, T-piece resuscitator (preferred — Neopuff), CPAP/PEEP capability, pulse ox.',
      },
      {
        id: 'birth',
        time_sec: 0,
        title_ru: 'Рождение (0-60 сек) — initial assessment',
        body: 'Tone? Breathing/crying? Heart rate (auscultation или palpation cord)?\n\nIf all OK — DCC ≥ 60 sec, skin-to-skin, vital signs.\n\nIf compromised — warm, dry, stimulate, position airway.',
        is_decision: true,
        next_yes: 'skin_to_skin',
        next_no: 'check_breathing',
      },
      {
        id: 'skin_to_skin',
        time_sec: 60,
        title_ru: 'Skin-to-skin + DCC',
        body: 'DCC ≥ 60 sec. Skin-to-skin с mother. Routine care.',
      },
      {
        id: 'check_breathing',
        time_sec: 60,
        title_ru: 'Breathing inadequate ИЛИ HR < 100?',
        body: 'Если apnea / gasping или HR < 100 → 5 inflation breaths (the European hallmark — отличается от NRP 30 sec PPV).',
        is_decision: true,
        is_critical: true,
        next_yes: 'inflation_breaths',
        next_no: 'continue_observe',
      },
      {
        id: 'inflation_breaths',
        time_sec: 90,
        title_ru: '⚡ 5 inflation breaths (signature ERC)',
        body: '5 inflation breaths по 2-3 sec each, pressure:\n- Term: 30 cm H₂O\n- Preterm: 25 cm H₂O\n\nGoal: open lungs (open up airway после fluid clearance). FiO₂ 21% term, 21-30% preterm.',
        is_critical: true,
        next_yes: 'reassess_inflation',
      },
      {
        id: 'reassess_inflation',
        time_sec: 120,
        title_ru: 'Reassess после 5 inflations',
        body: 'Chest movement? HR улучшился (> 100)?\nДА → continue ventilation (PPV) + reassess каждые 30 sec.\nНЕТ → Repeat 5 inflations + check airway technique.',
        is_decision: true,
        next_yes: 'ventilation',
        next_no: 'repeat_inflations',
      },
      {
        id: 'repeat_inflations',
        time_sec: 150,
        title_ru: 'Repeat inflations + airway',
        body: 'Если no chest movement: reposition head, two-person mask seal, jaw thrust, suction (только при obstruction), Guedel airway, рассмотреть intubation.',
      },
      {
        id: 'ventilation',
        time_sec: 180,
        title_ru: 'PPV continued + check HR',
        body: 'PPV 30/min. If HR < 60 после adequate ventilation — start chest compressions.',
        is_decision: true,
        next_yes: 'compressions',
        next_no: 'continue_observe',
      },
      {
        id: 'continue_observe',
        time_sec: 180,
        title_ru: 'Continue observation',
        body: 'Continue ventilation if HR > 100 + spontaneous breathing return. Pulse ox continuous. Wean FiO₂ к target SpO₂.',
      },
      {
        id: 'compressions',
        time_sec: 240,
        title_ru: '⚡ Chest compressions (HR < 60)',
        body: 'Intubate ASAP (ETT). Compressions 3:1 ratio с ventilation. 90 compressions/min + 30 ventilations/min. Depth 1/3 AP diameter. Two-thumb technique.\n\nFiO₂ 100% during compressions.',
        is_critical: true,
        next_yes: 'epi',
      },
      {
        id: 'epi',
        time_sec: 300,
        title_ru: 'Epinephrine после 60 sec compressions без response',
        body: 'IV/IO route: 0.01-0.03 мг/кг (1:10000). Repeat q3-5 min.\nETT (last resort): 0.05-0.1 мг/кг (1 dose).\n\nVolume: 10 мл/кг NS bolus if blood loss/hypovolemia suspect.',
        is_critical: true,
      },
      {
        id: 'reassess_final',
        time_sec: 600,
        title_ru: 'Reassess @ 10 min',
        body: 'After 10 min без detectable HR — consider stopping resuscitation (joint decision team + family if possible).\nERC emphasizes 20-min mark для extreme cases.',
        is_decision: true,
      },
    ],
  },
  {
    id: 'hbb',
    name_ru: 'HBB 2 ed. (WHO)',
    name_en: 'Helping Babies Breathe 2nd ed.',
    source: 'WHO/AAP Helping Babies Breathe 2nd edition 2016, updated 2024',
    references: [
      'Singhal N et al. Pediatrics 2012;130:e1290',
      'AAP HBB 2nd ed. Provider Guide 2016',
      'WHO Guidelines on Basic Newborn Resuscitation 2012 + update 2024',
    ],
    steps: [
      {
        id: 'preparation',
        time_sec: -60,
        title_ru: 'Подготовка к рождению',
        body: 'Подготовить чистую сухую warm зону. Стимулирующий cloth. Bag-mask. Stethoscope. Suction (only if needed).\n\nPlan для skilled help.',
      },
      {
        id: 'cry',
        time_sec: 0,
        title_ru: 'Рождение — Кричит ли ребёнок?',
        body: 'Если cries strongly — routine care: dry, skin-to-skin, breast-feed, delayed cord clamp.\n\nЕсли не cries или weak cry — START GOLDEN MINUTE.',
        is_decision: true,
        is_critical: true,
        next_yes: 'routine',
        next_no: 'golden_minute',
      },
      {
        id: 'routine',
        time_sec: 30,
        title_ru: 'Routine care (если cries)',
        body: 'Dry baby thoroughly. Skin-to-skin. Cover head. Delayed cord clamp ≥ 60 sec (≥ 1 min). Initiate breast-feeding в first hour.',
      },
      {
        id: 'golden_minute',
        time_sec: 30,
        title_ru: '⚡ GOLDEN MINUTE (first 60 sec critical)',
        body: 'Цель: начать ventilation в течение first 60 sec для baby не cries / inadequate breathing.\n\nDry, stimulate, clear airway only if needed (suction). Reposition head sniffing position.',
        is_critical: true,
        next_yes: 'breathing_check',
      },
      {
        id: 'breathing_check',
        time_sec: 30,
        title_ru: 'Breathing? (after 30 sec stimulation)',
        body: 'Если breathing well — keep warm, monitor.\nЕсли not breathing или gasping → START VENTILATION (ключевой момент HBB).',
        is_decision: true,
        is_critical: true,
        next_yes: 'monitor',
        next_no: 'ventilate',
      },
      {
        id: 'ventilate',
        time_sec: 60,
        title_ru: '⚡ START VENTILATION (within Golden Minute)',
        body: 'Bag-mask ventilation 40 breaths/min. Pressure ~20-30 cm H₂O (gauge if available, otherwise judge by chest rise).\n\nKey rule: chest must rise. If no rise — reposition head, check mask seal, suction если obstructed.',
        is_critical: true,
        next_yes: 'reassess_hr',
      },
      {
        id: 'reassess_hr',
        time_sec: 90,
        title_ru: 'Reassess HR @ 30 sec ventilation',
        body: 'HR > 100 + breathing — continue support, observe.\nHR 60-99 — continue ventilation, improve technique.\nHR < 60 — call for help, continue ventilation, consider chest compressions (advanced — depends on resources).',
        is_decision: true,
        is_critical: true,
        next_yes: 'help',
        next_no: 'monitor',
      },
      {
        id: 'help',
        time_sec: 120,
        title_ru: 'Call for HELP — advanced support',
        body: 'HBB framework recognizes resource-limited settings. If HR remains < 60 после adequate ventilation — call senior provider, advanced equipment if available, transport.\n\nContinue ventilation throughout.',
      },
      {
        id: 'monitor',
        time_sec: 180,
        title_ru: 'Monitor + post-resuscitation care',
        body: 'Continuous observation. Skin-to-skin (if stable). Initiate breast-feeding. Vital signs q15-30 min × 2 hours.',
      },
    ],
  },
  {
    id: 'rf',
    name_ru: 'МЗ РФ (Россия)',
    name_en: 'РФ Приказ МЗ 04.03.2020',
    source: 'Приказ Минздрава России от 04.03.2020 №228н "Реанимационная помощь новорождённым в родзале"',
    references: [
      'Приказ МЗ РФ от 04.03.2020 №228н',
      'КР МЗ РФ "Сердечно-лёгочная реанимация у новорождённого" 2024',
      'Российское общество неонатологов 2023',
    ],
    steps: [
      {
        id: 'preparation',
        time_sec: -60,
        title_ru: 'Подготовка к родам',
        body: 'Согретый источник лучистого тепла. Реанимационный стол. Аппарат ИВЛ (T-piece или Neopuff). ETT 2.5/3.0/3.5. Стерильное одеяло.\n\nКомандный брифинг.',
      },
      {
        id: 'birth',
        time_sec: 0,
        title_ru: 'Рождение — оценка',
        body: 'Доношенность? Чистые околоплодные воды? Дышит/кричит? Хороший мышечный тонус?\n\nЕсли ВСЁ ДА → оставить на животе матери, обтереть, отсроченное пережатие пуповины ≥ 60 сек.\n\nЕсли что-то НЕТ → реанимационный стол.',
        is_decision: true,
        next_yes: 'with_mother',
        next_no: 'initial_steps',
      },
      {
        id: 'with_mother',
        time_sec: 30,
        title_ru: 'Кенгуру + DCC ≥ 60 сек',
        body: 'Skin-to-skin с матерью. Отсроченное пережатие пуповины. Накрыть тёплым одеялом. Apgar 1 мин.',
      },
      {
        id: 'initial_steps',
        time_sec: 30,
        title_ru: 'Начальные мероприятия (30 сек)',
        body: 'Согреть (реанимационный стол с лучистым теплом). Положение sniffing (валик под плечами). Освободить дыхательные пути (ascpiration only если obstruction). Обтереть, тактильная стимуляция.',
        next_yes: 'first_assess',
      },
      {
        id: 'first_assess',
        time_sec: 60,
        title_ru: 'Оценка дыхания + ЧСС',
        body: 'Регулярное дыхание + ЧСС > 100? Цианоз?\n\nДА (есть всё) — продолжать наблюдение, контроль SpO₂ через right hand.\nНЕТ дыхания / есть gasping / ЧСС < 100 → НАЧАТЬ ИВЛ.',
        is_decision: true,
        is_critical: true,
        next_yes: 'observe',
        next_no: 'start_ivl',
      },
      {
        id: 'observe',
        time_sec: 60,
        title_ru: 'Наблюдение + SpO₂',
        body: 'Pulse oximeter on right hand (preductal). Sat goals:\n1 мин: 60-65%\n2 мин: 65-70%\n3 мин: 70-75%\n5 мин: 80-85%\n10 мин: 85-95%\n\nCPAP 5-7 см H₂O при respiratory distress.',
      },
      {
        id: 'start_ivl',
        time_sec: 60,
        title_ru: '⚡ ИВЛ — самый важный шаг',
        body: 'Bag-mask или T-piece. ЧДД 40-60/мин. PIP 20-25 см H₂O (term), 20-25 (preterm). PEEP 5 см H₂O.\n\nFiO₂ начало: 21% term, 30% preterm.\n\nПРОВЕРИТЬ экскурсию грудной клетки.',
        is_critical: true,
        next_yes: 'reassess_ivl',
      },
      {
        id: 'reassess_ivl',
        time_sec: 90,
        title_ru: 'Реоценка через 30 сек ИВЛ',
        body: 'ЧСС > 100 → продолжать ИВЛ + наблюдение.\nЧСС 60-99 → продолжать ИВЛ, улучшить технику (M-R SOPA / российский эквивалент: маска, репозиция, санация, открыть рот, давление, alternate airway).\nЧСС < 60 → переход к компрессиям.',
        is_decision: true,
        is_critical: true,
        next_yes: 'compressions',
        next_no: 'continue_ivl',
      },
      {
        id: 'continue_ivl',
        time_sec: 120,
        title_ru: 'Продолжение ИВЛ',
        body: 'ИВЛ до spontaneous adequate breathing + ЧСС > 100. Постепенно снижать FiO₂ к target SpO₂. Решение об интубации при > 5 мин ИВЛ через маску.',
      },
      {
        id: 'compressions',
        time_sec: 120,
        title_ru: '⚡ ЧСС < 60 — Компрессии грудной клетки',
        body: 'Интубация trachealis (ETT). Компрессии:вентиляция 3:1. 90 компрессий/мин + 30 вентиляций/мин. Глубина 1/3 AP диаметра. Two-thumb technique.\n\nFiO₂ 100%.',
        is_critical: true,
        next_yes: 'epi',
      },
      {
        id: 'epi',
        time_sec: 180,
        title_ru: 'ЧСС < 60 после 60 сек компрессий — Адреналин',
        body: 'Адреналин 0.01-0.03 мг/кг IV (предпочтительно через UVC) каждые 3-5 мин. Концентрация 1:10000 (0.1 мг/мл).\n\nЭндотрахеально (если IV нет): 0.05-0.1 мг/кг — однократно.\n\nВолемическая поддержка: 10 мл/кг NaCl 0.9% при гиповолемии.',
        is_critical: true,
        next_yes: 'final_decision',
      },
      {
        id: 'final_decision',
        time_sec: 600,
        title_ru: 'Решение через 10-20 мин',
        body: 'Прогрессирующее улучшение → продолжать с переводом в ОРИТН.\n\nЧСС не определяется или < 60 через 20 мин полноценной реанимации — обсудить прекращение реанимации (МЗ РФ Приказ 228н — учитывать GA, причину, family).',
        is_decision: true,
      },
    ],
  },
];

export default function ResuscitationFlowchart() {
  const [region, setRegion] = useState<RegionId>('rf');
  const [currentStep, setCurrentStep] = useState<string>('preparation');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBeepRef = useRef<number>(-1);

  const protocol = PROTOCOLS.find((p) => p.id === region);
  const currentStepObj = protocol?.steps.find((s) => s.id === currentStep);

  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([100, 50, 100]);
    }
  }, []);

  // Timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSec((s) => {
          const next = s + 1;
          // Tactile feedback at 30, 60, 300, 600 seconds
          if ([30, 60, 300, 600].includes(next) && lastBeepRef.current !== next) {
            lastBeepRef.current = next;
            triggerHaptic();
          }
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, triggerHaptic]);

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSec(0);
    lastBeepRef.current = -1;
    setCurrentStep('preparation');
  };

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      // Move past preparation
      if (currentStep === 'preparation') {
        const firstActive = protocol?.steps.find((s) => s.id !== 'preparation');
        if (firstActive) setCurrentStep(firstActive.id);
      }
    } else {
      setIsRunning(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!protocol || !currentStepObj) return null;

  const currentIndex = protocol.steps.findIndex((s) => s.id === currentStep);

  const goToStep = (stepId: string) => {
    const step = protocol.steps.find((s) => s.id === stepId);
    if (step) setCurrentStep(stepId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Region selector */}
      <div role="tablist" aria-label="Выбор протокола" style={{
        display: 'flex', gap: 6, flexWrap: 'wrap',
      }}>
        {PROTOCOLS.map((p) => {
          const isActive = region === p.id;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setRegion(p.id);
                handleReset();
              }}
              style={{
                padding: '8px 14px',
                background: isActive ? '#2563EB' : '#F5F6F8',
                color: isActive ? '#FFFFFF' : '#374151',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                transition: 'background 150ms',
              }}
            >
              {p.name_ru}
            </button>
          );
        })}
      </div>

      {/* Timer + step counter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        padding: '14px 18px',
        background: '#0F172A',
        borderRadius: 12,
        color: '#FFFFFF',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.7, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Прошло времени
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1, marginTop: 4 }}>
            {formatTime(elapsedSec)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleStart}
            style={{
              padding: '10px 18px',
              background: isRunning ? '#EF4444' : '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            {isRunning ? 'Пауза' : (elapsedSec === 0 ? 'Старт' : 'Продолжить')}
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 18px',
              background: '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            Сброс
          </button>
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>
          Шаг {currentIndex + 1} / {protocol.steps.length}
        </div>
      </div>

      {/* Current step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepObj.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          style={{
            padding: '20px 22px',
            background: currentStepObj.is_critical ? '#FEF2F2' : '#FFFFFF',
            borderRadius: 14,
            border: `2px solid ${currentStepObj.is_critical ? '#DC2626' : '#E5E7EB'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: currentStepObj.is_critical ? '#991B1B' : '#9CA3AF',
            }}>
              {currentStepObj.time_sec >= 0
                ? `~ ${formatTime(currentStepObj.time_sec)}`
                : 'до родов'}
            </span>
            {currentStepObj.is_critical && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px var(--space-2)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                background: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06), inset 0 0 0 1px #FECACA',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem', fontWeight: 700,
                color: '#DC2626',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                КРИТИЧНО
              </span>
            )}
            {currentStepObj.is_decision && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px var(--space-2)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                background: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem', fontWeight: 700,
                color: '#1D4ED8',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                РЕШЕНИЕ
              </span>
            )}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18, fontWeight: 700,
            color: '#111827', margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}>
            {currentStepObj.title_ru}
          </h3>
          <p style={{
            fontSize: 14, lineHeight: 1.6, color: '#374151',
            margin: 0, whiteSpace: 'pre-line',
          }}>
            {currentStepObj.body}
          </p>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            {currentStepObj.is_decision && currentStepObj.next_yes && (
              <button
                onClick={() => goToStep(currentStepObj.next_yes!)}
                style={{
                  padding: '10px 18px',
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                Да → {protocol.steps.find((s) => s.id === currentStepObj.next_yes)?.title_ru.slice(0, 30) ?? 'Далее'}…
              </button>
            )}
            {currentStepObj.is_decision && currentStepObj.next_no && (
              <button
                onClick={() => goToStep(currentStepObj.next_no!)}
                style={{
                  padding: '10px 18px',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                Нет → {protocol.steps.find((s) => s.id === currentStepObj.next_no)?.title_ru.slice(0, 30) ?? 'Далее'}…
              </button>
            )}
            {!currentStepObj.is_decision && currentStepObj.next_yes && (
              <button
                onClick={() => goToStep(currentStepObj.next_yes!)}
                style={{
                  padding: '10px 18px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                Далее: {protocol.steps.find((s) => s.id === currentStepObj.next_yes)?.title_ru.slice(0, 30) ?? ''}…
              </button>
            )}
            {currentIndex > 0 && (
              <button
                onClick={() => {
                  const prev = protocol.steps[currentIndex - 1];
                  if (prev) goToStep(prev.id);
                }}
                style={{
                  padding: '10px 14px',
                  background: '#F5F6F8',
                  color: '#374151',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                }}
              >
                ← Назад
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Compact step list — for navigation overview */}
      <details style={{
        background: '#F5F6F8',
        borderRadius: 10,
        padding: '8px 14px',
      }}>
        <summary style={{
          cursor: 'pointer', fontSize: 13, fontWeight: 600,
          color: '#374151', padding: '4px 0',
        }}>
          Все шаги протокола ({protocol.steps.length})
        </summary>
        <ol style={{ margin: '10px 0 0', paddingLeft: 22, fontSize: 12.5 }}>
          {protocol.steps.map((s, i) => (
            <li key={s.id} style={{
              padding: '4px 0',
              color: s.id === currentStep ? '#2563EB' : '#374151',
              fontWeight: s.id === currentStep ? 600 : 400,
            }}>
              <button
                onClick={() => goToStep(s.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  fontWeight: 'inherit',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {s.time_sec >= 0 ? `${formatTime(s.time_sec)} — ` : ''}{s.title_ru}
                {s.is_critical && <span style={{ color: '#DC2626', marginLeft: 6 }}>⚡</span>}
              </button>
            </li>
          ))}
        </ol>
      </details>

      {/* Sources */}
      <section style={{
        padding: '16px 18px',
        background: '#F5F6F8',
        borderRadius: 12,
        fontSize: 12, color: '#4B5563', lineHeight: 1.55,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8,
        }}>
          Источник: {protocol.source}
        </div>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {protocol.references.map((ref, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{ref}</li>
          ))}
        </ol>
        <p style={{
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid #E5E7EB',
          fontSize: 11, color: '#6B7280',
          margin: '12px 0 0',
        }}>
          <strong style={{ color: '#1A1A1A' }}>Внимание:</strong> данный flowchart — образовательный
          tool. Не заменяет полный курс NRP / ERC NLS / HBB / российской программы реанимационной
          подготовки. Для практической работы — пройти certified course и иметь bedside helper card.
        </p>
      </section>
    </div>
  );
}

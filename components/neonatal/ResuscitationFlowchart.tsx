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

  // Design tokens
  const PILL_SHADOW = '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)';

  // Region flags
  const FLAGS: Record<RegionId, string> = {
    nrp: '🇺🇸',
    erc: '🇪🇺',
    hbb: '🌍',
    rf: '🇷🇺',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Intro card — explains what this is */}
      <div style={{
        padding: '14px 18px',
        background: '#F5F6F8',
        borderRadius: 14,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 6,
        }}>
          Алгоритм первичной реанимации н/р
        </div>
        <p style={{
          margin: 0, fontSize: 13.5, lineHeight: 1.55, color: '#4B5563',
        }}>
          Пошаговый протокол с таймером и тактильной обратной связью на 30/60/300/600 секунд.
          Выберите регион, нажмите Старт и следуйте подсказкам.
        </p>
      </div>

      {/* Region selector — design-system pills */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10,
        }}>
          Регион / протокол
        </div>
        <div role="tablist" aria-label="Выбор протокола" style={{
          display: 'flex', gap: 8, flexWrap: 'wrap',
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
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px',
                  borderRadius: 'var(--md-sys-shape-corner-full)',
                  background: isActive ? '#0F172A' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : 'var(--md-sys-color-on-surface-variant)',
                  border: 'none',
                  boxShadow: isActive ? 'none' : PILL_SHADOW,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem', fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                <span aria-hidden="true">{FLAGS[p.id]}</span>
                {p.name_ru}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timer card — clean white with subtle shadow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '18px 22px',
        background: '#FFFFFF',
        borderRadius: 16,
        boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 4px 12px rgba(16,24,40,0.08)',
        flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 120 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: '#9CA3AF',
            marginBottom: 4,
          }}>
            Прошло времени
          </div>
          <div style={{
            fontSize: 40, fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            lineHeight: 1, color: '#0F172A',
            letterSpacing: '-0.02em',
          }}>
            {formatTime(elapsedSec)}
          </div>
          <div style={{
            marginTop: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 500,
            color: '#9CA3AF', letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Шаг {currentIndex + 1} из {protocol.steps.length}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleStart}
            aria-label={isRunning ? 'Пауза таймера' : (elapsedSec === 0 ? 'Старт таймера' : 'Продолжить таймер')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 18px',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: isRunning ? '#FEF2F2' : '#ECFDF5',
              color: isRunning ? '#991B1B' : '#065F46',
              border: 'none',
              boxShadow: PILL_SHADOW,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem', fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              transition: 'background 200ms cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {isRunning ? '⏸ Пауза' : (elapsedSec === 0 ? '▶ Старт' : '▶ Продолжить')}
          </button>
          <button
            onClick={handleReset}
            aria-label="Сбросить таймер"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 18px',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              color: 'var(--md-sys-color-on-surface-variant)',
              border: 'none',
              boxShadow: PILL_SHADOW,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem', fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              transition: 'background 200ms cubic-bezier(0.22,1,0.36,1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8F9FA'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
          >
            ⟲ Сброс
          </button>
        </div>
      </div>

      {/* Current step card — softer accent than the old "red box" */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepObj.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          style={{
            padding: '22px 24px',
            background: '#FFFFFF',
            borderRadius: 16,
            boxShadow: currentStepObj.is_critical
              ? '0 1px 2px rgba(220,38,38,0.08), 0 4px 16px rgba(220,38,38,0.10), inset 4px 0 0 #DC2626'
              : '0 1px 2px rgba(16,24,40,0.06), 0 4px 12px rgba(16,24,40,0.08)',
          }}
        >
          {/* Pills row — current time + status pills */}
          <div style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap',
            gap: 8, marginBottom: 14,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px 10px',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: PILL_SHADOW,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {currentStepObj.time_sec >= 0
                ? `T+${formatTime(currentStepObj.time_sec)}`
                : 'До родов'}
            </span>
            {currentStepObj.is_critical && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                background: '#FFFFFF',
                boxShadow: PILL_SHADOW,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem', fontWeight: 700,
                color: '#DC2626',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                ⚡ Критично
              </span>
            )}
            {currentStepObj.is_decision && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                background: '#FFFFFF',
                boxShadow: PILL_SHADOW,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem', fontWeight: 700,
                color: '#1D4ED8',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                ◇ Решение
              </span>
            )}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20, fontWeight: 700,
            color: '#0F172A', margin: '0 0 14px',
            letterSpacing: '-0.015em', lineHeight: 1.25,
          }}>
            {currentStepObj.title_ru}
          </h3>
          <p style={{
            fontSize: 14, lineHeight: 1.6, color: '#374151',
            margin: 0, whiteSpace: 'pre-line',
          }}>
            {currentStepObj.body}
          </p>

          {/* Navigation row — design-system pills (white BG + colored stroke) */}
          <div style={{
            display: 'flex', gap: 8, marginTop: 22, flexWrap: 'wrap',
            paddingTop: 18, borderTop: '1px solid #F0F1F5',
          }}>
            {currentStepObj.is_decision && currentStepObj.next_yes && (
              <button
                onClick={() => goToStep(currentStepObj.next_yes!)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px',
                  borderRadius: 'var(--md-sys-shape-corner-full)',
                  background: '#FFFFFF',
                  color: '#065F46',
                  border: 'none',
                  boxShadow: '0 0 0 1.5px #10B981, 0 1px 3px rgba(16,185,129,0.15)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem', fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  transition: 'background 200ms cubic-bezier(0.22,1,0.36,1)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
              >
                ✓ Да → {protocol.steps.find((s) => s.id === currentStepObj.next_yes)?.title_ru.slice(0, 28) ?? 'Далее'}…
              </button>
            )}
            {currentStepObj.is_decision && currentStepObj.next_no && (
              <button
                onClick={() => goToStep(currentStepObj.next_no!)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px',
                  borderRadius: 'var(--md-sys-shape-corner-full)',
                  background: '#FFFFFF',
                  color: '#991B1B',
                  border: 'none',
                  boxShadow: '0 0 0 1.5px #DC2626, 0 1px 3px rgba(220,38,38,0.15)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem', fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  transition: 'background 200ms cubic-bezier(0.22,1,0.36,1)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
              >
                ✗ Нет → {protocol.steps.find((s) => s.id === currentStepObj.next_no)?.title_ru.slice(0, 28) ?? 'Далее'}…
              </button>
            )}
            {!currentStepObj.is_decision && currentStepObj.next_yes && (
              <button
                onClick={() => goToStep(currentStepObj.next_yes!)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px',
                  borderRadius: 'var(--md-sys-shape-corner-full)',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem', fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  transition: 'background 200ms cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {protocol.steps.find((s) => s.id === currentStepObj.next_yes)?.title_ru.slice(0, 32) ?? 'Далее'} →
              </button>
            )}
            {currentIndex > 0 && (
              <button
                onClick={() => {
                  const prev = protocol.steps[currentIndex - 1];
                  if (prev) goToStep(prev.id);
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px',
                  borderRadius: 'var(--md-sys-shape-corner-full)',
                  background: '#FFFFFF',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  border: 'none',
                  boxShadow: PILL_SHADOW,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem', fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  transition: 'background 200ms cubic-bezier(0.22,1,0.36,1)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8F9FA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
              >
                ← Назад
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Step roadmap — replaces the old <details> with a richer card */}
      <div style={{
        background: '#F5F6F8',
        borderRadius: 14,
        padding: '16px 18px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          marginBottom: 12,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: '#9CA3AF',
          }}>
            Карта шагов
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 500, color: '#9CA3AF',
          }}>
            {protocol.steps.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {protocol.steps.map((s, i) => {
            const isCurrent = s.id === currentStep;
            const isPast = i < currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => goToStep(s.id)}
                aria-current={isCurrent ? 'step' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 12px',
                  background: isCurrent ? '#FFFFFF' : 'transparent',
                  boxShadow: isCurrent ? PILL_SHADOW : 'none',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'background 200ms',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{
                  flexShrink: 0,
                  width: 22, height: 22,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  background: isPast ? '#10B981' : isCurrent ? '#0F172A' : '#FFFFFF',
                  color: isPast || isCurrent ? '#FFFFFF' : '#9CA3AF',
                  boxShadow: isCurrent || isPast ? 'none' : PILL_SHADOW,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10, fontWeight: 700,
                }}>
                  {isPast ? '✓' : i + 1}
                </span>
                <span style={{
                  flex: 1, minWidth: 0,
                  fontSize: 13, fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? '#0F172A' : '#374151',
                  lineHeight: 1.4,
                }}>
                  {s.title_ru}
                </span>
                {s.time_sec >= 0 && (
                  <span style={{
                    flexShrink: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 500,
                    color: '#9CA3AF',
                  }}>
                    {formatTime(s.time_sec)}
                  </span>
                )}
                {s.is_critical && (
                  <span aria-label="критичный шаг" style={{
                    flexShrink: 0,
                    color: '#DC2626', fontSize: 12,
                  }}>
                    ⚡
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sources — design-system style (matches other ref cards) */}
      <section
        aria-labelledby="resus-sources"
        style={{
          padding: '18px 20px',
          background: '#F5F6F8',
          borderRadius: 14,
          fontSize: 12.5, color: '#4B5563', lineHeight: 1.55,
        }}
      >
        <div id="resus-sources" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8,
        }}>
          Источник: {protocol.source}
        </div>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {protocol.references.map((ref, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{ref}</li>
          ))}
        </ol>
        <p style={{
          marginTop: 14, paddingTop: 12,
          borderTop: '1px solid #E5E7EB',
          fontSize: 12, color: '#6B7280',
          margin: '14px 0 0',
        }}>
          <strong style={{ color: '#1A1A1A' }}>Внимание:</strong> образовательный
          инструмент. Не заменяет certified course по NRP / ERC NLS / HBB / российской
          программе реанимационной подготовки. Для bedside работы — иметь институциональный
          helper card.
        </p>
      </section>
    </div>
  );
}

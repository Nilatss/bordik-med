// @ts-nocheck
/** Runner: mims */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'region',
      label: 'Регион MIMS',
      type: 'select',
      options: [
        { value: 'uk', label: 'MIMS UK' },
        { value: 'singapore', label: 'MIMS Singapore' },
        { value: 'malaysia', label: 'MIMS Malaysia' },
        { value: 'hongkong', label: 'MIMS Hong Kong' },
        { value: 'philippines', label: 'MIMS Philippines' },
        { value: 'india', label: 'MIMS India' },
        { value: 'australia', label: 'MIMS Australia' },
      ],
    },
    {
      id: 'drug',
      label: 'Препарат',
      type: 'select',
      options: [
        { value: 'amoxicillin', label: 'Amoxicillin' },
        { value: 'metformin', label: 'Metformin' },
        { value: 'paracetamol', label: 'Paracetamol' },
        { value: 'atorvastatin', label: 'Atorvastatin' },
        { value: 'amlodipine', label: 'Amlodipine' },
      ],
    },
  ],
  compute: (v) => {
    const r = String(v.region);
    const d = String(v.drug);
    const regions: Record<string, string> = {
      uk: 'MIMS UK — mims.co.uk (HCP подписка)',
      singapore: 'MIMS Singapore — mims.com/singapore',
      malaysia: 'MIMS Malaysia — mims.com/malaysia',
      hongkong: 'MIMS Hong Kong — mims.com/hongkong',
      philippines: 'MIMS Philippines — mims.com/philippines',
      india: 'MIMS India — mims.com/india',
      australia: 'MIMS Australia — mimsonline.com.au',
    };
    const sampleBrands: Record<string, Record<string, string>> = {
      amoxicillin: {
        uk: 'Amoxil, Amix', singapore: 'Moxilen, Amoxil', malaysia: 'Moxilen, Ospamox',
        hongkong: 'Amoxil, Moxilin', philippines: 'Himox, Moxilin', india: 'Mox, Novamox', australia: 'Amoxil, Alphamox',
      },
      metformin: {
        uk: 'Glucophage, Metabet', singapore: 'Glucophage, Diaformin', malaysia: 'Glucophage, Diabemin',
        hongkong: 'Glucophage', philippines: 'Glucophage, Glumet', india: 'Glycomet, Obimet', australia: 'Diabex, Diaformin',
      },
      paracetamol: {
        uk: 'Panadol, Calpol', singapore: 'Panadol, Uphamol', malaysia: 'Panadol, Uphamol',
        hongkong: 'Panadol', philippines: 'Biogesic, Calpol', india: 'Crocin, Dolo 650', australia: 'Panadol, Panamax',
      },
      atorvastatin: {
        uk: 'Lipitor', singapore: 'Lipitor, Xarator', malaysia: 'Lipitor',
        hongkong: 'Lipitor', philippines: 'Lipitor, Avamax', india: 'Atorlip, Storvas', australia: 'Lipitor, Torvastat',
      },
      amlodipine: {
        uk: 'Istin', singapore: 'Norvasc', malaysia: 'Norvasc',
        hongkong: 'Norvasc', philippines: 'Norvasc', india: 'Amlong, Amlopres', australia: 'Norvasc',
      },
    };
    const brand = (sampleBrands[d] && sampleBrands[d][r]) || '—';
    return {
      value: brand,
      unit: `MIMS ${r.toUpperCase()}`,
      interpretation: `Бренды ${d} в регионе: ${brand}`,
      color: '#22C55E',
      details: `Регион: ${regions[r] || r}\nПрепарат (МНН): ${d}\nТиповые бренды региона: ${brand}\n\nMIMS (Monthly Index of Medical Specialities) — региональный формуляр с локальными дозировками, комбинированными формами и доступностью.`,
      actions: [
        `Открыть портал региона: ${regions[r] || 'mims.com'}`,
        'Найти препарат по МНН / торговому наименованию',
        'Проверить разделы: Dosage, Contraindications, Adverse Reactions, Local Availability',
        'Cross-check с национальным формуляром (BNF для UK, AMH для Австралии)',
      ],
      caveats: [
        'MIMS — коммерческий справочник, требует подписку (HCP verification)',
        'Состав и дозировки могут отличаться между регионами',
        'Для UK официальным источником остаётся BNF; MIMS используется как дополнение',
        'В Азии MIMS — основной практический справочник для частной практики',
      ],
      related: [
        { id: 'bnf', title: 'BNF (UK)' },
        { id: 'martindale', title: 'Martindale' },
        { id: 'asia-drug', title: 'Фармакопеи Азии' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '308.5', title: 'Международная фармакотерапия' },
      ],
    };
  },
  reference: 'MIMS (Monthly Index of Medical Specialities). https://www.mims.com/',
  countries: 'Великобритания · Азия (Сингапур, Малайзия, Гонконг, Филиппины, Индия) · Австралия',
  presets: [
    { label: 'Amoxicillin — Singapore', values: { region: 'singapore', drug: 'amoxicillin' } },
    { label: 'Paracetamol — India', values: { region: 'india', drug: 'paracetamol' } },
    { label: 'Atorvastatin — Australia', values: { region: 'australia', drug: 'atorvastatin' } },
  ],
  info: `### Для чего используется\n**MIMS** — региональный справочник лекарственных препаратов, распространённый в UK, Юго-Восточной Азии, Австралии и Индии. Основной источник для врачей первичного звена в этих регионах.\n\n### Региональные издания\n| Регион | Портал |\n|---|---|\n| UK | mims.co.uk |\n| Singapore | mims.com/singapore |\n| Malaysia | mims.com/malaysia |\n| Hong Kong | mims.com/hongkong |\n| Philippines | mims.com/philippines |\n| India | mims.com/india |\n| Australia | mimsonline.com.au |\n\n### Когда применять\n- Практика в UK / APAC регионе\n- Поиск локальных брендов при межстрановой миграции\n- Проверка комбинированных препаратов, популярных в Азии (FDC)\n- Сравнение цен / доступности в разных юрисдикциях\n\n### Источник\nhttps://www.mims.com/`,
};
export default runner;

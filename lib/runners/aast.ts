/** Runner: aast - AAST Organ Injury Scale (OIS) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'organ',
      label: 'Орган',
      type: 'select',
      options: [
        { value: 'spleen', label: 'Селезёнка' },
        { value: 'liver', label: 'Печень' },
        { value: 'kidney', label: 'Почка' },
        { value: 'pancreas', label: 'Поджелудочная железа' },
        { value: 'sbowel', label: 'Тонкая кишка' },
        { value: 'colon', label: 'Ободочная кишка' },
        { value: 'rectum', label: 'Прямая кишка' },
      ],
    },
    {
      id: 'grade',
      label: 'Степень повреждения (I-V/VI)',
      type: 'select',
      options: [
        { value: '1', label: 'I - минимальное' },
        { value: '2', label: 'II - умеренное' },
        { value: '3', label: 'III - значимое' },
        { value: '4', label: 'IV - тяжёлое' },
        { value: '5', label: 'V - массивное / devascularisation' },
        { value: '6', label: 'VI - несовместимое с жизнью (только liver/kidney)' },
      ],
    },
  ],
  compute: (v) => {
    const organ = String(v.organ);
    const grade = Number(v.grade);

    const descriptions: Record<string, Record<number, string>> = {
      spleen: {
        1: 'Субкапсулярная гематома < 10%, разрыв капсулы < 1 см',
        2: 'Гематома 10-50% или интрапаренхиматозная < 5 см; разрыв 1-3 см',
        3: 'Гематома > 50% или разрыв > 3 см / вовлечение сегментарных сосудов',
        4: 'Разрыв > 25% devascularisation сегмента/доли',
        5: 'Размозжение / полное сосудистое повреждение с devascularisation',
      },
      liver: {
        1: 'Субкапсулярная < 10%, разрыв капсулы < 1 см',
        2: 'Гематома 10-50% или < 10 см интрапаренхиматозной; разрыв 1-3 см',
        3: '> 50% субкапсулярной / > 10 см интрапаренх.; разрыв > 3 см',
        4: 'Разрыв 25-75% доли (1-3 сегмента Couinaud)',
        5: 'Разрыв > 75% доли / юкстакавальная вена / центральная печёночная вена',
        6: 'Avulsion hepatic (несовместимо с жизнью)',
      },
      kidney: {
        1: 'Контузия/субкапсулярная гематома, гематурия без разрыва',
        2: 'Околопочечная гематома < 1 см; разрыв коркового вещества < 1 см без urinary extravasation',
        3: 'Разрыв > 1 см без вовлечения ЧЛС или extravasation',
        4: 'Разрыв до ЧЛС / extravasation; повреждение сегментарной артерии/вены',
        5: 'Размозжение / avulsion сосудистой ножки (ренальная артерия/вена)',
      },
      pancreas: {
        1: 'Малая контузия / поверхностный разрыв без нарушения протока',
        2: 'Значимая контузия / разрыв без протока',
        3: 'Дистальное (слева от мезентериальных сосудов) повреждение протока',
        4: 'Проксимальное (справа от мезентериальных сосудов) повреждение с вовлечением ampulla',
        5: 'Массивное размозжение головки поджелудочной железы',
      },
      sbowel: {
        1: 'Контузия / гематома без devascularisation; частичный разрыв без перфорации',
        2: 'Разрыв < 50% окружности',
        3: 'Разрыв ≥ 50% без transection',
        4: 'Transection без потери ткани',
        5: 'Transection с потерей ткани / devascularisation сегмента',
      },
      colon: {
        1: 'Контузия / гематома без devascularisation; частичный разрыв',
        2: 'Разрыв < 50% окружности',
        3: 'Разрыв ≥ 50% без transection',
        4: 'Transection',
        5: 'Transection с потерей ткани / devascularisation сегмента',
      },
      rectum: {
        1: 'Контузия / гематома без devascularisation; частичный разрыв',
        2: 'Разрыв < 50%',
        3: 'Разрыв ≥ 50%',
        4: 'Full-thickness с extension в промежность',
        5: 'Devascularisation сегмента',
      },
    };

    const organLabels: Record<string, string> = {
      spleen: 'Селезёнка',
      liver: 'Печень',
      kidney: 'Почка',
      pancreas: 'Поджелудочная железа',
      sbowel: 'Тонкая кишка',
      colon: 'Ободочная кишка',
      rectum: 'Прямая кишка',
    };

    const desc = descriptions[organ]?.[grade] || 'Нет описания для данной комбинации';
    let interpretation = '', color = '#22C55E';
    if (grade <= 2) { interpretation = 'Низкая степень - кандидат на нехирургическое ведение (NOM)'; color = '#22C55E'; }
    else if (grade === 3) { interpretation = 'Умеренная - NOM при стабильности + IR при необходимости'; color = '#F59E0B'; }
    else if (grade === 4) { interpretation = 'Тяжёлая - высокий риск NOM failure, часто нужна хирургия/эмболизация'; color = '#EF4444'; }
    else { interpretation = 'Массивное повреждение - хирургия / damage control'; color = '#991B1B'; }

    const actions: string[] = [];
    if (organ === 'spleen') {
      if (grade <= 3) actions.push('NOM у гемодинамически стабильных: ICU наблюдение, серийные Hb, постельный режим 1-3 дня');
      if (grade >= 3) actions.push('Angioembolisation при контрастном blush, pseudoaneurysm, AV-fistula');
      if (grade >= 4) actions.push('Splenectomy при нестабильности / NOM failure; вакцинация post-splenectomy (S. pneumoniae, N. meningitidis, H. influenzae)');
    } else if (organ === 'liver') {
      if (grade <= 3) actions.push('NOM - стандарт у стабильных; ICU + серийные Hb + FAST/КТ контроль');
      actions.push('Angioembolisation при blush на КТ, pseudoaneurysm');
      if (grade >= 4) actions.push('Damage control surgery: packing, Pringle maneuver, temporary closure; planned relaparotomy 24-48 ч');
    } else if (organ === 'kidney') {
      if (grade <= 3) actions.push('NOM у стабильных, urine output monitoring');
      if (grade === 4) actions.push('Angioembolisation; стент при extravasation; nephron-sparing');
      if (grade === 5) actions.push('Nephrectomy (часто) при avulsion сосудистой ножки');
    } else if (organ === 'pancreas') {
      if (grade >= 3) actions.push('Distal pancreatectomy при повреждении дистального протока; Whipple при головке - редко (damage control)');
      actions.push('ERCP/stent при отсрочке операции');
    } else if (organ === 'sbowel' || organ === 'colon' || organ === 'rectum') {
      actions.push('Хирургия: primary repair (grade 1-2), segmental resection (grade 3-4), damage control + stoma (grade 5 / contamination)');
      actions.push('Broad-spectrum антибиотики: пиперациллин/тазобактам или цефтриаксон + метронидазол');
    }
    actions.push('Tranexamic acid 1 г < 3 ч при признаках кровотечения (CRASH-2)');
    actions.push('MTP при SI > 1,0 / ABC score ≥ 2');

    return {
      value: `${organLabels[organ]} grade ${grade}`,
      unit: '',
      interpretation,
      color,
      details: desc,
      actions,
      caveats: [
        'AAST OIS - анатомическая, а не клиническая шкала; оценивается ИНТРАОПЕРАЦИОННО или по КТ',
        'WSES Grading Systems (2016-2020) - ведут решение о NOM vs OM, объединяют AAST + гемодинамику + CT findings',
        'Kozar et al. 2018 - обновлённая AAST для liver/spleen/kidney включает пальпируемый активный кровотечения / AV-shunt / pseudoaneurysm (vascular injury)',
        'NOM успех: спасельсе 80-90% (stable), печень 85-95%, почка 85-95%, НО высокий grade + blush → чаще failure',
        'При колопроктологических травмах - обязательна антибиотикопрофилактика и быстрая ХО',
      ],
      related: [
        { id: 'fast-us', title: 'FAST / eFAST' },
        { id: 'iss', title: 'ISS / NISS' },
        { id: 'rts', title: 'RTS' },
        { id: 'triss', title: 'TRISS' },
        { id: 'shock-index', title: 'Shock Index' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '302.2', title: 'Травматология' },
      ],
    };
  },
  reference: 'Moore EE, Shackford SR, Pachter HL et al. Organ injury scaling: spleen, liver, and kidney. J Trauma 1989;29:1664. Moore EE et al. Revisions for pancreas, duodenum, small bowel, colon, rectum. J Trauma 1990;30:1427 & 1995;39:1069. Kozar RA et al. Organ injury scaling 2018 update: spleen, liver, kidney. J Trauma Acute Care Surg 2018;85:1119-22.',
  countries: 'Международный (AAST, США)',
  presets: [
    { label: 'Селезёнка I (минимальная субкапсулярная)', values: { organ: 'spleen', grade: '1' } },
    { label: 'Печень IV (тяжёлый разрыв доли)', values: { organ: 'liver', grade: '4' } },
    { label: 'Почка V (avulsion сосудистой ножки)', values: { organ: 'kidney', grade: '5' } },
    { label: 'Тонкая кишка III (разрыв > 50%)', values: { organ: 'sbowel', grade: '3' } },
  ],
  info: `### Для чего используется
**AAST Organ Injury Scale (OIS)** - стандартная анатомическая классификация повреждений органов при тупой и проникающей травме. Используется для:
- **Документирования** степени травмы (стандартизация между центрами)
- **Прогноза** и планирования NOM (non-operative management) vs OM
- **Научных сравнений** и регистров травмы

### Градация I-V (печень/почка до VI)
| Grade | Общий принцип |
|---|---|
| **I** | Минимальное (малая гематома / поверхностный разрыв) |
| **II** | Умеренное (гематома 10-50%, разрыв 1-3 см) |
| **III** | Значимое (> 50% или глубокий разрыв) |
| **IV** | Тяжёлое (devascularisation сегмента/доли, вовлечение сосудов/протока) |
| **V** | Массивное (размозжение, avulsion сосудистой ножки) |
| **VI** | Hepatic/renal avulsion (несовместимо с жизнью) |

### Ключевые органы (наиболее используемые)
**Селезёнка** (Moore 1989, обновление Kozar 2018):
- I: < 10% субкапсулярная / разрыв < 1 см
- V: полное devascularisation / размозжение

**Печень** (аналогично):
- VI: hepatic avulsion - incompatible with life

**Почка**:
- V: avulsion сосудистой ножки - нефрэктомия (часто)

### Обновление 2018 (Kozar)
Для **спленической, печёночной и почечной** - добавлен **vascular injury** (pseudoaneurysm, AV-fistula, активное кровотечение/blush) как критерий повышения grade при НЕинвазивной оценке (КТ).

### NOM - показания
- Гемодинамическая **стабильность** (SBP > 90, HR < 120)
- Отсутствие перитонита
- Отсутствие других показаний к лапаротомии
- Возможность ICU наблюдения и быстрой хирургии при failure

### WSES Grading (2016+)
Комбинирует AAST + гемодинамику + КТ + blush:
- **Minor** (hemodynamically stable, AAST I-II)
- **Moderate** (stable, AAST III)
- **Severe** (stable, AAST IV-V) или unstable
- **Non-operative vs operative** - зависит от ресурсов, blush, ответа на ресусцитацию

### Источники
Moore EE et al. *J Trauma* 1989;29:1664 (spleen, liver, kidney). Kozar RA et al. *J Trauma Acute Care Surg* 2018;85:1119 (update). WSES guidelines 2017-2020 (spleen, liver, pancreas, kidney).
`,
};

export default runner;

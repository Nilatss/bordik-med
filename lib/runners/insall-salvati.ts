/** Runner: insall-salvati - Insall-Salvati & Caton-Deschamps ratio (patellar height) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'tl',
      hint: 'Размер в миллиметрах',
      label: 'TL - длина сухожилия надколенника (lateral X-ray, flexion 20-30°)',
      type: 'number',
      unit: 'мм',
      min: 10,
      max: 120,
      step: 0.5,
      quickValues: [35, 40, 45, 50, 55, 60],
    },
    {
      id: 'pl',
      hint: 'Размер в миллиметрах',
      label: 'PL - длина надколенника (максимальная диагональ)',
      type: 'number',
      unit: 'мм',
      min: 10,
      max: 100,
      step: 0.5,
      quickValues: [35, 40, 45, 50, 55],
    },
  ],
  compute: (v) => {
    const tl = Number(v.tl);
    const pl = Number(v.pl);
    const ratio = tl / pl;
    const val = ratio.toFixed(2);
    let interpretation = '', color = '#22C55E', details = '';
    let actions: string[] = [];
    if (ratio > 1.2) {
      interpretation = 'Patella alta (высокое стояние надколенника)';
      color = '#EF4444';
      details = 'IS > 1,2 - patella alta. Ассоциирована с нестабильностью надколенника (рецидивирующий вывих), chondromalacia, patellofemoral pain, разрывом PCL/ACL. Входит в факторы TTOS (trochlear dysplasia, TT-TG > 20 мм, patella alta, patellar tilt).';
      actions = [
        'Оценить TT-TG (КТ/МРТ) - > 20 мм хирургическое показание',
        'Trochlear dysplasia по Dejour (A-D)',
        'Tibial tubercle distalization (Fulkerson/Caton-Deschamps) при рецидивирующей нестабильности',
        'MPFL reconstruction при первом/втором вывихе без тяжёлой дисплазии',
      ];
    } else if (ratio < 0.8) {
      interpretation = 'Patella baja (низкое стояние надколенника)';
      color = '#F59E0B';
      details = 'IS < 0,8 - patella baja/infera. Причины: послеоперационная контрактура (post-TKA, ACL reconstruction), болезнь Hoffa, посттравматическая, juvenile RA, ахондроплазия. Ограничивает flexion, повышает patellofemoral contact pressure.';
      actions = [
        'Оценить причину: ятрогения, контрактура, заболевание',
        'Aggressive PT на восстановление ROM',
        'Proximalization tibial tubercle (остеотомия) в рефрактерных случаях',
        'Пересмотреть уровень суставной линии при revision TKA',
      ];
    } else {
      interpretation = 'Нормальное положение надколенника';
      color = '#22C55E';
      details = 'IS 0,8-1,2 - норма. Рекомендуется подтвердить Caton-Deschamps (AT/AP, норма 0,6-1,3) - менее зависима от формы надколенника и более надёжна post-TKA.';
      actions = [
        'При клинике нестабильности - МРТ (MPFL, хрящ, TT-TG)',
        'Оценить Caton-Deschamps ratio дополнительно',
      ];
    }
    return {
      value: val,
      unit: '',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Измерять на lateral X-ray с flexion 20-30° (при большем сгибании ratio меняется)',
        'IS ненадёжен при дисморфных надколенниках (Wiberg III, bipartite) - использовать Caton-Deschamps',
        'Caton-Deschamps (AT/AP): AT от нижнего полюса надколенника до переднего верхнего края плато большеберцовой кости; AP - длина суставной поверхности надколенника. Норма 0,6-1,3; < 0,6 baja; > 1,3 alta',
        'Blackburne-Peel ratio - альтернатива при post-TKA',
        'Post-TKA patella baja может развиваться за счёт scarring patellar tendon - профилактика ранней PT',
      ],
      scale: {
        segments: [
          { min: 0.4, max: 0.8, label: 'Baja', color: '#F59E0B' },
          { min: 0.8, max: 1.2, label: 'Норма', color: '#22C55E' },
          { min: 1.2, max: 2.0, label: 'Alta', color: '#EF4444' },
        ],
        current: Number(val),
        unit: '',
      },
      related: [
        { id: 'ikdc', title: 'IKDC / Lysholm / KOOS' },
        { id: 'outerbridge', title: 'Outerbridge / ICRS' },
        { id: 'schatzker', title: 'Schatzker (tibial plateau)' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Травматология' },
      ],
    };
  },
  reference: 'Insall J, Salvati E. Patella position in the normal knee joint. Radiology 1971;101:101-4. Caton J, Deschamps G, Chambat P, Lerat JL, Dejour H. Patella infera: apropos of 128 cases. Rev Chir Orthop 1982;68:317-25.',
  countries: 'Международный',
  presets: [
    { label: 'Норма', values: { tl: 50, pl: 50 } },
    { label: 'Patella alta (рецидивирующий вывих)', values: { tl: 60, pl: 45 } },
    { label: 'Post-TKA baja', values: { tl: 32, pl: 45 } },
  ],
  info: `### Для чего используется
**Insall-Salvati (1971)** - простое измерение **высоты надколенника** на lateral X-ray. Используется для диагностики **patella alta/baja**, планирования хирургии нестабильности надколенника, оценки post-TKA patellar height.

### Формула
\`IS = TL / PL\`

- **TL** - длина сухожилия надколенника (от нижнего полюса patella до верхнего края бугристости большеберцовой кости)
- **PL** - максимальная диагональная длина надколенника
- Снимок: **lateral X-ray, flexion 20-30°**

### Интерпретация
| IS ratio | Интерпретация |
|---|---|
| < 0,8 | Patella baja (низкое) |
| 0,8-1,2 | Норма |
| > 1,2 | Patella alta (высокое) |

### Caton-Deschamps ratio (CD, 1982)
\`CD = AT / AP\`
- **AT** - расстояние от нижнего полюса patella до передне-верхнего края tibial plateau
- **AP** - длина суставной поверхности patella

| CD ratio | Интерпретация |
|---|---|
| < 0,6 | Baja |
| 0,6-1,3 | Норма |
| > 1,3 | Alta |

**CD надёжнее IS** при дисморфных patella и post-TKA (не зависит от формы patella tendon insertion).

### Blackburne-Peel ratio
Альтернатива, использует линию tibial plateau; норма 0,5-1,0.

### Patella alta - клиника
- Рецидивирующий вывих надколенника
- Patellofemoral pain
- Chondromalacia patellae
- Фактор в **«4 факторах нестабильности»** (Dejour): trochlear dysplasia, TT-TG > 20 мм, patella alta (CD > 1,2), patellar tilt

### Patella baja - причины
- **Ятрогения**: post-TKA (elevation joint line), ACL reconstruction, HTO
- Контрактура после длительной иммобилизации
- Hoffa's disease (impingement жировой подушки)
- JIA, ахондроплазия
- Post-traumatic (quadriceps/patellar tendon injury)

### Лечение
| Состояние | Подход |
|---|---|
| Patella alta + рецидивирующий вывих | Tibial tubercle **distalization** (Caton-Deschamps, Fulkerson) ± MPFL recon |
| Patella alta + TT-TG > 20 мм | Tubercle medialization + distalization |
| Patella baja (post-TKA) | Revision с восстановлением joint line, aggressive PT |
| Patella baja идиопатическая | PT, растяжка, в рефрактерных - proximalization |

### Источник
Insall J, Salvati E. *Radiology* 1971;101:101. Caton J et al. *Rev Chir Orthop* 1982;68:317.
`,
};

export default runner;

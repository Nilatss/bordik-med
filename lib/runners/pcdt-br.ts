// @ts-nocheck
/** Runner: pcdt-br — Protocolos Clínicos e Diretrizes Terapêuticas (Brazil SUS) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Бразилия',
  reference: 'Protocolos Clínicos e Diretrizes Terapêuticas (PCDT) — обязательные протоколы SUS (Sistema Único de Saúde). Publicados pelo Ministério da Saúde através de CONITEC (Comissão Nacional de Incorporação de Tecnologias no SUS). https://www.gov.br/conitec, https://www.gov.br/saude',
  inputs: [
    {
      id: 'area',
      label: 'Нозология / программа',
      type: 'select',
      options: [
        { value: 'hiv', label: 'HIV / AIDS (antiretroviral, PrEP, PEP)' },
        { value: 'tb', label: 'Tuberculose (TB program, PNCT)' },
        { value: 'hepatites', label: 'Hepatites virais (B, C)' },
        { value: 'cancer', label: 'Oncologia (PCDT oncológicos)' },
        { value: 'doencas-raras', label: 'Doenças raras (CER — Centros Especializados)' },
        { value: 'saude-mental', label: 'Saúde mental (RAPS, CAPS)' },
        { value: 'aps', label: 'Atenção Primária (Cadernos de Atenção Básica, e-SUS APS)' },
        { value: 'cronicas', label: 'Doenças crônicas (HAS, DM, obesidade)' },
      ],
    },
  ],
  presets: [
    { label: 'HIV / Antirretrovirais', values: { area: 'hiv' } },
    { label: 'Tuberculose (PNCT)', values: { area: 'tb' } },
    { label: 'Atenção Primária (APS)', values: { area: 'aps' } },
  ],
  compute: (v) => {
    const a = String(v.area || 'hiv');
    const map: Record<string, { name: string; details: string }> = {
      hiv: { name: 'HIV / AIDS', details: 'PCDT HIV adulto + PCDT HIV pediátrico + PCDT Profilaxia Pré-Exposição (PrEP) + PCDT Profilaxia Pós-Exposição (PEP). Бразилия — один из мировых лидеров по универсальному доступу к ART через SUS с 1996 года. Препараты бесплатно для всех. DTG-базированные режимы первой линии. Тестирование на HIV включено в пренатальный скрининг (Rede Cegonha).' },
      tb: { name: 'Tuberculose', details: 'PNCT (Programa Nacional de Controle da Tuberculose). Manual de Recomendações para o Controle da Tuberculose no Brasil. Бразилия в topе-30 стран WHO high-burden list. RHZE (rifampicina, isoniazida, pirazinamida, etambutol) — первая линия. Fixed-dose combination. BCG-вакцинация обязательна при рождении. Новый PCDT включает BPaL/BPaLM для DR-TB.' },
      hepatites: { name: 'Гепатиты B, C', details: 'PCDT Hepatite B + PCDT Hepatite C. DAA (direct-acting antivirals) для HCV — глософвир/ледипасвир, софосбувир/даклатасвир — бесплатно через SUS. Elimination target: WHO 2030. Screen-and-treat в primary care. HBV — TDF / entecavir.' },
      cancer: { name: 'Oncologia', details: 'PCDT oncológicos — по локализации (mama, colo útero, próstata, cólon, pulmão, estômago, леукемии). CACON (Centros de Alta Complexidade em Oncologia) + UNACON. Доступ через SUS — регулирован судебными решениями (judicialização da saúde — частая проблема для high-cost oncology).' },
      'doencas-raras': { name: 'Doenças raras', details: 'Política Nacional de Atenção Integral às Pessoas com Doenças Raras (Portaria 199/2014). CER — Centros Especializados em Reabilitação. PCDT para >60 редких заболеваний: фенилкетонурия, гипотиреоз врожд., CF, Gaucher, Pompe, MPS, Fabry, спинальная мышечная атрофия (SMA).' },
      'saude-mental': { name: 'Saúde mental', details: 'RAPS (Rede de Atenção Psicossocial). CAPS (Centros de Atenção Psicossocial) — community-based модель (Reforma Psiquiátrica). PCDT depressão, transtorno bipolar, esquizofrenia. Psicofármacos через SUS.' },
      aps: { name: 'Atenção Primária (APS)', details: 'Cadernos de Atenção Básica (CAB) — серия карманных руководств для ESF (Estratégia Saúde da Família). CAB 1-38+ по темам: HAS, DM, gestação, criança, idoso, saúde mental, dor crônica, DST, etc. Бесплатно PDF на gov.br/saude. e-SUS APS — национальная электронная система APS.' },
      cronicas: { name: 'Doenças crônicas', details: 'PCDT HAS (hipertensão arterial), PCDT DM2, Portaria de Tratamento da Obesidade. Linha de cuidado hipertensão/diabetes (HIPERDIA histórico). Distribuição gratuita de losartana, enalapril, hidroclorotiazida, metformina, glibenclamida, insulina NPH/regular através de Farmácia Popular.' },
    };
    const e = map[a];
    return {
      value: `PCDT — ${e.name}`,
      unit: 'SUS Brasil',
      color: '#6B7280',
      interpretation: `Navigate: Brazilian PCDT ${e.name}`,
      details: `Область: ${e.name}\n\n${e.details}\n\nPCDT (Protocolo Clínico e Diretriz Terapêutica) — обязательный протокол SUS. Утверждается CONITEC (Comissão Nacional de Incorporação de Tecnologias no SUS) + Ministério da Saúde через Portaria. Невыполнение PCDT = отсутствие реимбурсации + юридический риск. Judicialização da saúde (судебные иски) — частая проблема для не включённых в PCDT высокостоимостных препаратов.`,
      actions: [
        'CONITEC portal: https://www.gov.br/conitec/',
        'Ministério da Saúde: https://www.gov.br/saude/',
        'Cadernos de Atenção Básica: https://aps.saude.gov.br/biblioteca/',
        'PNCT (tuberculose): https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/t/tuberculose',
        'Departamento de HIV/AIDS: https://www.gov.br/aids/',
        'ANVISA (регулятор лекарств): https://www.gov.br/anvisa/',
        'Farmácia Popular: https://www.gov.br/saude/pt-br/assuntos/farmacia-popular',
        'BVS (Biblioteca Virtual em Saúde): https://bvsms.saude.gov.br/',
      ],
      caveats: [
        'Документы на португальском (Brazilian Portuguese)',
        'SUS — Sistema Único de Saúde — public universal, но огромные региональные различия (Norte/Nordeste vs Sudeste/Sul)',
        'PCDT — обязательные для SUS, но частная медицина (саúde suplementar — ANS) имеет собственные правила',
        'Judicialização — частая практика (пациенты через суд получают препараты не в PCDT)',
        'ANVISA регулирует лекарства (аналог FDA/EMA) — регистрация отдельно от включения в SUS',
        'Эндемические болезни: дenge, chikungunya, Zika, febre amarela (желтая лихорадка), лейшманиоз, шистосомоз, Chagas',
      ],
      related: [
        { id: 'imss', title: 'IMSS GPC (Mexico)' },
        { id: 'paho', title: 'PAHO (Pan-American)' },
        { id: 'sap-sac', title: 'SAP/SAC (Argentina)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
**PCDT (Protocolos Clínicos e Diretrizes Terapêuticas)** — обязательные клинические протоколы SUS (публичная система здравоохранения Бразилии). Утверждаются CONITEC + Ministério da Saúde.

### SUS
Sistema Único de Saúde — бесплатное универсальное здравоохранение для всех граждан и резидентов (Конституция 1988, ст. 196). Основа — ESF (Estratégia Saúde da Família) + Atenção Primária.

### CONITEC
Comissão Nacional de Incorporação de Tecnologias no SUS — оценивает новые препараты/технологии для включения в SUS. Публичные consulta pública перед каждым решением.

### Cadernos de Atenção Básica (CAB)
Серия >38 карманных пособий для family doctors в ESF. Бесплатно PDF. Ключевой образовательный ресурс для APS.

### Judicialização da saúde
Частая практика: пациенты через суд добиваются доступа к препаратам не в PCDT. Серьёзный политический и финансовый вызов системе.

### Программы
- HIV/AIDS — мировой лидер universal ART
- PNCT — TB
- PNI — национальный прививочный календарь (один из самых полных в мире)
- Farmácia Popular — субсидированные лекарства
- RAPS / CAPS — психическое здоровье

### Источники
- https://www.gov.br/conitec/
- https://www.gov.br/saude/
- https://aps.saude.gov.br/biblioteca/
- https://www.gov.br/anvisa/`,
};
export default runner;

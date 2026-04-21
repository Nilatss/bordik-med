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
    const map: Record<string, { name: string; details: string; actions: string[]; caveats: string[] }> = {
      hiv: {
        name: 'HIV / AIDS',
        details: 'PCDT HIV adulto + PCDT HIV pediátrico + PCDT Profilaxia Pré-Exposição (PrEP) + PCDT Profilaxia Pós-Exposição (PEP). Бразилия — один из мировых лидеров по универсальному доступу к ART через SUS с 1996 года. Препараты бесплатно для всех. DTG-базированные режимы первой линии. Тестирование на HIV включено в пренатальный скрининг (Rede Cegonha).',
        actions: [
          'PCDT HIV adulto: https://www.gov.br/aids/pt-br/central-de-conteudo/pcdts',
          'PrEP/PEP Brasil: https://www.gov.br/aids/pt-br/assuntos/prevencao-combinada/prep-profilaxia-pre-exposicao',
          'Departamento de HIV/AIDS: https://www.gov.br/aids/',
          'Telelab (тестирование): https://telelab.aids.gov.br/',
        ],
        caveats: [
          'DTG 1-я линия (TDF/3TC/DTG); DTG avoided в 1 триместре ранее — сейчас допустим с counseling',
          'Viremia threshold для смены схемы: 2 × >50 copies/mL на ART',
          'PrEP — бесплатно всем группам риска через SUS (с 2017)',
        ],
      },
      tb: {
        name: 'Tuberculose',
        details: 'PNCT (Programa Nacional de Controle da Tuberculose). Manual de Recomendações para o Controle da Tuberculose no Brasil. Бразилия в топе-30 стран WHO high-burden list. RHZE (rifampicina, isoniazida, pirazinamida, etambutol) — первая линия. Fixed-dose combination. BCG-вакцинация обязательна при рождении. Новый PCDT включает BPaL/BPaLM для DR-TB.',
        actions: [
          'PNCT portal: https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/t/tuberculose',
          'Manual de Recomendações TB: https://bvsms.saude.gov.br/bvs/publicacoes/manual_recomendacoes_controle_tuberculose_brasil_2_ed.pdf',
          'SITE-TB (система регистрации МЛУ-ТБ): https://sitetb.saude.gov.br/',
          'BCG календарь: https://www.gov.br/saude/pt-br/vacinacao',
        ],
        caveats: [
          'DOTS — обязательный стандарт наблюдения терапии',
          'Co-инфекция HIV — тестирование на HIV всем пациентам с ТБ',
          'BPaL/BPaLM для преXDR/RR-TB уже в PCDT',
          'Индигенные народы — особая подпрограмма PNCT',
        ],
      },
      hepatites: {
        name: 'Гепатиты B, C',
        details: 'PCDT Hepatite B + PCDT Hepatite C. DAA (direct-acting antivirals) для HCV — глософвир/ледипасвир, софосбувир/даклатасвир — бесплатно через SUS. Elimination target: WHO 2030. Screen-and-treat в primary care. HBV — TDF / entecavir.',
        actions: [
          'PCDT Hepatite C: https://www.gov.br/conitec/pt-br/midias/protocolos/20200813_pcdt_hepatite_c_relatorio_535_2020.pdf',
          'PCDT Hepatite B: https://www.gov.br/aids/pt-br/central-de-conteudo/pcdts',
          'Elimina Hepatites portal: https://www.gov.br/aids/pt-br/assuntos/hepatites-virais',
          'SIM-C (reg. гепатитов): https://sim-c.aids.gov.br/',
        ],
        caveats: [
          'Pangenotipная схема SOF/VEL 12 недель — стандарт HCV в Brasil',
          'Скрининг anti-HCV 1 раз всем ≥ 40 лет (Portaria Elimina 2030)',
          'HBsAg скрининг обязателен в пренатальном наблюдении',
          'HDV — тестирование всем HBsAg+ (Amazonas — эндемичный)',
        ],
      },
      cancer: {
        name: 'Oncologia',
        details: 'PCDT oncológicos — по локализации (mama, colo útero, próstata, cólon, pulmão, estômago, лейкемии). CACON (Centros de Alta Complexidade em Oncologia) + UNACON. Доступ через SUS — регулирован судебными решениями (judicialização da saúde — частая проблема для high-cost oncology).',
        actions: [
          'INCA (Instituto Nacional de Câncer): https://www.inca.gov.br/',
          'PCDT oncológicos (CONITEC): https://www.gov.br/conitec/pt-br/assuntos/protocolos-e-diretrizes',
          'CACON/UNACON список: https://www.inca.gov.br/assistencia-oncologica',
          'Carta dos Direitos do Paciente Oncológico SUS',
        ],
        caveats: [
          'Lei 12.732/2012 — начало лечения ≤ 60 дней от диагноза (часто не соблюдается)',
          'Multi-gene tests, CAR-T, IO — частая judicialização',
          'Национальный скрининг: шейка матки (Papanicolaou 25–64 л), грудь (маммография 50–69 л каждые 2 года)',
        ],
      },
      'doencas-raras': {
        name: 'Doenças raras',
        details: 'Política Nacional de Atenção Integral às Pessoas com Doenças Raras (Portaria 199/2014). CER — Centros Especializados em Reabilitação. PCDT para >60 редких заболеваний: фенилкетонурия, гипотиреоз врожд., CF, Gaucher, Pompe, MPS, Fabry, спинальная мышечная атрофия (SMA).',
        actions: [
          'Política Doenças Raras (Portaria 199/2014)',
          'PCDT específicos (CF, SMA, Gaucher, Pompe, MPS, Fabry): https://www.gov.br/conitec',
          'Teste do Pezinho ampliado (триагем неонатальна): https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/t/teste-do-pezinho',
          'Rede Nacional de Doenças Raras',
        ],
        caveats: [
          'SMA — nusinersen через SUS (только типа 1 вначале; тип 2–3 — через суд)',
          'Enzymes (Gaucher, Pompe, Fabry) — bundled доставка через Secretaria de Saúde',
          'Teste do Pezinho — 6 болезней бесплатно (расширение 14+ с 2024)',
          'Judicialização — доминирующий путь доступа к orphan drugs',
        ],
      },
      'saude-mental': {
        name: 'Saúde mental',
        details: 'RAPS (Rede de Atenção Psicossocial). CAPS (Centros de Atenção Psicossocial) — community-based модель (Reforma Psiquiátrica). PCDT depressão, transtorno bipolar, esquizofrenia. Psicofármacos через SUS.',
        actions: [
          'RAPS portal: https://www.gov.br/saude/pt-br/acesso-a-informacao/acoes-e-programas/rede-de-atencao-psicossocial',
          'CAPS lista: https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-mental',
          'PCDT depressão/bipolar/esquizofrenia (CONITEC)',
          'Centro de Valorização da Vida (CVV) 188 — suicide prevention',
        ],
        caveats: [
          'Reforma Psiquiátrica (Lei 10.216/2001) — ориентация на community care, не стационар',
          'Clozapina, lítio, anticonvulsantes — через SUS по PCDT',
          'CAPS AD — отдельная сеть для зависимостей',
          'Политические изменения 2017–2022: возврат к стационарам — обратно отменён',
        ],
      },
      aps: {
        name: 'Atenção Primária (APS)',
        details: 'Cadernos de Atenção Básica (CAB) — серия карманных руководств для ESF (Estratégia Saúde da Família). CAB 1-38+ по темам: HAS, DM, gestação, criança, idoso, saúde mental, dor crônica, DST, etc. Бесплатно PDF на gov.br/saude. e-SUS APS — национальная электронная система APS.',
        actions: [
          'Cadernos de Atenção Básica: https://aps.saude.gov.br/biblioteca/',
          'e-SUS APS (система записи): https://sisaps.saude.gov.br/esus/',
          'Biblioteca Virtual APS: https://aps.saude.gov.br/',
          'Previne Brasil (fin. ESF): https://aps.saude.gov.br/gestor/financiamento',
        ],
        caveats: [
          'ESF (Estratégia Saúde da Família) — первичная модель APS в SUS',
          'Agente Comunitário de Saúde (ACS) — ключевое звено, визиты по домам',
          'Previne Brasil (с 2019) — pay-for-performance финансирование',
          'e-SUS APS — обязательная регистрация всех консультаций',
        ],
      },
      cronicas: {
        name: 'Doenças crônicas',
        details: 'PCDT HAS (hipertensão arterial), PCDT DM2, Portaria de Tratamento da Obesidade. Linha de cuidado hipertensão/diabetes (HIPERDIA histórico). Distribuição gratuita de losartana, enalapril, hidroclorotiazida, metformina, glibenclamida, insulina NPH/regular através de Farmácia Popular.',
        actions: [
          'Farmácia Popular (бесплатные HAS/DM): https://www.gov.br/saude/pt-br/assuntos/farmacia-popular',
          'Linha de Cuidado HAS: https://linhasdecuidado.saude.gov.br/portal/hipertensao-arterial-sistemica-adulto/',
          'Linha de Cuidado DM2',
          'CAB 36 (DM2), CAB 37 (HAS): https://aps.saude.gov.br/biblioteca/',
        ],
        caveats: [
          'Farmácia Popular: losartana/enalapril/HCT/metformina/glibenclamida/insulina NPH — бесплатно',
          'Инсулин быстрого действия аналоги (glargine/aspart) — не всегда в SUS',
          'GLP-1 RA, SGLT2i — частично в PCDT (semaglutide ещё не универсально)',
          'Bariatric surgery — через SUS с ИМТ ≥ 35 + комплекации (по протоколу)',
        ],
      },
    };
    const e = map[a];
    return {
      value: `PCDT — ${e.name}`,
      unit: 'SUS Brasil',
      color: '#6B7280',
      interpretation: `Navigate: Brazilian PCDT ${e.name}`,
      details: `Область: ${e.name}\n\n${e.details}\n\nPCDT (Protocolo Clínico e Diretriz Terapêutica) — обязательный протокол SUS. Утверждается CONITEC (Comissão Nacional de Incorporação de Tecnologias no SUS) + Ministério da Saúde через Portaria. Невыполнение PCDT = отсутствие реимбурсации + юридический риск. Judicialização da saúde (судебные иски) — частая проблема для не включённых в PCDT высокостоимостных препаратов.`,
      actions: [
        ...e.actions,
        '— Общие источники SUS —',
        'CONITEC portal: https://www.gov.br/conitec/',
        'Ministério da Saúde: https://www.gov.br/saude/',
        'ANVISA (регулятор лекарств): https://www.gov.br/anvisa/',
        'BVS (Biblioteca Virtual em Saúde): https://bvsms.saude.gov.br/',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для SUS —',
        'Документы на португальском (Brazilian Portuguese)',
        'PCDT — обязательные для SUS, но частная медицина (saúde suplementar — ANS) имеет собственные правила',
        'Judicialização — частая практика (пациенты через суд получают препараты не в PCDT)',
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

/**
 * CalculatorBody — calculator phase content для ToolView.
 *
 * P1-CR-3 step 7/8 — extracted from ToolView.tsx.
 *
 * Layout:
 *   non-checkbox inputs (number/select)
 *   ─── dashed separator ───
 *   checkbox inputs
 *   ─── ResultCard (если result есть) ───
 *
 * Rhythm rules (gaps):
 *   - Между inputs одного типа (number↔number, select↔select,
 *     checkbox↔checkbox) — 6 px
 *   - Между группами (non-checkbox ↔ separator ↔ checkbox) — 24 px
 *   - Внутри single number block (label / field / chips) — 8 px
 */
import React, { useMemo } from 'react';
import type { ToolInput, Preset, CalculatorResult } from '@/lib/tools-runners';
import { InputField } from './InputField';
import { ResultCard } from './Result';

export function CalculatorBody({ inputs, values, setValues, result, presets }: {
  inputs: ToolInput[];
  values: Record<string, number | boolean | string>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, number | boolean | string>>>;
  result: CalculatorResult | null;
  presets?: Preset[];
}) {
  // Group checkboxes visually at the bottom — иначе single checkbox
  // sandwiched между number/select inputs blends in and easy to miss.
  // Stable: НЕ reshuffle когда all inputs are checkboxes ИЛИ когда их
  // нет (leave as-is).
  const { nonCheckboxes, checkboxes } = useMemo(() => {
    const nc: ToolInput[] = [];
    const cb: ToolInput[] = [];
    for (const inp of inputs) {
      if (inp.type === 'checkbox') cb.push(inp);
      else nc.push(inp);
    }
    return { nonCheckboxes: nc, checkboxes: cb };
  }, [inputs]);

  const renderInput = (inp: ToolInput) => (
    <InputField
      key={inp.id}
      input={inp}
      value={values[inp.id]}
      onChange={(v) => setValues((prev) => ({ ...prev, [inp.id]: v }))}
    />
  );

  return (
    <div>
      {presets && presets.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {presets.map((p, i) => (
            <button
              key={i}
              type="button"
              title="Заполнить пример"
              onClick={() => setValues((prev) => ({ ...prev, ...p.values }))}
              className="px-2.5 py-1 rounded-full border border-[#E2E4EA] bg-[#F5F6F8] text-[12px] text-[#374151] hover:bg-[#ECEEF2] hover:border-[#CBD0DA] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-6">
        {nonCheckboxes.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {nonCheckboxes.map(renderInput)}
          </div>
        )}
        {checkboxes.length > 0 && nonCheckboxes.length > 0 && (
          <div className="border-t border-dashed border-[#E2E4EA]" />
        )}
        {checkboxes.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {checkboxes.map(renderInput)}
          </div>
        )}
      </div>

      {result && <ResultCard result={result} />}
    </div>
  );
}

/**
 * TabIcon — sidebar tab icon switch для ToolView.
 *
 * P1-CR-3 step 5/8 — extracted from ToolView.tsx.
 *
 * Names map to keys возвращаемых `iconKeyForTitle` в lib/tool-view/utils.ts.
 * Один ёмкий `switch` вместо 18 отдельных функций — proportionally less
 * boilerplate чем рендерить tab pill JSX.
 */

export function TabIcon({ name, size = 16 }: { name: string; size?: number }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const s = size;
  switch (name) {
    case 'calc':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><rect x={4} y={2} width={16} height={20} rx={2}/><line x1={8} y1={6} x2={16} y2={6}/><circle cx={8} cy={10.5} r={0.5}/><circle cx={12} cy={10.5} r={0.5}/><circle cx={16} cy={10.5} r={0.5}/><circle cx={8} cy={14.5} r={0.5}/><circle cx={12} cy={14.5} r={0.5}/><circle cx={16} cy={14.5} r={0.5}/><circle cx={8} cy={18.5} r={0.5}/><circle cx={12} cy={18.5} r={0.5}/><circle cx={16} cy={18.5} r={0.5}/></svg>);
    case 'info':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><circle cx={12} cy={12} r={10}/><line x1={12} y1={16} x2={12} y2={12}/><line x1={12} y1={8} x2={12.01} y2={8}/></svg>);
    case 'clock':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><circle cx={12} cy={12} r={10}/><polyline points="12,6 12,12 16,14"/></svg>);
    case 'formula':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M4 20h4l6-16h4"/><line x1={4} y1={12} x2={12} y2={12}/></svg>);
    case 'bar':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><line x1={6} y1={20} x2={6} y2={14}/><line x1={12} y1={20} x2={12} y2={8}/><line x1={18} y1={20} x2={18} y2={4}/></svg>);
    case 'action':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>);
    case 'compare':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>);
    case 'warn':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/></svg>);
    case 'check':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>);
    case 'germ':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><circle cx={12} cy={12} r={5}/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/></svg>);
    case 'child':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><circle cx={12} cy={8} r={4}/><path d="M6 22v-3c0-2 2-4 6-4s6 2 6 4v3"/></svg>);
    case 'preg':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><circle cx={12} cy={7} r={3}/><path d="M9 22c0-5 1-8 3-8s3 3 3 8"/></svg>);
    case 'pulse':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>);
    case 'shield':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M12 2l9 4v6c0 5.5-4 10-9 10S3 17.5 3 12V6z"/></svg>);
    case 'numbers':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><line x1={10} y1={4} x2={8} y2={20}/><line x1={16} y1={4} x2={14} y2={20}/><line x1={4} y1={9} x2={20} y2={9}/><line x1={4} y1={15} x2={20} y2={15}/></svg>);
    case 'link':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>);
    case 'book':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>);
    case 'doc':
    default:
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><rect x={4} y={3} width={16} height={18} rx={2}/><line x1={8} y1={9} x2={16} y2={9}/><line x1={8} y1={13} x2={16} y2={13}/><line x1={8} y1={17} x2={12} y2={17}/></svg>);
  }
}

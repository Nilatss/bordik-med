// ts-node-style but without ts-node: minimal transpile via tsx
import('../lib/tool-meta.ts').then((m) => {
  console.log('Total:', m.COUNTRY_COUNTS.length);
  for (const c of m.COUNTRY_COUNTS) console.log(' ', c.flag, c.value, '(' + c.count + ')');
}).catch(e => { console.error(e); process.exit(1); });

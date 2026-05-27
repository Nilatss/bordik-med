/**
 * Tests that the mobile topbar logo <img> has explicit width and height
 * HTML attributes to prevent CLS (Cumulative Layout Shift).
 *
 * Bug: The logo rendered as:
 *   <img src="/logo-bordik.png" className="h-[22px] w-auto" />
 * Without HTML width/height attributes the browser cannot calculate the
 * intrinsic dimensions before the image loads, so it allocates no space
 * initially and then shifts content when the image loads → CLS.
 *
 * Fix: width={82} height={22} added, matching the logo's aspect ratio
 * (4711×1263 native → 82×22 at h-[22px]). The CSS still overrides to
 * h-[22px] w-auto; the HTML attributes give the browser the pre-paint hint.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const HOMEAPP_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../components/home/HomeApp.tsx',
);

describe('HomeApp logo image CLS prevention', () => {
  let source: string;

  it('source file is readable', () => {
    source = fs.readFileSync(HOMEAPP_PATH, 'utf8');
    expect(source.length).toBeGreaterThan(0);
  });

  it('logo <img> has an explicit width attribute', () => {
    source = source ?? fs.readFileSync(HOMEAPP_PATH, 'utf8');
    // Match the img tag for the Bordik logo
    const imgTagMatch = source.match(/<img[^>]*logo-bordik\.png[^>]*>/);
    expect(imgTagMatch).not.toBeNull();
    const imgTag = imgTagMatch![0];
    expect(imgTag).toMatch(/width=/);
  });

  it('logo <img> has an explicit height attribute', () => {
    source = source ?? fs.readFileSync(HOMEAPP_PATH, 'utf8');
    const imgTagMatch = source.match(/<img[^>]*logo-bordik\.png[^>]*>/);
    expect(imgTagMatch).not.toBeNull();
    const imgTag = imgTagMatch![0];
    expect(imgTag).toMatch(/height=/);
  });

  it('logo width matches the aspect ratio of the actual file (4711×1263 → 82px at 22px height)', () => {
    source = source ?? fs.readFileSync(HOMEAPP_PATH, 'utf8');
    const imgTagMatch = source.match(/<img[^>]*logo-bordik\.png[^>]*>/);
    expect(imgTagMatch).not.toBeNull();
    const imgTag = imgTagMatch![0];
    const widthMatch = imgTag.match(/width=\{(\d+)\}/);
    expect(widthMatch).not.toBeNull();
    const width = parseInt(widthMatch![1]!, 10);
    // Allow ±5px tolerance for rounding differences
    expect(width).toBeGreaterThanOrEqual(77);
    expect(width).toBeLessThanOrEqual(87);
  });
});

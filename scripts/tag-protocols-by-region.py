"""
Phase 1 of Protocols expansion: tag each existing protocol with regions[]
auto-derived from its references + content.

Region taxonomy (matches `lib/tool-meta-helpers.ts` COUNTRY_GROUPS where
practical):
  - РФ              — KР МЗ РФ, Минздрав России, Приказ МЗ РФ
  - США             — AAP, NRP, CDC, ACOG, AHA, FDA, NIH, NICHD
  - Европа          — NICE, ESPGHAN, ERC, ESPNIC, BAPM, EFCNI, ERS
  - Узбекистан      — gov.uz, МЗ РУз, ЎзР Минздрав
  - Международный   — WHO, iLCOR, UNICEF, MSF, IMCI, KDIGO

Multi-region OK (array). If no source maps — defaults to ['Международный'].
"""
from __future__ import annotations
import json
import re
from pathlib import Path

PATH = Path(r"C:\Users\KDFX Modes\Desktop\bordik-med\public\neonatal-guidelines.json")

# Order matters — first match wins for the "primary" tag, but ALL matching
# regions are added to the array.
REGION_PATTERNS: dict[str, list[str]] = {
    "РФ": [
        r"\bКР МЗ РФ\b", r"\bМЗ РФ\b", r"\bПриказ МЗ РФ\b",
        r"\bминздрав\s*россии\b", r"\bРоссия\b",
        r"\bклинические\s*рекомендации\s*РФ\b",
        r"\bроссийск\w+\b", r"\bПриказ № \d+", r"\bН?КПП\b",
    ],
    "США": [
        r"\bAAP\b", r"\bNRP\b", r"\bCDC\b", r"\bACOG\b",
        r"\bAHA\b", r"\bFDA\b", r"\bNIH\b", r"\bNICHD\b",
        r"\bAAEM\b", r"\bASCO\b", r"\bAAP COFN\b", r"\bUSPSTF\b",
        r"\bKaiser Permanente\b", r"\bUS Surgeon General\b",
        r"\bASH\b", r"\bSNS Saudi\b",  # Saudi often align с AAP — still tag separately в new entries
    ],
    "Европа": [
        r"\bNICE\b", r"\bESPGHAN\b", r"\bERC\b", r"\bESPNIC\b",
        r"\bBAPM\b", r"\bEFCNI\b", r"\bERS\b", r"\bEACTS\b",
        r"\bRCOG\b", r"\bRCPCH\b", r"\bRCPath\b", r"\bRCOA\b",
        r"\bMHRA\b", r"\bUEG\b", r"\bEMA\b",
        r"\bSweet DG\b", r"\bEuropean Consensus\b",
        r"\bAWMF\b",  # Germany
        r"\bSocietà\b", r"\bSociedad\b",  # IT/ES medical societies
    ],
    "Узбекистан": [
        r"\bgov\.uz\b", r"\bМЗ РУз\b", r"\bУзбекистан\b",
        r"\bЎзбекистон\b", r"\bТошкент\b",
    ],
    "Международный": [
        r"\bWHO\b", r"\bUNICEF\b", r"\biLCOR\b", r"\bIMCI\b",
        r"\bMSF\b", r"\bKDIGO\b", r"\bIRCC\b", r"\bWFAS\b",
        r"\bCochrane\b",  # international evidence body
        r"\bICMR\b", r"\bSCC \(Sapporo\)\b",
    ],
}

def detect_regions(*texts: str) -> list[str]:
    """Detect every region whose pattern matches any of `texts`. Returns
    a stable-ordered list. Falls back to ['Международный'] if nothing
    matches AND the protocol is content-only с general guidance."""
    found: list[str] = []
    haystack = "\n".join(t for t in texts if t)
    for region, patterns in REGION_PATTERNS.items():
        for p in patterns:
            if re.search(p, haystack, re.IGNORECASE | re.UNICODE):
                if region not in found:
                    found.append(region)
                break
    if not found:
        # No explicit reference — likely a generic protocol. Tag as
        # international so user can still filter.
        found = ["Международный"]
    return found


def main() -> None:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    counts: dict[str, int] = {}
    no_source = 0
    for g in data["guidelines"]:
        refs_text = "\n".join(g.get("references", []))
        content = g.get("content", "")
        title = (g.get("title_ru", "") + " " + g.get("title_en", ""))
        regions = detect_regions(refs_text, content, title)
        g["regions"] = regions
        for r in regions:
            counts[r] = counts.get(r, 0) + 1
        if not g.get("references"):
            no_source += 1

    data["version"] = "1.8.0"
    data["lastUpdated"] = "2026-05-10"
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Total protocols: {len(data['guidelines'])}")
    print(f"Protocols without references: {no_source}")
    print(f"Regions distribution (counts protocols-per-region — sums >100% for multi-region):")
    for r, n in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {r:20s} {n}")


if __name__ == "__main__":
    main()

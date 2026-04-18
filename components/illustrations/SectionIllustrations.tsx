/**
 * Abstract gradient illustrations for section cards.
 * Style: soft geometric shapes with gradients — Teamway-inspired.
 * Each illustration is unique but visually consistent.
 */

const SIZE = 120;

export function BasicIllustration() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="basic-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8D5D0" />
          <stop offset="100%" stopColor="#D4A89A" />
        </linearGradient>
        <linearGradient id="basic-g2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#C9978A" />
          <stop offset="100%" stopColor="#E8D5D0" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="50" r="40" fill="url(#basic-g1)" opacity="0.8" />
      <circle cx="45" cy="75" r="30" fill="url(#basic-g2)" opacity="0.6" />
      <rect x="65" y="65" width="35" height="35" rx="8" fill="#C9978A" opacity="0.4" transform="rotate(15 82 82)" />
    </svg>
  );
}

export function AdvancedIllustration() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="adv-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B8C5E8" />
          <stop offset="100%" stopColor="#8B9FD4" />
        </linearGradient>
        <linearGradient id="adv-g2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7B8FC4" />
          <stop offset="100%" stopColor="#B8C5E8" />
        </linearGradient>
      </defs>
      <rect x="20" y="25" width="50" height="50" rx="12" fill="url(#adv-g1)" opacity="0.7" transform="rotate(-10 45 50)" />
      <circle cx="80" cy="65" r="32" fill="url(#adv-g2)" opacity="0.6" />
      <rect x="55" y="15" width="25" height="25" rx="6" fill="#7B8FC4" opacity="0.4" transform="rotate(20 67 27)" />
    </svg>
  );
}

export function ExpertIllustration() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="exp-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0D0E8" />
          <stop offset="100%" stopColor="#B490C8" />
        </linearGradient>
      </defs>
      <circle cx="55" cy="55" r="38" fill="url(#exp-g1)" opacity="0.7" />
      <ellipse cx="75" cy="70" rx="28" ry="20" fill="#B490C8" opacity="0.4" transform="rotate(-15 75 70)" />
      <circle cx="35" cy="80" r="18" fill="#D0B8D8" opacity="0.5" />
    </svg>
  );
}

export function ExpansionIllustration() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="ext-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D0E8D5" />
          <stop offset="100%" stopColor="#8BC5A0" />
        </linearGradient>
      </defs>
      <rect x="15" y="30" width="55" height="55" rx="14" fill="url(#ext-g1)" opacity="0.7" transform="rotate(5 42 57)" />
      <circle cx="85" cy="45" r="25" fill="#8BC5A0" opacity="0.5" />
      <rect x="60" y="70" width="30" height="30" rx="8" fill="#A8D8B8" opacity="0.4" transform="rotate(-10 75 85)" />
    </svg>
  );
}

export function TerritoriesIllustration() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="ter-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8D0C0" />
          <stop offset="100%" stopColor="#B8A888" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="55" r="35" fill="url(#ter-g1)" opacity="0.6" />
      <rect x="55" y="20" width="40" height="40" rx="10" fill="#B8A888" opacity="0.5" transform="rotate(25 75 40)" />
      <ellipse cx="40" cy="80" rx="25" ry="18" fill="#C8C0A8" opacity="0.4" />
    </svg>
  );
}

export function FrontiersIllustration() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="fro-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C8D8E8" />
          <stop offset="100%" stopColor="#88A8C8" />
        </linearGradient>
      </defs>
      <rect x="25" y="25" width="45" height="45" rx="22" fill="url(#fro-g1)" opacity="0.7" />
      <circle cx="80" cy="40" r="22" fill="#88A8C8" opacity="0.5" />
      <rect x="50" y="65" width="35" height="35" rx="8" fill="#A0B8D0" opacity="0.4" transform="rotate(-8 67 82)" />
    </svg>
  );
}

export function CalculatorsIllustration() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="calc-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0E0E0" />
          <stop offset="100%" stopColor="#B0B0B0" />
        </linearGradient>
      </defs>
      <rect x="20" y="20" width="50" height="60" rx="10" fill="url(#calc-g1)" opacity="0.6" />
      <circle cx="80" cy="55" r="28" fill="#C0C0C0" opacity="0.5" />
      <rect x="50" y="40" width="20" height="20" rx="4" fill="#A0A0A0" opacity="0.4" />
      <rect x="35" y="70" width="25" height="25" rx="6" fill="#B8B8B8" opacity="0.3" transform="rotate(10 47 82)" />
    </svg>
  );
}

export function SubjectsIllustration() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="sub-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8D0E8" />
          <stop offset="100%" stopColor="#A890C8" />
        </linearGradient>
      </defs>
      <circle cx="55" cy="50" r="35" fill="url(#sub-g1)" opacity="0.6" />
      <rect x="60" y="55" width="40" height="40" rx="10" fill="#A890C8" opacity="0.4" transform="rotate(12 80 75)" />
      <circle cx="35" cy="80" r="20" fill="#C8B8D8" opacity="0.5" />
    </svg>
  );
}

import type { SectionId } from '@/lib/curriculum';

const illustrationMap: Record<SectionId, () => React.ReactElement> = {
  fundamentals: BasicIllustration,
  biomedical: AdvancedIllustration,
  clinical: ExpertIllustration,
  allied: ExpansionIllustration,
  skills: TerritoriesIllustration,
  hss: FrontiersIllustration,
  threads: CalculatorsIllustration,
  frontier: SubjectsIllustration,
  business: BasicIllustration,
  regulatory: AdvancedIllustration,
  career: ExpansionIllustration,
  tech: FrontiersIllustration,
};

export function SectionIllustration({ sectionId }: { sectionId: SectionId }) {
  const Illustration = illustrationMap[sectionId];
  return Illustration ? <Illustration /> : null;
}

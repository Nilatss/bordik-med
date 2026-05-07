/**
 * Реестр Gemini-промптов.
 *
 * Закрывает P1-CR-6 из docs/code-review-2026-05.md — раньше промпты
 * были захардкожены в `app/api/diagnostic/route.ts:192-235`,
 * перемешивали diff с handler-логикой, не позволяли A/B-тестирование
 * и i18n.
 *
 * Каждый промпт имеет:
 *   - id     — стабильный идентификатор для логов / Sentry
 *   - version — semver, инкрементируется при изменении содержания
 *   - lang   — 'ru' | 'en' | ... (на сейчас только 'ru')
 *   - content — текст системного промпта
 *
 * При логировании Gemini-вызовов добавлять `prompt_id` + `prompt_version`
 * в события — позволит attribution бага к конкретной версии промпта.
 *
 * При A/B-тесте — добавлять варианты с suffix '-vN' и роутить через
 * config-flag.
 */

import { diagnosticNextRu } from './diagnostic-next.ru';
import { diagnosticFinalizeRu } from './diagnostic-finalize.ru';

export interface PromptDefinition {
  id: string;
  version: string;
  lang: string;
  content: string;
}

export const prompts = {
  diagnosticNext: { ru: diagnosticNextRu },
  diagnosticFinalize: { ru: diagnosticFinalizeRu },
} as const;

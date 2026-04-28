import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Как Bordik / IronMed Academy обрабатывает персональные данные.',
  alternates: {
    canonical: '/privacy',
    languages: {
      // P2-SEO-2 — currently only the Russian version exists; the
      // x-default + ru-RU hreflang pair tells Google we are Russian-
      // language and that there's no separate localised URL.
      'ru-RU':     '/privacy',
      'x-default': '/privacy',
    },
  },
};

const LAST_UPDATED = '2026-04-28';

/**
 * Privacy Policy - GDPR Art. 13/14, Russia 152-FZ Art. 18, Uzbekistan
 * ZRU-547. Static page; no localization split until we have a translator.
 *
 * Sections:
 *   1. Кто мы и контакт DPO
 *   2. Какие данные собираем (минимизация)
 *   3. Цели обработки + правовые основания
 *   4. Под-процессоры (Supabase / Vercel / Google / Telegram)
 *   5. MediaPipe (биометрия) - on-device, кадры не покидают устройство
 *   6. AI / Gemini (потенциальное раскрытие, дисклеймер)
 *   7. Сроки хранения
 *   8. Права субъектов (доступ / удаление / портабельность)
 *   9. Международная передача
 *  10. Cookies / localStorage
 *  11. Изменения политики
 */
export default function PrivacyPage() {
  return (
    <main id="main-content" style={{
      maxWidth: 760, margin: '40px auto', padding: '0 24px',
      fontFamily: 'var(--font-body)', color: '#1A1A1A', lineHeight: 1.65,
    }}>
      {/* P2-SEO-3 — BreadcrumbList helps Google render rich snippets
          and improves "where am I" UX in SERP. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://ironmed-academy.vercel.app/' },
            { '@type': 'ListItem', position: 2, name: 'Политика конфиденциальности' },
          ],
        }) }}
      />
      <a
        href="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: '#6B7280', textDecoration: 'none',
          marginBottom: 18,
        }}
      >
        <span aria-hidden="true">←</span> На главную
      </a>
      <p style={{
        margin: 0, fontFamily: 'var(--font-mono)', fontSize: 11,
        color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        Юридический документ
      </p>
      <h1 style={{
        margin: '6px 0 6px', fontFamily: 'var(--font-display)', fontSize: 28,
        fontWeight: 700, letterSpacing: '-0.02em',
      }}>
        Политика конфиденциальности
      </h1>
      <p style={{ color: '#6B7280', fontSize: 13 }}>
        Действует с {LAST_UPDATED}. Применяется ко всем посетителям и зарегистрированным пользователям.
      </p>

      <Section h="1. Кто мы">
        <p>
          IronMed Academy («Bordik», «мы», «нам», «нас») — образовательная
          платформа для медиков и студентов. Если у вас есть вопросы об обработке
          ваших данных, права субъекта или жалоба — пишите на{' '}
          <a href="mailto:privacy@bordik.app">privacy@bordik.app</a>.
        </p>
        <p>
          Контакт по безопасности (уязвимости, инциденты):{' '}
          <a href="mailto:security@bordik.app">security@bordik.app</a> (PGP-ключ
          по запросу). Также см. <code>/.well-known/security.txt</code>.
        </p>
      </Section>

      <Section h="2. Какие данные мы собираем">
        <p>
          Мы стараемся собирать <strong>минимум</strong> данных, необходимых
          для работы платформы.
        </p>
        <ul>
          <li>
            <strong>Аккаунт:</strong> email-адрес и идентификатор пользователя
            (UUID). Если вы используете SSO Google — email и публичный профиль.
          </li>
          <li>
            <strong>Прогресс обучения:</strong> завершённые курсы, ответы на
            тесты, уровни сложности, время изучения. Хранятся в БД и зеркально
            в локальном хранилище браузера для офлайн-режима.
          </li>
          <li>
            <strong>Профиль:</strong> отображаемое имя, страна, специализация,
            язык, цель обучения — заполняются вами добровольно.
          </li>
          <li>
            <strong>Технические данные:</strong> IP-адрес (только в логах
            запросов), user-agent, тип устройства. Используются для
            предотвращения атак и диагностики.
          </li>
          <li>
            <strong>Прокторинг:</strong> кадры с камеры обрабатываются
            <em> только в вашем браузере</em>, на сервер не передаются. См. §5.
          </li>
        </ul>
      </Section>

      <Section h="3. Цели обработки и правовые основания">
        <table style={{
          width: '100%', borderCollapse: 'collapse', margin: '12px 0',
          fontSize: 14,
        }}>
          <thead>
            <tr style={{ background: '#F5F6F8', textAlign: 'left' }}>
              <th style={th}>Цель</th>
              <th style={th}>Категория данных</th>
              <th style={th}>Основание (GDPR Art. 6)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={td}>Аутентификация и работа аккаунта</td><td style={td}>email, UUID</td><td style={td}>Договор (b)</td></tr>
            <tr><td style={td}>Сохранение прогресса</td><td style={td}>прогресс, профиль</td><td style={td}>Договор (b)</td></tr>
            <tr><td style={td}>Прокторинг тестов</td><td style={td}>биометрия (на устройстве)</td><td style={td}>Явное согласие (a)</td></tr>
            <tr><td style={td}>AI-генерация вопросов</td><td style={td}>содержимое теста</td><td style={td}>Договор (b)</td></tr>
            <tr><td style={td}>Защита от атак</td><td style={td}>IP, user-agent</td><td style={td}>Законный интерес (f)</td></tr>
          </tbody>
        </table>
      </Section>

      <Section h="4. Под-процессоры">
        <p>
          Мы используем сторонние сервисы для отдельных функций. Данные
          обрабатываются ими по их условиям + нашим DPA, где это возможно.
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> (Frankfurt / Singapore) — аутентификация
            и БД. <a href="https://supabase.com/dpa">DPA</a>.
          </li>
          <li>
            <strong>Vercel</strong> (Global edge) — хостинг приложения.{' '}
            <a href="https://vercel.com/legal/dpa">DPA</a>.
          </li>
          <li>
            <strong>Google Generative Language API (Gemini)</strong> — генерация
            адаптивных тестов. См. §6.
          </li>
          <li>
            <strong>Telegram (через бот @bordik_feedback_bot)</strong> — приём
            обратной связи и приложений. Сообщения и файлы из формы «Обратная
            связь» доставляются в наш приватный Telegram-чат.
          </li>
          <li>
            <strong>SendGrid / Resend</strong> (если используется) — рассылка
            транзакционных писем (подтверждение почты, восстановление пароля).
          </li>
        </ul>
      </Section>

      <Section h="5. Прокторинг и MediaPipe (биометрические признаки)">
        <p>
          Для тестов с прокторингом мы используем библиотеку{' '}
          <strong>Google MediaPipe Tasks Vision</strong>{' '}
          (<code>face_landmarker</code>, <code>object_detector</code>),
          выполняющуюся в режиме WebAssembly + WebGL/WebGPU{' '}
          <strong>в вашем браузере</strong>.
        </p>
        <ul>
          <li>
            <strong>Видеопоток с камеры не покидает ваше устройство.</strong>{' '}
            Кадры не передаются на наш сервер и не сохраняются.
          </li>
          <li>
            Из кадра вычисляются <em>геометрические признаки</em>: положение
            лица, открытость глаз, наличие в кадре посторонних объектов
            (телефон, книга и т.д.). Эти признаки не используются для
            идентификации и не сохраняются после окончания сессии теста.
          </li>
          <li>
            На сервер передаются <em>только агрегированные счётчики событий</em>{' '}
            (например: «3 раза взгляд ушёл с экрана»), без скриншотов и без
            сырых данных лица.
          </li>
          <li>
            Согласие на использование камеры запрашивается отдельно перед
            каждым тестом с прокторингом. Вы можете отказаться — тест будет
            недоступен, но это не повлияет на остальные функции.
          </li>
          <li>
            <strong>В ЕС / Великобритании / РФ / Узбекистане</strong> признаки
            положения лица могут квалифицироваться как биометрия (особая
            категория данных). Правовое основание: ваше явное согласие
            (GDPR Art. 9(2)(a) / 152-ФЗ ст. 11). Вы можете отозвать согласие
            в любой момент через настройки профиля.
          </li>
        </ul>
      </Section>

      <Section h="6. AI / Google Gemini">
        <p>
          Адаптивный диагностический тест и часть учебного контента создаются
          с помощью <strong>Google Generative Language API (Gemini)</strong>.
          В запрос передаются только: тип запроса, история ваших ответов в
          текущей сессии (без идентификаторов аккаунта), список модулей курса.
        </p>
        <p>
          Google не получает: ваш email, имя, страну, IP-адрес. Мы не передаём
          никаких данных о вашей идентичности.
        </p>
        <p>
          <strong>Дисклеймер:</strong> AI-сгенерированный контент может
          содержать ошибки. Все материалы платформы — учебные, а не
          клинические рекомендации. Не используйте их для постановки диагноза
          или назначения лечения конкретным пациентам без проверки с
          профессионалом.
        </p>
      </Section>

      <Section h="7. Сроки хранения">
        <ul>
          <li>Аккаунт и прогресс: пока вы не удалите аккаунт.</li>
          <li>Технические логи (IP, ошибки запросов): 90 дней, затем удаление.</li>
          <li>Сообщения обратной связи: до 1 года, для разбора инцидентов.</li>
          <li>Резервные копии БД: 7 дней (зашифрованы).</li>
        </ul>
      </Section>

      <Section h="8. Ваши права">
        <p>В соответствии с GDPR / 152-ФЗ / ZRU-547 вы можете:</p>
        <ul>
          <li>Получить копию ваших данных (право на доступ).</li>
          <li>Удалить аккаунт и все данные (право на стирание, GDPR Art. 17).{' '}
            <a href="/api/account/delete">Самостоятельное удаление</a> (требует
            подтверждения через email).
          </li>
          <li>Перенести данные в другой сервис (право на портабельность).</li>
          <li>Отозвать согласие на прокторинг или AI-обработку.</li>
          <li>
            Подать жалобу регулятору — Роскомнадзор (РФ), Information Commissioner&apos;s Office (UK),
            EDPB (EU), Узкомназарат (Узбекистан).
          </li>
        </ul>
      </Section>

      <Section h="9. Международная передача данных">
        <p>
          Серверы Supabase и Vercel находятся вне РФ и Узбекистана. Передача
          данных регулируется Standard Contractual Clauses (EU) и аналогами.
          При signup мы запрашиваем согласие на трансграничную передачу — без
          него аккаунт не создаётся.
        </p>
      </Section>

      <Section h="10. Cookies и локальное хранилище">
        <p>
          Мы используем минимальный набор:
        </p>
        <ul>
          <li>
            <strong>Auth cookies</strong> (Supabase, httpOnly + secure +
            sameSite) — обязательные, для работы аутентификации.
          </li>
          <li>
            <strong>localStorage / IndexedDB</strong> — прогресс обучения,
            настройки UI, офлайн-кеш курсов. Не содержит email или
            идентификационных данных.
          </li>
          <li>
            <strong>Service Worker / Cache Storage</strong> — для работы PWA
            офлайн.
          </li>
          <li>
            <strong>Аналитика</strong> — не используем сторонние трекеры.
            Только серверные логи Vercel (без cookie).
          </li>
        </ul>
      </Section>

      <Section h="11. Изменения политики">
        <p>
          При существенных изменениях мы уведомим вас по email и баннером в
          приложении за 14 дней до вступления в силу. Минорные правки (опечатки,
          уточнения) могут вноситься без уведомления — дата редакции вверху.
        </p>
      </Section>

      <p style={{
        marginTop: 32, paddingTop: 16,
        borderTop: '1px solid #E5E7EB',
        fontSize: 13, color: '#6B7280',
      }}>
        <a href="/terms">Условия использования</a> ·{' '}
        <a href="/.well-known/security.txt">Security.txt</a> ·{' '}
        <a href="/">На главную</a>
      </p>
    </main>
  );
}

function Section({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700,
        marginBottom: 8,
      }}>
        {h}
      </h2>
      <div>{children}</div>
    </section>
  );
}

const th: React.CSSProperties = {
  padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6B7280',
  borderBottom: '1px solid #E5E7EB',
};
const td: React.CSSProperties = {
  padding: '8px 10px', borderBottom: '1px solid #F3F4F6', verticalAlign: 'top',
};

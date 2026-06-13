# Колесо баланса

Мобильное PWA для оценки 8 сфер жизни, постановки целей, планов, задач и ежедневных привычек.

## Стек

- Next.js 15 (App Router), React 19, Tailwind CSS
- Prisma 5 + PostgreSQL (Neon)
- NextAuth v5 + Google OAuth
- Recharts, Web Push, GitHub Actions Cron

## Быстрый старт

1. Скопируйте `.env.example` в `.env` и заполните переменные.
2. Создайте БД и примените схему:

```bash
pnpm db:push
```

3. Запустите dev-сервер:

```bash
pnpm dev
```

4. Откройте [http://localhost:3000](http://localhost:3000)

## Переменные окружения

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection (хост с `-pooler`) |
| `DIRECT_URL` | Neon **direct** connection (для `db:push` / migrate) |
| `AUTH_SECRET` | Секрет NextAuth (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push (`npx web-push generate-vapid-keys`) |
| `CRON_SECRET` | Защита `/api/cron/send-reminders` |
| `CRON_WINDOW_MINUTES` | `1` — точность до минуты (по умолчанию) |

## Экраны

- **Сегодня** — привычки и задачи на день
- **Дашборд** — колесо, прогресс дня, цели, streaks
- **Сферы** — 8 областей жизни, переоценка
- **Аналитика** — графики оценок и привычек
- **Настройки** — уведомления, переименование сфер

## PWA и push

- Добавьте приложение на домашний экран (обязательно для push на iOS).
- **Настройки** → «Включить push», затем push у каждой задачи/привычки.
- Cron через **[cron-job.org](https://cron-job.org)** (каждую минуту) — см. раздел ниже.

## Производительность

### Dev vs Prod

`pnpm dev` всегда медленнее из-за компиляции RSC. Для реальной оценки скорости:

```bash
pnpm build && pnpm start
```

### Кэш данных

Чтение страниц кэшируется на 30 сек (`unstable_cache` + тег `user-{id}`). После изменений кэш сбрасывается через server actions.

### Neon: регион БД

Если запросы >500 ms, перенесите БД ближе к себе:

1. [Neon Console](https://console.neon.tech) → **New Project** → регион **Frankfurt (eu-central-1)**
2. Скопируйте **Pooled** и **Direct** connection strings
3. Обновите `DATABASE_URL` и `DIRECT_URL` в `.env`
4. Перенесите данные (если нужно):
   ```bash
   pg_dump "$OLD_DIRECT_URL" | psql "$NEW_DIRECT_URL"
   ```
5. `pnpm db:push`

Ожидаемый эффект из EU/RU: **−300–600 ms** на каждый запрос к БД.

### После обновления auth

Если после деплоя снова попадаете на онбординг — выйдите и войдите заново (обновится JWT с полем `onboarded`).

## Деплой на Vercel

### 1. Подготовка

```bash
pnpm install
pnpm db:push          # схема в Neon (локально, через DIRECT_URL)
pnpm build            # проверка сборки
```

### 2. Деплой

```bash
pnpm dlx vercel login
pnpm dlx vercel link
pnpm dlx vercel env pull .env.vercel.local   # опционально
pnpm dlx vercel --prod
```

Или подключите GitHub-репозиторий в [Vercel Dashboard](https://vercel.com/new).

### 3. Environment Variables на Vercel

Скопируйте из локального `.env` (Settings → Environment Variables → Production):

| Переменная | Значение |
|---|---|
| `DATABASE_URL` | Neon pooled URL |
| `AUTH_SECRET` | тот же или новый секрет |
| `AUTH_GOOGLE_ID` | из Google Console |
| `AUTH_GOOGLE_SECRET` | из Google Console |
| `AUTH_URL` | `https://life-balance-murex.vercel.app` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | из `web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | из `web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | `mailto:ваш@email.com` |
| `CRON_SECRET` | случайная строка |
| `CRON_WINDOW_MINUTES` | `1` |

`DIRECT_URL` на Vercel **не нужен** (только для локального `db:push`).

### 4. Google OAuth — обновить URI

Замените `ВАШ-ПРОЕКТ` на `life-balance-murex` (или ваш домен):

**Authorized JavaScript origins:**
- `http://localhost:3000` (для dev)
- `https://life-balance-murex.vercel.app`

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google`
- `https://life-balance-murex.vercel.app/api/auth/callback/google`

### 5. После деплоя

1. Откройте https://life-balance-murex.vercel.app
2. Войдите через Google
3. Добавьте PWA на домашний экран (для push на iOS)
4. Настройте **cron-job.org** — см. ниже

## Push-напоминания и Cron

Vercel Hobby не умеет частый cron. Используйте **cron-job.org** (бесплатно, **каждую минуту**).

### 1. Vercel env

Добавьте на Vercel (если ещё нет):

| Переменная | Значение |
|---|---|
| `CRON_WINDOW_MINUTES` | `1` |

Остальное — `CRON_SECRET`, VAPID-ключи (см. таблицу выше).

### 2. cron-job.org (обязательно)

1. Регистрация: [cron-job.org](https://cron-job.org/en/signup/)
2. **Cronjobs → Create cronjob**
3. Заполните:

| Поле | Значение |
|---|---|
| Title | Life Balance reminders |
| URL | `https://life-balance-murex.vercel.app/api/cron/send-reminders` |
| Schedule | Every 1 minute |
| Request method | GET |

4. **Advanced → Headers** → добавьте:

```
Authorization: Bearer ВАШ_CRON_SECRET
```

(`CRON_SECRET` — тот же, что на Vercel)

5. **Create cronjob** → включите job (Enabled)

Проверка: **History** у job — статус 200, ответ `{"ok":true,...}`.

### 3. В приложении

1. **Настройки → Включить push**
2. У задачи/привычки: **Push-напоминание** + время (локальное)
3. iOS: PWA на экран «Домой»

### Ручная проверка (опционально)

GitHub → **Actions → Send push reminders (manual test) → Run workflow**  
(Secrets `CRON_SECRET` + `APP_URL` — только для теста)

### Альтернативы

| Способ | Точность | Цена |
|---|---|---|
| **cron-job.org** | 1 мин | Бесплатно |
| **Vercel Pro** | 1 мин | Платно |
| **Telegram-бот** | Мгновенно | Бесплатно, нужна интеграция |

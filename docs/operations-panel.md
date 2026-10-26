# Operations panel

Primary navigation covers overview, orders, videos, finance, customer accounts, characters and settings. Old bot leads, chats, templates and settings remain in the legacy area. The customer website is maintained separately.

## Financial setup

1. Open **Configurações → Custos e cálculo de margem**.
2. Enter the USD/BRL rate actually paid. It is intentionally unset initially.
3. Enter optional fallback payment fees and per-video overhead.
4. Add text/review model names and their input/output prices in USD per million tokens. Missing values remain unknown.
5. Open an order and choose **Conciliar taxas do provedor** to read payment fees. A manually entered order fee overrides provider/estimated fees. Order notes and test flags are stored separately from the original order.

The finance page supports search, dates, status, optional tests and authenticated CSV export with one row per video. Incomplete data does not produce a fictional margin. Historical AI costs can be incomplete. The result is an estimated contribution margin, not accounting net profit, and changes when financial assumptions change.

The video library and order detail use authenticated signed media URLs with native playback and seeking. Order details also expose the generation scene, original message, recipient information and all recorded attempts/costs. Generation retries require inline confirmation; server restrictions continue blocking historical orders.

All private routes, including preview/image/debug APIs and CSV export, require admin authentication. Credentials and upstream keys remain server-side. Financial writes go through the same-origin operations route.

Deployment requires the backend's additive `0016_admin_finance` migration. Back up the database, deploy the backend, then the panel. Preserve the existing worker cutoff, queue and disabled historical recovery. The runner must copy `public` for the locally hosted Manrope font (license in `public/fonts`).

Validate with `npm run build` and browser checks at desktop and mobile sizes. Exercise read-only filtering, export, media playback and seeking; do not trigger paid regeneration or change customer data during release checks.

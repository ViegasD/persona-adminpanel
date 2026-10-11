# Storefront Settings

`/manager/settings` loads the maintained `persona-website` backend through the
server-only `STOREFRONT_API_URL` and `STOREFRONT_ADMIN_KEY`. The legacy bot settings
remain separate and collapsed. A legacy backend outage does not hide the store.

The new section manages registration, accepting new checkouts, credit redemption,
mandatory account checkout, and existing package prices/limits/availability.
Email configuration and generation/recovery status are read-only deployment
diagnostics. No SMTP password or provider key is returned to the browser.

Free signup credits and paid-order bonuses are prohibited in backend code.
No setting can enable them. One video uses one credit; standalone credit sales
are not implemented and must not be advertised as available.

Backend revision `0014_storefront_policy` adds one configuration table without
updating customer/order/payment/credit records. Back up and migrate the backend
before deploying this admin release. Do not change the historical-processing hold
as part of this release. Saving new-order settings does not start a video worker,
change its eligibility cutoff, retry historical jobs, or cancel in-flight jobs.

Writes require configured `ADMIN_PASS`, the existing authenticated middleware,
same-origin requests, and server-side storefront authorization. Settings revisions
prevent silently overwriting another administrator's changes.

Set `ADMIN_USER` and `ADMIN_PASS` in the admin service runtime environment before
deploying. Production fails closed if the password is missing. Docker excludes
`.env` files and uses the portable dependency lockfile, including patched PostCSS.

Verify with `npm run build`, then `node scripts/verify-storefront-settings.cjs
<playwright-module-path>`. Browser tests use an isolated mock backend and never
write to the VPS. `--serve` leaves the isolated preview running for manual review.

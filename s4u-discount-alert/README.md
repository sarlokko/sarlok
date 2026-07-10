# S4U Discount Alert

Private, non-commercial Devvit app that reads Reddit directly and sends Gmail
alerts for S4U watch-face discounts between 50% and 100%.

## Reddit sources

The app checks:

- posts by `u/matze_styles4you`, the S4U developer account;
- `r/GalaxyWatchFace`;
- `r/wearosfaces`;
- `r/androidwatchfaces`;
- `r/WearOS`;
- `r/GalaxyWatch`.

It reads only public posts and comments through Reddit's official Devvit API.
It never posts, comments, votes, moderates, or sends Reddit messages.

## Schedule and filtering

The Devvit scheduler wakes the app hourly. The monitor performs Reddit reads
only at approximately 08:17, 14:17, and 20:17 in `Europe/Rome`, including
daylight-saving changes.

Each active run checks posts from the previous 24 hours. Redis remembers
successfully emailed Reddit post IDs for 45 days, preventing duplicate alerts
while allowing a later run to recover from a temporary Gmail failure.

An offer qualifies only when:

1. its title, body, or comments identify S4U/styles4you; and
2. an explicit discount from 50% through 100%, or a free offer, is detected.

The email contains the detected percentage, copyable coupon code, direct store
link, coupon-page link, and original Reddit post link whenever available.

## Gmail connection

Devvit cannot connect to Gmail SMTP. This app uses a private Google Apps Script
webhook that calls `GmailApp` from the owner's Google account.

1. Create a project at <https://script.google.com/>.
2. Replace the editor contents with `gmail-apps-script.gs`.
3. In **Project Settings → Script Properties**, add:
   - `WEBHOOK_TOKEN`: a random secret with at least 32 characters;
   - `ALERT_RECIPIENT`: the destination Gmail address.
4. Select **Deploy → New deployment → Web app**:
   - execute as **Me**;
   - access: **Anyone**.
5. Copy the deployment URL ending in `/exec`.
6. Configure the Devvit global settings:

```bash
npx devvit settings set gmail_webhook_url
npx devvit settings set gmail_webhook_token
npx devvit settings set alert_recipient
```

The recipient and token are validated by Apps Script. Stable notification IDs
also prevent duplicate Gmail deliveries if a webhook response is lost.

HTTP access to `script.google.com` and `script.googleusercontent.com` must be
approved by Reddit for the Devvit app. Devvit requires links to the included
privacy policy and terms when HTTP Fetch is enabled.

## Development

```bash
npm test
npm run dev
```

The playtest installs the app into its automatically created development
community. Use the moderator menu item **Check S4U discounts now** for a manual
run. Use **Send Gmail test** to verify the complete Devvit-to-Gmail connection
without waiting for a qualifying offer.

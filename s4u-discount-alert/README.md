# S4U Discount Alert

Private, non-commercial Devvit app that reads Reddit directly and sends private
Reddit alerts for S4U watch-face discounts between 50% and 100%.

## Reddit sources

The app checks:

- posts by `u/matze_styles4you`, the S4U developer account;
- `r/GalaxyWatchFace`;
- `r/wearosfaces`;
- `r/androidwatchfaces`;
- `r/WearOS`;
- `r/GalaxyWatch`.

It reads only public posts and comments through Reddit's official Devvit API.
It never posts, comments, votes, or moderates. Its only write action is sending
qualifying offer alerts to the configured Reddit account.

## Schedule and filtering

The Devvit scheduler wakes the app hourly. The monitor performs Reddit reads
only at approximately 08:17, 14:17, and 20:17 in `Europe/Rome`, including
daylight-saving changes.

Each active run checks posts from the previous 24 hours. Redis remembers
successfully notified Reddit post IDs for 45 days, preventing duplicate alerts
while allowing a later run to recover from a temporary delivery failure.

An offer qualifies only when:

1. its title, body, or comments identify S4U/styles4you; and
2. an explicit discount from 50% through 100%, or a free offer, is detected.

The private message contains the detected percentage, copyable coupon code,
direct store link, coupon-page link, and original Reddit post link whenever
available.

## Notifications

Reddit rejected the Google Apps Script domains required by the original Gmail
webhook design. The app therefore sends a private Reddit message without using
an external service. Reddit can forward private-message notifications to the
email address registered on the recipient's Reddit account.

The default recipient is `u/sarlokkko`. It can be changed in the Devvit global
settings or with:

```bash
npx devvit settings set reddit_recipient
```

To receive the same alert at the account's email address, enable Reddit email
notifications for private messages in **Settings → Emails**.

## Development

```bash
npm test
npm run dev
```

The playtest installs the app into its automatically created development
community. Use the moderator menu item **Check S4U discounts now** for a manual
run. Use **Send notification test** to verify private-message delivery without
waiting for a qualifying offer.

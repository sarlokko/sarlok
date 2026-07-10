# S4U Reddit alerts

This personal monitor searches Reddit for S4U watch-face offers discounted by
50–100% and sends a Gmail message containing:

- the detected discount;
- a copyable promo code, when present;
- direct Google Play or Galaxy Store links;
- coupon-page and original Reddit links.

The GitHub Actions workflow checks every hour so that the script can run at
08:00, 14:00 and 20:00 in `Europe/Rome`, including daylight-saving changes.
Only offers published in the completed interval since the previous scheduled
check are emailed, so normal scheduled runs do not overlap.

## One-time setup

### 1. Create a Reddit API application

Sign in to Reddit and open <https://www.reddit.com/prefs/apps>. Create a
confidential application (`web app` or `script`) for this personal read-only
monitor and copy its client ID and client secret.

The bot uses application-only OAuth. Do not provide or store the password of
the Reddit account.

### 2. Create a Gmail app password

Enable two-step verification on the sending Google account, then create an app
password at <https://myaccount.google.com/apppasswords>. A normal Gmail
password will not work with the SMTP connection.

### 3. Add GitHub Actions secrets

In the repository, open **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
| --- | --- |
| `REDDIT_CLIENT_ID` | Reddit application's client ID |
| `REDDIT_CLIENT_SECRET` | Reddit application's client secret |
| `REDDIT_USER_AGENT` | For example `script:s4u-watchface-alert:1.0 (by /u/yourname)` |
| `GMAIL_USERNAME` | Full Gmail address used to send alerts |
| `GMAIL_APP_PASSWORD` | The 16-character Google app password |
| `ALERT_RECIPIENT` | Gmail address that receives the alerts |

Never commit these values to the repository or paste them into an issue or
pull request.

Scheduled workflows run only from the repository's default branch. Merge the
workflow there after reviewing it. GitHub may automatically disable scheduled
workflows in a public repository after 60 days without repository activity;
re-enable the workflow from the Actions page if that happens.

## Manual verification

Use **Actions → S4U Reddit discount alerts → Run workflow** and leave
`dry_run` enabled. The run log reports matching offers without sending email.
After the dry run succeeds, a manual run with `dry_run` disabled verifies Gmail
delivery. Manual runs inspect the previous 24 hours and can therefore repeat an
offer already sent by a scheduled run.

For local tests:

```bash
python3 -m unittest tools/s4u_reddit_alert/test_s4u_reddit_alert.py
```

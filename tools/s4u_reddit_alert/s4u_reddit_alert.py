#!/usr/bin/env python3
"""Send Gmail alerts for new S4U watch-face discounts found on Reddit."""

from __future__ import annotations

import argparse
import base64
import html
import json
import os
import re
import smtplib
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, time, timedelta, timezone
from email.message import EmailMessage
from typing import Any, Iterable
from zoneinfo import ZoneInfo


ROME = ZoneInfo("Europe/Rome")
SCHEDULE_HOURS = (8, 14, 20)
USER_AGENT_DEFAULT = "script:s4u-watchface-alert:1.0 (personal monitor)"
SEARCH_TERMS = ('"S4U" watchface', '"S4U" "watch face"', '"styles4you"')

BRAND_PATTERN = re.compile(r"\bS4U\b|styles\s*4\s*you|styles4you", re.IGNORECASE)
DISCOUNT_PATTERN = re.compile(
    r"(?P<pct>100|[5-9]\d)\s*%\s*(?:off|discount|sale|sconto)?"
    r"|(?:off|discount|sale|sconto)\s*(?:of|del|fino\s+al|up\s+to)?\s*"
    r"(?P<pct_after>100|[5-9]\d)\s*%",
    re.IGNORECASE,
)
FREE_PATTERN = re.compile(
    r"\b(?:free|gratis|gratuito|giveaway)\b|(?:€|\$|£)\s*0(?:[.,]00)?\b",
    re.IGNORECASE,
)
URL_PATTERN = re.compile(r"https?://[^\s<>\"]+", re.IGNORECASE)
LABELED_CODE_PATTERN = re.compile(
    r"(?:promo(?:tional)?|coupon|discount|redeem|voucher|codice)"
    r"(?:\s+(?:code|codice))?\s*(?:is|è|:|=|-)\s*"
    r"`?([A-Z0-9][A-Z0-9-]{4,31})`?",
    re.IGNORECASE,
)
GENERIC_CODE_PATTERN = re.compile(r"(?<![A-Za-z0-9])([A-Z0-9]{10,32})(?![A-Za-z0-9])")

STORE_HOSTS = (
    "play.google.com",
    "galaxystore.samsung.com",
    "galaxy.store",
    "apps.samsung.com",
)
COUPON_HOST_HINTS = ("coupon", "promo", "redeem")


class MonitorError(RuntimeError):
    """A configuration or remote-service error."""


@dataclass(frozen=True)
class Config:
    reddit_client_id: str
    reddit_client_secret: str
    reddit_user_agent: str
    gmail_username: str
    gmail_app_password: str
    recipient: str

    @classmethod
    def from_environment(cls, *, require_mail: bool = True) -> "Config":
        values = {
            "reddit_client_id": os.getenv("REDDIT_CLIENT_ID", "").strip(),
            "reddit_client_secret": os.getenv("REDDIT_CLIENT_SECRET", "").strip(),
            "reddit_user_agent": (
                os.getenv("REDDIT_USER_AGENT", "").strip() or USER_AGENT_DEFAULT
            ),
            "gmail_username": os.getenv("GMAIL_USERNAME", "").strip(),
            "gmail_app_password": os.getenv("GMAIL_APP_PASSWORD", "").replace(" ", ""),
            "recipient": os.getenv("ALERT_RECIPIENT", "").strip(),
        }
        required = ["reddit_client_id", "reddit_client_secret"]
        if require_mail:
            required.extend(["gmail_username", "gmail_app_password", "recipient"])
        environment_names = {
            "reddit_client_id": "REDDIT_CLIENT_ID",
            "reddit_client_secret": "REDDIT_CLIENT_SECRET",
            "gmail_username": "GMAIL_USERNAME",
            "gmail_app_password": "GMAIL_APP_PASSWORD",
            "recipient": "ALERT_RECIPIENT",
        }
        missing = [environment_names[name] for name in required if not values[name]]
        if missing:
            raise MonitorError(
                "Missing required environment variables: " + ", ".join(missing)
            )
        return cls(**values)


@dataclass(frozen=True)
class Offer:
    reddit_id: str
    title: str
    reddit_url: str
    discount: int
    watchface_links: tuple[str, ...]
    coupon_links: tuple[str, ...]
    code: str | None
    created_at: datetime


def should_run(now: datetime) -> bool:
    """Return true once the hourly workflow reaches a configured Rome hour."""
    local_now = now.astimezone(ROME)
    return local_now.hour in SCHEDULE_HOURS


def scheduled_window(now: datetime) -> tuple[datetime, datetime]:
    """Return the latest complete interval between two scheduled Rome slots."""
    local_now = now.astimezone(ROME)
    slots: list[datetime] = []
    for day_offset in (-2, -1, 0):
        day = local_now.date() + timedelta(days=day_offset)
        slots.extend(
            datetime.combine(day, time(hour=hour), tzinfo=ROME)
            for hour in SCHEDULE_HOURS
        )
    completed_slots = sorted(slot for slot in slots if slot <= local_now)
    if len(completed_slots) < 2:  # pragma: no cover - defensive only
        raise MonitorError("Unable to calculate the scheduled search window")
    return (
        completed_slots[-2].astimezone(timezone.utc),
        completed_slots[-1].astimezone(timezone.utc),
    )


def force_window(now: datetime, hours: int = 24) -> tuple[datetime, datetime]:
    return now.astimezone(timezone.utc) - timedelta(hours=hours), now.astimezone(
        timezone.utc
    )


class RedditClient:
    def __init__(self, client_id: str, client_secret: str, user_agent: str) -> None:
        self.client_id = client_id
        self.client_secret = client_secret
        self.user_agent = user_agent
        self.access_token = ""

    def authenticate(self) -> None:
        credentials = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()
        request = urllib.request.Request(
            "https://www.reddit.com/api/v1/access_token",
            data=urllib.parse.urlencode({"grant_type": "client_credentials"}).encode(),
            headers={
                "Authorization": f"Basic {credentials}",
                "User-Agent": self.user_agent,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method="POST",
        )
        payload = self._open_json(request)
        token = payload.get("access_token")
        if not token:
            raise MonitorError("Reddit OAuth did not return an access token")
        self.access_token = str(token)

    def get(self, path: str, params: dict[str, str | int]) -> Any:
        if not self.access_token:
            self.authenticate()
        url = "https://oauth.reddit.com" + path
        url += "?" + urllib.parse.urlencode(params)
        request = urllib.request.Request(
            url,
            headers={
                "Authorization": f"bearer {self.access_token}",
                "User-Agent": self.user_agent,
            },
        )
        return self._open_json(request)

    @staticmethod
    def _open_json(request: urllib.request.Request) -> Any:
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except urllib.error.HTTPError as exc:
            detail = exc.read(500).decode(errors="replace")
            raise MonitorError(
                f"Reddit returned HTTP {exc.code}: {detail or exc.reason}"
            ) from exc
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise MonitorError(f"Reddit request failed: {exc}") from exc

    def search(self, query: str) -> list[dict[str, Any]]:
        payload = self.get(
            "/search",
            {
                "q": query,
                "sort": "new",
                "t": "week",
                "limit": 100,
                "type": "link",
                "raw_json": 1,
            },
        )
        return [
            child.get("data", {})
            for child in payload.get("data", {}).get("children", [])
            if child.get("kind") == "t3"
        ]

    def comments(self, reddit_id: str) -> list[str]:
        payload = self.get(
            f"/comments/{reddit_id}",
            {"sort": "top", "limit": 50, "depth": 2, "raw_json": 1},
        )
        if not isinstance(payload, list) or len(payload) < 2:
            return []
        return list(_comment_bodies(payload[1]))


def _comment_bodies(node: Any) -> Iterable[str]:
    if isinstance(node, dict):
        if node.get("kind") == "t1":
            body = node.get("data", {}).get("body")
            if isinstance(body, str):
                yield body
        for value in node.values():
            yield from _comment_bodies(value)
    elif isinstance(node, list):
        for value in node:
            yield from _comment_bodies(value)


def detect_discount(text: str) -> int | None:
    percentages = [
        int(match.group("pct") or match.group("pct_after"))
        for match in DISCOUNT_PATTERN.finditer(text)
    ]
    if FREE_PATTERN.search(text):
        percentages.append(100)
    return max(percentages) if percentages else None


def extract_urls(text: str) -> list[str]:
    result: list[str] = []
    for match in URL_PATTERN.finditer(html.unescape(text)):
        url = match.group(0).rstrip(".,;:!?)\\]}'")
        if url not in result:
            result.append(url)
    return result


def classify_links(urls: Iterable[str]) -> tuple[tuple[str, ...], tuple[str, ...]]:
    store_links: list[str] = []
    coupon_links: list[str] = []
    for url in urls:
        host = urllib.parse.urlparse(url).netloc.lower()
        lowered = url.lower()
        if any(store_host in host for store_host in STORE_HOSTS):
            if url not in store_links:
                store_links.append(url)
        elif any(hint in lowered for hint in COUPON_HOST_HINTS):
            if url not in coupon_links:
                coupon_links.append(url)
    return tuple(store_links), tuple(coupon_links)


def extract_code(text: str) -> str | None:
    labeled = LABELED_CODE_PATTERN.search(text)
    if labeled:
        return labeled.group(1).upper()
    for match in GENERIC_CODE_PATTERN.finditer(text):
        candidate = match.group(1)
        if any(character.isalpha() for character in candidate) and any(
            character.isdigit() for character in candidate
        ):
            return candidate
    return None


def post_to_offer(
    post: dict[str, Any],
    comments: Iterable[str],
    window_start: datetime,
    window_end: datetime,
) -> Offer | None:
    try:
        created_at = datetime.fromtimestamp(float(post["created_utc"]), timezone.utc)
    except (KeyError, TypeError, ValueError, OSError):
        return None
    if not window_start <= created_at < window_end:
        return None

    title = str(post.get("title", "")).strip()
    selftext = str(post.get("selftext", ""))
    comment_text = "\n".join(comments)
    combined = "\n".join((title, selftext, comment_text))
    if not BRAND_PATTERN.search(combined):
        return None
    discount = detect_discount(combined)
    if discount is None or not 50 <= discount <= 100:
        return None

    urls = extract_urls(combined)
    external_url = str(post.get("url_overridden_by_dest") or post.get("url") or "")
    if external_url.startswith(("http://", "https://")) and external_url not in urls:
        urls.insert(0, external_url)
    watchface_links, coupon_links = classify_links(urls)

    permalink = str(post.get("permalink", ""))
    reddit_url = (
        urllib.parse.urljoin("https://www.reddit.com", permalink)
        if permalink
        else "https://www.reddit.com"
    )
    return Offer(
        reddit_id=str(post.get("id", "")),
        title=title or "Offerta S4U",
        reddit_url=reddit_url,
        discount=discount,
        watchface_links=watchface_links,
        coupon_links=coupon_links,
        code=extract_code(combined),
        created_at=created_at,
    )


def collect_offers(
    client: RedditClient, window_start: datetime, window_end: datetime
) -> list[Offer]:
    posts: dict[str, dict[str, Any]] = {}
    for query in SEARCH_TERMS:
        for post in client.search(query):
            reddit_id = str(post.get("id", ""))
            if reddit_id:
                posts[reddit_id] = post

    offers: list[Offer] = []
    for reddit_id, post in posts.items():
        title_and_body = f"{post.get('title', '')}\n{post.get('selftext', '')}"
        if not BRAND_PATTERN.search(title_and_body):
            continue
        comments = client.comments(reddit_id)
        offer = post_to_offer(post, comments, window_start, window_end)
        if offer:
            offers.append(offer)
    return sorted(offers, key=lambda offer: offer.created_at)


def build_message(
    sender: str,
    recipient: str,
    offers: list[Offer],
    window_start: datetime,
    window_end: datetime,
) -> EmailMessage:
    message = EmailMessage()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = (
        f"S4U: {len(offers)} "
        f"{'offerta trovata' if len(offers) == 1 else 'offerte trovate'}"
    )

    plain_parts = [
        "Nuove offerte S4U trovate su Reddit:",
        "",
    ]
    html_parts = [
        "<h2>Nuove offerte S4U trovate su Reddit</h2>",
        "<p>Codici e link sono riportati direttamente qui sotto.</p>",
    ]
    for offer in offers:
        if offer.code:
            code_text = offer.code
        elif offer.coupon_links:
            code_text = "Da ottenere dalla pagina coupon"
        elif offer.discount == 100:
            code_text = "Nessun codice rilevato (offerta gratuita)"
        else:
            code_text = "Codice non trovato"
        action_links = tuple(
            dict.fromkeys((*offer.watchface_links, *offer.coupon_links))
        )
        plain_parts.extend(
            [
                f"{offer.title} — {offer.discount}% di sconto",
                f"Codice: {code_text}",
                *[f"Watchface: {link}" for link in offer.watchface_links],
                *[f"Pagina coupon: {link}" for link in offer.coupon_links],
                f"Post Reddit: {offer.reddit_url}",
                "",
            ]
        )
        links_html = "".join(
            f'<li><a href="{html.escape(link, quote=True)}">'
            f"Apri {'la watchface' if link in offer.watchface_links else 'la pagina coupon'}"
            "</a></li>"
            for link in action_links
        )
        if not links_html:
            links_html = "<li>Link diretto non trovato: apri il post Reddit.</li>"
        html_parts.extend(
            [
                "<hr>",
                f"<h3>{html.escape(offer.title)}</h3>",
                f"<p><strong>Sconto: {offer.discount}%</strong></p>",
                "<p>Codice:</p>",
                '<p style="font: bold 22px monospace; padding: 12px; '
                'background: #f2f2f2; display: inline-block;">'
                f"{html.escape(code_text)}</p>",
                f"<ul>{links_html}</ul>",
                f'<p><a href="{html.escape(offer.reddit_url, quote=True)}">'
                "Apri il post Reddit</a></p>",
            ]
        )

    local_start = window_start.astimezone(ROME).strftime("%d/%m/%Y %H:%M")
    local_end = window_end.astimezone(ROME).strftime("%d/%m/%Y %H:%M")
    footer = f"Intervallo controllato: {local_start}–{local_end} (Europe/Rome)"
    plain_parts.append(footer)
    html_parts.append(f"<p><small>{html.escape(footer)}</small></p>")
    message.set_content("\n".join(plain_parts))
    message.add_alternative("\n".join(html_parts), subtype="html")
    return message


def send_gmail(config: Config, message: EmailMessage) -> None:
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=30) as smtp:
            smtp.login(config.gmail_username, config.gmail_app_password)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        raise MonitorError(f"Gmail delivery failed: {exc}") from exc


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--force",
        action="store_true",
        help="run outside scheduled hours and inspect the previous 24 hours",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="print matches without sending email",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    now = datetime.now(timezone.utc)
    if not args.force and not should_run(now):
        print(
            f"Skipped: current Europe/Rome hour is {now.astimezone(ROME).hour:02d}; "
            f"scheduled hours are {SCHEDULE_HOURS}."
        )
        return 0

    config = Config.from_environment(require_mail=not args.dry_run)
    window_start, window_end = (
        force_window(now) if args.force else scheduled_window(now)
    )
    client = RedditClient(
        config.reddit_client_id,
        config.reddit_client_secret,
        config.reddit_user_agent,
    )
    offers = collect_offers(client, window_start, window_end)
    print(f"Found {len(offers)} qualifying S4U offer(s).")
    for offer in offers:
        print(
            json.dumps(
                {
                    "title": offer.title,
                    "discount": offer.discount,
                    "code": offer.code,
                    "watchface_links": offer.watchface_links,
                    "coupon_links": offer.coupon_links,
                    "reddit_url": offer.reddit_url,
                },
                ensure_ascii=False,
            )
        )

    if not offers or args.dry_run:
        return 0
    message = build_message(
        config.gmail_username,
        config.recipient,
        offers,
        window_start,
        window_end,
    )
    send_gmail(config, message)
    print(f"Alert sent to {config.recipient}.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except MonitorError as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)

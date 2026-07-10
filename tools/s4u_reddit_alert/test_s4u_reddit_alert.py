import os
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch


sys.path.insert(0, str(Path(__file__).parent))

from s4u_reddit_alert import (  # noqa: E402
    Config,
    MonitorError,
    build_message,
    classify_links,
    detect_discount,
    extract_code,
    extract_urls,
    post_to_offer,
    scheduled_window,
    should_run,
)


class ScheduleTests(unittest.TestCase):
    def test_runs_at_rome_schedule_in_summer(self):
        self.assertTrue(should_run(datetime(2026, 7, 10, 6, 20, tzinfo=timezone.utc)))
        self.assertFalse(should_run(datetime(2026, 7, 10, 7, 20, tzinfo=timezone.utc)))

    def test_runs_at_rome_schedule_in_winter(self):
        self.assertTrue(should_run(datetime(2026, 1, 10, 7, 20, tzinfo=timezone.utc)))

    def test_scheduled_window_uses_previous_slot(self):
        start, end = scheduled_window(
            datetime(2026, 7, 10, 6, 20, tzinfo=timezone.utc)
        )
        self.assertEqual(start, datetime(2026, 7, 9, 18, 0, tzinfo=timezone.utc))
        self.assertEqual(end, datetime(2026, 7, 10, 6, 0, tzinfo=timezone.utc))


class ExtractionTests(unittest.TestCase):
    def test_detects_supported_discounts(self):
        self.assertEqual(detect_discount("S4U watch face is 50% OFF"), 50)
        self.assertEqual(detect_discount("Sconto fino al 75%"), 75)
        self.assertEqual(detect_discount("Free S4U watchface this weekend"), 100)

    def test_rejects_discounts_below_threshold(self):
        self.assertIsNone(detect_discount("Save 49% on this face"))

    def test_extracts_labeled_and_google_style_codes(self):
        self.assertEqual(extract_code("Promo code: AB12-CD34-EF56"), "AB12-CD34-EF56")
        self.assertEqual(extract_code("Use ABC123DEF456GHI789JK"), "ABC123DEF456GHI789JK")

    def test_extracts_and_classifies_links(self):
        text = (
            "[Get it](https://play.google.com/store/apps/details?id=s4u.test), "
            "then visit https://watchface-coupon.example/code."
        )
        urls = extract_urls(text)
        store_links, coupon_links = classify_links(urls)
        self.assertEqual(
            store_links,
            ("https://play.google.com/store/apps/details?id=s4u.test",),
        )
        self.assertEqual(
            coupon_links, ("https://watchface-coupon.example/code",)
        )

    def test_builds_offer_from_post_and_comments(self):
        post = {
            "id": "abc123",
            "title": "S4U Assen — 75% OFF",
            "selftext": (
                "https://play.google.com/store/apps/details?id=com.watch.s4u"
            ),
            "permalink": "/r/WearOS/comments/abc123/s4u_assen/",
            "created_utc": datetime(2026, 7, 10, 9, tzinfo=timezone.utc).timestamp(),
        }
        offer = post_to_offer(
            post,
            ["Coupon code: A1B2C3D4E5F6"],
            datetime(2026, 7, 10, 8, tzinfo=timezone.utc),
            datetime(2026, 7, 10, 10, tzinfo=timezone.utc),
        )
        self.assertIsNotNone(offer)
        assert offer is not None
        self.assertEqual(offer.discount, 75)
        self.assertEqual(offer.code, "A1B2C3D4E5F6")
        self.assertEqual(
            offer.watchface_links,
            ("https://play.google.com/store/apps/details?id=com.watch.s4u",),
        )

    def test_rejects_non_s4u_post(self):
        post = {
            "id": "abc123",
            "title": "Other brand — 100% OFF",
            "selftext": "",
            "created_utc": datetime(2026, 7, 10, 9, tzinfo=timezone.utc).timestamp(),
        }
        self.assertIsNone(
            post_to_offer(
                post,
                [],
                datetime(2026, 7, 10, 8, tzinfo=timezone.utc),
                datetime(2026, 7, 10, 10, tzinfo=timezone.utc),
            )
        )


class MessageTests(unittest.TestCase):
    def test_message_contains_copyable_code_and_links(self):
        post = {
            "id": "abc123",
            "title": "S4U Assen — 50% OFF",
            "selftext": (
                "https://play.google.com/store/apps/details?id=s4u.test "
                "https://watchface-coupon.example/code"
            ),
            "permalink": "/r/WearOS/comments/abc123/example/",
            "created_utc": datetime(2026, 7, 10, 9, tzinfo=timezone.utc).timestamp(),
        }
        offer = post_to_offer(
            post,
            ["Code: CODE123456"],
            datetime(2026, 7, 10, 8, tzinfo=timezone.utc),
            datetime(2026, 7, 10, 10, tzinfo=timezone.utc),
        )
        assert offer is not None
        message = build_message(
            "sender@gmail.com",
            "recipient@gmail.com",
            [offer],
            datetime(2026, 7, 10, 8, tzinfo=timezone.utc),
            datetime(2026, 7, 10, 10, tzinfo=timezone.utc),
        )
        self.assertEqual(message["To"], "recipient@gmail.com")
        self.assertIn("CODE123456", message.get_body(preferencelist=("plain",)).get_content())
        self.assertIn(
            "play.google.com",
            message.get_body(preferencelist=("html",)).get_content(),
        )
        self.assertIn(
            "watchface-coupon.example",
            message.get_body(preferencelist=("html",)).get_content(),
        )


class ConfigurationTests(unittest.TestCase):
    def test_mail_values_are_optional_for_dry_run(self):
        environment = {
            "REDDIT_CLIENT_ID": "client",
            "REDDIT_CLIENT_SECRET": "secret",
        }
        with patch.dict(os.environ, environment, clear=True):
            config = Config.from_environment(require_mail=False)
        self.assertEqual(config.reddit_client_id, "client")
        self.assertEqual(config.gmail_username, "")
        self.assertTrue(config.reddit_user_agent)

    def test_empty_user_agent_secret_uses_default(self):
        environment = {
            "REDDIT_CLIENT_ID": "client",
            "REDDIT_CLIENT_SECRET": "secret",
            "REDDIT_USER_AGENT": "",
        }
        with patch.dict(os.environ, environment, clear=True):
            config = Config.from_environment(require_mail=False)
        self.assertIn("s4u-watchface-alert", config.reddit_user_agent)

    def test_missing_reddit_credentials_fail(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(MonitorError):
                Config.from_environment(require_mail=False)


if __name__ == "__main__":
    unittest.main()

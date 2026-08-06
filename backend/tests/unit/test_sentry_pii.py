"""Unit tests for the Sentry PII filter (_strip_pii).

These tests prove that resume text, auth tokens, and AI prompts are scrubbed
from Sentry events before they leave the process, satisfying the Phase 10
observability exit gate for the controlled-error drill.
"""

from app.main import _strip_pii


def _make_event(**overrides) -> dict:
    base = {
        "request": {
            "method": "POST",
            "url": "/api/v1/score",
            "headers": {
                "content-type": "application/json",
                "authorization": "Bearer eyJhbGci...",
                "cookie": "sb-pagdtcttkviglyoeuagy-auth-token=secret",
                "set-cookie": "session=abc",
            },
            "data": {"resume_text": "John Smith, 5 years Python experience..."},
            "body": '{"job_description": "Senior Python engineer..."}',
        },
        "extra": {"job_text": "Senior engineer at ACME Corp"},
        "exception": {
            "values": [
                {
                    "stacktrace": {
                        "frames": [
                            {
                                "filename": "app/api/routes/score.py",
                                "lineno": 42,
                                "vars": {
                                    "resume_data": {"name": "John Smith"},
                                    "job_desc": "Software engineer role...",
                                },
                            }
                        ]
                    }
                }
            ]
        },
    }
    base.update(overrides)
    return base


def test_strips_request_data_and_body():
    event = _make_event()
    result = _strip_pii(event, {})
    assert "data" not in result["request"]
    assert "body" not in result["request"]


def test_strips_auth_header():
    event = _make_event()
    result = _strip_pii(event, {})
    assert "authorization" not in result["request"]["headers"]


def test_strips_cookie_header():
    event = _make_event()
    result = _strip_pii(event, {})
    assert "cookie" not in result["request"]["headers"]


def test_strips_set_cookie_header():
    event = _make_event()
    result = _strip_pii(event, {})
    assert "set-cookie" not in result["request"]["headers"]


def test_preserves_content_type_header():
    event = _make_event()
    result = _strip_pii(event, {})
    assert result["request"]["headers"]["content-type"] == "application/json"


def test_strips_stack_frame_local_vars():
    event = _make_event()
    result = _strip_pii(event, {})
    frame = result["exception"]["values"][0]["stacktrace"]["frames"][0]
    assert "vars" not in frame


def test_strips_extra():
    event = _make_event()
    result = _strip_pii(event, {})
    assert "extra" not in result


def test_tolerates_missing_request():
    event = {"message": "An error occurred"}
    result = _strip_pii(event, {})
    assert result["message"] == "An error occurred"


def test_tolerates_missing_exception():
    event = _make_event()
    del event["exception"]
    result = _strip_pii(event, {})
    assert "data" not in result["request"]


def test_tolerates_empty_headers():
    event = _make_event()
    event["request"]["headers"] = {}
    result = _strip_pii(event, {})
    assert result["request"]["headers"] == {}


def test_returns_event_dict():
    event = _make_event()
    result = _strip_pii(event, {})
    assert isinstance(result, dict)

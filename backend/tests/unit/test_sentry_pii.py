"""Unit tests for the allowlisted Sentry error envelope."""

import json

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
        "message": "Failed for John Smith, 5 years Python experience",
        "breadcrumbs": {"values": [{"message": "Senior engineer at ACME Corp"}]},
        "contexts": {"trace": {"resume": "John Smith"}},
        "tags": {"job_description": "Senior Python engineer"},
        "transaction": "/api/v1/score?email=john@example.com",
        "exception": {
            "values": [
                {
                    "type": "RuntimeError",
                    "value": "Unexpected provider output: John Smith",
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
    assert "request" not in result


def test_strips_auth_header():
    event = _make_event()
    result = _strip_pii(event, {})
    assert "request" not in result


def test_strips_cookie_header():
    event = _make_event()
    result = _strip_pii(event, {})
    assert "request" not in result


def test_strips_set_cookie_header():
    event = _make_event()
    result = _strip_pii(event, {})
    assert "request" not in result


def test_drops_all_request_headers():
    event = _make_event()
    result = _strip_pii(event, {})
    assert "request" not in result


def test_strips_stack_frame_local_vars():
    event = _make_event()
    result = _strip_pii(event, {})
    frame = result["exception"]["values"][0]["stacktrace"]["frames"][0]
    assert "vars" not in frame
    assert frame["filename"] == "app/api/routes/score.py"


def test_strips_extra():
    event = _make_event()
    result = _strip_pii(event, {})
    assert "extra" not in result


def test_tolerates_missing_request():
    event = {"message": "An error occurred"}
    result = _strip_pii(event, {})
    assert result["message"] == "Application error details redacted"


def test_tolerates_missing_exception():
    event = _make_event()
    del event["exception"]
    result = _strip_pii(event, {})
    assert "request" not in result


def test_tolerates_empty_headers():
    event = _make_event()
    event["request"]["headers"] = {}
    result = _strip_pii(event, {})
    assert "request" not in result


def test_returns_event_dict():
    event = _make_event()
    result = _strip_pii(event, {})
    assert isinstance(result, dict)


def test_sensitive_values_are_absent_from_serialized_event():
    result = _strip_pii(_make_event(), {})
    serialized = json.dumps(result)
    for forbidden in (
        "John Smith",
        "Senior Python engineer",
        "ACME Corp",
        "eyJhbGci",
        "john@example.com",
    ):
        assert forbidden not in serialized


def test_exception_value_is_generic_but_type_and_location_remain():
    result = _strip_pii(_make_event(), {})
    exception = result["exception"]["values"][0]
    assert exception["type"] == "RuntimeError"
    assert exception["value"] == "Application error details redacted"
    assert exception["stacktrace"]["frames"][0]["lineno"] == 42

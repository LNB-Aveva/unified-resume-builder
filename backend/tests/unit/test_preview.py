"""The public preview must be deterministic and must not spend AI quota."""

import pytest

from app.services.ai.preview import preview_rewrite_bullet


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("source", "expected_start"),
    [
        ("Responsible for managing the sales team", "Managed"),
        ("Helped with customer complaints", "Supported"),
        ("Worked on improving website performance", "Improved"),
    ],
)
async def test_preview_replaces_weak_opening_without_inventing_facts(source, expected_start):
    result = await preview_rewrite_bullet(source)

    assert result["original"] == source
    assert result["rewritten"].startswith(expected_start)
    assert result["rewritten"].endswith(".")
    assert result["improvement"] == "Replaced weak opening"


@pytest.mark.anyio
async def test_preview_preserves_strong_bullet_content():
    source = "Built Python APIs for three internal teams"

    result = await preview_rewrite_bullet(source)

    assert result == {
        "original": source,
        "rewritten": f"{source}.",
        "improvement": "Focused the opening action",
    }


@pytest.mark.anyio
async def test_preview_normalizes_bullet_marker_and_whitespace():
    result = await preview_rewrite_bullet("-   Worked on   release automation  ")

    assert result["original"] == "Worked on   release automation"
    assert result["rewritten"] == "Developed release automation."

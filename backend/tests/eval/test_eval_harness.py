"""Pytest wrapper for the evaluation harness — ensures scoring quality stays above threshold."""

from tests.eval.run_eval import run_eval


class TestScoringQuality:
    def test_within_one_grade_80_percent(self):
        report = run_eval(verbose=False)
        assert report["within_one_pct"] >= 80, (
            f"Only {report['within_one_pct']}% within one grade "
            f"(failures: {', '.join(report['failures'])})"
        )

    def test_no_strong_match_scores_f(self):
        """An obviously good resume should never score F."""
        report = run_eval(verbose=False)
        for r in report["results"]:
            if r["expected"] in ("A", "B"):
                assert r["actual"] != "F", (
                    f"{r['id']}: expected {r['expected']} but got F "
                    f"(score={r['score']})"
                )

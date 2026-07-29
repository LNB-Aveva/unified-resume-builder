"""Evaluation harness: runs resume/JD pairs through the scorer and compares to expected grades."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.schemas.job import JobDescription
from app.services.nlp.keyword_extractor import extract_keywords
from app.services.scoring.ats_scorer import score_from_text

_GRADE_ORDER = {"A": 0, "B": 1, "C": 2, "D": 3, "F": 4}
_DATASET_PATH = Path(__file__).parent / "eval_dataset.json"


def _grade_distance(actual: str, expected: str) -> int:
    return abs(_GRADE_ORDER[actual] - _GRADE_ORDER[expected])


def run_eval(dataset_path: Path = _DATASET_PATH, verbose: bool = True) -> dict:
    with open(dataset_path, encoding="utf-8") as f:
        cases = json.load(f)

    results = []
    exact = 0
    within_one = 0
    failures = []

    for case in cases:
        job = JobDescription(raw_text=case["job_description"])
        analysis = extract_keywords(job)
        score = score_from_text(analysis, case["resume_text"])

        expected = case["expected_grade"]
        actual = score.grade
        distance = _grade_distance(actual, expected)
        ok = distance <= 1

        if actual == expected:
            exact += 1
        if ok:
            within_one += 1
        else:
            failures.append(case["id"])

        results.append({
            "id": case["id"],
            "expected": expected,
            "actual": actual,
            "score": score.overall_score,
            "distance": distance,
            "pass": ok,
            "matched": score.total_matched,
            "missing": score.total_missing,
            "missing_keywords": score.missing_keywords[:5],
        })

    total = len(cases)
    exact_pct = round(exact / total * 100, 1) if total else 0
    within_one_pct = round(within_one / total * 100, 1) if total else 0

    if verbose:
        print(f"\n{'='*70}")
        print(f"  EVALUATION REPORT — {total} cases")
        print(f"{'='*70}\n")

        for r in results:
            status = "PASS" if r["pass"] else "FAIL"
            marker = " " if r["pass"] else "!"
            grade_info = f"{r['expected']}→{r['actual']}"
            print(
                f" {marker} [{status}] {r['id']:<35} "
                f"expected={r['expected']} actual={r['actual']} "
                f"score={r['score']:5.1f}  matched={r['matched']} missing={r['missing']}"
            )
            if not r["pass"] and r["missing_keywords"]:
                print(f"          missing: {', '.join(r['missing_keywords'])}")

        print(f"\n{'-'*70}")
        print(f"  Exact match:    {exact}/{total} ({exact_pct}%)")
        print(f"  Within 1 grade: {within_one}/{total} ({within_one_pct}%)")
        if failures:
            print(f"  Failures:       {', '.join(failures)}")
        print(f"{'-'*70}")

        target = "80%+ within one grade"
        if within_one_pct >= 80:
            print(f"\n  EXIT GATE: PASS ({target})")
        else:
            print(f"\n  EXIT GATE: FAIL (need {target}, got {within_one_pct}%)")

    return {
        "total": total,
        "exact": exact,
        "exact_pct": exact_pct,
        "within_one": within_one,
        "within_one_pct": within_one_pct,
        "failures": failures,
        "results": results,
    }


if __name__ == "__main__":
    report = run_eval()
    sys.exit(0 if report["within_one_pct"] >= 80 else 1)

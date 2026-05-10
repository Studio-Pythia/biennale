#!/usr/bin/env python3
"""Data quality agent for pavilion funding/selection records.

Runs consistency checks over data/pavilions.json and writes:
- reports/data-quality-report.json (machine-readable)
- reports/data-quality-report.md (human-readable backlog)

This can be scheduled in CI/cron to improve data in the background.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "pavilions.json"
REPORT_DIR = ROOT / "reports"
JSON_REPORT = REPORT_DIR / "data-quality-report.json"
MD_REPORT = REPORT_DIR / "data-quality-report.md"


@dataclass
class Issue:
    pavilion_id: str
    country: str
    severity: str
    category: str
    message: str
    fix_hint: str


def has_nonempty_text(value: Any) -> bool:
    return isinstance(value, str) and value.strip() != ""


def analyze_record(row: dict[str, Any]) -> list[Issue]:
    issues: list[Issue] = []

    pid = str(row.get("id", "unknown"))
    country = str(row.get("country", "Unknown"))

    budget_disclosed = bool(row.get("total_budget_disclosed", False))
    budget_amount = row.get("total_budget_amount_usd")
    public_sources = row.get("public_funding_sources") or []
    private_funders = row.get("private_funders") or []
    selection_method = str(row.get("selection_method", "unknown"))
    selection_notes = str(row.get("selection_method_notes", "")).strip()
    sources = row.get("sources") or []

    if budget_disclosed and budget_amount is None:
        issues.append(Issue(pid, country, "high", "budget", "Budget marked disclosed but amount is null.", "Set total_budget_amount_usd or change total_budget_disclosed=false."))

    if (not budget_disclosed) and budget_amount is not None:
        issues.append(Issue(pid, country, "medium", "budget", "Budget amount present but total_budget_disclosed is false.", "Set total_budget_disclosed=true or remove amount if uncertain."))

    if not public_sources and not private_funders:
        issues.append(Issue(pid, country, "high", "funding", "No public or private funding sources listed.", "Add at least one funding source or explain non-disclosure in notes."))

    if selection_method in {"open_call", "panel", "ministerial", "invitation"} and not selection_notes:
        issues.append(Issue(pid, country, "medium", "selection", "Selection method set without supporting notes.", "Add selection_method_notes with process details and source links."))

    if selection_method == "unknown":
        issues.append(Issue(pid, country, "low", "selection", "Selection method unknown.", "Research commissioning body process and update selection_method."))

    if len(sources) < 2:
        issues.append(Issue(pid, country, "medium", "sources", "Fewer than 2 source links.", "Add at least two corroborating sources (official + independent)."))

    for idx, funder in enumerate(private_funders):
        if not has_nonempty_text(funder.get("name")):
            issues.append(Issue(pid, country, "high", "funding", f"Private funder #{idx + 1} missing name.", "Fill in private_funders[].name."))
        if not has_nonempty_text(funder.get("sector")):
            issues.append(Issue(pid, country, "low", "funding", f"Private funder #{idx + 1} missing sector.", "Add private_funders[].sector for context."))

    return issues


def build_markdown(issues: list[Issue], total: int) -> str:
    by_severity: dict[str, list[Issue]] = {"high": [], "medium": [], "low": []}
    for issue in issues:
        by_severity.setdefault(issue.severity, []).append(issue)

    lines = [
        "# Pavilion Data Quality Report",
        "",
        f"Records scanned: **{total}**",
        f"Issues found: **{len(issues)}**",
        "",
    ]

    for severity in ["high", "medium", "low"]:
        items = by_severity.get(severity, [])
        lines.append(f"## {severity.title()} severity ({len(items)})")
        lines.append("")
        for i in items:
            lines.append(f"- **{i.country} ({i.pavilion_id})** · `{i.category}` · {i.message}  ")
            lines.append(f"  Fix: {i.fix_hint}")
        lines.append("")

    return "\n".join(lines)


def main() -> None:
    rows = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    issues: list[Issue] = []
    for row in rows:
        issues.extend(analyze_record(row))

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "records_scanned": len(rows),
        "issues_found": len(issues),
        "issues": [asdict(i) for i in issues],
    }
    JSON_REPORT.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    MD_REPORT.write_text(build_markdown(issues, len(rows)), encoding="utf-8")

    print(f"Wrote {JSON_REPORT}")
    print(f"Wrote {MD_REPORT}")
    print(f"Found {len(issues)} issues across {len(rows)} pavilions")


if __name__ == "__main__":
    main()

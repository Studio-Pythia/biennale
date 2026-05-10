#!/usr/bin/env python3
"""
Biennale press-coverage scraper.

For each of the 97 national pavilions, ask Claude Haiku (with the web_search
tool) to find a 2026 Biennale review on each of 6 art-press outlets and
return a structured record (headline, date, snippet, sentiment, key phrases,
validation flag).

Output: data/press_coverage.json (sidecar to data/pavilions.json).

Usage:
  python3 scripts/press_extraction.py [--dry-run]
  python3 scripts/press_extraction.py --pavilion PA
  python3 scripts/press_extraction.py --outlet artforum
  python3 scripts/press_extraction.py --pavilion AT --outlet frieze --dry-run
  python3 scripts/press_extraction.py --skip-existing      # skip pavilions already in output

Env: ANTHROPIC_API_KEY (scripts/.env or process env).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from anthropic import Anthropic

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PAVILIONS_PATH = DATA_DIR / "pavilions.json"
OUTPUT_PATH = DATA_DIR / "press_coverage.json"

# --- env loading ---
env_file = Path(__file__).parent / ".env"
if env_file.exists():
    for line in env_file.read_text().strip().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY")
if not ANTHROPIC_KEY:
    print("ERROR: ANTHROPIC_API_KEY not set (scripts/.env or process env).", file=sys.stderr)
    sys.exit(1)

HAIKU_MODEL = "claude-haiku-4-5-20251001"
PER_OUTLET_CONCURRENCY = 3
MAX_WEB_SEARCHES = 3  # per (pavilion, outlet) call

# --- Outlets, with the host the search should be filtered to.
OUTLETS: dict[str, dict[str, str]] = {
    "art_newspaper":  {"label": "The Art Newspaper", "host": "theartnewspaper.com"},
    "artnews":        {"label": "ARTnews",            "host": "artnews.com"},
    "frieze":         {"label": "Frieze",             "host": "frieze.com"},
    "hyperallergic":  {"label": "Hyperallergic",      "host": "hyperallergic.com"},
    "e_flux":         {"label": "e-flux",             "host": "e-flux.com"},
    "artforum":       {"label": "Artforum",           "host": "artforum.com"},
}

WEB_SEARCH_TOOL = {
    "type": "web_search_20250305",
    "name": "web_search",
    "max_uses": MAX_WEB_SEARCHES,
}

EXTRACT_SYSTEM = (
    "You are a research assistant extracting structured metadata about Venice "
    "Biennale 2026 national-pavilion press coverage. You use the web_search tool "
    "to find the best matching article on a specified outlet, then return a "
    "single JSON object with the requested fields. Be strict: if no genuine "
    "article on the outlet about the named pavilion exists, return "
    'validated=false with empty fields rather than fabricating. Reply with the '
    "JSON object only, no prose, no code fences."
)


@dataclass
class PressEntry:
    outlet: str
    outlet_label: str
    url: str
    headline: str
    published_at: str | None
    snippet: str
    sentiment: str  # "positive" | "mixed" | "negative" | "unknown"
    key_phrases: list[str]
    validated: bool
    validation_notes: str = ""


def load_pavilions() -> list[dict[str, Any]]:
    return json.loads(PAVILIONS_PATH.read_text())


def load_existing_output() -> dict[str, Any]:
    if OUTPUT_PATH.exists():
        try:
            return json.loads(OUTPUT_PATH.read_text())
        except json.JSONDecodeError:
            return {}
    return {}


def build_prompt(country: str, outlet_key: str) -> str:
    outlet = OUTLETS[outlet_key]
    return f"""Find the most relevant article published by {outlet["label"]} (host: {outlet["host"]}) about the {country} national pavilion at the Venice Biennale 2026.

Use the web_search tool with a site-restricted query, e.g.:
  site:{outlet["host"]} "{country}" pavilion Biennale 2026

Then return EXACTLY this JSON object:
{{
  "url": "...",                       // canonical article URL on {outlet["host"]} (or "" if none)
  "headline": "...",                  // article headline (or "")
  "published_at": "YYYY-MM-DD" | null,
  "snippet": "...",                   // 1-2 sentence factual summary of what the article says about the {country} pavilion
  "sentiment": "positive" | "mixed" | "negative" | "unknown",
  "key_phrases": ["...", "..."],      // up to 5 short phrases (<=6 words each) capturing the article's framing
  "validated": true | false,          // true ONLY if a substantive article on {outlet["host"]} about the {country} pavilion at Biennale 2026 was found (not a passing mention, not a different year, not a generic preview). Otherwise false.
  "validation_notes": "..."           // 1 sentence explaining the verdict
}}

Reply with ONLY that JSON object."""


def parse_haiku_json(text: str) -> dict | None:
    raw = text.strip()
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
    return None


def find_for_outlet(client: Anthropic, country: str, outlet_key: str) -> PressEntry | None:
    prompt = build_prompt(country, outlet_key)
    try:
        msg = client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=900,
            system=EXTRACT_SYSTEM,
            tools=[WEB_SEARCH_TOOL],
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as e:
        print(f"  haiku/web_search error ({outlet_key}): {e}", file=sys.stderr)
        return None

    text_blocks = [b.text for b in msg.content if getattr(b, "type", None) == "text"]
    if not text_blocks:
        return None
    payload = parse_haiku_json(text_blocks[-1])
    if not payload:
        print(f"  haiku returned non-JSON for {outlet_key}: {text_blocks[-1][:200]}", file=sys.stderr)
        return None

    outlet = OUTLETS[outlet_key]
    return PressEntry(
        outlet=outlet_key,
        outlet_label=outlet["label"],
        url=str(payload.get("url") or "").strip(),
        headline=str(payload.get("headline") or "").strip(),
        published_at=payload.get("published_at"),
        snippet=str(payload.get("snippet") or "").strip(),
        sentiment=str(payload.get("sentiment") or "unknown").strip().lower(),
        key_phrases=[str(p).strip() for p in (payload.get("key_phrases") or [])][:5],
        validated=bool(payload.get("validated", False)),
        validation_notes=str(payload.get("validation_notes") or "").strip(),
    )


async def gather_pavilion(
    client: Anthropic,
    pavilion: dict,
    outlet_keys: list[str],
    semaphore: asyncio.Semaphore,
) -> list[PressEntry]:
    country = pavilion["country"]

    async def one(key: str) -> PressEntry | None:
        async with semaphore:
            return await asyncio.to_thread(find_for_outlet, client, country, key)

    results = await asyncio.gather(*(one(k) for k in outlet_keys))
    return [r for r in results if r and r.url]


async def main_async(args) -> int:
    pavilions = load_pavilions()
    if args.pavilion:
        pavilions = [p for p in pavilions if p["id"].lower() == args.pavilion.lower()]
        if not pavilions:
            print(f"No pavilion with id={args.pavilion}", file=sys.stderr)
            return 1

    outlet_keys = [args.outlet] if args.outlet else list(OUTLETS.keys())
    for k in outlet_keys:
        if k not in OUTLETS:
            print(f"Unknown outlet: {k}. Available: {list(OUTLETS)}", file=sys.stderr)
            return 1

    client = Anthropic(api_key=ANTHROPIC_KEY)
    semaphore = asyncio.Semaphore(PER_OUTLET_CONCURRENCY)

    output: dict[str, dict] = load_existing_output()
    started = time.time()

    for pavilion in pavilions:
        pid = pavilion["id"]
        country = pavilion["country"]
        if args.skip_existing and pid in output and output[pid].get("entries"):
            print(f"[{pid}] {country} — skipped (already in output)")
            continue

        print(f"[{pid}] {country}")
        entries = await gather_pavilion(client, pavilion, outlet_keys, semaphore)
        for e in entries:
            flag = "✓" if e.validated else "?"
            print(f"   {flag} {e.outlet_label}: {e.headline[:80]}")
            if e.url:
                print(f"     {e.url}")
        if not entries:
            print(f"   (no coverage found)")

        output[pid] = {
            "id": pid,
            "country": country,
            "scraped_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "entries": [asdict(e) for e in entries],
        }
        if not args.dry_run:
            OUTPUT_PATH.write_text(json.dumps(output, indent=2, ensure_ascii=False))

    elapsed = time.time() - started
    found = sum(len(v.get("entries", [])) for v in output.values())
    validated = sum(
        1 for v in output.values() for e in v.get("entries", []) if e.get("validated")
    )
    print(
        f"\nDone in {elapsed:.1f}s — {validated} validated / {found} total entries "
        f"across {len(output)} pavilions"
    )
    if args.dry_run:
        print("(dry-run: nothing written)")
    else:
        print(f"Wrote {OUTPUT_PATH}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pavilion", help="ISO code; scrape just one pavilion")
    parser.add_argument("--outlet", help=f"One of: {', '.join(OUTLETS)}")
    parser.add_argument("--dry-run", action="store_true", help="Don't write output file")
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip pavilions that already have entries in the output file",
    )
    args = parser.parse_args()
    return asyncio.run(main_async(args))


if __name__ == "__main__":
    sys.exit(main())

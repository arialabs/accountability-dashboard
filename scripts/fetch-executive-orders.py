#!/usr/bin/env python3
"""Fetch executive orders from the Federal Register API.

Writes src/data/executive-orders.json. Run by .github/workflows/eo-sync.yml
daily; can also be run locally: python3 scripts/fetch-executive-orders.py
"""

import json
import time
import urllib.parse
import urllib.request

OUTPUT_PATH = "src/data/executive-orders.json"
SIGNING_DATE_GTE = "2025-01-20"

CATEGORIES = {
    "Immigration & Border": ["immigration", "border", "asylum", "migrant", "alien", "deportat", "sanctuary", "visa", "refugee"],
    "National Security": ["national security", "defense", "military", "terror", "intel", "foreign", "weapon", "nato", "war", "armed forces"],
    "Trade & Tariffs": ["tariff", "trade", "import", "export", "commerce", "duty", "steel", "aluminum"],
    "Energy & Environment": ["energy", "oil", "gas", "coal", "drill", "environment", "climate", "emission", "natural resource", "mineral"],
    "Government Reform": ["federal workforce", "government", "agency", "regulation", "deregulat", "bureauc", "doge", "efficiency", "spending"],
    "Civil Rights": ["civil right", "dei", "diversity", "equity", "inclusion", "discriminat", "affirmative"],
    "Healthcare": ["health", "medicaid", "medicare", "drug", "pharma", "medical", "fda"],
    "Technology": ["technology", "ai ", "artificial intelligence", "cyber", "digital", "data"],
    "Finance & Economy": ["financial", "economic", "crypto", "bank", "tax", "budget", "inflation"],
}


def fetch_eos(page=1, per_page=100):
    params = urllib.parse.urlencode(
        {
            "fields[]": [
                "title", "document_number", "type", "signing_date",
                "abstract", "html_url", "agencies", "topics",
                "executive_order_number",
            ],
            "conditions[type][]": "PRESDOCU",
            "conditions[presidential_document_type][]": "executive_order",
            "conditions[signing_date][gte]": SIGNING_DATE_GTE,
            "per_page": per_page,
            "page": page,
            "order": "newest",
        },
        doseq=True,
    )
    url = f"https://www.federalregister.gov/api/v1/documents.json?{params}"
    with urllib.request.urlopen(url) as r:
        return json.load(r)


def categorize(title):
    t = title.lower()
    for cat, keywords in CATEGORIES.items():
        if any(kw in t for kw in keywords):
            return cat
    return "Other"


def main():
    all_results = []
    page = 1
    while True:
        data = fetch_eos(page=page)
        results = data["results"]
        all_results.extend(results)
        print(f"Page {page}: {len(results)} results ({len(all_results)} / {data['count']})", flush=True)
        if len(all_results) >= data["count"] or len(results) < 100:
            break
        page += 1
        time.sleep(0.5)

    clean = []
    for r in all_results:
        agencies = [a.get("name", "") for a in (r.get("agencies") or [])]
        title = r.get("title", "")
        clean.append(
            {
                "document_number": r.get("document_number", ""),
                "eo_number": r.get("executive_order_number"),
                "title": title,
                "signing_date": r.get("signing_date", ""),
                "abstract": r.get("abstract") or "",
                "html_url": r.get("html_url", ""),
                "agencies": agencies,
                "topics": r.get("topics") or [],
                "category": categorize(title),
            }
        )

    out = {
        "total": len(clean),
        "source": "Federal Register API",
        "last_updated": time.strftime("%Y-%m-%d"),
        "orders": clean,
    }
    with open(OUTPUT_PATH, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Wrote {len(clean)} executive orders")


if __name__ == "__main__":
    main()

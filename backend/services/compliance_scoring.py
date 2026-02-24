"""
Compliance Scoring Engine
Applies weighted scoring to GDPR/CCPA compliance analysis results.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Score Weights (total = 100)
# -------------------------------------------------------------------
SCORE_WEIGHTS = {
    "data_collection":       15,
    "processing_purpose":    10,
    "gdpr_rights":           20,
    "ccpa_rights":           20,
    "data_retention":        10,
    "security_measures":     10,
    "transparency":          10,
    "third_party_sharing":    5,
}

# Mapping from human-readable detected section names → weight keys
_SECTION_KEY_MAP: dict[str, str] = {
    # Data Collection
    "data collection":        "data_collection",
    "data collection practices": "data_collection",
    "personal data collected": "data_collection",
    "categories of data collected": "data_collection",
    "categories of data":     "data_collection",
    # Processing Purpose
    "processing purpose":     "processing_purpose",
    "purpose of processing":  "processing_purpose",
    "lawful basis":           "processing_purpose",
    "purpose limitation":     "processing_purpose",
    # GDPR Rights
    "gdpr rights":            "gdpr_rights",
    "user rights":            "gdpr_rights",
    "data subject rights":    "gdpr_rights",
    "right of access":        "gdpr_rights",
    "right to rectification": "gdpr_rights",
    "right to erasure":       "gdpr_rights",
    "right to portability":   "gdpr_rights",
    # CCPA Rights
    "ccpa rights":            "ccpa_rights",
    "consumer rights":        "ccpa_rights",
    "right to know":          "ccpa_rights",
    "right to delete":        "ccpa_rights",
    "right to opt out":       "ccpa_rights",
    "ccpa opt-out":           "ccpa_rights",
    "opt-out":                "ccpa_rights",
    "opt out":                "ccpa_rights",
    # Data Retention
    "data retention":         "data_retention",
    "data retention policy":  "data_retention",
    "retention period":       "data_retention",
    # Security Measures
    "security measures":      "security_measures",
    "security":               "security_measures",
    "data security":          "security_measures",
    "technical measures":     "security_measures",
    # Transparency
    "transparency":           "transparency",
    "privacy notice":         "transparency",
    "notice of collection":   "transparency",
    "privacy policy":         "transparency",
    # Third Party Sharing
    "third party sharing":    "third_party_sharing",
    "third-party sharing":    "third_party_sharing",
    "data sharing":           "third_party_sharing",
    "data sale disclosure":   "third_party_sharing",
    "data sale":              "third_party_sharing",
}

# Which weight keys count toward GDPR vs CCPA sub-scores
_GDPR_KEYS = {"data_collection", "processing_purpose", "gdpr_rights", "data_retention", "security_measures", "transparency"}
_CCPA_KEYS = {"data_collection", "ccpa_rights", "third_party_sharing", "transparency"}

GDPR_PASS_THRESHOLD = 70
CCPA_PASS_THRESHOLD = 70


def calculate_compliance_score(ai_result: dict[str, Any]) -> dict[str, Any]:
    """
    Merge AI-detected sections with the weighted scoring engine.

    Takes the raw AI result and overlays deterministic scoring:
    - Calculates an overall score (0-100).
    - Derives GDPR and CCPA statuses based on sub-score thresholds.

    Returns the enriched result dict (same keys but with recalculated score/statuses).
    """
    detected = ai_result.get("detected_sections", [])
    detected_lower = {s.lower().strip() for s in detected}

    # Determine which weight keys are satisfied
    satisfied_keys: set[str] = set()
    for section in detected_lower:
        key = _SECTION_KEY_MAP.get(section)
        if key:
            satisfied_keys.add(key)

    # Calculate overall score
    total_score = sum(
        weight for key, weight in SCORE_WEIGHTS.items()
        if key in satisfied_keys
    )

    # Calculate GDPR sub-score (normalised to 100)
    gdpr_max = sum(SCORE_WEIGHTS[k] for k in _GDPR_KEYS)
    gdpr_earned = sum(SCORE_WEIGHTS[k] for k in _GDPR_KEYS if k in satisfied_keys)
    gdpr_pct = round((gdpr_earned / gdpr_max) * 100) if gdpr_max else 0

    # Calculate CCPA sub-score (normalised to 100)
    ccpa_max = sum(SCORE_WEIGHTS[k] for k in _CCPA_KEYS)
    ccpa_earned = sum(SCORE_WEIGHTS[k] for k in _CCPA_KEYS if k in satisfied_keys)
    ccpa_pct = round((ccpa_earned / ccpa_max) * 100) if ccpa_max else 0

    gdpr_status = "PASS" if gdpr_pct >= GDPR_PASS_THRESHOLD else "FAIL"
    ccpa_status = "PASS" if ccpa_pct >= CCPA_PASS_THRESHOLD else "FAIL"

    # Build missing sections list from unsatisfied weights
    missing = _build_missing_sections(satisfied_keys)

    logger.info(
        "Compliance score: %d/100 | GDPR: %s (%d%%) | CCPA: %s (%d%%)",
        total_score, gdpr_status, gdpr_pct, ccpa_status, ccpa_pct,
    )

    return {
        "gdpr_status": gdpr_status,
        "ccpa_status": ccpa_status,
        "score": total_score,
        "detected_sections": ai_result.get("detected_sections", []),
        "missing_sections": missing,
        "ai_suggestions": ai_result.get("ai_suggestions", []),
    }


def _build_missing_sections(satisfied: set[str]) -> list[str]:
    """Build human-readable missing sections list from unsatisfied weight keys."""
    key_to_label = {
        "data_collection":    "Data Collection Practices",
        "processing_purpose": "Processing Purpose / Lawful Basis",
        "gdpr_rights":        "GDPR Data Subject Rights",
        "ccpa_rights":        "CCPA Consumer Rights / Opt-Out",
        "data_retention":     "Data Retention Policy",
        "security_measures":  "Security Measures",
        "transparency":       "Transparency / Privacy Notice",
        "third_party_sharing": "Third Party Sharing / Data Sale Disclosure",
    }
    return [
        label for key, label in key_to_label.items()
        if key not in satisfied
    ]

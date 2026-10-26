"""
ScamShield AI - FastAPI inference service (STUB for Module 2).

This is the contract the Express backend calls. Replace the `score_*` functions with the real
multilingual models (Module 3) - keep the request/response shapes and nothing else needs to change.

Run:  uvicorn main:app --port 8000 --reload
"""
import os
import re
from typing import Optional

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel, Field
from spam_similarity import find_similar_spam

app = FastAPI(title="ScamShield AI inference (stub)", version="0.1.0")

INTERNAL_KEY = os.getenv("AI_INTERNAL_KEY", "")
MAX_IMAGE_BYTES = int(os.getenv("SCAN_MAX_IMAGE_MB", "5")) * 1024 * 1024


def require_internal_key(x_internal_key: Optional[str] = Header(default=None)) -> None:
    """Only the Express backend should call this service. Skipped when no key is configured (local dev)."""
    if INTERNAL_KEY and x_internal_key != INTERNAL_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")


# ------------------------------------------------------------------ response contract
class AnalysisResult(BaseModel):
    verdict: str = Field(description="safe | suspicious | scam")
    risk_score: int = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=1)
    language: Optional[str] = None
    reasons: list[str] = []
    signals: dict = {}


def build(score: int, reasons: list[str], language: Optional[str] = None, **signals) -> AnalysisResult:
    score = max(0, min(100, score))
    verdict = "scam" if score >= 70 else "suspicious" if score >= 35 else "safe"
    return AnalysisResult(
        verdict=verdict, risk_score=score, confidence=0.5, language=language,
        reasons=reasons or ["No obvious scam indicators were found."],
        signals={"stub": True, **signals},
    )


# ------------------------------------------------------------------ request contracts
class TextIn(BaseModel):
    scan_id: str
    text: str = Field(min_length=1, max_length=20000)


class UrlIn(BaseModel):
    scan_id: str
    url: str
    original: Optional[str] = None
    hostname: str
    scheme_assumed: bool = False
    has_credentials: bool = False
    is_punycode: bool = False
    is_ip_host: bool = False


class PhoneIn(BaseModel):
    scan_id: str
    phone: str
    kind: str  # "number" | "short_code"
    e164: Optional[str] = None
    country: Optional[str] = None
    is_valid: Optional[bool] = None


# ------------------------------------------------------------------ placeholder scoring (replace me)
URGENCY = re.compile(r"urgent|immediately|blocked|suspended|expire|last chance|فوری|بند|ابھی", re.I)
MONEY = re.compile(r"prize|lottery|winner|reward|cash|refund|inam|انعام|بینظیر|bisp|loan", re.I)
CREDENTIALS = re.compile(r"\botp\b|\bpin\b|password|cnic|verify your|account number|شناختی", re.I)


def score_text(text: str) -> AnalysisResult:
    score, reasons = 0, []
    if URGENCY.search(text):
        score += 25; reasons.append("Uses urgent or threatening language to pressure you.")
    if MONEY.search(text):
        score += 30; reasons.append("Promises money, prizes or refunds.")
    if CREDENTIALS.search(text):
        score += 35; reasons.append("Asks for sensitive details such as an OTP, PIN or CNIC.")
    if re.search(r"https?://|bit\.ly|tinyurl", text, re.I):
        score += 10; reasons.append("Contains a link - check it before opening.")
    match = find_similar_spam(text)
    spam_similarity = match["spam_similarity"]
    ham_similarity = match["ham_similarity"]
    # A close match is supporting evidence for suspicious spam, never enough to label a message a scam.
    if match["applicable"]:
        if spam_similarity >= 0.80 and spam_similarity - ham_similarity >= 0.15:
            score = max(score, 40)
            reasons.append("Closely resembles known spam SMS patterns in the UCI SMS Spam Collection dataset.")
        elif spam_similarity < 0.80:
            reasons.append("No close match was found in the dataset's English SMS spam examples; this alone does not confirm the message is safe.")
        else:
            reasons.append("The message also resembles legitimate examples in the dataset, so its similarity signal is inconclusive.")
    return build(
        score,
        reasons,
        dataset="uci_sms_spam_collection",
        dataset_applicable=match["applicable"],
        spam_similarity=spam_similarity,
        ham_similarity=ham_similarity,
    )


def score_url(u: UrlIn) -> AnalysisResult:
    score, reasons = 0, []
    if u.is_ip_host:
        score += 40; reasons.append("The link uses a raw IP address instead of a domain name.")
    if u.is_punycode:
        score += 35; reasons.append("The domain uses look-alike (punycode) characters.")
    if u.has_credentials:
        score += 40; reasons.append("The link hides its real destination behind a 'user@' prefix.")
    if u.hostname.count("-") >= 3 or u.hostname.count(".") >= 4:
        score += 20; reasons.append("The domain has an unusual number of hyphens or subdomains.")
    if re.search(r"\.(zip|xyz|top|click|gq|tk|ml)$", u.hostname):
        score += 15; reasons.append("The domain ends in a TLD often used in scams.")
    return build(score, reasons)


def score_phone(p: PhoneIn) -> AnalysisResult:
    if p.kind == "short_code":
        return build(10, ["Short codes can't be verified here - confirm with the organisation's official site."], kind=p.kind)
    reasons = [] if p.is_valid else ["The number has an unusual format for its country."]
    return build(0 if p.is_valid else 30, reasons, country=p.country, kind=p.kind)


# ------------------------------------------------------------------ routes
@app.get("/health")
def health():
    return {"status": "ok", "stub": True}


@app.post("/analyze/text", response_model=AnalysisResult, dependencies=[Depends(require_internal_key)])
def analyze_text(body: TextIn):
    return score_text(body.text)


@app.post("/analyze/url", response_model=AnalysisResult, dependencies=[Depends(require_internal_key)])
def analyze_url(body: UrlIn):
    return score_url(body)


@app.post("/analyze/phone", response_model=AnalysisResult, dependencies=[Depends(require_internal_key)])
def analyze_phone(body: PhoneIn):
    return score_phone(body)


@app.post("/analyze/image", response_model=AnalysisResult, dependencies=[Depends(require_internal_key)])
async def analyze_image(scan_id: str = Form(...), file: UploadFile = File(...)):
    data = await file.read(MAX_IMAGE_BYTES + 1)
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="image too large")
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="unsupported image type")
    # TODO (Module 3): OCR the screenshot, then run score_text on the extracted text.
    # Keep the bytes in memory only - do not write them to disk.
    return build(0, ["Screenshot received. OCR analysis is not connected yet (stub)."], bytes=len(data))

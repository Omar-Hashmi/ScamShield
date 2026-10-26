"""Similarity lookup against the UCI SMS Spam Collection corpus."""
from collections import Counter
from functools import lru_cache
import math
from pathlib import Path
import re

CORPUS_PATH = Path(__file__).parent / "data" / "SMSSpamCollection.tsv"
TOKEN_RE = re.compile(r"[a-z0-9]+", re.IGNORECASE)


def _vector(tokens: list[str], idf: dict[str, float]) -> dict[str, float]:
    counts = Counter(tokens)
    weighted = {term: (1 + math.log(count)) * idf.get(term, 0.0) for term, count in counts.items()}
    norm = math.sqrt(sum(weight * weight for weight in weighted.values()))
    return {term: weight / norm for term, weight in weighted.items()} if norm else {}


@lru_cache(maxsize=1)
def _corpus():
    labeled = []
    with CORPUS_PATH.open(encoding="utf-8", errors="replace") as source:
        for line in source:
            label, sep, message = line.rstrip("\r\n").partition("\t")
            if sep and label in {"spam", "ham"} and message.strip():
                labeled.append((label, message.strip()))

    # IDF is calculated over the full corpus so common legitimate language carries little weight.
    documents = []
    for label, message in labeled:
        words = TOKEN_RE.findall(message.lower())
        # Word bigrams help distinguish recurring spam phrases from isolated keywords.
        tokens = words + [f"{a}_{b}" for a, b in zip(words, words[1:])]
        documents.append((label, message, tokens))
    document_frequency = Counter(term for _, _, terms in documents for term in set(terms))
    count = max(len(documents), 1)
    idf = {term: math.log((count + 1) / (freq + 1)) + 1 for term, freq in document_frequency.items()}
    return idf, [(label, _vector(terms, idf)) for label, _, terms in documents]


def find_similar_spam(message: str) -> dict:
    """Return the closest spam and ham similarity scores; never returns corpus text."""
    words = TOKEN_RE.findall(message.lower())
    letters = [char for char in message if char.isalpha()]
    latin_ratio = sum("a" <= char.lower() <= "z" for char in letters) / max(len(letters), 1)
    if len(words) < 4 or latin_ratio < 0.7:
        return {"applicable": False, "spam_similarity": 0.0, "ham_similarity": 0.0}

    idf, documents = _corpus()
    tokens = words + [f"{a}_{b}" for a, b in zip(words, words[1:])]
    query = _vector(tokens, idf)
    best = {"spam": 0.0, "ham": 0.0}
    for label, vector in documents:
        # Cosine similarity of sparse normalized TF-IDF vectors.
        if len(query) > len(vector):
            smaller, larger = vector, query
        else:
            smaller, larger = query, vector
        similarity = sum(weight * larger.get(term, 0.0) for term, weight in smaller.items())
        best[label] = max(best[label], similarity)
    return {"applicable": True, "spam_similarity": round(best["spam"], 4), "ham_similarity": round(best["ham"], 4)}

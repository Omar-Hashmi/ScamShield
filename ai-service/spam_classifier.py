"""Small multinomial Naive Bayes classifier trained from the bundled labeled SMS corpus."""
from collections import Counter
from functools import lru_cache
import math
import re

from spam_similarity import CORPUS_PATH, TOKEN_RE


def _tokens(message: str) -> list[str]:
    words = TOKEN_RE.findall(message.lower())
    return words + [f"{left}_{right}" for left, right in zip(words, words[1:])]


@lru_cache(maxsize=1)
def _model():
    document_counts = Counter()
    word_counts = {"ham": Counter(), "spam": Counter()}
    with CORPUS_PATH.open(encoding="utf-8", errors="replace") as source:
        for line in source:
            label, sep, message = line.rstrip("\r\n").partition("\t")
            if sep and label in word_counts and message.strip():
                document_counts[label] += 1
                word_counts[label].update(_tokens(message))

    vocabulary = set(word_counts["ham"]) | set(word_counts["spam"])
    total_documents = sum(document_counts.values()) or 1
    vocabulary_size = max(len(vocabulary), 1)
    denominators = {
        label: sum(counts.values()) + vocabulary_size
        for label, counts in word_counts.items()
    }
    priors = {
        label: math.log((document_counts[label] + 1) / (total_documents + 2))
        for label in word_counts
    }
    return vocabulary, word_counts, denominators, priors


def classify_message(message: str) -> dict:
    """Return a spam probability; this old English SMS corpus is not multilingual."""
    words = TOKEN_RE.findall(message.lower())
    letters = [char for char in message if char.isalpha()]
    latin_ratio = sum("a" <= char.lower() <= "z" for char in letters) / max(len(letters), 1)
    if len(words) < 4 or latin_ratio < 0.7:
        return {"applicable": False, "spam_probability": 0.0}

    vocabulary, counts, denominators, priors = _model()
    features = Counter(term for term in _tokens(message) if term in vocabulary)
    if not features:
        return {"applicable": True, "spam_probability": 0.0}

    log_scores = {}
    for label in ("ham", "spam"):
        score = priors[label]
        denominator = denominators[label]
        score += sum(
            math.log((counts[label][term] + 1) / denominator)
            for term, occurrences in features.items()
            for _ in range(occurrences)
        )
        log_scores[label] = score

    # Stable two-class softmax.
    offset = max(log_scores.values())
    ham_weight = math.exp(log_scores["ham"] - offset)
    spam_weight = math.exp(log_scores["spam"] - offset)
    return {
        "applicable": True,
        "spam_probability": round(spam_weight / (spam_weight + ham_weight), 4),
    }

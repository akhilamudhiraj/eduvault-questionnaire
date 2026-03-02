import anthropic
import os
import re
from app.config import ANTHROPIC_API_KEY

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "does", "for", "from",
    "how", "in", "is", "it", "of", "on", "or", "the", "to", "what", "when",
    "where", "which", "who", "why", "with", "eduvault", "platform", "system"
}


def tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[a-zA-Z0-9]+", (text or "").lower())
    return [t for t in tokens if t not in STOPWORDS and len(t) > 1]


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", text or "")
    return [p.strip() for p in parts if p and p.strip()]


def answer_question_local(question: str, reference_docs: list[dict]) -> dict:
    q_tokens = set(tokenize(question))
    if not q_tokens:
        return {
            "answer": "Not found in references.",
            "citations": [],
            "confidence": 0.0
        }

    candidates = []
    for doc in reference_docs:
        doc_name = doc.get("name", "Unknown Document")
        for sentence in split_sentences(doc.get("content", "")):
            s_tokens = set(tokenize(sentence))
            if not s_tokens:
                continue
            overlap = len(q_tokens.intersection(s_tokens))
            if overlap <= 0:
                continue
            score = overlap / max(1, len(q_tokens))
            candidates.append((score, sentence, doc_name))

    if not candidates:
        return {
            "answer": "Not found in references.",
            "citations": [],
            "confidence": 0.0
        }

    candidates.sort(key=lambda x: x[0], reverse=True)
    top = candidates[:2]

    answer = " ".join(item[1] for item in top)
    citations = []
    for _, _, doc_name in top:
        if doc_name not in citations:
            citations.append(doc_name)

    best_score = top[0][0]
    confidence = min(0.95, round(0.35 + (best_score * 0.6), 2))

    return {
        "answer": answer,
        "citations": citations,
        "confidence": confidence
    }

def answer_question(question: str, reference_docs: list[dict]) -> dict:
    force_local = os.getenv("FORCE_LOCAL_AI", "false").lower() in {"1", "true", "yes"}

    if force_local or not client:
        return answer_question_local(question, reference_docs)

    # Build context from reference documents
    context = ""
    for doc in reference_docs:
        context += f"\n\n--- Document: {doc['name']} ---\n{doc['content']}"

    prompt = f"""You are a compliance assistant for EduVault, a Higher Education SaaS company.

You must answer the following question using ONLY the reference documents provided below.

Reference Documents:
{context}

Question: {question}

Instructions:
- Answer based strictly on the reference documents
- If the answer is not found in the documents, respond with exactly: "Not found in references."
- After your answer, list which document(s) you used as citations
- Rate your confidence from 0.0 to 1.0 based on how well the documents support the answer

Respond in this exact format:
ANSWER: <your answer here>
CITATIONS: <document name(s) used, comma separated>
CONFIDENCE: <0.0 to 1.0>
"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        response_text = message.content[0].text
        return parse_ai_response(response_text)
    except Exception:
        # Fallback to local answer generation when API is unavailable or quota-limited.
        return answer_question_local(question, reference_docs)


def parse_ai_response(response_text: str) -> dict:
    lines = response_text.strip().split('\n')
    answer = ""
    citations = []
    confidence = 0.0

    for line in lines:
        if line.startswith("ANSWER:"):
            answer = line.replace("ANSWER:", "").strip()
        elif line.startswith("CITATIONS:"):
            citations_str = line.replace("CITATIONS:", "").strip()
            citations = [c.strip() for c in citations_str.split(",")]
        elif line.startswith("CONFIDENCE:"):
            try:
                confidence = float(line.replace("CONFIDENCE:", "").strip())
            except:
                confidence = 0.5

    if not answer:
        answer = "Not found in references."

    return {
        "answer": answer,
        "citations": citations,
        "confidence": confidence
    }

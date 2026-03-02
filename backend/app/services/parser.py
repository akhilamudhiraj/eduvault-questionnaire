import re

def parse_questionnaire(text: str) -> list[dict]:
    questions = []
    lines = text.strip().split('\n')
    
    current_question = None
    question_number = 0

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Match patterns like "1.", "1)", "Q1.", "Question 1:"
        match = re.match(r'^(?:Q(?:uestion)?\s*)?(\d+)[.):\s]+(.+)', line, re.IGNORECASE)
        if match:
            if current_question:
                questions.append(current_question)
            question_number += 1
            current_question = {
                "question_number": question_number,
                "question_text": match.group(2).strip()
            }
        elif current_question:
            current_question["question_text"] += " " + line

    if current_question:
        questions.append(current_question)

    return questions
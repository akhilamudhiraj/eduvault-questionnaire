import re

def parse_questionnaire(text: str) -> list[dict]:
    questions = []
    lines = text.strip().split('\n')
    
    current_question = None

    for line in lines:
        raw_line = line.rstrip()
        line = raw_line.strip()
        if not line:
            continue

        # Match patterns like "1.", "1)", "Q1.", "Question 1:"
        match = re.match(r'^(?:Q(?:uestion)?\s*)?(\d+)[.):\s]+(.+)', line, re.IGNORECASE)
        if match:
            if current_question:
                questions.append(current_question)
            parsed_number = int(match.group(1))
            current_question = {
                "question_number": parsed_number,
                # Preserve question text exactly as entered (incl. numbering prefix).
                "question_text": line
            }
        elif current_question:
            current_question["question_text"] += "\n" + line

    if current_question:
        questions.append(current_question)

    return questions

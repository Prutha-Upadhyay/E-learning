import json
import sys

# Generate quiz questions based on the input transcript
text = sys.argv[1]
generated_text = "1. What is the first question?\n2. What is the second question?\n3. What is the third question?\n"

# Process the generated text to extract quiz questions
quiz_questions = generated_text.split('\n')

# Return quiz questions as JSON
print(json.dumps(quiz_questions))

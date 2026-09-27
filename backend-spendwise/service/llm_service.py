import os
import json

from dotenv import load_dotenv
from google import genai


load_dotenv()


# ==================================================
# GEMINI CONFIGURATION
# ==================================================

api_key = os.getenv(
    "GEMINI_API_KEY"
)


client = None

if api_key:

    client = genai.Client(
        api_key=api_key
    )


# ==================================================
# GENERATE FINANCIAL INSIGHTS USING GEMINI
# ==================================================

def generate_financial_insights(
    financial_data,
    decision_insights
):

    # --------------------------------------------------
    # CHECK GEMINI CONFIGURATION
    # --------------------------------------------------

    if client is None:

        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    # --------------------------------------------------
    # PROMPT
    # --------------------------------------------------

    prompt = f"""
You are the AI financial analyst
for SpendWise.

Analyze the user's financial data
and generate useful personalized
financial insights.

The backend has already performed
basic financial calculations and
decision analysis.

Your job is to provide higher-level
reasoning, explanation, and
personalized recommendations.

FINANCIAL DATA:

{json.dumps(
    financial_data,
    indent=2
)}

BASIC BACKEND DECISIONS:

{json.dumps(
    decision_insights,
    indent=2
)}

IMPORTANT:

The backend decisions are provided
as supporting information.

Do not blindly repeat them.

Analyze the financial data yourself
and improve the explanation where
appropriate.

Look for:

1. Important spending patterns
2. Budget problems
3. Large or unusual expenses
4. Savings behavior
5. Relationships between income
   and expenses
6. Savings opportunities
7. Practical recommendations


IMPORTANT RULES:

- Use ONLY the provided data.
- Do not invent numbers.
- Do not invent transactions.
- Do not invent budgets.
- Do not assume missing information.
- Do not give investment advice.
- Do not make stock market predictions.
- Do not simply repeat the dashboard numbers.
- Explain WHY an observation matters.
- Prefer specific insights over generic advice.
- Keep recommendations practical.
- Generate 4 to 6 useful insights.
- Do not force an insight type.


Possible insight types:

- spending_behavior
- budget_alert
- savings_opportunity
- recommendation
- unusual_spending
- spending_pattern
- positive_behavior


Choose the type that best matches
the actual insight.

Do not force an insight type.


Return ONLY valid JSON.

Required format:

{{
    "insights": [
        {{
            "type": "spending_behavior",
            "title": "Short meaningful title",
            "message": "Explain the important pattern and why it matters."
        }}
    ]
}}
"""

    # --------------------------------------------------
    # GEMINI API CALL
    # --------------------------------------------------

    response = client.interactions.create(

        model="gemini-3.8-flash",

        input=prompt
    )

    response_text = (
        response.output_text.strip()
    )

    # --------------------------------------------------
    # REMOVE MARKDOWN CODE BLOCK
    # --------------------------------------------------

    if response_text.startswith("```"):

        response_text = (
            response_text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

    # --------------------------------------------------
    # PARSE JSON
    # --------------------------------------------------

    try:

        result = json.loads(
            response_text
        )

    except json.JSONDecodeError as e:

        raise ValueError(
            "Gemini returned invalid JSON."
        ) from e

    # --------------------------------------------------
    # VALIDATE RESPONSE
    # --------------------------------------------------

    if not isinstance(
        result,
        dict
    ):

        raise ValueError(
            "Gemini response is not a JSON object."
        )

    if "insights" not in result:

        raise ValueError(
            "Gemini response does not contain insights."
        )

    if not isinstance(
        result["insights"],
        list
    ):

        raise ValueError(
            "Gemini insights must be a list."
        )

    return result
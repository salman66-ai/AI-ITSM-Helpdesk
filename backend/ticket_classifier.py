import json
import re


from backend.llm_service import client, MODEL_NAME


def classify_ticket(question: str):

    system_prompt = """
You are an enterprise ITSM ticket classification AI.

Analyze the employee's IT issue and return ONLY valid JSON.

The JSON must contain exactly these fields:

{
  "intent": "",
  "category": "",
  "subcategory": "",
  "priority": "",
  "impact": "",
  "urgency": "",
  "assignment_group": "",
  "summary": "",
  "suggested_resolution": "",
  "confidence": 0.0
}

IMPORTANT:
Use ONLY the approved ITSM categories and metadata below.

APPROVED KNOWLEDGE BASE MAPPINGS:

1. VPN problems:
   Category: Network
   Subcategory: VPN
   Priority: P2
   Assignment Group: Network Support

2. Password reset or account unlock:
   Category: Access Management
   Subcategory: Password Reset
   Priority: P2
   Assignment Group: Service Desk

3. Outlook synchronization problems:
   Category: Email
   Subcategory: Outlook Synchronization
   Priority: P3
   Assignment Group: Service Desk

4. Corporate Wi-Fi problems:
   Category: Network
   Subcategory: Wi-Fi
   Priority: P3
   Assignment Group: Network Support

5. Laptop performance / slow laptop:
   Category: Hardware
   Subcategory: Laptop Performance
   Priority: P3
   Assignment Group: Service Desk

RULES:

1. intent must be one of:
   Incident, Service Request, Knowledge Question, Automatable Issue

2. category must use an approved category from the mappings above.

3. subcategory must use the approved subcategory for the detected issue.

4. priority must use the approved priority for the detected issue.

5. assignment_group must use the approved assignment group for the detected issue.

6. impact must be one of:
   Individual, Department, Organization

7. urgency must be one of:
   High, Medium, Low

8. confidence must be a number between 0 and 1.

9. Use the employee's actual issue.

9a. suggested_resolution must only contain actions supported by the approved knowledge base mapping. Do not recommend actions such as hardware upgrades, malware investigation, replacement, or other actions unless explicitly present in the approved knowledge.

10. Do not invent technical details.

11. Keep summary short.

12. Keep suggested_resolution short.

13. 13. If the issue does not match an approved knowledge category, use:
   category: "Unclassified"
   subcategory: "Unknown"
   priority: "P3"
   assignment_group: "Service Desk"

13a. For an Unclassified issue, suggested_resolution must be:
"Escalate to Service Desk because sufficient approved knowledge was not found."

14. Return JSON only. No markdown. No explanation.
"""

    user_prompt = f"""
Employee request:

{question}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        max_tokens=300,
        temperature=0.1
    )

    content = response.choices[0].message.content.strip()

    # Remove markdown code fences if the model adds them
    content = re.sub(
        r"^```(?:json)?\s*|\s*```$",
        "",
        content
    ).strip()

    try:
        result = json.loads(content)

    except json.JSONDecodeError:
        raise ValueError(
            f"LLM returned invalid JSON: {content}"
        )

    return result
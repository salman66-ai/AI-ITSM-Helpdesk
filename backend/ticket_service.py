from datetime import datetime, timezone

from database import tickets_collection


def create_ticket(question: str, analysis: dict, resolution: str):

    ticket_number = f"INC{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"

    ticket = {
        "ticket_number": ticket_number,
        "description": question,

        "intent": analysis.get("intent"),
        "category": analysis.get("category"),
        "subcategory": analysis.get("subcategory"),
        "priority": analysis.get("priority"),
        "impact": analysis.get("impact"),
        "urgency": analysis.get("urgency"),
        "assignment_group": analysis.get("assignment_group"),

        "summary": analysis.get("summary"),
        "suggested_resolution": analysis.get("suggested_resolution"),
        "ai_resolution": resolution,
        "confidence": analysis.get("confidence"),

        "status": "Open",
        "source": "AI Helpdesk",

        "created_at": datetime.now(timezone.utc)
    }

    result = tickets_collection.insert_one(ticket)

    return {
        "ticket_id": ticket_number,
        "database_id": str(result.inserted_id),
        "status": "Open"
    }
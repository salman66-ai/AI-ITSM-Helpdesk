from datetime import datetime, timezone


def create_servicenow_incident(ticket: dict):

    incident_number = (
        f"INC{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    )

    return {
        "success": True,
        "incident_number": incident_number,
        "state": "New",
        "short_description": ticket.get("summary"),
        "description": ticket.get("description"),
        "priority": ticket.get("priority"),
        "impact": ticket.get("impact"),
        "urgency": ticket.get("urgency"),
        "assignment_group": ticket.get("assignment_group"),
        "integration": "Mock ServiceNow API"
    }


def update_servicenow_incident(
    incident_number: str,
    update_data: dict
):

    return {
        "success": True,
        "incident_number": incident_number,
        "state": update_data.get("state", "Resolved"),
        "resolution": update_data.get(
            "resolution",
            "Issue resolved through automated self-healing."
        ),
        "updated_by": "AI Self-Healing Agent",
        "integration": "Mock ServiceNow API"
    }

def create_servicenow_request(
    request_id: str,
    software_name: str
):

    servicenow_request_number = (
        f"REQ{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    )

    return {
        "success": True,
        "request_number": servicenow_request_number,
        "request_id": request_id,
        "software": software_name,
        "state": "Requested",
        "status": "Provisioning",
        "description": (
            f"Software provisioning request created for {software_name}."
        ),
        "integration": "Mock ServiceNow API"
    }
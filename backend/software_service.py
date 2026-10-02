from datetime import datetime, timezone

from database import software_requests_collection, audit_collection


def create_software_request(
    software_name: str,
    employee_request: str
):
    request_number = (
        f"REQ{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    )

    request = {
        "request_id": request_number,
        "software": software_name,
        "employee_request": employee_request,
        "status": "Provisioning",
        "created_at": datetime.now(timezone.utc)
    }

    result = software_requests_collection.insert_one(request)

    audit_collection.insert_one({
        "action": "SOFTWARE_PROVISIONING",
        "status": "REQUEST_CREATED",
        "details": {
            "request_id": request_number,
            "software": software_name
        },
        "timestamp": datetime.now(timezone.utc)
    })

    return {
        "request_id": request_number,
        "software": software_name,
        "status": "Provisioning",
        "database_id": str(result.inserted_id)
    }


def mock_provision_software(
    request_id: str,
    software_name: str
):
    audit_collection.insert_one({
        "action": "MOCK_SOFTWARE_PROVISION",
        "status": "SUCCESS",
        "details": {
            "request_id": request_id,
            "software": software_name
        },
        "timestamp": datetime.now(timezone.utc)
    })

    return {
        "request_id": request_id,
        "software": software_name,
        "status": "Provisioning",
        "message": f"{software_name} provisioning initiated successfully."
    }
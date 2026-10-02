from software_service import create_software_request
from software_service import mock_provision_software
from datetime import datetime, timezone
from servicenow_mock import update_servicenow_incident
from automation_service import execute_password_self_heal
from servicenow_mock import create_servicenow_incident
from servicenow_mock import create_servicenow_request
from ticket_classifier import classify_ticket
from ticket_service import create_ticket
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic import BaseModel
from rag_service import search_knowledge
from llm_service import generate_answer
from database import (
    client,
    tickets_collection,
    audit_collection,
    software_requests_collection
)

KNOWLEDGE_DISTANCE_THRESHOLD = 0.9


def get_relevant_knowledge(question: str, top_k: int = 3, analysis: dict = None):
    results = search_knowledge(question, top_k=top_k)

    if not results:
        return []

    # If the classifier itself says the topic is outside
    # the approved IT knowledge base, do not expose unrelated results.
    if analysis and analysis.get("category") == "Unclassified":
        return []

    # FAISS distance is lower when the semantic match is stronger.
    if results[0]["distance"] > KNOWLEDGE_DISTANCE_THRESHOLD:
        return []

    return results


app = FastAPI(
    title="AI ITSM Helpdesk",
    description="AI-powered ITSM and Intelligent Helpdesk Automation Platform",
    version="1.0.0"
)

app = FastAPI(
    title="AI ITSM Helpdesk",
    description="AI-powered ITSM and Intelligent Helpdesk Automation Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SoftwareRequest(BaseModel):
    question: str

class AutomationRequest(BaseModel):
    question: str

class CreateTicketRequest(BaseModel):
    question: str

class AIAnalyzeRequest(BaseModel):
    question: str

class KnowledgeSearchRequest(BaseModel):
    question: str
    top_k: int = 3


class AIHelpRequest(BaseModel):
    question: str
    top_k: int = 3


@app.get("/")
def root():
    return {
        "message": "AI ITSM Helpdesk Backend is running!",
        "status": "success"
    }


@app.get("/health")
def health_check():
    try:
        client.admin.command("ping")

        return {
            "status": "healthy",
            "mongodb": "connected"
        }

    except Exception as e:

        return {
            "status": "unhealthy",
            "mongodb": "disconnected",
            "error": str(e)
        }

@app.get("/dashboard")
def dashboard():

    # Ticket statistics
    total_tickets = tickets_collection.count_documents({})

    open_tickets = tickets_collection.count_documents({
        "status": "Open"
    })

    resolved_tickets = tickets_collection.count_documents({
        "status": "Resolved"
    })

    escalated_tickets = tickets_collection.count_documents({
        "status": "Escalated"
    })

    # Software provisioning statistics
    software_requests = software_requests_collection.count_documents({})

    provisioning_requests = software_requests_collection.count_documents({
        "status": "Provisioning"
    })

    # Automation statistics
    automation_actions = audit_collection.count_documents({
        "action": {
            "$in": [
                "PASSWORD_RESET",
                "ACCOUNT_UNLOCK",
                "ACCESS_VALIDATION",
                "SOFTWARE_PROVISIONING",
                "MOCK_SOFTWARE_PROVISION"
            ]
        }
    })

    successful_automations = audit_collection.count_documents({
        "status": "SUCCESS"
    })

    # Recent tickets
    recent_tickets_cursor = (
        tickets_collection
        .find(
            {},
            {
                "_id": 0,
                "ticket_number": 1,
                "summary": 1,
                "status": 1,
                "priority": 1,
                "assignment_group": 1,
                "created_at": 1
            }
        )
        .sort("created_at", -1)
        .limit(5)
    )

    recent_tickets = []

    for ticket in recent_tickets_cursor:

        if ticket.get("created_at"):
            ticket["created_at"] = ticket["created_at"].isoformat()

        recent_tickets.append(ticket)

    return {
        "tickets": {
            "total": total_tickets,
            "open": open_tickets,
            "resolved": resolved_tickets,
            "escalated": escalated_tickets
        },

        "software": {
            "total_requests": software_requests,
            "provisioning": provisioning_requests
        },

        "automation": {
            "total_actions": automation_actions,
            "successful_actions": successful_automations
        },

        "recent_tickets": recent_tickets
    }

@app.post("/knowledge/search")
def knowledge_search(request: KnowledgeSearchRequest):

    results = search_knowledge(
        request.question,
        request.top_k
    )

    KNOWLEDGE_DISTANCE_THRESHOLD = 0.9

    # Do not show unrelated knowledge when the
    # semantic match is too weak.
    if not results or results[0]["distance"] > KNOWLEDGE_DISTANCE_THRESHOLD:
        return {
            "question": request.question,
            "results": [],
            "knowledge_found": False,
            "message": (
                "No relevant approved knowledge was found "
                "for this question."
            )
        }

    return {
        "question": request.question,
        "results": results,
        "knowledge_found": True,
        "message": "Relevant approved knowledge found."
    }

@app.get("/knowledge/articles")
def knowledge_articles():

    articles = [
        {
            "title": "Corporate VPN Authentication Troubleshooting",
            "file": "vpn_troubleshooting.txt",
            "category": "Network",
            "subcategory": "VPN",
            "priority": "P2",
            "assignment_group": "Network Support",
            "description": (
                "Troubleshooting guidance for VPN authentication "
                "and connection failures."
            )
        },
        {
            "title": "Corporate Password Reset and Account Unlock",
            "file": "password_reset.txt",
            "category": "Access Management",
            "subcategory": "Password Reset",
            "priority": "P2",
            "assignment_group": "Service Desk",
            "description": (
                "Guidance for expired passwords and locked corporate accounts."
            )
        },
        {
            "title": "Outlook Email Synchronization Troubleshooting",
            "file": "outlook_sync.txt",
            "category": "Email",
            "subcategory": "Outlook Synchronization",
            "priority": "P3",
            "assignment_group": "Service Desk",
            "description": (
                "Troubleshooting steps for Outlook email and calendar "
                "synchronization problems."
            )
        },
        {
            "title": "Corporate Wi-Fi Connectivity Troubleshooting",
            "file": "wifi_troubleshooting.txt",
            "category": "Network",
            "subcategory": "Wi-Fi",
            "priority": "P3",
            "assignment_group": "Network Support",
            "description": (
                "Troubleshooting guidance for corporate Wi-Fi connectivity "
                "and unstable wireless connections."
            )
        },
        {
            "title": "Corporate Laptop Performance Troubleshooting",
            "file": "laptop_performance.txt",
            "category": "Hardware",
            "subcategory": "Laptop Performance",
            "priority": "P3",
            "assignment_group": "Service Desk",
            "description": (
                "Troubleshooting guidance for slow laptops, "
                "unresponsive applications and system freezes."
            )
        }
    ]

    return {
        "total_articles": len(articles),
        "indexed_chunks": 26,
        "embedding_model": "all-MiniLM-L6-v2",
        "vector_database": "FAISS",
        "articles": articles
    }

@app.post("/ai/help")
def ai_help(request: AIHelpRequest):

    # 1. Search approved knowledge
    results = search_knowledge(
        request.question,
        request.top_k
    )

    # 2. Build context for the LLM
    context = "\n\n".join(
        result["text"]
        for result in results
    )

    # 3. Generate grounded AI answer
    answer = generate_answer(
        request.question,
        context
    )

    # 4. Return answer + sources
    sources = [
        {
            "source": result["source"],
            "distance": result["distance"]
        }
        for result in results
    ]

    return {
        "question": request.question,
        "answer": answer,
        "sources": sources
    }

@app.post("/ai/analyze")
def ai_analyze(request: AIAnalyzeRequest):

    classification = classify_ticket(request.question)

    return {
        "question": request.question,
        "analysis": classification
    }

@app.post("/ai/full-analysis")
def full_analysis(request: AIAnalyzeRequest):

    # 1. Classify the employee request
    classification = classify_ticket(request.question)

    # 2. Search the approved knowledge base
    knowledge_results = search_knowledge(
        request.question,
        top_k=3
    )

    # 3. Determine whether relevant approved knowledge was found
    KNOWLEDGE_DISTANCE_THRESHOLD = 0.9

    knowledge_found = True

    if classification.get("category") == "Unclassified":
        knowledge_found = False

    elif not knowledge_results:
        knowledge_found = False

    elif knowledge_results[0]["distance"] > KNOWLEDGE_DISTANCE_THRESHOLD:
        knowledge_found = False

    # 4. If no relevant knowledge was found,
    #    do not send unrelated knowledge to the LLM
    if not knowledge_found:

        answer = (
            "I could not find sufficient information in the approved "
            "IT knowledge base to answer this question."
        )

        return {
            "question": request.question,
            "analysis": classification,
            "resolution": answer,
            "sources": [],
            "knowledge_found": False,
            "knowledge_message": (
                "No relevant approved knowledge was found. "
                "Please escalate to the Service Desk for human assistance."
            )
        }

    # 5. Build knowledge context only from relevant results
    context = "\n\n".join(
        result["text"]
        for result in knowledge_results
    )

    # 6. Generate grounded resolution
    answer = generate_answer(
        request.question,
        context
    )

    # 7. Prepare knowledge sources
    sources = [
        {
            "source": result["source"],
            "distance": result["distance"]
        }
        for result in knowledge_results
    ]

    return {
        "question": request.question,
        "analysis": classification,
        "resolution": answer,
        "sources": sources,
        "knowledge_found": True,
        "knowledge_message": "Relevant approved knowledge found."
    }

@app.post("/tickets/create")
def create_ai_ticket(request: CreateTicketRequest):

    # 1. AI classification
    classification = classify_ticket(request.question)

    # 2. Knowledge search
    knowledge_results = search_knowledge(
        request.question,
        top_k=3
    )

    # 3. Build knowledge context
    context = "\n\n".join(
        result["text"]
        for result in knowledge_results
    )

    # 4. Generate grounded resolution
    resolution = generate_answer(
        request.question,
        context
    )

    # 5. Create MongoDB ticket
    ticket = create_ticket(
        request.question,
        classification,
        resolution
    )

    # 6. Create ServiceNow incident
    servicenow_ticket = {
        "summary": classification.get("summary"),
        "description": request.question,
        "priority": classification.get("priority"),
        "impact": classification.get("impact"),
        "urgency": classification.get("urgency"),
        "assignment_group": classification.get("assignment_group")
    }

    servicenow_incident = create_servicenow_incident(
        servicenow_ticket
    )

    return {
        "message": "Ticket created successfully",
        "ticket": ticket,
        "servicenow": servicenow_incident,
        "analysis": classification,
        "resolution": resolution
    }

@app.post("/automation/self-heal")
def self_heal(request: AutomationRequest):

    question = request.question.lower()

    # Identify password-expired issue
    password_issue = (
        "password" in question
        and (
            "expired" in question
            or "expire" in question
            or "reset" in question
        )
    )

    if not password_issue:
        return {
            "automation": "Not applicable",
            "status": "Escalated",
            "message": "No supported self-healing automation was identified."
        }

    # Execute self-healing
    result = execute_password_self_heal()

    # Mock ServiceNow incident
    incident_number = (
        f"INC{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    )

    resolution = (
        "Password reset and account access validation "
        "completed successfully through AI self-healing."
    )

    servicenow_update = update_servicenow_incident(
        incident_number,
        {
            "state": "Resolved",
            "resolution": resolution
        }
    )

    # Create resolved AI ticket in MongoDB
    ticket_number = (
        f"INC{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}"
    )

    tickets_collection.insert_one({
        "ticket_number": ticket_number,
        "description": request.question,
        "intent": "Automatable Issue",
        "category": "Access Management",
        "subcategory": "Password Reset",
        "priority": "P2",
        "impact": "Individual",
        "urgency": "High",
        "assignment_group": "Service Desk",
        "summary": "Password expired and access restored through AI self-healing",
        "suggested_resolution": resolution,
        "ai_resolution": resolution,
        "confidence": 0.98,
        "status": "Resolved",
        "resolution_type": "AI Self-Healing",
        "servicenow_incident": incident_number,
        "source": "AI Self-Healing",
        "created_at": datetime.now(timezone.utc),
        "resolved_at": datetime.now(timezone.utc)
    })

    return {
        "question": request.question,
        "identified_issue": "Password Expired",
        "automation": result,
        "servicenow": servicenow_update,
        "ticket": {
            "ticket_number": ticket_number,
            "status": "Resolved",
            "resolution_type": "AI Self-Healing"
        }
    }

@app.post("/software/provision")
def provision_software(request: SoftwareRequest):

    question = request.question.lower()

    # Identify supported software
    if (
        "visual studio code" in question
        or "vs code" in question
        or "vscode" in question
    ):
        software_name = "Visual Studio Code"

    else:
        return {
            "status": "Escalated",
            "message": "The requested software is not currently available in the software catalogue."
        }

    # 1. Create MongoDB software request
    software_request = create_software_request(
        software_name,
        request.question
    )

    # 2. Create ServiceNow service request
    servicenow_request = create_servicenow_request(
        software_request["request_id"],
        software_name
    )

    # 3. Start mock provisioning
    provisioning = mock_provision_software(
        software_request["request_id"],
        software_name
    )

    return {
        "message": "Software request created successfully",
        "request": software_request,
        "servicenow": servicenow_request,
        "provisioning": provisioning
    }
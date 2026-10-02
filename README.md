# AI ITSM Helpdesk

An AI-powered IT Service Management (ITSM) Helpdesk prototype combining intelligent ticket intake, Retrieval-Augmented Generation (RAG), automated self-healing, software provisioning, ServiceNow integration, and audit logging.

## Architecture

Employee Request → AI Understanding → Knowledge Retrieval → Intelligent Decision → Automation → ServiceNow → Resolution

## Technology Stack

- Frontend: React.js + Vite
- Backend: Python + FastAPI
- Database: MongoDB Atlas
- LLM: Hugging Face `Qwen/Qwen3-4B-Instruct-2507`
- Embeddings: `sentence-transformers/all-MiniLM-L6-v2`
- Vector Database: FAISS
- ITSM: ServiceNow mock REST integration

## Features

### Intelligent Ticket Intake

The AI classifies employee requests by:

- Intent
- Category
- Subcategory
- Priority
- Impact
- Urgency
- Assignment Group
- Summary
- Suggested Resolution
- Confidence

VPN example:

`My VPN is not connecting and authentication keeps failing.`

Expected classification:

- Intent: Incident
- Category: Network
- Subcategory: VPN
- Priority: P2
- Impact: Individual
- Urgency: High
- Assignment Group: Network Support

A mock ServiceNow incident can then be created.

### RAG Knowledge Management

Approved knowledge documents are stored in `knowledge_base/`.

Current articles:

- `vpn_troubleshooting.txt`
- `password_reset.txt`
- `outlook_sync.txt`
- `wifi_troubleshooting.txt`
- `laptop_performance.txt`

Pipeline:

Documents → Logical Section Chunking → Sentence Transformers → FAISS → Semantic Search → Grounded LLM Response

The current knowledge base contains 5 approved articles and 26 indexed chunks.

The system filters weak semantic matches and does not provide unrelated knowledge to the LLM. If sufficient approved knowledge is unavailable, it responds that the approved IT knowledge base is insufficient and directs the request toward human assistance.

### AI Self-Healing

Supported password-expiry flow:

Identify → Diagnose → Knowledge Search → Determine Automation → Execute → Validate → Update ServiceNow

Example:

`My password has expired and I cannot log in`

The prototype performs mock password reset and account-access validation, updates a mock ServiceNow incident to Resolved, persists a resolved AI ticket in MongoDB, and records automated actions in `audit_logs`.

### Employee Self-Service

Employees can enter natural-language IT requests and receive:

- Intent classification
- IT categorization
- Grounded resolution
- Knowledge sources
- Human escalation when approved knowledge is insufficient

### Software Provisioning

Example:

`I need Visual Studio Code installed`

The system creates a MongoDB software request, creates a mock ServiceNow request, starts mock provisioning, and records the provisioning action in the audit log.

### Audit Logging

Automated actions are stored in MongoDB `audit_logs`.

Examples:

- `PASSWORD_RESET`
- `ACCESS_VALIDATION`
- `SOFTWARE_PROVISIONING`
- `MOCK_SOFTWARE_PROVISION`

Each record includes an action, status, details, and timestamp.

## MongoDB

Database:

`ai_itsm_helpdesk`

Collections:

- `tickets`
- `knowledge`
- `chat`
- `audit_logs`
- `software_requests`

## Project Structure

AI-ITSM-Helpdesk/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── ...
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── llm_service.py
│   ├── rag_service.py
│   ├── ticket_classifier.py
│   ├── ticket_service.py
│   ├── automation_service.py
│   ├── software_service.py
│   ├── servicenow_mock.py
│   ├── requirements.txt
│   └── __init__.py
├── knowledge_base/
│   ├── vpn_troubleshooting.txt
│   ├── password_reset.txt
│   ├── outlook_sync.txt
│   ├── wifi_troubleshooting.txt
│   └── laptop_performance.txt
├── tests/
│   ├── conftest.py
│   └── test_ticket_classifier.py
├── .gitignore
├── README.md
└── AI_ITSM_Helpdesk_Hackathon_Presentation.pptx

## Environment Variables

Keep credentials in `.env` and never commit them.

```env
MONGODB_URI=your_mongodb_atlas_connection_string
HF_API_KEY=your_huggingface_api_key
```

## Backend Setup

Open a terminal in:

```text
C:\Project\AI-ITSM-Helpdeskackend
```

Activate the existing virtual environment and install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

Backend:

`http://127.0.0.1:8000`

Health check:

`http://127.0.0.1:8000/health`

## Frontend Setup

Open another terminal in:

```text
C:\Project\AI-ITSM-Helpdesk
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm run dev
```

Frontend:

`http://localhost:5173`

## Mandatory Demo Scenarios

### 1. VPN Incident

```text
My VPN is not connecting and authentication keeps failing.
```

Demonstrates AI classification, P2 priority, Network/VPN routing, knowledge retrieval, grounded resolution, and ServiceNow incident creation.

### 2. Password Self-Healing

```text
My password has expired and I cannot log in
```

Demonstrates identification, diagnosis, knowledge search, automation decision, password reset, access validation, ServiceNow resolution, MongoDB resolution, and audit logging.

### 3. Outlook RAG

```text
My Outlook is not syncing
```

Demonstrates semantic retrieval, grounded troubleshooting, and source attribution.

### 4. Software Provisioning

```text
I need Visual Studio Code installed
```

Demonstrates software request creation, MongoDB persistence, mock ServiceNow request, provisioning status, and audit logging.

### 5. Unsupported Question

```text
How do I troubleshoot a satellite communication system?
```

Demonstrates unclassified handling, suppression of unrelated knowledge, no hallucinated solution, and human escalation.

## AI Safety

- The LLM is instructed to use only approved IT knowledge.
- Weak semantic matches are filtered before generating responses.
- Unsupported questions do not receive unrelated knowledge.
- Knowledge sources are shown to users.
- The system does not claim actions were performed unless the system actually performed them.
- Unsupported requests are escalated to the Service Desk.
- Automated actions are persisted in MongoDB audit logs.

## Git / Security

Do not commit:

- `.env`
- MongoDB credentials
- Hugging Face API keys
- `node_modules/`
- `venv/`
- `dist/`
- Python cache files
- generated FAISS index files

Recommended `.gitignore`:

```text
.env
__pycache__/
*.py[cod]
venv/
*.index
node_modules/
dist/
.vscode/
```

## Demo Checklist

1. Start MongoDB Atlas.
2. Start the FastAPI backend.
3. Start the React frontend.
4. Demonstrate VPN incident intake.
5. Demonstrate Outlook RAG.
6. Demonstrate password self-healing.
7. Show MongoDB `audit_logs`.
8. Demonstrate VS Code provisioning.
9. Demonstrate the unsupported satellite question.
10. Refresh the ITSM Dashboard and show persisted metrics.

## Prototype Note

ServiceNow and software provisioning are implemented as mock integrations for the hackathon prototype. The mock functions can be replaced with real ServiceNow REST API and provisioning integrations.

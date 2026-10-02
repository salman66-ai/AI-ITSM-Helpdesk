import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [activePage, setActivePage] = useState("self-service");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [resolution, setResolution] = useState("");
  const [sources, setSources] = useState([]);
  const [knowledgeFound, setKnowledgeFound] = useState(true);
  const [knowledgeSearchFound, setKnowledgeSearchFound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState("");
  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [knowledgeStats, setKnowledgeStats] = useState(null);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeQuery, setKnowledgeQuery] = useState("");
  const [knowledgeResults, setKnowledgeResults] = useState([]);
  const [knowledgeSearching, setKnowledgeSearching] = useState(false);
  const [automationResult, setAutomationResult] = useState(null);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [softwareResult, setSoftwareResult] = useState(null);
  const [softwareLoading, setSoftwareLoading] = useState(false);
  const loadDashboard = async () => {
  setDashboardLoading(true);

  try {
    const response = await fetch(`${API_URL}/dashboard`);

    if (!response.ok) {
      throw new Error("Failed to load dashboard data.");
    }

    const data = await response.json();

    setDashboard(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setDashboardLoading(false);
  }
};

  useEffect(() => {
  if (activePage === "dashboard") {
    loadDashboard();
  }

  if (activePage === "knowledge") {
    loadKnowledgeBase();
  }
}, [activePage]);

  const loadKnowledgeBase = async () => {
  setKnowledgeLoading(true);

  try {
    const response = await fetch(
      `${API_URL}/knowledge/articles`
    );

    if (!response.ok) {
      throw new Error("Failed to load knowledge base.");
    }

    const data = await response.json();

    setKnowledgeArticles(data.articles);
    setKnowledgeStats({
      totalArticles: data.total_articles,
      indexedChunks: data.indexed_chunks,
      embeddingModel: data.embedding_model,
      vectorDatabase: data.vector_database,
    });
  } catch (err) {
    setError(err.message);
  } finally {
    setKnowledgeLoading(false);
  }
};

const searchKnowledge = async () => {
  if (!knowledgeQuery.trim()) {
    return;
  }

  setKnowledgeSearching(true);
  setKnowledgeResults([]);
  setKnowledgeSearchFound(null);
  setError("");

  try {
    const response = await fetch(
      `${API_URL}/knowledge/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: knowledgeQuery,
          top_k: 5,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Knowledge search failed.");
    }

    const data = await response.json();

    setKnowledgeResults(data.results || []);
    setKnowledgeSearchFound(data.knowledge_found !== false);
  } catch (err) {
    setError(err.message);
  } finally {
    setKnowledgeSearching(false);
  }
};

  const runSelfHealing = async () => {
  if (!question.trim()) {
    return;
  }

  setAutomationLoading(true);
  setAutomationResult(null);
  setError("");

  try {
    const response = await fetch(
      `${API_URL}/automation/self-heal`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Self-healing automation failed.");
    }

    const data = await response.json();

    setAutomationResult(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setAutomationLoading(false);
  }
};

  const analyzeIssue = async () => {
  if (!question.trim()) return;

  setLoading(true);
  setError("");
  setAnalysis(null);
  setResolution("");
  setSources([]);
  setKnowledgeFound(true);
  setTicket(null);

  try {
    const response = await fetch(`${API_URL}/ai/full-analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze the request.");
    }

    const data = await response.json();

    setAnalysis(data.analysis);
    setResolution(data.resolution);
    setSources(data.sources || []);
    setKnowledgeFound(data.knowledge_found !== false);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const createTicket = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/tickets/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create the ticket.");
      }

      const data = await response.json();

      setTicket(data);
      setAnalysis(data.analysis);
      setResolution(data.resolution);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    const renderKnowledgeBase = () => {
  if (knowledgeLoading && !knowledgeStats) {
    return (
      <section className="page-section">
        <div className="page-title">
          <div>
            <h2>Knowledge Base</h2>
            <p>Enterprise IT knowledge and semantic search</p>
          </div>
        </div>

        <div className="card coming-soon">
          <div className="coming-icon">◌</div>
          <h2>Loading Knowledge Intelligence...</h2>
          <p>
            Loading approved IT knowledge and vector search metadata.
          </p>
        </div>
      </section>
    );
  }

  if (!knowledgeStats) {
    return null;
  }

  return (
    <section className="page-section">

      <div className="page-title">
        <div>
          <h2>Knowledge Base</h2>
          <p>
            Approved enterprise knowledge powering AI-assisted support
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadKnowledgeBase}
          disabled={knowledgeLoading}
        >
          {knowledgeLoading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* KNOWLEDGE ENGINE */}

      <div className="knowledge-engine">

        <div className="knowledge-engine-content">

          <span className="section-label">
            AI KNOWLEDGE ENGINE
          </span>

          <h2>
            Grounded answers from approved IT knowledge
          </h2>

          <p>
            Documents are converted into embeddings and indexed in
            FAISS for semantic retrieval before the AI generates a
            response.
          </p>

          <div className="knowledge-pipeline">

            <span>Documents</span>
            <b>→</b>
            <span>Embeddings</span>
            <b>→</b>
            <span>FAISS</span>
            <b>→</b>
            <span>Semantic Search</span>
            <b>→</b>
            <span>AI Response</span>

          </div>

        </div>

        <div className="knowledge-ai-icon">
          ✦
        </div>

      </div>

      {/* STATS */}

      <div className="stats-grid knowledge-stats">

        <div className="stat-card">
          <span>Knowledge Articles</span>
          <strong>{knowledgeStats.totalArticles}</strong>
          <small>Approved IT documents</small>
        </div>

        <div className="stat-card">
          <span>Indexed Chunks</span>
          <strong>{knowledgeStats.indexedChunks}</strong>
          <small>Semantic search chunks</small>
        </div>

        <div className="stat-card">
          <span>Embedding Model</span>
          <strong className="model-stat">
            MiniLM
          </strong>
          <small>{knowledgeStats.embeddingModel}</small>
        </div>

        <div className="stat-card">
          <span>Vector Database</span>
          <strong className="model-stat">
            FAISS
          </strong>
          <small>Local vector index</small>
        </div>

      </div>

      {/* SEMANTIC SEARCH */}

      <div className="card knowledge-search-card">

        <div className="section-label">
          SEMANTIC KNOWLEDGE SEARCH
        </div>

        <h2>Search the IT knowledge base</h2>

        <p className="knowledge-search-description">
          Ask a natural-language IT question. The system will retrieve
          the most semantically relevant approved knowledge.
        </p>

        <div className="knowledge-search-box">

          <input
            value={knowledgeQuery}
            onChange={(e) =>
              setKnowledgeQuery(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchKnowledge();
              }
            }}
            placeholder="Example: How do I troubleshoot Outlook synchronization?"
          />

          <button
            className="primary-button"
            onClick={searchKnowledge}
            disabled={knowledgeSearching}
          >
            {knowledgeSearching
              ? "Searching..."
              : "Search Knowledge"}
          </button>

        </div>

        {knowledgeSearchFound === false && (
  <div
    style={{
      marginTop: "24px",
      padding: "20px",
      borderRadius: "12px",
      background: "#fff7ed",
      border: "1px solid #fed7aa",
    }}
  >
    <div
      style={{
        fontSize: "14px",
        fontWeight: "700",
        color: "#c2410c",
        marginBottom: "8px",
      }}
    >
      ⚠ NO RELEVANT KNOWLEDGE FOUND
    </div>

    <h3 style={{ margin: "0 0 8px 0" }}>
      No approved knowledge matches this question
    </h3>

    <p style={{ margin: 0, color: "#64748b" }}>
      No relevant approved knowledge was found for this question.
      Unrelated knowledge articles are not being shown.
    </p>
  </div>
)}

{knowledgeSearchFound === true && knowledgeResults.length > 0 && (
  <div className="knowledge-results">

    <div className="results-header">
      <span>SEMANTIC SEARCH RESULTS</span>

      <strong>
        {knowledgeResults.length} matches
      </strong>
    </div>

    {knowledgeResults.map((result, index) => (
      <div
        className="knowledge-result"
        key={index}
      >

        <div className="knowledge-result-icon">
          📄
        </div>

        <div className="knowledge-result-content">

          <div className="knowledge-result-top">
            <strong>
              {result.source}
            </strong>

            <span>
              Match {index + 1}
            </span>
          </div>

          <p>
            {result.text}
          </p>

          <small>
            Semantic distance:{" "}
            {result.distance.toFixed(3)}
          </small>

        </div>

      </div>
    ))}

  </div>
)}

      </div>

      {/* ARTICLES */}

      <div className="card">

        <div className="section-label">
          APPROVED KNOWLEDGE
        </div>

        <h2>Knowledge Articles</h2>

        <div className="article-grid">

          {knowledgeArticles.map((article) => (
            <div
              className="article-card"
              key={article.file}
            >

              <div className="article-icon">
                📄
              </div>

              <div className="article-content">

                <h3>{article.title}</h3>

                <p>
                  {article.description}
                </p>

                <div className="article-meta">

                  <span>
                    {article.category}
                  </span>

                  <span>
                    {article.subcategory}
                  </span>

                  <span>
                    {article.priority}
                  </span>

                </div>

                <div className="article-footer">

                  <small>
                    {article.file}
                  </small>

                  <small>
                    {article.assignment_group}
                  </small>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
};

  const renderSelfHealing = () => {
  return (
    <section className="page-section">

      <div className="page-title">
        <div>
          <h2>AI Self-Healing</h2>
          <p>
            Detect, automate and validate common IT issues
          </p>
        </div>

        <div className="automation-live">
          <span></span>
          Automation Engine Active
        </div>
      </div>

      {/* HERO */}

      <div className="self-heal-hero">

        <div>
          <span className="section-label">
            AUTONOMOUS IT REMEDIATION
          </span>

          <h2>
            Resolve supported IT issues automatically
          </h2>

          <p>
            The AI identifies an automatable issue, executes an
            approved remediation, validates the result and updates
            the ITSM record.
          </p>
        </div>

        <div className="self-heal-icon">
          ⚡
        </div>

      </div>

      {/* WORKFLOW */}

      <div className="card">

        <div className="section-label">
          AUTOMATION WORKFLOW
        </div>

        <h2>
          Password Expiry Self-Heal
        </h2>

        <div className="automation-flow">

          <div className="flow-step active">
            <div>1</div>
            <strong>Identify</strong>
            <span>Detect issue</span>
          </div>

          <div className="flow-line"></div>

          <div className="flow-step active">
            <div>2</div>
            <strong>Diagnose</strong>
            <span>Analyze request</span>
          </div>

          <div className="flow-line"></div>

          <div className="flow-step active">
            <div>3</div>
            <strong>Knowledge</strong>
            <span>Retrieve KB</span>
          </div>

          <div className="flow-line"></div>

          <div className="flow-step active">
            <div>4</div>
            <strong>Execute</strong>
            <span>Run automation</span>
          </div>

          <div className="flow-line"></div>

          <div className="flow-step active">
            <div>5</div>
            <strong>Validate</strong>
            <span>Verify access</span>
          </div>

          <div className="flow-line"></div>

          <div className="flow-step active">
            <div>6</div>
            <strong>Update ITSM</strong>
            <span>Resolve ticket</span>
          </div>

        </div>

      </div>

      {/* REQUEST */}

      <div className="card self-heal-request">

        <div className="section-label">
          AUTOMATION REQUEST
        </div>

        <h2>
          Run a Self-Healing Action
        </h2>

        <p>
          Try the supported password-expired scenario.
        </p>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: My password has expired."
          rows="3"
        />

        <button
          className="primary-button"
          onClick={runSelfHealing}
          disabled={automationLoading}
        >
          {automationLoading
            ? "Running Self-Healing..."
            : "⚡ Run Self-Healing"}
        </button>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

      </div>

      {/* RESULT */}

      {automationResult && (
        <>
          <div className="card">

            <div className="automation-result-header">

              <div>
                <span className="section-label">
                  AUTOMATION RESULT
                </span>

                <h2>
                  {automationResult.identified_issue ||
                    automationResult.message ||
                    "Self-Healing Result"}
                </h2>
              </div>

            <div
              className={
                automationResult.status === "Escalated"
                  ? "completed-badge"
                  : "completed-badge"
              }
            >
              {automationResult.status === "Escalated"
                ? "⚠ Escalated"
                : "✓ Completed"}
            </div>

            </div>

            <div className="automation-steps">

              <div className="automation-step">
                <div className="step-check">✓</div>

                <div>
                  <strong>Identify</strong>
                  <span>Password expiry detected from employee request.</span>
                </div>

                <b>Success</b>
              </div>

              <div className="automation-step">
                <div className="step-check">✓</div>

                <div>
                  <strong>Diagnose</strong>
                  <span>Request classified as a supported password-expired issue.</span>
                </div>

                <b>Success</b>
              </div>

              <div className="automation-step">
                <div className="step-check">✓</div>

                <div>
                  <strong>Knowledge Search</strong>
                  <span>Approved password-reset knowledge identified for remediation.</span>
                </div>

                <b>Success</b>
              </div>

              <div className="automation-step">
                <div className="step-check">✓</div>

                <div>
                  <strong>Determine Automation</strong>
                  <span>Password self-healing automation is supported.</span>
                </div>

                <b>Approved</b>
              </div>

              {automationResult.automation?.steps?.map(
                (step, index) => (
                  <div
                    className="automation-step"
                    key={`execution-${index}`}
                  >
                    <div className="step-check">
                      ✓
                    </div>

                    <div>
                      <strong>
                        Execute — {step.action}
                      </strong>

                      <span>
                        {step.message}
                      </span>
                    </div>

                    <b>
                      {step.status}
                    </b>
                  </div>
                )
              )}

              <div className="automation-step">
                <div className="step-check">✓</div>

                <div>
                  <strong>Validate</strong>
                  <span>Account access validation completed successfully.</span>
                </div>

                <b>Success</b>
              </div>

              {automationResult.servicenow && (
                <div className="automation-step">
                  <div className="step-check">✓</div>

                  <div>
                    <strong>Update ServiceNow</strong>
                    <span>
                      Incident updated with the automated resolution.
                    </span>
                  </div>

                  <b>Resolved</b>
                </div>
              )}

            </div>

          </div>

          {/* SERVICENOW */}

          {automationResult.servicenow && (
            <div className="success-card self-heal-success">

              <div className="success-icon">
                ✓
              </div>

              <div className="self-heal-service">

                <span className="section-label">
                  SERVICENOW UPDATE
                </span>

                <h2>
                  Incident Automatically Resolved
                </h2>

                <div className="ticket-number">
                  {automationResult.servicenow.incident_number}
                </div>

                <p>
                  {automationResult.servicenow.resolution}
                </p>

              </div>

              <div className="resolved-status">
                <strong>
                  Resolved
                </strong>

                <span>
                  AI Self-Healing Agent
                </span>
              </div>

            </div>
          )}

        </>
      )}

    </section>
  );
};

 const renderSelfService = () => (
  <>
    <section className="hero">
      <div className="hero-badge">AI-POWERED IT SUPPORT</div>

      <h2>How can we help you?</h2>

      <p>
        Describe your IT issue and our AI assistant will analyze it,
        search the knowledge base, and suggest a resolution.
      </p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Example: My VPN is not connecting and authentication keeps failing."
        rows="5"
      />

      <button
        className="primary-button"
        onClick={analyzeIssue}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Ask AI"}
      </button>

      {error && <div className="error">{error}</div>}
    </section>

    {analysis && (
      <section className="card">
        <div className="card-header">
          <h2>AI Analysis</h2>

          <span className="confidence">
            Confidence: {(analysis.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="analysis-grid">
          <div>
            <span>Intent</span>
            <strong>{analysis.intent}</strong>
          </div>

          <div>
            <span>Category</span>
            <strong>{analysis.category}</strong>
          </div>

          <div>
            <span>Subcategory</span>
            <strong>{analysis.subcategory}</strong>
          </div>

          <div>
            <span>Priority</span>
            <strong>{analysis.priority}</strong>
          </div>

          <div>
            <span>Impact</span>
            <strong>{analysis.impact}</strong>
          </div>

          <div>
            <span>Urgency</span>
            <strong>{analysis.urgency}</strong>
          </div>

          <div>
            <span>Assignment Group</span>
            <strong>{analysis.assignment_group}</strong>
          </div>

          <div>
            <span>Summary</span>
            <strong>{analysis.summary}</strong>
          </div>
        </div>
      </section>
    )}

    {resolution && (
      <section className="card">
        <h2>
          {knowledgeFound
            ? "Suggested Resolution"
            : "⚠ Knowledge Not Found"}
        </h2>

        {!knowledgeFound && (
          <div
            style={{
              padding: "14px",
              marginBottom: "16px",
              borderRadius: "8px",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
            }}
          >
            No relevant approved knowledge was found for this request.
            The system has not used unrelated knowledge to generate a
            solution.
          </div>
        )}

        <div className="resolution">
          {resolution}
        </div>

        <button
          className="secondary-button"
          onClick={createTicket}
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : knowledgeFound
              ? "Create IT Incident"
              : "Escalate & Create IT Incident"}
        </button>
      </section>
    )}

    {knowledgeFound && sources.length > 0 && (
      <section className="card">
        <h2>Knowledge Sources</h2>

        {sources.map((source, index) => (
          <div className="source" key={index}>
            <strong>{source.source}</strong>

            <span>
              Match distance: {source.distance.toFixed(3)}
            </span>
          </div>
        ))}
      </section>
    )}

    {!knowledgeFound && analysis && (
      <section className="card">
        <h2>Knowledge Status</h2>

        <div
          style={{
            padding: "14px",
            borderRadius: "8px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <strong>Human assistance required</strong>

          <p style={{ marginBottom: 0 }}>
            This request is outside the approved knowledge base.
            Please escalate it to the Service Desk.
          </p>
        </div>
      </section>
    )}

    {ticket && (
      <section className="success-card">
        <h2>Incident Created Successfully</h2>

        <div className="ticket-number">
          {ticket.servicenow.incident_number}
        </div>

        <p>
          Your IT incident has been created and assigned to{" "}
          <strong>{ticket.analysis.assignment_group}</strong>.
        </p>

        <div className="ticket-details">
          <span>
            Priority: <strong>{ticket.analysis.priority}</strong>
          </span>

          <span>
            Status: <strong>{ticket.servicenow.state}</strong>
          </span>
        </div>
      </section>
    )}
  </>
);

  const renderDashboard = () => {
  if (dashboardLoading && !dashboard) {
    return (
      <section className="page-section">
        <div className="page-title">
          <div>
            <h2>ITSM Dashboard</h2>
            <p>Enterprise AI helpdesk overview</p>
          </div>
        </div>

        <div className="card coming-soon">
          <div className="coming-icon">◌</div>
          <h2>Loading ITSM Intelligence...</h2>
          <p>
            Fetching live ticket, automation and provisioning data.
          </p>
        </div>
      </section>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <h2>ITSM Dashboard</h2>
          <p>Live enterprise AI helpdesk overview</p>
        </div>

        <button
          className="secondary-button"
          onClick={loadDashboard}
          disabled={dashboardLoading}
        >
          {dashboardLoading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* KPI CARDS */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>Total Tickets</span>

          <strong>
            {dashboard.tickets.total}
          </strong>

          <small>
            AI monitored tickets
          </small>
        </div>

        <div className="stat-card">
          <span>Open Tickets</span>

          <strong>
            {dashboard.tickets.open}
          </strong>

          <small>
            Requires attention
          </small>
        </div>

        <div className="stat-card">
          <span>AI Resolved</span>

          <strong>
            {dashboard.tickets.resolved}
          </strong>

          <small>
            Self-service resolved
          </small>
        </div>

        <div className="stat-card">
          <span>Escalated</span>

          <strong>
            {dashboard.tickets.escalated}
          </strong>

          <small>
            Human support required
          </small>
        </div>

      </div>

      {/* SECONDARY METRICS */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>Software Requests</span>

          <strong>
            {dashboard.software.total_requests}
          </strong>

          <small>
            Service catalogue requests
          </small>
        </div>

        <div className="stat-card">
          <span>Provisioning</span>

          <strong>
            {dashboard.software.provisioning}
          </strong>

          <small>
            Currently provisioning
          </small>
        </div>

        <div className="stat-card">
          <span>Automation Actions</span>

          <strong>
            {dashboard.automation.total_actions}
          </strong>

          <small>
            AI automation activity
          </small>
        </div>

        <div className="stat-card">
          <span>Successful Actions</span>

          <strong>
            {dashboard.automation.successful_actions}
          </strong>

          <small>
            Completed successfully
          </small>
        </div>

      </div>

      {/* DASHBOARD PANELS */}

      <div className="dashboard-grid">

        <div className="card">
          <h2>AI Automation Status</h2>

          <div className="status-row">
            <span>Password Self-Heal</span>
            <strong className="status-success">
              Active
            </strong>
          </div>

          <div className="status-row">
            <span>Knowledge Search</span>
            <strong className="status-success">
              Active
            </strong>
          </div>

          <div className="status-row">
            <span>ServiceNow Integration</span>
            <strong className="status-success">
              Connected
            </strong>
          </div>

          <div className="status-row">
            <span>Software Provisioning</span>
            <strong className="status-success">
              Active
            </strong>
          </div>
        </div>

        <div className="card">
          <h2>Recent Tickets</h2>

          {dashboard.recent_tickets.length === 0 ? (
            <p className="empty-state">
              No tickets created yet.
            </p>
          ) : (
            dashboard.recent_tickets.map((ticket) => (
              <div
                className="activity"
                key={ticket.ticket_number}
              >
                <strong>
                  {ticket.ticket_number}
                </strong>

                <span>
                  {ticket.summary}
                </span>

                <span>
                  {ticket.priority} ·{" "}
                  {ticket.assignment_group} ·{" "}
                  {ticket.status}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
};

  const renderAIAnalysis = () => {
  return (
    <section className="page-section">

      <div className="page-title">
        <div>
          <h2>AI Analysis</h2>
          <p>
            Understand how the AI interprets and resolves employee requests
          </p>
        </div>
      </div>

      {/* AI INPUT */}

      <div className="card ai-analysis-input">

        <div className="analysis-input-header">
          <div>
            <span className="section-label">
              AI REQUEST ANALYZER
            </span>

            <h2>Analyze an employee request</h2>

            <p>
              The AI will classify the request, search the approved
              knowledge base and generate a grounded resolution.
            </p>
          </div>

          <div className="ai-pulse">
            <span>AI</span>
          </div>
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: My VPN is not connecting and authentication keeps failing."
          rows="4"
        />

        <button
          className="primary-button"
          onClick={analyzeIssue}
          disabled={loading}
        >
          {loading ? "AI is analyzing..." : "Analyze Request"}
        </button>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

      </div>

      {/* EMPTY STATE */}

      {!analysis && !loading && (
        <div className="card coming-soon ai-empty">

          <div className="ai-empty-icon">
            ✦
          </div>

          <h2>Ready for AI Analysis</h2>

          <p>
            Enter an employee IT request above to see intent,
            classification, priority, confidence, knowledge sources
            and the recommended resolution.
          </p>

        </div>
      )}

      {/* CLASSIFICATION */}

      {analysis && (
        <div className="card">

          <div className="card-header">

            <div>
              <span className="section-label">
                AI CLASSIFICATION
              </span>

              <h2 className="analysis-heading">
                Request Understanding
              </h2>
            </div>

            <div className="confidence-large">
              <span>AI Confidence</span>
              <strong>
                {(analysis.confidence * 100).toFixed(0)}%
              </strong>
            </div>

          </div>

          <div className="analysis-grid">

            <div>
              <span>Intent</span>
              <strong>{analysis.intent}</strong>
            </div>

            <div>
              <span>Category</span>
              <strong>{analysis.category}</strong>
            </div>

            <div>
              <span>Subcategory</span>
              <strong>{analysis.subcategory}</strong>
            </div>

            <div>
              <span>Priority</span>
              <strong className={`priority-${analysis.priority.toLowerCase()}`}>
                {analysis.priority}
              </strong>
            </div>

            <div>
              <span>Impact</span>
              <strong>{analysis.impact}</strong>
            </div>

            <div>
              <span>Urgency</span>
              <strong>{analysis.urgency}</strong>
            </div>

            <div>
              <span>Assignment Group</span>
              <strong>{analysis.assignment_group}</strong>
            </div>

            <div>
              <span>Summary</span>
              <strong>{analysis.summary}</strong>
            </div>

          </div>

        </div>
      )}

      {/* RESOLUTION + SOURCES */}

      {analysis && (
        <div className="dashboard-grid">

          <div className="card">

            <div className="section-label">
              GROUNDED AI RESPONSE
            </div>

            <h2>
              {knowledgeFound
                ? "Suggested Resolution"
                : "⚠ Knowledge Not Found"}
            </h2>

            <div className="resolution">
              {resolution}
            </div>

            {!knowledgeFound && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  color: "#9a3412",
                }}
              >
                <strong>Human assistance required</strong>

                <p style={{ margin: "6px 0 0" }}>
                  No relevant approved knowledge was found. The request
                  should be escalated to the Service Desk.
                </p>
              </div>
            )}

            <button
              className="secondary-button"
              onClick={createTicket}
              disabled={loading}
            >
              {loading
                ? "Creating Incident..."
                : knowledgeFound
                  ? "Create ServiceNow Incident"
                  : "Escalate & Create IT Incident"}
            </button>

          </div>

          <div className="card">

            <div className="section-label">
              RETRIEVED KNOWLEDGE
            </div>

            <h2>Knowledge Sources</h2>

            {!knowledgeFound || sources.length === 0 ? (
                <p className="empty-state">
                  {knowledgeFound
                    ? "No approved knowledge sources found."
                    : "No relevant approved knowledge was found for this request."}
                </p>
              ) : (
              sources.map((source, index) => (
                <div
                  className="knowledge-source"
                  key={index}
                >

                  <div className="knowledge-source-icon">
                    📄
                  </div>

                  <div>
                    <strong>
                      {source.source}
                    </strong>

                    <span>
                      Semantic match distance:{" "}
                      {source.distance.toFixed(3)}
                    </span>
                  </div>

                </div>
              ))
            )}

          </div>

        </div>
      )}

      {/* SERVICENOW RESULT */}

      {ticket && (
        <div className="success-card analysis-success">

          <div className="success-icon">
            ✓
          </div>

          <div>

            <h2>
              ServiceNow Incident Created
            </h2>

            <div className="ticket-number">
              {ticket.servicenow.incident_number}
            </div>

            <p>
              Incident successfully created and assigned to{" "}
              <strong>
                {ticket.analysis.assignment_group}
              </strong>
              .
            </p>

          </div>

          <div className="ticket-details">

            <span>
              Priority:{" "}
              <strong>
                {ticket.analysis.priority}
              </strong>
            </span>

            <span>
              Status:{" "}
              <strong>
                {ticket.servicenow.state}
              </strong>
            </span>

          </div>

        </div>
      )}

    </section>
  );
};   

  const renderPlaceholder = (title, description) => (
    <section className="page-section">
      <div className="page-title">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="card coming-soon">
        <div className="coming-icon">⚙</div>
        <h2>Module Ready for Integration</h2>
        <p>
          This module will be connected to the AI ITSM backend in the next
          implementation step.
        </p>
      </div>
    </section>
  );

  if (!isLoggedIn) {
  return (
    <div className="login-page">
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <div className="login-card">

        <div className="login-brand">
          <div className="login-brand-icon">
            ✦
          </div>

          <div>
            <h1>AI ITSM Helpdesk</h1>
            <p>Intelligent Employee Support Platform</p>
          </div>
        </div>

        <div className="login-welcome">
          <span>WELCOME BACK</span>

          <h2>
            Intelligent IT support,
            <br />
            powered by AI.
          </h2>

          <p>
            Sign in to access your enterprise IT support workspace.
          </p>
        </div>

        <div className="login-role-title">
          Continue as
        </div>

        <div className="login-role-grid">

          <button
            className="login-role-card"
            onClick={() => {
              setUserRole("employee");
              setIsLoggedIn(true);
              setActivePage("self-service");
            }}
          >
            <div className="login-role-icon">
              👤
            </div>

            <div>
              <strong>Employee</strong>
              <span>
                Get AI-powered IT support
              </span>
            </div>

            <b>→</b>
          </button>

          <button
            className="login-role-card"
            onClick={() => {
              setUserRole("admin");
              setIsLoggedIn(true);
              setActivePage("dashboard");
            }}
          >
            <div className="login-role-icon admin">
              🛠️
            </div>

            <div>
              <strong>IT Support</strong>
              <span>
                Manage enterprise IT operations
              </span>
            </div>

            <b>→</b>
          </button>

        </div>

        <div className="login-features">
          <span>✦ AI</span>
          <span>•</span>
          <span>RAG</span>
          <span>•</span>
          <span>Automation</span>
          <span>•</span>
          <span>ServiceNow</span>
        </div>

        <div className="login-demo">
          Demo environment · Secure enterprise workspace
        </div>

      </div>
    </div>
  );
}

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">AI</div>

          <div>
            <h1>AI ITSM Helpdesk</h1>
            <p>Intelligent Employee Support Platform</p>
          </div>
        </div>

        <div className="header-actions">
  <div className="user-role-badge">
    <span className="user-role-icon">
      {userRole === "admin" ? "🛠️" : "👤"}
    </span>

    <div>
      <strong>
        {userRole === "admin" ? "IT Support" : "Employee"}
      </strong>

      <small>
        {userRole === "admin"
          ? "Support Workspace"
          : "Employee Workspace"}
      </small>
    </div>
  </div>

          <div className="status">
            <span className="status-dot"></span>
            AI Assistant Online
          </div>

          <button
            className="logout-button"
            onClick={() => {
              setIsLoggedIn(false);
              setUserRole(null);
              setActivePage("self-service");
            }}
          >
            ↪ Logout
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-title">WORKSPACE</div>

          <button
            className={
              activePage === "self-service"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => setActivePage("self-service")}
          >
            <span>💬</span>
            Employee Self-Service
          </button>

          <button
            className={
              activePage === "dashboard"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => setActivePage("dashboard")}
          >
            <span>📊</span>
            ITSM Dashboard
          </button>

          <button
            className={
              activePage === "analysis"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => setActivePage("analysis")}
          >
            <span>🤖</span>
            AI Analysis
          </button>

          <button
            className={
              activePage === "knowledge"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => setActivePage("knowledge")}
          >
            <span>📚</span>
            Knowledge Base
          </button>

          <button
            className={
              activePage === "automation"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => setActivePage("automation")}
          >
            <span>⚡</span>
            Self-Healing
          </button>

          <button
            className={
              activePage === "software"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => setActivePage("software")}
          >
            <span>💻</span>
            Software Provisioning
          </button>

          <div className="sidebar-footer">
            <span className="sidebar-footer-dot"></span>
            System Operational
          </div>
        </aside>

        <main className="container">
          {activePage === "self-service" &&
            renderSelfService()}

          {activePage === "dashboard" &&
            renderDashboard()}

          {activePage === "analysis" &&
            renderAIAnalysis()}

          {activePage === "knowledge" &&
            renderKnowledgeBase()}

          {activePage === "automation" &&
            renderSelfHealing()}

          {activePage === "software" && (
  <section className="page-section">
    <div className="page-title">
      <div>
        <h2>Software Provisioning</h2>
        <p>Request approved software through the IT service catalogue</p>
      </div>
    </div>

    <div className="card">
      <div className="card-header">
        <div>
          <h3>Software Request</h3>
          <p>
            Submit a software request and the AI ITSM system will create
            a provisioning request.
          </p>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
          }}
        >
          Software
        </label>

        <select
            id="software-select"
            defaultValue="Visual Studio Code"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d7dbea",
              fontSize: "15px",
              background: "#fff",
              color: "#111827",
            }}
          >
            <option value="Visual Studio Code">
              Visual Studio Code
            </option>
          </select>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
          }}
        >
          Employee Request
        </label>

        <textarea
          id="software-request"
          rows="4"
          defaultValue="I need Visual Studio Code installed"
          placeholder="Example: I need Visual Studio Code installed"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #d7dbea",
            fontSize: "15px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          className="primary-button"
          disabled={softwareLoading}
          onClick={async () => {
            const request =
              document.getElementById("software-request").value.trim();

            if (!request) {
              return;
            }

            setSoftwareLoading(true);
            setSoftwareResult(null);

            try {
              const response = await fetch(
                `${API_URL}/software/provision`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    question: request,
                  }),
                }
              );

              if (!response.ok) {
                throw new Error(
                  "Software provisioning request failed."
                );
              }

              const data = await response.json();

              setSoftwareResult(data);
            } catch (err) {
              setSoftwareResult({
                error: err.message,
              });
            } finally {
              setSoftwareLoading(false);
            }
          }}
        >
          {softwareLoading
            ? "Creating Request..."
            : "Request Software"}
        </button>
      </div>

      {softwareResult && !softwareResult.error && (
        <div
          style={{
            marginTop: "28px",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #cfe8d5",
            background: "#f3fbf5",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#16803c",
              marginBottom: "8px",
            }}
          >
            ✓ PROVISIONING REQUEST CREATED
          </div>

          <h3 style={{ margin: "0 0 16px 0" }}>
            Software provisioning initiated
          </h3>

          <div
            style={{
              display: "grid",
              gap: "10px",
            }}
          >
            <div>
              <strong>Request ID:</strong>{" "}
              {softwareResult.request.request_id}
            </div>

            <div>
              <strong>ServiceNow Request:</strong>{" "}
              {softwareResult.servicenow.request_number}
            </div>

            <div>
              <strong>Software:</strong>{" "}
              {softwareResult.request.software}
            </div>

            <div>
              <strong>Status:</strong>{" "}
              <span style={{ fontWeight: "700" }}>
                {softwareResult.request.status}
              </span>
            </div>

            <div>
              <strong>ServiceNow State:</strong>{" "}
              {softwareResult.servicenow.state}
            </div>

            <div>
              <strong>Integration:</strong>{" "}
              {softwareResult.servicenow.integration}
            </div>
          </div>
        </div>
      )}

      {softwareResult && softwareResult.error && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "10px",
            background: "#fff4f4",
            border: "1px solid #f0caca",
            color: "#b42318",
          }}
        >
          <strong>Request Failed</strong>
          <div style={{ marginTop: "6px" }}>
            {softwareResult.error}
          </div>
        </div>
      )}
    </div>
  </section>
)}
        </main>
      </div>
    </div>
  );
}

export default App;
# CreditLens AI

CreditLens AI is an AI-assisted credit analysis platform for lenders, analysts,
and finance teams. It accepts company financial documents, extracts structured
financial data, validates the results, computes a deterministic credit score,
generates analyst-style risk narratives, answers lending questions, and produces
professional credit proposal reports.

The project is designed to be implementable by AI coding agents while still
following a production-minded architecture: typed data contracts, provider
fallbacks, resilient external calls, auditable scoring, cached market data, and
template-based reporting.

## Product Flow

```text
Upload financial documents
  -> Azure Document Intelligence extracts Markdown + structured JSON
  -> Pydantic validates extracted data
  -> Financial metrics are normalized
  -> Credit scoring and risk analysis run deterministically
  -> LLM provider chain generates narratives and Q&A answers
  -> Server-side charts are created for reports
  -> DOCX proposal is generated from a template
  -> PDF fallback/export is available
  -> Frontend dashboard displays analysis, charts, chat, and downloads
```

## Core Capabilities

- Multi-document upload for financial statements, annual reports, bank materials,
  and supporting credit documents.
- Azure Document Intelligence extraction using a Markdown + JSON hybrid approach.
- Typed financial extraction, analysis, and report models using Pydantic v2.
- Multi-provider LLM routing with NVIDIA NIM as primary and Groq / Cloudflare
  Workers AI as fallbacks.
- Deterministic, auditable credit scoring with multi-factor risk analysis.
- Stock and market data through yfinance, Alpha Vantage fallback, and cached
  responses.
- Editable DOCX credit proposal generation with PDF fallback.
- Server-side matplotlib charts for reports.
- Frontend Three.js visualizations for interactive analysis.
- Async processing for long-running extraction, analysis, and report generation.
- Persisted state so sessions can survive application restarts.
- Structured logging, retries, backoff, and circuit breaker behavior for external
  provider failures.

## Architecture Overview

| Area | Architecture |
|---|---|
| Backend framework | FastAPI |
| Document extraction | Azure Document Intelligence using Markdown + JSON output |
| Validation | Pydantic v2 models for extraction, analysis, scoring, and reports |
| LLM routing | NVIDIA NIM primary, Groq fallback, Cloudflare Workers AI fallback |
| Credit scoring | Deterministic multi-factor model with auditable breakdown |
| Report generation | DOCX template with docxtpl, chart images, and PDF fallback |
| Charts | matplotlib for report assets, Three.js for frontend interactivity |
| Stock data | yfinance, Alpha Vantage fallback, cached final fallback |
| State | Persisted sessions and async jobs |
| Frontend | React 18 + Vite |
| Styling/UI | Domain-focused analyst dashboard, dense and readable |
| Runtime model | Upload starts processing job; frontend polls status |

## Why This Architecture

The initial MVP concept used Markdown-only extraction, a single LLM provider,
simple manual JSON parsing, PageIndex as the core document layer, in-memory
session state, yfinance-only stock data, and PDF-only reports.

That is useful for a demo, but fragile in practice. Credit analysis depends on
reliable extraction, repeatable scoring, validated output, and professional
reporting. The improved architecture therefore uses:

- Markdown for LLM-readable context.
- JSON for structured metadata, table geometry, figures, key/value fields, and
  validation.
- Pydantic v2 to prevent malformed LLM output from leaking downstream.
- LLM provider fallback so one rate limit or outage does not stop the product.
- DOCX templates so reports are editable, reusable, and business-friendly.
- Async processing because extraction and report generation can be slow.
- Persistent state so a server restart does not destroy a credit review.

## Output Format Decision

Use a Markdown + JSON hybrid extraction payload.

### Markdown

Markdown is best for LLM context because it keeps the document readable:

- headings preserve hierarchy
- tables remain understandable
- paragraphs remain in order
- section boundaries are visible
- the model can reason over the document like a human analyst

Example:

```text
| Metric | FY2024 | FY2023 |
|---|---:|---:|
| Net sales | 53,093 | 49,251 |
| Operating profit | 12,238 | 9,283 |
```

### JSON

JSON is best for programmatic extraction and validation:

- table cells and row/column positions
- key/value fields
- figure and layout metadata
- page references
- section metadata
- bounding boxes where needed
- normalized downstream models

The extraction layer should keep both forms. Markdown feeds LLM reasoning. JSON
feeds validation, scoring, traceability, and report rendering.

### DOCX Handling

For DOCX uploads, convert to PDF first when reliable figure extraction is needed.
DOCX files often store images and objects in Office-specific structures, while
PDF-based layout parsing is usually more predictable for document intelligence.

## LLM Strategy

### Provider Order

1. NVIDIA NIM
2. Groq
3. Cloudflare Workers AI

NVIDIA NIM is the primary provider because it is OpenAI-compatible and suitable
for extraction assistance, summarization, analysis narratives, and Q&A.

Groq is a fast fallback provider for OpenAI-compatible chat completions.

Cloudflare Workers AI is the secondary fallback to improve availability when the
primary providers fail, throttle, or become unavailable.

### LLM Router Requirements

Implement a backend service named `llm_router.py` that:

- exposes one internal interface for model calls
- tries providers in configured priority order
- logs provider failures with structured fields
- retries only transient errors
- does not retry invalid model output as if it were a network failure
- supports request timeouts
- supports circuit breaker behavior after repeated provider failures
- returns provider metadata with each successful response

### Optional FinGPT Layer

FinGPT from the AI4Finance Foundation may be used as an optional specialist layer
for financial sentiment and qualitative risk signals. It should not replace the
main provider fallback chain.

Recommended use:

- news sentiment
- qualitative risk flag classification
- sector-specific language analysis

## Data Validation

Treat all LLM output as untrusted.

Every structured response should pass through Pydantic v2 before it is used by
scoring, reporting, or UI rendering.

Required model groups:

- extraction models
- normalized financial metric models
- analysis models
- score breakdown models
- report payload models
- provider response metadata models

Validation should catch:

- malformed JSON
- missing required fields
- invalid numeric types
- impossible values
- inconsistent currencies or fiscal periods
- incomplete report payloads

## Credit Scoring

Credit scoring must remain deterministic and auditable. LLMs may help summarize
risks or explain findings, but the final score should be produced by application
logic.

### Scoring Factors

The scoring system should include:

- profitability
- leverage
- revenue growth
- profit growth
- liquidity
- cash flow quality
- trend direction across periods
- sector or peer comparison
- balance sheet strength
- qualitative risk flags from extracted notes
- market and stock indicators where available

### Output

The scoring service should return:

- final numeric score from 0 to 100
- credit rating
- recommendation
- max safe loan estimate
- category-level score breakdown
- financial strengths
- risk factors
- recommended lending conditions
- concise narrative summary
- traceable metrics used in the calculation

### Suggested Rating Scale

| Score | Rating | Action |
|---:|---|---|
| 85-100 | AAA | Approve |
| 70-84 | AA | Approve with standard terms |
| 55-69 | BBB | Conditional approval |
| 40-54 | BB | High scrutiny |
| < 40 | CCC | Decline |

The max safe loan can initially use a conservative rule such as a percentage of
total assets, but it should be adjusted by leverage, cash flow, sector risk, and
trend direction as the scoring model matures.

## Decision Engine Reference Logic

The original `README.md` contained important application logic for the MVP credit
decision engine. That logic should be preserved as the baseline implementation
and then expanded into the richer architecture described above.

### Analysis Flow

The decision engine has three stages:

1. Extract structured financial data from combined document Markdown.
2. Compute a deterministic rule-based credit score.
3. Ask the LLM to generate a lending decision narrative and recommendation using
   the validated financials and deterministic score.

The decision engine should return:

- extracted financials
- credit score
- score breakdown
- credit rating
- recommendation
- max safe loan
- strengths
- risks
- approval conditions
- narrative
- requested loan amount

### Financial Extraction Schema

The baseline extraction prompt expects this JSON shape:

```json
{
  "company_name": "string",
  "ticker": "string or null",
  "fiscal_year": "string",
  "currency": "string",
  "revenue": "number or null",
  "revenue_prev": "number or null",
  "operating_profit": "number or null",
  "net_profit": "number or null",
  "total_assets": "number or null",
  "total_liabilities": "number or null",
  "net_assets": "number or null",
  "cash": "number or null",
  "capex": "number or null",
  "equity_ratio": "number or null",
  "roe": "number or null",
  "roa": "number or null",
  "operating_margin": "number or null",
  "dividend_per_share": "number or null",
  "payout_ratio": "number or null",
  "revenue_growth_pct": "number or null",
  "profit_growth_pct": "number or null",
  "segments": [
    {
      "name": "string",
      "revenue": "number",
      "profit": "number"
    }
  ],
  "forecast_revenue": "number or null",
  "forecast_op_profit": "number or null",
  "qualitative_notes": "string"
}
```

In the improved architecture, this shape should become a Pydantic v2 model.
Aliases may be used to normalize older fields such as `revenue_prev` into clearer
names such as `revenue_previous`.

### Baseline Scoring Formula

The original MVP scoring model uses five weighted categories:

| Category | Max Points | Inputs |
|---|---:|---|
| Profitability | 30 | ROE, operating margin, ROA |
| Leverage | 25 | equity ratio, liabilities to net assets |
| Growth | 20 | revenue growth, profit growth |
| Liquidity | 15 | approximated from equity ratio |
| Qualitative | 10 | default baseline risk assessment |

Baseline implementation:

```python
def compute_credit_score(f: dict) -> tuple[float, dict]:
    """
    Weighted scoring 0-100. All rule-based and deterministic.
    Weights: Profitability 30%, Leverage 25%, Growth 20%,
    Liquidity 15%, Quality 10%.
    """
    breakdown = {}

    # Profitability: 30 points
    prof = 0
    if f.get("roe") is not None:
        prof += min(f["roe"] / 15 * 12, 12)
    if f.get("operating_margin") is not None:
        prof += min(f["operating_margin"] / 20 * 10, 10)
    if f.get("roa") is not None:
        prof += min(f["roa"] / 10 * 8, 8)
    breakdown["profitability"] = round(min(prof, 30), 1)

    # Leverage: 25 points
    lev = 0
    if f.get("equity_ratio") is not None:
        lev += min(f["equity_ratio"] / 60 * 15, 15)
    if f.get("total_liabilities") and f.get("net_assets"):
        liab_ratio = f["total_liabilities"] / f["net_assets"]
        lev += max(0, 10 - liab_ratio * 5)
    breakdown["leverage"] = round(min(lev, 25), 1)

    # Growth: 20 points
    grow = 0
    if f.get("revenue_growth_pct") is not None:
        grow += min(f["revenue_growth_pct"] / 10 * 10, 10)
    if f.get("profit_growth_pct") is not None:
        grow += min(f["profit_growth_pct"] / 15 * 10, 10)
    breakdown["growth"] = round(min(max(grow, 0), 20), 1)

    # Liquidity: 15 points
    liq = 0
    if f.get("equity_ratio"):
        liq = min(f["equity_ratio"] / 80 * 15, 15)
    breakdown["liquidity"] = round(liq, 1)

    # Qualitative: 10 points
    breakdown["qualitative"] = 6.0

    total = sum(breakdown.values())
    return round(min(total, 100), 1), breakdown
```

The improved scoring service should start from this baseline, then add richer
inputs such as cash flow quality, sector benchmarks, peer comparison, trend
direction, and qualitative risk flags.

### Rating Conversion

Baseline rating conversion:

```python
def score_to_rating(score: float) -> str:
    if score >= 85:
        return "AAA"
    if score >= 70:
        return "AA"
    if score >= 55:
        return "BBB"
    if score >= 40:
        return "BB"
    return "CCC"
```

### Lending Decision Logic

The original MVP estimates `max_safe_loan` as 20% of total assets when asset data
is available.

```python
total_assets = financials.get("total_assets", 0)
max_safe_loan = total_assets * 0.20 if total_assets else None
```

The LLM is then asked to return a lending decision as JSON:

```json
{
  "recommendation": "APPROVE | CONDITIONAL | DECLINE",
  "max_safe_loan": "number",
  "loan_to_asset_ratio": "number or null",
  "strengths": ["string", "string", "string"],
  "risks": ["string", "string", "string"],
  "conditions": ["string"],
  "narrative": "2-3 sentence professional summary"
}
```

In the improved version, this output must be validated before it becomes part of
the final analysis response.

### Baseline Decision Engine Function

The original end-to-end decision function should be preserved conceptually:

```python
def run_credit_analysis(combined_markdown: str, loan_amount: float = None) -> dict:
    # 1. Extract structured financial data from document Markdown.
    # 2. Parse and validate the JSON financials.
    # 3. Compute deterministic score and category breakdown.
    # 4. Generate lending decision narrative and recommendation.
    # 5. Return one complete analysis payload.

    financials = extract_financials_from_markdown(combined_markdown)
    score, breakdown = compute_credit_score(financials)
    decision = get_lending_decision(financials, score, breakdown, loan_amount)

    return {
        "financials": financials,
        "credit_score": score,
        "score_breakdown": breakdown,
        "credit_rating": score_to_rating(score),
        "recommendation": decision["recommendation"],
        "max_safe_loan": decision.get("max_safe_loan"),
        "strengths": decision.get("strengths", []),
        "risks": decision.get("risks", []),
        "conditions": decision.get("conditions", []),
        "narrative": decision.get("narrative", ""),
        "loan_amount_requested": loan_amount
    }
```

The production implementation should replace loose JSON parsing with Pydantic
model parsing and should use the LLM router rather than calling NVIDIA directly.

## Report Generation

Use template-based DOCX generation as the primary reporting path.

### Primary Output

- Use `docxtpl`.
- Store the template at `backend/templates/credit_proposal.docx`.
- Populate the template with validated `ReportPayload` data.
- Embed chart images generated by the chart service.
- Keep the generated DOCX editable for business users.

### PDF Fallback

PDF can be generated as:

- a converted version of the DOCX report
- a direct fallback using ReportLab if DOCX conversion is unavailable

The application should be able to return DOCX and PDF downloads when both are
implemented.

### Report Contents

The credit proposal/report should include:

- company name and fiscal period
- executive summary
- requested loan amount when provided
- lending recommendation
- final credit score and rating
- max safe loan estimate
- key financials table
- profitability analysis
- leverage analysis
- liquidity analysis
- growth and trend analysis
- market or stock data where available
- strengths
- risks
- approval conditions
- charts
- source document references where possible

## Stock Data Strategy

Do not depend on yfinance as the only market data source.

Recommended lookup order:

1. yfinance
2. Alpha Vantage
3. cached response

The stock service should:

- normalize responses into one internal shape
- cache successful lookups
- return stale cached data when live sources fail
- avoid repeatedly hammering failing providers
- include source metadata and timestamps

Example normalized fields:

- ticker
- current price
- market cap
- P/E ratio
- beta
- 52-week high
- 52-week low
- volume
- dividend yield
- historical close prices
- source
- retrieved_at

## Charts

Use two chart layers.

### Server-Side Charts

Use matplotlib for charts embedded in DOCX/PDF reports.

Report charts should be:

- deterministic
- printable
- image-based
- generated from validated analysis data

Recommended report charts:

- credit score breakdown
- revenue and profit trend
- leverage ratio trend
- liquidity/cash trend
- stock price history when ticker data is available

### Frontend Charts

Use Three.js for interactive dashboard visualizations.

Recommended frontend visualizations:

- credit score sphere colored by rating
- 3D risk/radar bars for score categories
- 3D stock price line or ribbon

Three.js should improve analyst exploration, while matplotlib should serve the
stable reporting use case.

## Scalability and Processing

Uploads, extraction, scoring, and report generation can take time. The backend
should therefore use async processing rather than making the user wait on one
blocking request.

Recommended flow:

1. User uploads documents.
2. Backend creates a session and job.
3. Background worker runs extraction.
4. Background worker validates extracted data.
5. Scoring service computes analysis.
6. LLM router generates narrative and Q&A-ready context.
7. Chart service creates report images.
8. Report generator creates DOCX/PDF artifacts.
9. Frontend polls job status and renders results when ready.

State should be persisted so processing can be recovered or inspected after a
restart.

## Recommended Folder Structure

```text
credit-analysis-ai/
  backend/
    main.py
    config/
      settings.py
      logging.py
    core/
      errors.py
      resilience.py
      storage.py
    services/
      document_intelligence.py
      llm_router.py
      scoring.py
      report_generator.py
      stock_service.py
      chart_service.py
    models/
      extraction.py
      analysis.py
      report.py
      stock.py
      jobs.py
    templates/
      credit_proposal.docx
    workers/
      tasks.py
    requirements.txt

  frontend/
    index.html
    package.json
    vite.config.js
    src/
      main.jsx
      App.jsx
      api/
        client.js
        analysis.js
        reports.js
        stock.js
      components/
        Upload.jsx
        Dashboard.jsx
        Chat.jsx
        ReportControls.jsx
        StatusTracker.jsx
      pages/
        AnalysisPage.jsx
      utils/
        formatting.js

  .env.example
  README.md
```

## Backend Services

### `backend/main.py`

FastAPI application entry point.

Responsibilities:

- configure CORS
- load settings
- register routes
- expose health checks
- accept uploads
- create processing jobs
- expose job status
- expose analysis retrieval
- expose stock lookup
- expose report download

### `backend/services/document_intelligence.py`

Azure Document Intelligence integration.

Responsibilities:

- submit files to Azure DI
- request Markdown output
- preserve structured JSON/layout metadata
- normalize extraction payloads
- handle DOCX-to-PDF conversion when needed
- return validated extraction-ready data

### `backend/services/llm_router.py`

Provider abstraction for LLM calls.

Responsibilities:

- call NVIDIA NIM first
- call Groq if NVIDIA fails
- call Cloudflare Workers AI if Groq fails
- normalize responses
- apply retry/backoff
- apply circuit breaker behavior
- return provider metadata

### `backend/services/scoring.py`

Deterministic credit scoring.

Responsibilities:

- consume validated financial metrics
- compute score categories
- calculate final credit score
- assign rating
- generate recommendation inputs
- return auditable score breakdown

### `backend/services/report_generator.py`

Business report generation.

Responsibilities:

- load DOCX template
- render validated report payload
- embed chart images
- write DOCX artifacts
- export or generate PDF fallback
- return downloadable file metadata

### `backend/services/stock_service.py`

Market data integration.

Responsibilities:

- fetch from yfinance
- fall back to Alpha Vantage
- fall back to cache
- normalize response shape
- include source and timestamp metadata

### `backend/services/chart_service.py`

Report-safe chart generation.

Responsibilities:

- create matplotlib figures
- save chart images for reports
- generate score, trend, leverage, liquidity, and stock charts
- return image paths or bytes for report embedding

### `backend/workers/tasks.py`

Background processing.

Responsibilities:

- process uploaded files
- run extraction
- validate data
- run scoring
- generate narratives
- create charts
- generate reports
- update job/session status

## Pydantic Model Design

### Extraction Models

Suggested fields:

- company_name
- ticker
- fiscal_year
- currency
- revenue
- revenue_previous
- operating_profit
- net_profit
- total_assets
- total_liabilities
- net_assets
- cash
- capex
- equity_ratio
- roe
- roa
- operating_margin
- dividend_per_share
- payout_ratio
- revenue_growth_pct
- profit_growth_pct
- segments
- forecast_revenue
- forecast_operating_profit
- qualitative_notes
- source_pages
- confidence

### Analysis Models

Suggested fields:

- financials
- credit_score
- credit_rating
- score_breakdown
- recommendation
- max_safe_loan
- loan_amount_requested
- strengths
- risks
- conditions
- narrative
- provider_metadata
- generated_at

### Report Models

Suggested fields:

- title
- company_name
- fiscal_period
- executive_summary
- recommendation
- credit_score
- credit_rating
- key_financials
- score_breakdown
- strengths
- risks
- conditions
- chart_paths
- source_documents
- prepared_at

## API Design

Recommended endpoints:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Application health check |
| `POST` | `/sessions` | Create an analysis session |
| `POST` | `/sessions/{session_id}/upload` | Upload documents and start processing |
| `GET` | `/sessions/{session_id}` | Get session metadata |
| `GET` | `/sessions/{session_id}/jobs/{job_id}` | Get processing status |
| `GET` | `/sessions/{session_id}/analysis` | Get validated credit analysis |
| `POST` | `/sessions/{session_id}/chat` | Ask questions about the credit package |
| `GET` | `/stock/{ticker}` | Fetch normalized stock data |
| `POST` | `/sessions/{session_id}/reports` | Generate or refresh report artifacts |
| `GET` | `/sessions/{session_id}/reports/{report_id}` | Download DOCX or PDF report |

### Original MVP Route Behavior to Preserve

The original README defined a simpler FastAPI route surface. The improved API can
use the more structured session/job endpoints above, but it should preserve the
same functional behavior.

| Original Route | Behavior to Preserve |
|---|---|
| `POST /upload` | Accept multiple files, extract content, create a session, return `session_id` and document count. |
| `POST /analyze/{session_id}` | Run credit analysis for the uploaded documents and optional loan amount. |
| `POST /chat/{session_id}` | Answer user questions against extracted document context and existing analysis. |
| `GET /stock/{ticker}` | Return normalized market data for a ticker. |
| `GET /report/{session_id}` | Return a generated credit report once analysis exists. |

Baseline session shape:

```python
SESSIONS = {
    "session_id": {
        "docs_md": [],
        "analysis": None,
        "pageindex_ids": []
    }
}
```

In the improved architecture, this in-memory structure should become persisted
session/job state. `pageindex_ids` should only exist if optional document Q&A
keeps PageIndex.

### Original Data Flow to Preserve

The first README defined this full MVP path:

```text
1. Upload one to five documents
2. Azure Document Intelligence extracts Markdown for each file
3. Documents are indexed or stored for Q&A
4. NVIDIA-compatible LLM extracts JSON financials from combined Markdown
5. Rule-based credit scoring runs without LLM involvement
6. LLM generates lending decision and narrative
7. Frontend renders Three.js visuals and financial tables
8. User asks questions and receives document-grounded answers
9. Report generator builds downloadable report
```

The improved pipeline should preserve that user-facing behavior while replacing
fragile internals with typed validation, provider fallback, persistent state, and
template-based reports.

## Environment Variables

Create `.env.example` with:

```bash
# NVIDIA NIM
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.3-70b-instruct

# Groq fallback
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile

# Cloudflare Workers AI fallback
CLOUDFLARE_AI_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_AI_TOKEN=xxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3.3-70b-instruct

# Azure Document Intelligence
AZURE_DI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DI_KEY=your_azure_key_here

# Stock data
ALPHA_VANTAGE_KEY=your_key_here

# App config
ENV=development
APP_STORAGE_DIR=./storage
```

## Backend Dependencies

Recommended `backend/requirements.txt`:

```text
fastapi
uvicorn[standard]
python-multipart
python-dotenv
pydantic>=2
pydantic-settings

azure-ai-documentintelligence
azure-core

openai
httpx
tenacity

yfinance
beautifulsoup4

docxtpl
python-docx
reportlab
matplotlib

orjson
```

Optional dependencies depending on persistence and worker implementation:

```text
sqlalchemy
alembic
redis
rq
celery
```

PageIndex should not be a required dependency for the core pipeline. It can be
added as an optional dependency if the project keeps vectorless exploratory Q&A.

## Frontend Dependencies

Recommended `frontend/package.json` dependencies:

```json
{
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.3.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.165.0",
    "lucide-react": "^0.468.0"
  }
}
```

## Frontend Application

The frontend should open directly into the credit analysis workspace, not a
marketing page.

Primary views:

- upload panel
- processing/status tracker
- credit dashboard
- financial metrics table
- risk breakdown
- interactive Three.js visuals
- chat/Q&A panel
- report download controls

### Frontend Flow

```text
User uploads files
  -> API returns session_id and job_id
  -> UI polls job status
  -> dashboard appears when analysis is ready
  -> user can ask questions
  -> user downloads DOCX/PDF report
```

### API Client Functions

The frontend API layer should include:

- `createSession()`
- `uploadDocuments(sessionId, files)`
- `getJobStatus(sessionId, jobId)`
- `getAnalysis(sessionId)`
- `askQuestion(sessionId, message)`
- `getStock(ticker)`
- `generateReport(sessionId, format)`
- `downloadReport(sessionId, reportId)`

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy ..\.env.example .env
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend should call the backend at:

```text
http://localhost:8000
```

## Azure Document Intelligence

Use Azure Document Intelligence with the prebuilt layout model.

Recommended configuration:

```text
Model: prebuilt-layout
Output: Markdown plus structured result metadata
Free tier: F0 where available
```

The extraction service should request Markdown output and also preserve useful
structured result fields for validation and traceability.

## Error Handling

The application should distinguish between:

- transient network/provider failures
- rate limits
- authentication/configuration failures
- invalid LLM output
- invalid extracted financial data
- missing report template
- unavailable stock data

Retries should be used for transient errors only. Invalid data should fail fast
with a clear validation error and enough context for debugging.

## Logging

Use structured logs for:

- session creation
- upload received
- extraction started/completed/failed
- provider selected
- provider fallback
- validation failures
- scoring completed
- report generated
- stock source selected
- cache fallback used

Do not log API keys, raw confidential documents, or full financial documents.

## Security Notes

The MVP can run without authentication locally, but production should add:

- authentication
- authorization by session or tenant
- upload size limits
- allowed file type validation
- malware scanning where appropriate
- encrypted storage for documents and reports
- secret management outside `.env`
- retention/deletion policy for uploaded documents

## Implementation Notes for AI Coding Agents

- Keep extraction logic separate from analysis logic.
- Treat LLM output as untrusted until Pydantic validates it.
- Do not build final reports from raw strings.
- Isolate all external providers behind service modules.
- Cache stock lookups aggressively.
- Log provider failures with structured metadata.
- Use retries only for transient failures.
- Keep the final credit score deterministic and auditable.
- Keep DOCX report generation template-based.
- Use Three.js only for frontend interactive visuals.
- Use matplotlib for report charts.
- Persist session and job state instead of relying only on in-memory dictionaries.
- Keep PageIndex optional, not central to scoring or report generation.

## Migration from the Earlier README

The earlier README should be updated in these ways:

1. Replace "Stack Overview" with the improved architecture overview.
2. Replace the Markdown-only decision with the Markdown + JSON hybrid decision.
3. Replace single-provider NVIDIA usage with the LLM fallback chain.
4. Remove PageIndex from the core analysis path.
5. Replace manual JSON parsing with Pydantic v2 validation.
6. Replace the simple scoring formula with a multi-factor scoring service.
7. Replace PDF-only reporting with DOCX template generation and PDF fallback.
8. Replace yfinance-only stock lookup with multi-source lookup and cache.
9. Replace in-memory-only sessions with persisted sessions and async jobs.
10. Add structured logging, retries, backoff, and provider circuit breaker behavior.

## Suggested Build Order

1. Create backend settings and Pydantic models.
2. Normalize the existing financial extraction output.
3. Add the LLM router while preserving NVIDIA as the first provider.
4. Update Azure DI extraction to return Markdown + JSON.
5. Replace manual JSON parsing with model validation.
6. Build the deterministic scoring service.
7. Add stock fallback and caching.
8. Add matplotlib chart generation.
9. Add DOCX template report generation.
10. Add PDF fallback/export.
11. Add persisted session/job state.
12. Move extraction, scoring, and reporting into background workers.
13. Update frontend upload/status/dashboard/report flows.

## Definition of Done

The project is ready when:

- documents can be uploaded
- extraction produces Markdown and structured data
- structured data validates through Pydantic
- analysis produces a score, rating, recommendation, strengths, risks, and
  conditions
- provider fallback works when the primary LLM fails
- stock lookup can fall back to a secondary source or cache
- reports can be generated as DOCX
- PDF fallback is available
- frontend shows processing status
- dashboard renders validated analysis
- report downloads work
- logs explain provider failures and validation failures
- sessions survive backend restart if persistence is enabled

## Bottom Line

This file represents the target README-level project specification. The improved
architecture should be implemented in phases, starting with the reliability
foundation: Pydantic validation, hybrid extraction, and LLM fallback routing.
After that, add richer scoring, stock fallback, report templates, async jobs, and
persistent state.

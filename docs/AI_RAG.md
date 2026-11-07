# Grounded RAG & Multi-Provider AI Architecture

## 1. Grounded RAG Pipeline

```
Admin Upload PDF ──► Text Extract ──► Vector Embedding ──► Ready for Review ──► Admin Publish
                                                                                    │
                                                                                    ▼
Student Question ──► Query Embedding ──► pgvector HNSW Search ──► Grounded Prompt ──► Answer + Citations
```

### Zero Hallucination Rule:
If similarity score is below threshold or no published documents match the query, the AI assistant explicitly responds:
*"I couldn't verify this information from the official campus knowledge base."*

## 2. Multi-Provider AI Strategy

- **Primary**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.5-flash` & `text-embedding-004`).
- **Fallback**: Groq API (`llama-3.3-70b-versatile`).
- **Dev Mode**: `DEV_MODE=true` ensures simulated grounded fallbacks when external API keys are omitted.

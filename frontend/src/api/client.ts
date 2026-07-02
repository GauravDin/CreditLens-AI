// src/api/client.ts
import axios from 'axios'

const client = axios.create({ baseURL: 'http://localhost:8000' })

// Response interceptor: extract detail from FastAPI errors
client.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.detail || err.message || 'Unknown error occurred'
    return Promise.reject(new Error(msg))
  }
)

export const api = {
  upload: (files: File[]) => {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    return client.post('/upload', form)
  },
  analyze: (sessionId: string, loanAmount?: number | null, loanCurrency?: string | null) =>
    client.post(`/analyze/${sessionId}`, {
      loan_amount: loanAmount ?? null,
      loan_currency: loanCurrency ?? null,
    }),
  downloadReport: (sessionId: string, fmt: 'docx' | 'pdf') =>
    client.get(`/report/${sessionId}`, {
      params: { fmt },
      responseType: 'blob',
    }),
  chat: (sessionId: string, message: string, history: any[] = []) =>
    client.post(`/chat/${sessionId}`, { message, history }),
  chatSuggestions: (sessionId: string) =>
    client.get(`/chat/${sessionId}/suggestions`),
  stock: (ticker: string) =>
    client.get(`/stock/${ticker}`),
  health: () =>
    client.get('/health'),
  sessionInfo: (sessionId: string) =>
    client.get(`/session/${sessionId}`),
  deleteSession: (sessionId: string) =>
    client.delete(`/session/${sessionId}`),
}

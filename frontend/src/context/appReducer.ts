import { AppState } from './AppContext'
import { UploadedFile, CreditAnalysisResult, ChatMessage, StockData } from '../types/api'

export type AppAction =
  | { type: 'SET_SESSION_ID'; payload: string | null }
  | { type: 'SET_UPLOADED_FILES'; payload: UploadedFile[] }
  | { type: 'SET_UPLOAD_STATUS'; payload: AppState['uploadStatus'] }
  | { type: 'SET_ANALYSIS_STATUS'; payload: AppState['analysisStatus'] }
  | { type: 'SET_ANALYSIS'; payload: CreditAnalysisResult | null }
  | { type: 'SET_LOAN_CONFIG'; payload: { amount: number | null; currency: string | null } }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CHAT_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_CHAT_LOADING'; payload: boolean }
  | { type: 'SET_STOCK_DATA'; payload: StockData | null }
  | { type: 'SET_STOCK_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: AppState['activeTab'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload }
    case 'SET_UPLOADED_FILES':
      return { ...state, uploadedFiles: action.payload }
    case 'SET_UPLOAD_STATUS':
      return { ...state, uploadStatus: action.payload }
    case 'SET_ANALYSIS_STATUS':
      return { ...state, analysisStatus: action.payload }
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.payload }
    case 'SET_LOAN_CONFIG':
      return {
        ...state,
        loanAmount: action.payload.amount,
        loanCurrency: action.payload.currency,
      }
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] }
    case 'SET_CHAT_MESSAGES':
      return { ...state, chatMessages: action.payload }
    case 'SET_CHAT_LOADING':
      return { ...state, chatLoading: action.payload }
    case 'SET_STOCK_DATA':
      return { ...state, stockData: action.payload }
    case 'SET_STOCK_LOADING':
      return { ...state, stockLoading: action.payload }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'RESET_STATE':
      localStorage.removeItem('credit_ai_session')
      return {
        sessionId: null,
        uploadedFiles: [],
        uploadStatus: 'idle',
        analysisStatus: 'idle',
        analysis: null,
        loanAmount: null,
        loanCurrency: null,
        chatMessages: [],
        chatLoading: false,
        stockData: null,
        stockLoading: false,
        activeTab: 'overview',
        error: null,
      }
    default:
      return state;
  }
}

// src/hooks/useChat.ts
import React from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../api/client'
import { ChatMessage } from '../types/api'

export function useChat() {
  const { state, dispatch } = useApp()

  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false)

  const fetchSuggestions = async (sessionId: string) => {
    setLoadingSuggestions(true)
    try {
      const res = await api.chatSuggestions(sessionId)
      setSuggestions(res.data)
    } catch (err) {
      console.error('Failed to fetch suggestions:', err)
      setSuggestions([
        "What are the main risk factors?",
        "How does the liquidity look?",
        "Are there any covenant concerns?",
        "What is the recommended maximum loan?"
      ])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const sendMessage = async (sessionId: string, text: string) => {
    if (!text.trim()) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    // Capture history before adding the new message
    const historyPayload = state.chatMessages.map(m => ({
      role: m.role,
      content: m.content
    }))

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMsg })
    dispatch({ type: 'SET_CHAT_LOADING', payload: true })

    try {
      const res = await api.chat(sessionId, text, historyPayload)
      const data = res.data

      const botMsg: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString(),
      }

      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: botMsg })
    } catch (err: any) {
      console.error(err)
      const errMsg = err.message || 'Chat error occurred'
      
      const errorBubble: ChatMessage = {
        role: 'assistant',
        content: `Error: ${errMsg}. Please try asking again.`,
        timestamp: new Date().toISOString(),
      }
      
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: errorBubble })
    } finally {
      dispatch({ type: 'SET_CHAT_LOADING', payload: false })
    }
  }

  const clearChat = () => {
    dispatch({ type: 'SET_CHAT_MESSAGES', payload: [] })
  }

  return {
    chatMessages: state.chatMessages,
    chatLoading: state.chatLoading,
    suggestions,
    loadingSuggestions,
    fetchSuggestions,
    sendMessage,
    clearChat,
  }
}

import { useEffect, useRef, useCallback, useState } from 'react'
import type { AgentStatus } from '@/types'

interface WSMessage {
  type: 'connected' | 'agent_update' | 'pong' | 'keepalive'
  agent?: string
  status?: 'idle' | 'running' | 'completed' | 'error'
  message?: string
  progress?: number
  session_id?: string
}

export function useWebSocket(sessionId: string | null) {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [agentUpdates, setAgentUpdates] = useState<AgentStatus[]>([])
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const connect = useCallback(() => {
    if (!sessionId || wsRef.current?.readyState === WebSocket.OPEN) return

    const wsUrl = `${(import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8000'}/ws/${sessionId}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setIsConnected(true)
      // Ping every 20s to keep alive
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, 20_000)
    }

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        if (msg.type === 'agent_update' && msg.agent && msg.status) {
          setAgentUpdates((prev) => {
            const idx = prev.findIndex((a) => a.name === msg.agent)
            const update: AgentStatus = {
              name: msg.agent!,
              status: msg.status!,
              message: msg.message,
              progress: msg.progress,
            }
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = update
              return next
            }
            return [...prev, update]
          })
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      if (pingRef.current) clearInterval(pingRef.current)
      wsRef.current = null
    }

    ws.onerror = () => {
      ws.close()
    }

    wsRef.current = ws
  }, [sessionId])

  const disconnect = useCallback(() => {
    if (pingRef.current) clearInterval(pingRef.current)
    wsRef.current?.close()
    wsRef.current = null
    setIsConnected(false)
  }, [])

  useEffect(() => {
    if (sessionId) connect()
    return disconnect
  }, [sessionId, connect, disconnect])

  return { isConnected, agentUpdates }
}

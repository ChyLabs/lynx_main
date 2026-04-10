import { useEffect, useRef, useState, useCallback } from 'react'

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface UseWebSocketOptions<T> {
    url: string | null
    enabled?: boolean
    onMessage?: (data: T) => void
    onError?: (error: Event) => void
    reconnectInterval?: number
    maxReconnectAttempts?: number
}

interface UseWebSocketReturn {
    status: WebSocketStatus
    connect: (url: string) => void
    disconnect: () => void
    reconnect: () => void
}

export function useWebSocket<T = any>({
    url,
    enabled = true,
    onMessage,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
}: UseWebSocketOptions<T>): UseWebSocketReturn {
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectAttemptsRef = useRef(0)
    const currentUrlRef = useRef<string | null>(null)
    const onMessageRef = useRef(onMessage)
    const onErrorRef = useRef(onError)
    const reconnectIntervalRef = useRef(reconnectInterval)
    const maxReconnectAttemptsRef = useRef(maxReconnectAttempts)
    const enabledRef = useRef(enabled)
    const [status, setStatus] = useState<WebSocketStatus>('disconnected')

    useEffect(() => {
        onMessageRef.current = onMessage
        onErrorRef.current = onError
        reconnectIntervalRef.current = reconnectInterval
        maxReconnectAttemptsRef.current = maxReconnectAttempts
        enabledRef.current = enabled
    }, [onMessage, onError, reconnectInterval, maxReconnectAttempts, enabled])

    const disconnect = useCallback(() => {
        reconnectAttemptsRef.current = 0

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }

        if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current)
            connectTimeoutRef.current = null
        }

        if (wsRef.current) {
            const ws = wsRef.current
            console.log(`Disconnecting WebSocket: ${ws.url}`)

            ws.onopen = null
            ws.onmessage = null
            ws.onerror = null
            ws.onclose = null

            ws.close()
            wsRef.current = null
        }

        setStatus('disconnected')
    }, [])

    const connect = useCallback((targetUrl: string) => {
        if (wsRef.current && wsRef.current.url === targetUrl) {
            console.log(`Already connected/connecting to ${targetUrl}, skipping`)
            return
        }

        if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current)
            connectTimeoutRef.current = null
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }

        if (wsRef.current) {
            const oldWs = wsRef.current

            oldWs.onopen = null
            oldWs.onmessage = null
            oldWs.onerror = null
            oldWs.onclose = null

            oldWs.close()
            wsRef.current = null
        }

        setStatus('connecting')
        currentUrlRef.current = targetUrl
        reconnectAttemptsRef.current = 0

        try {
            const ws = new WebSocket(targetUrl)
            wsRef.current = ws

            ws.onopen = () => {
                setStatus('connected')
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as T
                    onMessageRef.current?.(data)
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err)
                }
            }

            ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                setStatus('error')
                onErrorRef.current?.(error)
            }

            ws.onclose = () => {
                if (currentUrlRef.current === targetUrl && enabledRef.current) {
                    setStatus('disconnected')

                    if (reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
                        const attempt = reconnectAttemptsRef.current
                        const delay = reconnectIntervalRef.current * Math.pow(2, attempt)
                        const maxDelay = 30000
                        const actualDelay = Math.min(delay, maxDelay)

                        reconnectTimeoutRef.current = setTimeout(() => {
                            reconnectAttemptsRef.current++
                            connect(targetUrl)
                        }, actualDelay)
                    } else {
                        setStatus('disconnected')
                    }
                }
            }
        } catch (error) {
            console.error('Failed to create WebSocket:', error)
            setStatus('error')
        }
    }, [])

    const reconnect = useCallback(() => {
        const url = currentUrlRef.current
        disconnect()
        if (url) {
            setTimeout(() => connect(url), 100)
        }
    }, [disconnect, connect])

    useEffect(() => {
        if (url && enabled) {
            const hasValidConnection = wsRef.current &&
                (wsRef.current.readyState === WebSocket.OPEN ||
                    wsRef.current.readyState === WebSocket.CONNECTING) &&
                currentUrlRef.current === url

            if (!hasValidConnection) {
                connect(url)
            }
        } else {
            currentUrlRef.current = null
            if (wsRef.current) {
                const ws = wsRef.current
                ws.onopen = null
                ws.onmessage = null
                ws.onerror = null
                ws.onclose = null
                ws.close()
                wsRef.current = null
            }
            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current)
                connectTimeoutRef.current = null
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
                reconnectTimeoutRef.current = null
            }
            setStatus('disconnected')
        }

        return () => {
            if (wsRef.current) {
                const ws = wsRef.current
                ws.onopen = null
                ws.onmessage = null
                ws.onerror = null
                ws.onclose = null
                try {
                    ws.close()
                } catch (e) {
                }
                wsRef.current = null
            }
            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current)
                connectTimeoutRef.current = null
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
                reconnectTimeoutRef.current = null
            }
        }
    }, [url, enabled, connect])

    return {
        status,
        connect,
        disconnect,
        reconnect,
    }
}

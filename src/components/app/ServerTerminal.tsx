import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plug, Loader2 } from "lucide-react"

import "@xterm/xterm/css/xterm.css"

type ServerTerminalProps = {
    hostLabel: string
    server_uuid?: string
    className?: string
    nodeDomain?: string
    onConnectionStateChange?: (state: ConnectionState) => void
}

type ConnectionState = "disconnected" | "connecting" | "connected"

export type ServerTerminalRef = {
    disconnect: () => void
    connectionState: ConnectionState
}

// Checked
export const ServerTerminal = forwardRef<ServerTerminalRef, ServerTerminalProps>(({ hostLabel, server_uuid, className, nodeDomain, onConnectionStateChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const termRef = useRef<Terminal | null>(null)
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectedForServer = useRef<string | null>(null)
    const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected")
    const [sessionId, setSessionId] = useState<string | null>(null)

    const getSessionStorageKey = () => server_uuid ? `terminal-session-${server_uuid}` : null

    const connectToServer = (existingSessionId?: string) => {
        if (!server_uuid || !termRef.current || !nodeDomain) return

        if (connectionState === "connected" || connectionState === "connecting") return

        setConnectionState("connecting")
        const term = termRef.current

        let wsUrl = `${nodeDomain}/ssh/${server_uuid}/ws`
        if (existingSessionId) {
            wsUrl += `?session_id=${existingSessionId}`
            term.writeln("\x1b[33m⟳\x1b[0m Reconnecting to previous session...")
        }

        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
            }
            pingIntervalRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }))
                }
            }, 30000)
        }

        ws.onmessage = (event) => {
            if (event.data instanceof Blob) {
                event.data.arrayBuffer().then((buffer) => {
                    const uint8Array = new Uint8Array(buffer)
                    term.write(uint8Array)
                })
            } else if (typeof event.data === 'string') {
                try {
                    const message = JSON.parse(event.data)

                    if (message.type === 'connected' || message.type === 'reconnect') {
                        const newSessionId = message.session_id
                        setSessionId(newSessionId)
                        setConnectionState("connected")

                        const storageKey = getSessionStorageKey()
                        if (storageKey) {
                            sessionStorage.setItem(storageKey, newSessionId)
                        }

                        if (message.type === 'connected') {
                            term.writeln("\x1b[32m✓\x1b[0m Connected to server")
                        } else {
                            term.writeln("\x1b[32m✓\x1b[0m Reconnected to session")
                        }

                        setTimeout(() => {
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({
                                    type: 'resize',
                                    rows: term.rows,
                                    cols: term.cols
                                }))
                            }
                            term.focus()
                        }, 100)
                    } else if (message.type === 'error') {
                        term.writeln(`\r\n\x1b[31m✗\x1b[0m ${message.error}`)
                        setConnectionState("disconnected")
                    }
                } catch (e) {
                    term.write(event.data)
                }
            }
        }

        ws.onerror = (error) => {
            term.writeln("\r\n\x1b[31m✗\x1b[0m Connection error")
            setConnectionState("disconnected")
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
            }
        }

        ws.onclose = () => {
            term.writeln("\r\n\x1b[33m⚠\x1b[0m Connection closed. Click 'Connect' to reconnect.")
            setConnectionState("disconnected")
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
            }
        }
    }

    const disconnectFromServer = () => {
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current)
        }
        setConnectionState("disconnected")

        if (termRef.current) {
            termRef.current.clear()
            termRef.current.writeln("\x1b[90mPress 'Connect' to start a new terminal session\x1b[0m")
        }

        const storageKey = getSessionStorageKey()
        if (storageKey) {
            sessionStorage.removeItem(storageKey)
        }
        setSessionId(null)
    }

    useImperativeHandle(ref, () => ({
        disconnect: disconnectFromServer,
        connectionState
    }))

    useEffect(() => {
        onConnectionStateChange?.(connectionState)
    }, [connectionState, onConnectionStateChange])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 13,
            lineHeight: 1.35,
            fontFamily:
                'ui-monospace, SFMono-Regular, "Cascadia Code", Menlo, Monaco, Consolas, monospace',
            theme: {
                background: "#09090b",
                foreground: "#e4e4e7",
                cursor: "#a1a1aa",
                cursorAccent: "#09090b",
                selectionBackground: "#3f3f46",
            },
            scrollback: 8000,
        })

        termRef.current = term

        const fit = new FitAddon()
        term.loadAddon(fit)
        term.open(el)
        fit.fit()

        const sendTerminalSize = () => {
            const ws = wsRef.current
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'resize',
                    rows: term.rows,
                    cols: term.cols
                }))
            }
        }

        if (!server_uuid) {
            const prompt = `root@${hostLabel}:~# `
            term.writeln(
                "\x1b[90mLocal session — keys echo here. Connect a backend for a live shell.\x1b[0m"
            )
            term.write(prompt)

            term.onData((data) => {
                for (const ch of data) {
                    const code = ch.codePointAt(0) ?? 0
                    if (code === 13) {
                        term.write("\r\n" + prompt)
                        continue
                    }
                    if (code === 127 || code === 8) {
                        term.write("\b \b")
                        continue
                    }
                    if (code < 32 && code !== 9) continue
                    term.write(ch)
                }
            })
        } else {
            term.onData((data) => {
                const ws = wsRef.current
                if (ws && ws.readyState === WebSocket.OPEN) {
                    const encoder = new TextEncoder()
                    ws.send(encoder.encode(data))
                }
            })
            const storageKey = getSessionStorageKey()
            const existingSessionId = storageKey ? sessionStorage.getItem(storageKey) : null

            if (!nodeDomain) {
                term.writeln("\x1b[90mWaiting for server connection details...\x1b[0m")
            } else if (existingSessionId) {
                term.writeln("\x1b[90mPress 'Connect' to reconnect to your previous session\x1b[0m")
            } else {
                term.writeln("\x1b[90mPress 'Connect' to start a terminal session\x1b[0m")
            }
        }

        const ro = new ResizeObserver(() => {
            fit.fit()
            if (server_uuid) {
                setTimeout(sendTerminalSize, 50)
            }
        })
        ro.observe(el)

        return () => {
            ro.disconnect()
            term.dispose()
            termRef.current = null
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
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
                pingIntervalRef.current = null
            }
        }
    }, [hostLabel, server_uuid])

    useEffect(() => {
        if (!server_uuid || !nodeDomain || !termRef.current) return

        if (reconnectedForServer.current === server_uuid) return

        if (connectionState !== "disconnected") return

        const storageKey = getSessionStorageKey()
        const existingSessionId = storageKey ? sessionStorage.getItem(storageKey) : null

        if (existingSessionId) {
            reconnectedForServer.current = server_uuid
            const term = termRef.current
            term.clear()
            term.writeln("\x1b[90mReconnecting to your previous session...\x1b[0m")
            setTimeout(() => connectToServer(existingSessionId), 100)
        }
    }, [nodeDomain, server_uuid])

    return (
        <div className="relative">
            {server_uuid && connectionState === "disconnected" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm">
                    <Button
                        onClick={() => {
                            const storageKey = getSessionStorageKey()
                            const existingSessionId = storageKey ? sessionStorage.getItem(storageKey) : null
                            connectToServer(existingSessionId || undefined)
                        }}
                        variant="secondary"
                        size="lg"
                        className="gap-2 rounded-xl"
                    >
                        <Plug className="size-4" />
                        Connect to Terminal
                    </Button>
                </div>
            )}
            {server_uuid && connectionState === "connecting" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin" />
                        <span className="text-sm font-medium">Connecting...</span>
                    </div>
                </div>
            )}
            <div
                ref={containerRef}
                tabIndex={0}
                onClick={() => termRef.current?.focus()}
                className={cn(
                    "bg-zinc-950 min-h-[min(50vh,26rem)] w-full overflow-hidden py-2 pr-1 pl-2 outline-none",
                    className
                )}
            />
        </div>
    )
})

ServerTerminal.displayName = "ServerTerminal"

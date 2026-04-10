import { useCallback, useRef, useState } from 'react'
import { useWebSocket } from './useWebSocket'

interface ServerResourceData {
    cpu_percent?: number
    memory_usage?: number
    disk_usage?: number
    interface_stats?: Record<string, Record<string, number>>
}

interface ServerResourceMetrics {
    cpuPercent: number
    memoryMB: number
    diskMB: number
    timestamp: number
}

export function useServerResources(serverId: string | undefined, nodeDomain: string | undefined) {
    const [metrics, setMetrics] = useState<ServerResourceMetrics>({
        cpuPercent: 0,
        memoryMB: 0,
        diskMB: 0,
        timestamp: Date.now(),
    })

    const [history, setHistory] = useState<{
        cpu: Array<{ t: number; v: number }>
        memory: Array<{ t: number; v: number }>
        disk: Array<{ t: number; v: number }>
    }>({
        cpu: [],
        memory: [],
        disk: [],
    })

    const handleMessage = useCallback((data: ServerResourceData) => {
        const memoryMB = data.memory_usage ? Math.round(data.memory_usage / (1024 * 1024)) : 0
        const diskMB = data.disk_usage ? Number((data.disk_usage / (1024 * 1024)).toFixed(1)) : 0
        const cpuPercent = data.cpu_percent ? Number(data.cpu_percent.toFixed(2)) : 0

        setMetrics({
            cpuPercent,
            memoryMB,
            diskMB,
            timestamp: Date.now(),
        })

        setHistory(prev => {
            const updateHistory = (prevHistory: Array<{ t: number; v: number }>, newValue: number) => {
                const newPoint = { t: prevHistory.length, v: newValue }
                const updated = [...prevHistory, newPoint].slice(-30)
                return updated.map((p, i) => ({ ...p, t: i }))
            }

            return {
                cpu: updateHistory(prev.cpu, cpuPercent),
                memory: updateHistory(prev.memory, memoryMB),
                disk: updateHistory(prev.disk, diskMB),
            }
        })
    }, [])

    const url = serverId && nodeDomain ? `${nodeDomain}/resources/${serverId}/ws` : null

    const { status, reconnect } = useWebSocket<ServerResourceData>({
        url,
        enabled: !!serverId && !!nodeDomain,
        onMessage: handleMessage,
    })

    return {
        metrics,
        history,
        status,
        reconnect,
    }
}

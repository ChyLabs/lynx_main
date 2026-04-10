import { useCallback, useState } from 'react'
import { useWebSocket } from './useWebSocket'

interface NodeResourceData {
    cpu_percent?: string
    memory_percent?: string
    memory_total?: number
    memory_used?: number
    disk_percent?: string
    disk_total?: number
    disk_used?: number
    timestamp?: number
}

interface NodeResourceMetrics {
    cpuPercent: number
    memoryPercent: number
    memoryUsedMB: number
    memoryTotalMB: number
    diskPercent: number
    diskUsedGB: number
    diskTotalGB: number
    timestamp: number
}

export function useNodeResources(nodeId: string | undefined, nodeDomain: string | undefined) {
    const [metrics, setMetrics] = useState<NodeResourceMetrics>({
        cpuPercent: 0,
        memoryPercent: 0,
        memoryUsedMB: 0,
        memoryTotalMB: 0,
        diskPercent: 0,
        diskUsedGB: 0,
        diskTotalGB: 0,
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

    const handleMessage = useCallback((data: NodeResourceData) => {
        const memoryUsedMB = data.memory_used ? Math.round(data.memory_used / (1024 * 1024)) : 0
        const memoryTotalMB = data.memory_total ? Math.round(data.memory_total / (1024 * 1024)) : 0
        const diskUsedGB = data.disk_used ? Number((data.disk_used / (1024 * 1024 * 1024)).toFixed(2)) : 0
        const diskTotalGB = data.disk_total ? Number((data.disk_total / (1024 * 1024 * 1024)).toFixed(2)) : 0
        const cpuPercent = data.cpu_percent ? Number(parseFloat(data.cpu_percent).toFixed(2)) : 0
        const memoryPercent = data.memory_percent ? parseFloat(data.memory_percent) : 0
        const diskPercent = data.disk_percent ? parseFloat(data.disk_percent) : 0

        setMetrics({
            cpuPercent,
            memoryPercent,
            memoryUsedMB,
            memoryTotalMB,
            diskPercent,
            diskUsedGB,
            diskTotalGB,
            timestamp: data.timestamp || Date.now(),
        })

        setHistory(prev => {
            const updateHistory = (prevHistory: Array<{ t: number; v: number }>, newValue: number) => {
                const newPoint = { t: prevHistory.length, v: newValue }
                const updated = [...prevHistory, newPoint].slice(-30)
                return updated.map((p, i) => ({ ...p, t: i }))
            }

            return {
                cpu: updateHistory(prev.cpu, cpuPercent),
                memory: updateHistory(prev.memory, memoryUsedMB),
                disk: updateHistory(prev.disk, diskUsedGB),
            }
        })
    }, [])

    const url = nodeId && nodeDomain ? `${nodeDomain}/node/resources/ws` : null

    const { status, reconnect } = useWebSocket<NodeResourceData>({
        url,
        enabled: !!nodeId && !!nodeDomain,
        onMessage: handleMessage,
    })

    return {
        metrics,
        history,
        status,
        reconnect,
    }
}

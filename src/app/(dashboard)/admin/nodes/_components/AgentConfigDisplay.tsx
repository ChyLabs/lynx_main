import { Check, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

interface AgentConfigDisplayProps {
    config: string
    nodeName: string
}

export const AgentConfigDisplay = ({ config, nodeName }: AgentConfigDisplayProps) => {
    const { copied: configCopied, copyToClipboard: copyConfig } = useCopyToClipboard()

    const downloadConfig = () => {
        const blob = new Blob([config], { type: "text/yaml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${nodeName.toLowerCase().replace(/\s+/g, "-")}-config.yml`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <Card className="border-blue-500/30 bg-blue-500/5 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Agent Configuration
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void copyConfig(config)}
                        className="h-8 cursor-pointer"
                    >
                        {configCopied ? (
                            <>
                                <Check className="size-3 text-green-600" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="size-3" />
                                Copy
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={downloadConfig}
                        className="h-8 cursor-pointer"
                    >
                        <Download className="size-3" />
                        Download
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="border rounded-md">
                    <pre className="bg-muted text-foreground overflow-x-auto p-4 font-mono text-xs whitespace-pre">
                        {config}
                    </pre>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                        📋 Installation Instructions
                    </p>
                    <ol className="text-muted-foreground text-xs space-y-1 list-decimal list-inside">
                        <li>
                            Save this config to{" "}
                            <code className="bg-muted rounded px-1 py-0.5 font-mono">
                                /var/lynx/config.yml
                            </code>
                        </li>
                        <li>
                            Install binary:{" "}
                            <code className="bg-muted rounded px-1 py-0.5 font-mono">
                                sudo cp lynx_agent /usr/local/bin/
                            </code>
                        </li>
                        <li>
                            Start service:{" "}
                            <code className="bg-muted rounded px-1 py-0.5 font-mono">
                                sudo systemctl start lynx-agent
                            </code>
                        </li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    )
}

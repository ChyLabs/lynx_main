import { Check, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import type { CreateNodeApiTokenResponseData } from "@/validators/node.validator"

interface ApiKeyResultProps {
    result: CreateNodeApiTokenResponseData
}

export const ApiKeyResult = ({ result }: ApiKeyResultProps) => {
    const { copied: keyCopied, copyToClipboard: copyKey } = useCopyToClipboard()
    const { copied: configCopied, copyToClipboard: copyConfig } = useCopyToClipboard()

    const downloadConfig = () => {
        const blob = new Blob([result.agent_config], { type: "text/yaml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${result.node_name.toLowerCase().replace(/\s+/g, "-")}-config.yml`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <>
            {/* API Key Details Card */}
            <Card className="border-green-500/30 bg-green-500/5 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                        API key registered
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Node</p>
                        <p className="text-foreground text-sm font-medium">
                            {result.node_name}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Machine ID</p>
                        <p className="text-foreground font-mono text-sm">
                            {result.machine_id}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-muted-foreground text-xs">
                            Encrypted API key
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="bg-muted text-foreground flex-1 overflow-x-auto rounded-md px-3 py-2 font-mono text-xs break-all">
                                {result.encrypted_api_key}
                            </code>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0 cursor-pointer"
                                onClick={() => void copyKey(result.encrypted_api_key)}
                                aria-label="Copy API key"
                            >
                                {keyCopied ? (
                                    <Check
                                        className="size-4 text-green-600"
                                        aria-hidden
                                    />
                                ) : (
                                    <Copy className="size-4" aria-hidden />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Agent Config Card */}
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
                            onClick={() => void copyConfig(result.agent_config)}
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
                            {result.agent_config}
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
        </>
    )
}

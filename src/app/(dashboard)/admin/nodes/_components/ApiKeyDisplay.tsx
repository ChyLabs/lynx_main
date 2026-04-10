import { useState } from "react"
import { Check, Copy, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

interface ApiKeyDisplayProps {
    apiKey: string
    label?: string
}

export const ApiKeyDisplay = ({ apiKey, label = "API key" }: ApiKeyDisplayProps) => {
    const [visible, setVisible] = useState(false)
    const { copied, copyToClipboard } = useCopyToClipboard()

    return (
        <div className="space-y-2">
            <p className="text-muted-foreground text-xs">
                A key is registered.
            </p>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Input
                        readOnly
                        value={apiKey}
                        type={visible ? "text" : "password"}
                        className="font-mono pr-10 text-sm"
                        aria-label={label}
                    />
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
                    >
                        {visible ? (
                            <EyeOff className="size-4" aria-hidden />
                        ) : (
                            <Eye className="size-4" aria-hidden />
                        )}
                    </button>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 cursor-pointer"
                    onClick={() => void copyToClipboard(apiKey)}
                    aria-label={`Copy ${label}`}
                >
                    {copied ? (
                        <Check className="size-4 text-green-600" aria-hidden />
                    ) : (
                        <Copy className="size-4" aria-hidden />
                    )}
                </Button>
            </div>
        </div>
    )
}

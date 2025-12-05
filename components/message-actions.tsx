'use client'

import { useMemo } from 'react'

import { UseChatHelpers } from '@ai-sdk/react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import type { SearchResultItem } from '@/lib/types'
import type { UIDataTypes, UIMessage, UITools } from '@/lib/types/ai'
import { cn } from '@/lib/utils'
import { processCitations } from '@/lib/utils/citation'

import { Button } from './ui/button'
import { ChatShare } from './chat-share'
import { RetryButton } from './retry-button'

interface MessageActionsProps {
  message: string
  messageId: string
  traceId?: string
  reload?: () => Promise<void | string | null | undefined>
  chatId?: string
  enableShare?: boolean
  className?: string
  status?: UseChatHelpers<UIMessage<unknown, UIDataTypes, UITools>>['status']
  visible?: boolean
  citationMaps?: Record<string, Record<number, SearchResultItem>>
}

export function MessageActions({
  message,
  messageId,
  traceId,
  reload,
  chatId,
  enableShare,
  className,
  status,
  visible = true,
  citationMaps
}: MessageActionsProps) {
  const mappedMessage = useMemo(() => {
    if (!message) return ''
    return processCitations(message, citationMaps || {})
  }, [message, citationMaps])

  const isLoading = status === 'submitted' || status === 'streaming'

  // Keep the element mounted during loading to preserve layout; otherwise skip rendering.
  if (!visible && !isLoading) {
    return null
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(mappedMessage)
    toast.success('Message copied to clipboard')
  }

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'flex items-center gap-0.5 self-end transition-opacity duration-200',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0 invisible',
        className
      )}
    >
      {reload && <RetryButton reload={reload} messageId={messageId} />}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="rounded-full"
      >
        <Copy size={14} />
      </Button>
      {enableShare && chatId && <ChatShare chatId={chatId} />}
    </div>
  )
}

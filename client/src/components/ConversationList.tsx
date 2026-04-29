"use client"

import type React from "react"

import { useAllConversations } from "@/hooks/use-all-conversations"
import { useWallet } from "@solana/wallet-adapter-react"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Loader2, Inbox, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface ConversationListProps {
  onSelectConversation: (address: string) => void
  selectedAddress?: string
}

export function ConversationList({ onSelectConversation, selectedAddress }: ConversationListProps) {
  const { connected } = useWallet()
  const { data: conversations, isLoading } = useAllConversations()
  const [deletedConversations, setDeletedConversations] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem("deletedConversations")
    if (stored) {
      try {
        setDeletedConversations(new Set(JSON.parse(stored)))
      } catch (e) {
        console.error("Failed to parse deleted conversations:", e)
      }
    }
  }, [])

  const handleDeleteConversation = (address: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = new Set(deletedConversations)
    updated.add(address)
    setDeletedConversations(updated)
    localStorage.setItem("deletedConversations", JSON.stringify(Array.from(updated)))
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Inbox className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">Connect wallet to view conversations</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <p className="text-xs text-muted-foreground">Loading conversations...</p>
      </div>
    )
  }

  const visibleConversations =
    conversations?.filter((conv) => !deletedConversations.has(conv.otherParticipant.toBase58())) || []

  if (!conversations || conversations.length === 0 || visibleConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        {!conversations || conversations.length === 0 ? (
          <>
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium mb-1">No conversations yet</p>
            <p className="text-xs text-muted-foreground">Enter a wallet address to start chatting</p>
          </>
        ) : (
          <>
            <Trash2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium mb-1">All conversations deleted</p>
            <p className="text-xs text-muted-foreground">Start a new chat to begin messaging</p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-white/10 bg-black/20">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Messages ({visibleConversations.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {visibleConversations.map((conv, index) => {
          const isSelected = conv.otherParticipant.toBase58() === selectedAddress
          const shortAddress = `${conv.otherParticipant.toBase58().slice(0, 4)}...${conv.otherParticipant.toBase58().slice(-4)}`

          return (
            <motion.div
              key={conv.publicKey.toBase58()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <button
                onClick={() => onSelectConversation(conv.otherParticipant.toBase58())}
                className={cn(
                  "w-full p-2 lg:p-4 flex items-start gap-2 border-b border-white/5 hover:bg-white/5 transition-all text-left relative",
                  isSelected && "bg-primary/20 border-l-2 border-l-primary",
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-900 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {shortAddress.slice(0, 2)}
                  </div>
                  {conv.unreadCount > 0 && !isSelected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-50 rounded-full flex items-center justify-center text-red-700 text-xs font-bold shadow-lg animate-pulse">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-mono text-sm font-semibold truncate text-foreground">{shortAddress}</p>
                    {conv.lastMessageTime && (
                      <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                        {formatDistanceToNow(conv.lastMessageTime, { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessageContent || "No messages yet"}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      {conv.messageCount} msg{conv.messageCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={(e) => handleDeleteConversation(conv.otherParticipant.toBase58(), e)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                title="Delete conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

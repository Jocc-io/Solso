"use client"

import { useState, useRef, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Send, Loader2, Key, Info, Shield, Clock, RotateCcw } from "lucide-react"
import { useConversation, useMessages, useInitializeConversation, useSendMessage } from "@/hooks/use-solana-chat"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { PublicKey } from "@solana/web3.js"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  initialRecipientAddress?: string
  onRecipientChange?: (address: string) => void
}

export function ChatInterface({ initialRecipientAddress = "", onRecipientChange }: ChatInterfaceProps) {
  const { connected, publicKey } = useWallet()
  const [recipientAddress, setRecipientAddress] = useState(initialRecipientAddress)
  const [messageInput, setMessageInput] = useState("")
  const [chatOpened, setChatOpened] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialRecipientAddress !== recipientAddress) {
      setRecipientAddress(initialRecipientAddress)
      if (initialRecipientAddress) {
        setChatOpened(true)
      }
    }
  }, [initialRecipientAddress])

  // Validate address format
  const isValidAddress = useMemo(() => {
    try {
      new PublicKey(recipientAddress)
      return true
    } catch {
      return false
    }
  }, [recipientAddress])

  // Data fetching
  const { data: conversation, isLoading: isLoadingConv } = useConversation(
    isValidAddress && connected ? recipientAddress : undefined,
  )

  const { data: messages, isLoading: isLoadingMessages } = useMessages(conversation?.publicKey)

  // Mutations
  const initMutation = useInitializeConversation()
  const sendMutation = useSendMessage()

  const isPending = initMutation.isPending || sendMutation.isPending

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async () => {
    if (!messageInput.trim() || !isValidAddress) return

    try {
      if (!conversation) {
        // Initialize first
        await initMutation.mutateAsync(recipientAddress)
        // Then send (optimistically knowing init will succeed and invalidate)
        // In a real app we might wait for the query to refresh, but here we can chain if we had the PDA locally
        // For simplicity, we'll let the user click send again or handle it in one flow if we refactored
        // Let's just initialize for now if no convo exists
      } else {
        await sendMutation.mutateAsync({
          conversation,
          content: messageInput,
          currentCount: conversation.messageCount,
        })
        setMessageInput("")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleInit = async () => {
    if (!isValidAddress) return
    try {
      await initMutation.mutateAsync(recipientAddress)
    } catch (err) {
      console.error(err)
    }
  }

  const handleNewChat = () => {
    setRecipientAddress("")
    setMessageInput("")
    setChatOpened(false)
    onRecipientChange?.("")
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center p-8 border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
        <Shield className="w-16 h-16 text-muted-foreground mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground max-w-md">
          Connect your Solana wallet to start sending secure, on-chain messages. Conversations are stored permanently on
          the blockchain.
        </p>
      </div>
    )
  }

  return (
<div className="flex flex-col h-[450px] sm:h-[400px] lg:h-[700px] bg-card/50 border border-white/10 rounded-3xl 
overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            <Key className="w-4 h-4" />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            Recipient Address
          </label>
          <input
            type="text"
            placeholder="Enter Solana wallet address..."
            value={recipientAddress}
            onChange={(e) => {
              setRecipientAddress(e.target.value)
              onRecipientChange?.(e.target.value)
            }}
            className="w-full bg-transparent border-none text-sm font-mono focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        {isValidAddress && !conversation && !isLoadingConv && (
          <button
            onClick={handleInit}
            disabled={isPending}
            className="px-4 py-2 text-xs mt-2 font-bold uppercase tracking-wider bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Initializing..." : "Start Chat"}
          </button>
        )}
        {recipientAddress && (
          <button
            onClick={handleNewChat}
            title="Start a new chat with a different address"
            className="p-2 text-xs mt-2 font-bold uppercase tracking-wider bg-white/10 text-foreground rounded-lg hover:bg-white/20 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline ">New</span>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
        {!isValidAddress ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <Info className="w-12 h-12 mb-4" />
            <p>Enter a valid wallet address to start chatting</p>
          </div>
        ) : isLoadingConv || (conversation && isLoadingMessages) ? (
          <div className="flex flex-col items-center justify-center h-full text-primary animate-pulse">
            <Loader2 className="w-8 h-8 mb-2 animate-spin" />
            <span className="text-xs uppercase tracking-widest">Loading chain data...</span>
          </div>
        ) : !conversation ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium">No conversation found</p>
            <p className="text-sm opacity-60 max-w-xs text-center mt-2">
              Click "Start Chat" above to initialize a new conversation on-chain.
            </p>
          </div>
        ) : messages && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages?.map((msg) => {
              const isMe = msg.sender.toBase58() === publicKey?.toBase58()
              return (
                <motion.div
                  key={msg.index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-4 rounded-2xl text-sm relative group transition-all hover:shadow-lg",
                      isMe
                        ? "bg-white/20 text-white rounded-tr-sm shadow-primary/10"
                        : "bg-white/10 text-foreground rounded-tl-sm hover:bg-white/15",
                    )}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    <div
                      className={cn(
                        "flex items-center gap-2 mt-2 text-[10px] opacity-60 font-mono",
                        isMe ? "text-primary-foreground" : "text-muted-foreground",
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {format(new Date(msg.timestamp), "MMM d, h:mm a")}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/30 border-t border-white/10 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={!conversation ? "Initialize conversation first..." : "Type a secure message...Max 500 chars"}
            disabled={!conversation || isPending}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!messageInput.trim() || !conversation || isPending}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
              !messageInput.trim() || !conversation || isPending
                ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                : "bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0",
            )}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-muted-foreground/40 font-mono flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> Encrypted & Stored on Solana Devnet
          </span>
        </div>
      </div>
    </div>
  )
}

// Helper for memo
import { useMemo } from "react"
import { MessageSquare } from "lucide-react"

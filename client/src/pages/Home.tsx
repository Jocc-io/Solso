import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ChatInterface } from "@/components/ChatInterface";
import { ConversationList } from "@/components/ConversationList";
import { WalletContextProvider } from "@/components/WalletProvider";
import { motion } from "framer-motion";
import { Sparkles, Lock, Zap } from "lucide-react";

export default function Home() {
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  return (
    <WalletContextProvider>
      <Layout>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-8xl mx-auto">

          {/* Left Column: Info Section - Hidden on mobile when chat is active */}
            <div className={`lg:col-span-3 space-y-6 hidden lg:block`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Live on Devnet
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 leading-tight">
                Decentralized <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent neon-text">
                  Conversations
                </span>
              </h1>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Send permanent, uncensorable messages stored directly on the Solana blockchain.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-3 "
            >
              <FeatureCard
                icon={<Lock className="w-4 h-4 text-accent" />}
                title="Censorship Resistant"
                description="Messages stored as accounts on Solana."
              />
              <FeatureCard
                icon={<Zap className="w-4 h-4 text-purple-400" />}
                title="Lightning Fast"
                description="400ms block times for instant delivery."
              />
              <FeatureCard
                icon={<Sparkles className="w-4 h-4 text-yellow-400" />}
                title="Web3 Native"
                description="Login with your wallet. No email required."
              />
            </motion.div>
            
          </div>

            <div className="lg:col-span-3 space-y-6 block lg:hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 mt-8 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Live on Devnet
              </div>

              <h1 className="text-2xl md:text-2xl font-bold tracking-tight mb-3  leading-tight">
                Decentralized 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent neon-text ml-2">
                  Conversations
                </span>
              </h1>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Send permanent, uncensorable messages stored directly on the Solana.
              </p>
            </motion.div>
            
          </div>

          {/* Middle Column: Conversation List */}
         
            <div className={`lg:col-span-3 space-y-6 hidden lg:block`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="h-[700px] bg-card/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md"
            >
              <ConversationList
                onSelectConversation={setSelectedAddress}
                selectedAddress={selectedAddress}
              />
            </motion.div>
          </div>

          {/* Right Column: Chat Interface */}
          
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <ChatInterface
                initialRecipientAddress={selectedAddress}
                onRecipientChange={setSelectedAddress}
              />
            </motion.div>
          </div>
          <div className="lg:col-span-3 space-y-6 block lg:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="h-[400px] bg-card/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md"
            >
              <ConversationList
                onSelectConversation={setSelectedAddress}
                selectedAddress={selectedAddress}
              />
            </motion.div>
          </div>
          <div className="lg:col-span-3 space-y-6 block lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-3 "
            >
              <FeatureCard
                icon={<Lock className="w-4 h-4 text-accent" />}
                title="Censorship Resistant"
                description="Messages stored as accounts on Solana."
              />
              <FeatureCard
                icon={<Zap className="w-4 h-4 text-purple-400" />}
                title="Lightning Fast"
                description="400ms block times for instant delivery."
              />
              <FeatureCard
                icon={<Sparkles className="w-4 h-4 text-yellow-400" />}
                title="Web3 Native"
                description="Login with your wallet. No email required."
              />
            </motion.div>
            
          </div>

        </div>
      </Layout>
    </WalletContextProvider>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
      <div className="mt-1 p-2 rounded-lg bg-black/30">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

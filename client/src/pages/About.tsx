import { Layout } from "@/components/Layout";
import { WalletContextProvider } from "@/components/WalletProvider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Code, Database, Globe } from "lucide-react";

export default function About() {
  return (
    <WalletContextProvider>
      <Layout>
        <div className="max-w-3xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-white">How SolSo Works</h1>
              <p className="text-xl text-muted-foreground">
                A technical deep dive into on-chain messaging architecture.
              </p>
            </div>

            <div className="grid gap-8">
              <Section 
                icon={<Database className="w-6 h-6 text-accent" />}
                title="Account Architecture"
                content="Unlike Web2 chat apps that store messages in a central SQL database, SolSo stores every message as a separate Account on the Solana blockchain. This guarantees data permanence and true ownership."
              />
              
              <Section 
                icon={<Code className="w-6 h-6 text-primary" />}
                title="Program Logic"
                content="The application interacts with a custom Anchor program (Smart Contract) deployed on Devnet. PDA (Program Derived Address) derivation is used to deterministically locate conversations between any two wallets without an indexer."
              />
              
              <Section 
                icon={<Globe className="w-6 h-6 text-pink-500" />}
                title="Network Cost"
                content="Every message requires a small amount of SOL (rent) to store the data on-chain. On Devnet, this ensures protection against spam and DDoS attacks, creating a high-value communication channel."
              />
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 mt-12">
              <h3 className="text-lg font-bold mb-4">Contract Details</h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-muted-foreground">Network</span>
                  <span className="text-accent">Solana Devnet</span>
                </div>
                <div className="flex justify-between items-center py-2 ">
                  <span className="text-muted-foreground">Program ID</span>
                  <a href="https://solscan.io/account/AcGFqZav2bu4MiYeTRKka4TYMhAGgkxByfs6eRofz62Z?cluster=devnet" 
                  target="_blank" rel="noopener noreferrer"  className={cn("hover:text-purple-400 transition-colors text-sm opacity-60")}>
                  AcGFqZav...fz62Z
                  </a>
                </div>
                
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    </WalletContextProvider>
  );
}

function Section({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <div className="flex gap-6 items-start p-6 rounded-2xl bg-card border border-border/50 hover:border-accent/30 transition-colors">
      <div className="p-3 rounded-xl bg-background border border-white/10 shadow-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

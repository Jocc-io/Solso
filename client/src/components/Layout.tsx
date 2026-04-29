import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Twitter, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
<div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
       <header className="h-16 fixed top-8 inset-x-0 px-2 lg:px-0 lg:top-0 z-50 bg-[#030711]">
        <div className="container mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/logo.png" className="w-20 lg:w-24 max-w-none" alt="logo" />
          </Link>
          <div className="block lg:hidden">
          <a className="inline-flex items-center px-4  py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs" 
          href="https://faucet.solso.fun"> Faucet </a>              
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-md font-medium text-muted-foreground">
              
              <a href="https://jocc.io" className={cn("hover:text-primary transition-colors", location === "https://jocc.io" && "text-purple-400")}>
                Jocc
              </a>
               <Link href="/" className={cn("hover:text-primary transition-colors", location === "/" && "text-purple-400")}>
                Chat
              </Link>
              <Link href="/about" className={cn("hover:text-primary transition-colors", location === "/about" && "text-purple-400")}>
                About
              </Link>
              <a href="https://faucet.solso.fun" className={cn("hover:text-primary transition-colors", location === "https://faucet.solso.fun" && "text-purple-400")}>
                Faucet
              </a>
            </nav>
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-xl !h-10 !px-6 !font-semibold transition-all" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-20 overflow-y-auto">
       <div className="mx-auto max-w-8xl px-4 sm:px-2 lg:px-24">
        {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a className="block lg:hidden text-sm mt-2" href="/about"> About </a>              
            <div className="text-sm text-muted-foreground ">
              <p className="mb-2">&copy; 2026 solso - All Rights Reserved</p>
               <a href="https://solscan.io/account/AcGFqZav2bu4MiYeTRKka4TYMhAGgkxByfs6eRofz62Z?cluster=devnet" 
               target="_blank" rel="noopener noreferrer"  
               className={cn("block text-center hover:text-purple-500 transition-colors text-xs opacity-60")}>
                Program ID: AcGFqZav...fz62Z
              </a>
            </div>
            
            
            <div className="flex items-center gap-4 mb-4 mt-0 lg:mt-4">
              <a href="https://x.com/joccnft" target="_blank" rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://discord.gg/jmMY8MrQCt" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-110">
                <MessageCircle className="w-5 h-5" />
              </a>
              
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

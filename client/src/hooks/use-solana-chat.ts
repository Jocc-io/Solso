import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider, utils, web3, Idl } from "@project-serum/anchor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Buffer } from "buffer";
import { useEffect, useState } from "react";

// Polyfill Buffer for the browser environment
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const PROGRAM_ID = new PublicKey("AcGFqZav2bu4MiYeTRKka4TYMhAGgkxByfs6eRofz62Z");

// Define a minimal IDL based on the requirements
const IDL: Idl = {
  version: "0.1.0",
  name: "solana_chat",
  instructions: [
    {
      name: "initializeConversation",
      accounts: [
        { name: "conversation", isMut: true, isSigner: false },
        { name: "participant1", isMut: true, isSigner: true },
        { name: "participant2", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "sendMessage",
      accounts: [
        { name: "conversation", isMut: true, isSigner: false },
        { name: "message", isMut: true, isSigner: false },
        { name: "sender", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "content", type: "string" }],
    },
  ],
  accounts: [
    {
      name: "Conversation",
      type: {
        kind: "struct",
        fields: [
          { name: "participant1", type: "publicKey" },
          { name: "participant2", type: "publicKey" },
          { name: "messageCount", type: "u64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "Message",
      type: {
        kind: "struct",
        fields: [
          { name: "conversation", type: "publicKey" },
          { name: "sender", type: "publicKey" },
          { name: "recipient", type: "publicKey" },
          { name: "index", type: "u64" },
          { name: "content", type: "string" },
          { name: "timestamp", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
};

// Types derived from IDL
export interface ChatMessage {
  publicKey: PublicKey;
  conversation: PublicKey;
  sender: PublicKey;
  recipient: PublicKey;
  index: number;
  content: string;
  timestamp: number;
}

export interface ChatConversation {
  publicKey: PublicKey;
  participant1: PublicKey;
  participant2: PublicKey;
  messageCount: number;
}

export function useSolanaChat() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [program, setProgram] = useState<Program | null>(null);

  useEffect(() => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });
      const prog = new Program(IDL, PROGRAM_ID, provider);
      setProgram(prog);
    } else {
      setProgram(null);
    }
  }, [connection, wallet]);

  return { program, wallet };
}

// Hook to fetch conversation details
export function useConversation(otherUserKeyString?: string) {
  const { program, wallet } = useSolanaChat();
  
  return useQuery({
    queryKey: ["conversation", wallet?.publicKey?.toString(), otherUserKeyString],
    queryFn: async () => {
      if (!program || !wallet || !otherUserKeyString) return null;

      try {
        const otherUser = new PublicKey(otherUserKeyString);
        // Sort participants to ensure consistent PDA derivation
        const [p1, p2] = wallet.publicKey.toBuffer().compare(otherUser.toBuffer()) < 0
          ? [wallet.publicKey, otherUser]
          : [otherUser, wallet.publicKey];

        const [conversationPda] = await PublicKey.findProgramAddress(
          [Buffer.from("conversation"), p1.toBuffer(), p2.toBuffer()],
          program.programId
        );

        const account = await program.account.conversation.fetchNullable(conversationPda);
        
        if (account) {
          return {
            publicKey: conversationPda,
            participant1: account.participant1 as PublicKey,
            participant2: account.participant2 as PublicKey,
            messageCount: (account.messageCount as any).toNumber(),
          } as ChatConversation;
        }
        return null;
      } catch (e) {
        console.error("Error fetching conversation:", e);
        return null;
      }
    },
    enabled: !!program && !!wallet && !!otherUserKeyString,
  });
}

// Hook to fetch messages for a conversation
export function useMessages(conversationPda?: PublicKey) {
  const { program } = useSolanaChat();
  
  return useQuery({
    queryKey: ["messages", conversationPda?.toString()],
    queryFn: async () => {
      if (!program || !conversationPda) return [];

      try {
        // Fetch all message accounts that belong to this conversation
        // Note: In a production app, you'd want to paginate or filter by conversation index
        // This is a naive implementation fetching all program accounts and filtering (expensive)
        // Ideally the contract would support a better way, or we'd use getProgramAccounts with memcmp
        
        const messageAccounts = await program.account.message.all([
          {
            memcmp: {
              offset: 8, // Discriminator
              bytes: conversationPda.toBase58(),
            },
          },
        ]);

        return messageAccounts.map((msg) => ({
          publicKey: msg.publicKey,
          conversation: msg.account.conversation as PublicKey,
          sender: msg.account.sender as PublicKey,
          recipient: msg.account.recipient as PublicKey,
          index: (msg.account.index as any).toNumber(),
          content: msg.account.content as string,
          timestamp: (msg.account.timestamp as any).toNumber() * 1000,
        } as ChatMessage)).sort((a, b) => a.timestamp - b.timestamp);
      } catch (e) {
        console.error("Error fetching messages:", e);
        return [];
      }
    },
    enabled: !!program && !!conversationPda,
    refetchInterval: 5000, // Poll every 5s for new messages
  });
}

// Mutation to initialize conversation
export function useInitializeConversation() {
  const { program, wallet } = useSolanaChat();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserKeyString: string) => {
      if (!program || !wallet) throw new Error("Wallet not connected");

      const otherUser = new PublicKey(otherUserKeyString);
      const [p1, p2] = wallet.publicKey.toBuffer().compare(otherUser.toBuffer()) < 0
        ? [wallet.publicKey, otherUser]
        : [otherUser, wallet.publicKey];

      const [conversationPda] = await PublicKey.findProgramAddress(
        [Buffer.from("conversation"), p1.toBuffer(), p2.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeConversation()
        .accounts({
          conversation: conversationPda,
          participant1: wallet.publicKey,
          participant2: otherUser,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return conversationPda;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversation", wallet?.publicKey.toString(), variables] });
    },
  });
}

// Mutation to send message
export function useSendMessage() {
  const { program, wallet } = useSolanaChat();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversation, content, currentCount }: { conversation: ChatConversation, content: string, currentCount: number }) => {
      if (!program || !wallet) throw new Error("Wallet not connected");

      const [messagePda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("message"), 
          conversation.publicKey.toBuffer(), 
          new util.BN(currentCount).toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );

      // Note: In a real app we might need to increment local count optimistically or fetch fresh count
      // Here we rely on the passed currentCount

      await program.methods
        .sendMessage(content)
        .accounts({
          conversation: conversation.publicKey,
          message: messagePda,
          sender: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
        
      return messagePda;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["messages", vars.conversation.publicKey.toString()] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] }); // Count updates
    },
  });
}

// Utility for BN because anchor types can be tricky
import * as util from "bn.js";

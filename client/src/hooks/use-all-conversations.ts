import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Buffer } from "buffer";

const PROGRAM_ID = new PublicKey("AcGFqZav2bu4MiYeTRKka4TYMhAGgkxByfs6eRofz62Z");

const IDL: any = {
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

export interface ConversationWithDetails {
  publicKey: PublicKey;
  participant1: PublicKey;
  participant2: PublicKey;
  messageCount: number;
  otherParticipant: PublicKey;
  unreadCount: number;
  lastMessageTime?: number;
  lastMessageContent?: string;
}

export function useAllConversations() {
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

  return useQuery({
    queryKey: ["allConversations", wallet?.publicKey?.toString()],
    queryFn: async () => {
      if (!program || !wallet) return [];

      try {
        const allConversations = await program.account.conversation.all();

        const userConversations: ConversationWithDetails[] = [];

        for (const conv of allConversations) {
          const participant1 = conv.account.participant1 as PublicKey;
          const participant2 = conv.account.participant2 as PublicKey;
          const messageCount = (conv.account.messageCount as any).toNumber();

          if (
            participant1.toString() === wallet.publicKey.toString() ||
            participant2.toString() === wallet.publicKey.toString()
          ) {
            const otherParticipant =
              participant1.toString() === wallet.publicKey.toString()
                ? participant2
                : participant1;

            const messageAccounts = await program.account.message.all([
              {
                memcmp: {
                  offset: 8,
                  bytes: conv.publicKey.toBase58(),
                },
              },
            ]);

            const messages = messageAccounts
              .map((msg) => ({
                publicKey: msg.publicKey,
                conversation: msg.account.conversation as PublicKey,
                sender: msg.account.sender as PublicKey,
                recipient: msg.account.recipient as PublicKey,
                index: (msg.account.index as any).toNumber(),
                content: msg.account.content as string,
                timestamp: (msg.account.timestamp as any).toNumber() * 1000,
              }))
              .sort((a, b) => a.timestamp - b.timestamp);

            const unreadCount = messages.filter(
              (msg) => msg.recipient.toString() === wallet.publicKey.toString()
            ).length;

            const lastMessage = messages[messages.length - 1];

            userConversations.push({
              publicKey: conv.publicKey,
              participant1,
              participant2,
              messageCount,
              otherParticipant,
              unreadCount,
              lastMessageTime: lastMessage?.timestamp,
              lastMessageContent: lastMessage?.content,
            });
          }
        }

        userConversations.sort((a, b) => {
          const timeA = a.lastMessageTime || 0;
          const timeB = b.lastMessageTime || 0;
          return timeB - timeA;
        });

        return userConversations;
      } catch (e) {
        console.error("Error fetching conversations:", e);
        return [];
      }
    },
    enabled: !!program && !!wallet,
    refetchInterval: 10000,
  });
}

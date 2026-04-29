use anchor_lang::prelude::*;

declare_id!("AcGFqZav2bu4MiYeTRKka4TYMhAGgkxByfs6eRofz62Z");

#[program]
pub mod solana_chat {
    use super::*;

    /// إنشاء محادثة بين محفظتين
    pub fn initialize_conversation(
        ctx: Context<InitializeConversation>,
    ) -> Result<()> {
        let conversation = &mut ctx.accounts.conversation;

        let (p1, p2) = sort_keys(
            ctx.accounts.participant1.key(),
            ctx.accounts.participant2.key(),
        );

        conversation.participant1 = p1;
        conversation.participant2 = p2;
        conversation.message_count = 0;
        conversation.bump = ctx.bumps.conversation;

        Ok(())
    }

    /// إرسال رسالة نصية
    pub fn send_message(
        ctx: Context<SendMessage>,
        content: String,
    ) -> Result<()> {
        require!(content.len() <= 500, ChatError::MessageTooLong);

        let conversation = &mut ctx.accounts.conversation;
        let sender = ctx.accounts.sender.key();

        // تحقق إن المرسل أحد طرفي المحادثة
        require!(
            sender == conversation.participant1 || sender == conversation.participant2,
            ChatError::UnauthorizedSender
        );

        let recipient = if sender == conversation.participant1 {
            conversation.participant2
        } else {
            conversation.participant1
        };

        let clock = Clock::get()?;

        let message = &mut ctx.accounts.message;
        message.conversation = conversation.key();
        message.sender = sender;
        message.recipient = recipient;
        message.content = content;
        message.timestamp = clock.unix_timestamp;
        message.index = conversation.message_count;
        message.bump = ctx.bumps.message;

        conversation.message_count += 1;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeConversation<'info> {
    #[account(
        init,
        payer = participant1,
        space = Conversation::SPACE,
        seeds = [
            b"conversation",
            sort_keys(participant1.key(), participant2.key()).0.as_ref(),
            sort_keys(participant1.key(), participant2.key()).1.as_ref()
        ],
        bump
    )]
    pub conversation: Account<'info, Conversation>,

    #[account(mut)]
    pub participant1: Signer<'info>,

    /// CHECK: مجرد مفتاح عام
    pub participant2: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(content: String)]
pub struct SendMessage<'info> {
    #[account(
        mut,
        seeds = [
            b"conversation",
            conversation.participant1.as_ref(),
            conversation.participant2.as_ref()
        ],
        bump = conversation.bump
    )]
    pub conversation: Account<'info, Conversation>,

    #[account(
        init,
        payer = sender,
        space = Message::space(content.len()),
        seeds = [
            b"message",
            conversation.key().as_ref(),
            &conversation.message_count.to_le_bytes()
        ],
        bump
    )]
    pub message: Account<'info, Message>,

    #[account(mut)]
    pub sender: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Conversation {
    pub participant1: Pubkey,
    pub participant2: Pubkey,
    pub message_count: u64,
    pub bump: u8,
}

impl Conversation {
    pub const SPACE: usize = 8  // discriminator
        + 32                   // participant1
        + 32                   // participant2
        + 8                    // message_count
        + 1;                   // bump
}

#[account]
pub struct Message {
    pub conversation: Pubkey,
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub index: u64,
    pub content: String,
    pub timestamp: i64,
    pub bump: u8,
}

impl Message {
    pub fn space(content_len: usize) -> usize {
        8   // discriminator
        + 32 // conversation
        + 32 // sender
        + 32 // recipient
        + 8  // index
        + 4 + content_len // String
        + 8  // timestamp
        + 1  // bump
    }
}

#[error_code]
pub enum ChatError {
    #[msg("Message exceeds 500 characters")]
    MessageTooLong,
    #[msg("Sender is not part of this conversation")]
    UnauthorizedSender,
}

/// ترتيب المفاتيح علشان PDA deterministic
fn sort_keys(a: Pubkey, b: Pubkey) -> (Pubkey, Pubkey) {
    if a.to_bytes() < b.to_bytes() {
        (a, b)
    } else {
        (b, a)
    }
}

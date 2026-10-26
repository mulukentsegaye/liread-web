/**
 * Telegram Webhook Serverless Endpoint for LiRead
 * Route: /api/telegram
 * 
 * Handles Telegram webhook updates when users interact with the LiRead bot (@lireadbooksbot).
 * 
 * CASE A: Admin replies to a "NEW BOOK REQUEST" notification with a PDF/EPUB document:
 *         Extracts the target user's UID (UID:xxx) and delivers the document directly
 *         to the user, backs it up to the private Vault Channel, and confirms to Admin.
 * 
 * CASE B: User requests a book (either via website deep-link "/start req_..." or by typing a book title):
 *         Replies immediately to the user and notifies Admin with the UID for one-tap fulfillment.
 * 
 * CASE C: User clicks "/start <numericMessageId>" (from instant vault downloads):
 *         Copies the document from the Vault channel directly to the user.
 */

interface TelegramChat {
  id: number | string;
  type?: string;
  first_name?: string;
  username?: string;
}

interface TelegramDocument {
  file_id: string;
  file_unique_id?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    is_bot?: boolean;
  };
  chat: TelegramChat;
  date: number;
  text?: string;
  caption?: string;
  reply_to_message?: TelegramMessage;
  document?: TelegramDocument;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
}

const WELCOME_MESSAGE =
  "📚 Welcome to LiRead Bot!\n\nSend me the title and author of any book you want to request, or browse books at https://liread.vercel.app/";

const NOT_AVAILABLE_MESSAGE = "Sorry, this book PDF isn't available yet.";

// Helper to format channel ID for Telegram Bot API (-100 prefix for supergroups/channels)
function formatVaultChatId(rawId: string | number): (string | number)[] {
  const str = String(rawId).trim();
  if (str.startsWith('@') || str.startsWith('-100')) {
    return [str];
  }
  if (str.startsWith('-')) {
    return [str];
  }
  // Try with -100 prefix first, then raw number as fallback
  return [`-100${str}`, Number(str) || str];
}

async function sendTelegramMessage(
  token: string,
  chatId: number | string,
  text: string,
  parseMode?: string
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(parseMode ? { parse_mode: parseMode } : {}),
      }),
    });
    const data = await res.json().catch(() => null);
    if (data && data.ok) return true;

    // If parseMode caused a markdown error, retry without parseMode
    if (parseMode) {
      const retryRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      });
      const retryData = await retryRes.json().catch(() => null);
      return Boolean(retryData && retryData.ok);
    }
    return false;
  } catch (err) {
    console.error('[telegram-webhook] Error in sendMessage:', err);
    return false;
  }
}

async function sendTelegramDocument(
  token: string,
  chatId: number | string,
  documentFileId: string,
  caption?: string
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        document: documentFileId,
        ...(caption ? { caption } : {}),
      }),
    });
    const data = await res.json().catch(() => null);
    if (data && data.ok) return true;
    console.warn('[telegram-webhook] sendDocument response not ok:', data);
    return false;
  } catch (err) {
    console.error('[telegram-webhook] Error in sendDocument:', err);
    return false;
  }
}

async function copyTelegramMessage(
  token: string,
  chatId: number | string,
  fromChatId: number | string,
  messageId: number,
  caption?: string
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/copyMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        from_chat_id: fromChatId,
        message_id: messageId,
        ...(caption ? { caption } : {}),
      }),
    });
    const data = await res.json().catch(() => null);
    return Boolean(data && data.ok);
  } catch (err) {
    console.error('[telegram-webhook] Error in copyMessage:', err);
    return false;
  }
}

async function backupToVault(
  token: string,
  vaultId: string,
  documentFileId: string,
  fromChatId?: number | string,
  messageId?: number
): Promise<boolean> {
  if (!vaultId) return false;
  const candidates = formatVaultChatId(vaultId);
  for (const targetId of candidates) {
    const sent = await sendTelegramDocument(token, targetId, documentFileId, '📁 LiRead Archive Backup');
    if (sent) return true;
    if (fromChatId && messageId) {
      const copied = await copyTelegramMessage(token, targetId, fromChatId, messageId);
      if (copied) return true;
    }
  }
  return false;
}

// Universal response helper supporting both Node (res.status().json()) and Web Response (Edge/Fetch API)
function respondOk(res?: any) {
  if (res && typeof res.status === 'function') {
    return res.status(200).json({ ok: true });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: any, res?: any) {
  // Support quick health-check via GET
  if (req.method === 'GET') {
    const info = {
      ok: true,
      service: 'LiRead Telegram Bot Webhook (@lireadbooksbot)',
      configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      adminConfigured: Boolean(process.env.TELEGRAM_ADMIN_CHAT_ID),
      vaultConfigured: Boolean(process.env.TELEGRAM_VAULT_CHANNEL_ID),
    };
    if (res && typeof res.status === 'function') {
      return res.status(200).json(info);
    }
    return new Response(JSON.stringify(info), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Telegram sends webhook updates via POST
  if (req.method !== 'POST') {
    return respondOk(res);
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = String(process.env.TELEGRAM_ADMIN_CHAT_ID || '').trim();
    const vaultChannelId = String(process.env.TELEGRAM_VAULT_CHANNEL_ID || '').trim();

    if (!botToken) {
      console.warn('[telegram-webhook] Warning: TELEGRAM_BOT_TOKEN environment variable is not set.');
      return respondOk(res);
    }

    // Parse request body safely
    let update: TelegramUpdate | null = null;
    if (typeof req.body === 'object' && req.body !== null) {
      update = req.body as TelegramUpdate;
    } else if (typeof req.body === 'string') {
      try {
        update = JSON.parse(req.body) as TelegramUpdate;
      } catch {
        update = null;
      }
    } else if (typeof req.json === 'function') {
      update = (await req.json().catch(() => null)) as TelegramUpdate;
    }

    if (!update || !update.message || !update.message.chat) {
      return respondOk(res);
    }

    const message = update.message;
    const chatId = message.chat.id;
    const rawText = (message.text || message.caption || '').trim();
    const isAdmin =
      Boolean(adminChatId) && (
        String(message.chat.id) === adminChatId ||
        (message.from && String(message.from.id) === adminChatId)
      );

    // =========================================================================
    // CASE A: ADMIN REPLIES TO A REQUEST NOTIFICATION WITH A DOCUMENT/PDF
    // =========================================================================
    if (isAdmin && message.reply_to_message && message.document) {
      const replyText =
        message.reply_to_message.text || message.reply_to_message.caption || '';
      const uidMatch = replyText.match(/UID:(\d+)/);

      if (uidMatch) {
        const targetUserId = uidMatch[1];
        const fileId = message.document.file_id;

        // 1. Send the file to the waiting user via sendDocument
        const deliveryCaption =
          "🎉 Good news! Your requested book from LiRead is ready. Enjoy reading!\n\n🌐 https://liread.vercel.app/";

        const delivered = await sendTelegramDocument(
          botToken,
          targetUserId,
          fileId,
          deliveryCaption
        );

        // 2. If TELEGRAM_VAULT_CHANNEL_ID is set, also back up to Vault Channel
        if (vaultChannelId) {
          await backupToVault(
            botToken,
            vaultChannelId,
            fileId,
            message.chat.id,
            message.message_id
          );
        }

        // 3. Reply to Admin
        const confirmationMessage = delivered
          ? "✅ Book successfully delivered to the user and saved to the Vault!"
          : `⚠️ Upload saved to Vault, but could not deliver to user UID:${targetUserId} (they may not have started the bot or blocked it).`;

        await sendTelegramMessage(botToken, message.chat.id, confirmationMessage);
        return respondOk(res);
      } else {
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          "ℹ️ Document received, but no UID was found in the replied message. Make sure you reply directly to a '🔔 NEW BOOK REQUEST' notification."
        );
        return respondOk(res);
      }
    }

    // =========================================================================
    // CASE C: NUMERIC PAYLOAD (e.g., /start 12 from direct vault message)
    // =========================================================================
    const numericMatch = rawText.match(/^\/start(?:@\w+)?\s+(\d+)$/i);
    if (numericMatch) {
      const messageId = Number(numericMatch[1]);
      if (vaultChannelId) {
        const candidates = formatVaultChatId(vaultChannelId);
        let copied = false;
        for (const chId of candidates) {
          copied = await copyTelegramMessage(botToken, chatId, chId, messageId);
          if (copied) break;
        }
        if (!copied) {
          await sendTelegramMessage(botToken, chatId, NOT_AVAILABLE_MESSAGE);
        }
      } else {
        await sendTelegramMessage(botToken, chatId, NOT_AVAILABLE_MESSAGE);
      }
      return respondOk(res);
    }

    // =========================================================================
    // CASE B: USER REQUESTS A BOOK (via website deep-link or by typing text)
    // =========================================================================
    let requestedBookTitle: string | null = null;

    if (/^\/start(?:@\w+)?\s+req_/i.test(rawText)) {
      // 1. Deep link: /start req_Atomic_Habits
      const slug = rawText.replace(/^\/start(?:@\w+)?\s+req_/i, '').trim();
      requestedBookTitle = slug.replace(/_+/g, ' ').trim();
    } else if (/^\/start(?:@\w+)?$/i.test(rawText)) {
      // 2. /start with no book payload
      await sendTelegramMessage(botToken, chatId, WELCOME_MESSAGE);
      return respondOk(res);
    } else if (!isAdmin && rawText && !rawText.startsWith('/')) {
      // 3. Normal text from non-admin user
      requestedBookTitle = rawText.trim();
    } else if (isAdmin && /^\/help|^\/start/i.test(rawText)) {
      // Admin greeting / status
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `👋 Hello Admin (@${message.from?.username || 'admin'})!\n\nLiRead Bot is active and listening.\n\n⚙️ Configuration:\n• Admin ID: ${adminChatId}\n• Vault Channel: ${vaultChannelId}\n\nWhen readers request books on the website, you will receive a notification here with their UID. Simply reply to that message with the PDF/EPUB to auto-deliver it!`
      );
      return respondOk(res);
    }

    if (requestedBookTitle) {
      // 1. Reply immediately to the user (message.chat.id)
      const userReply = `📚 Request received for: *${requestedBookTitle}*\n\nOur librarian has been notified! As soon as it's uploaded, I will send the file directly to you right here in this chat. 🔔`;
      await sendTelegramMessage(botToken, chatId, userReply, 'Markdown');

      // 2. Send notification message to Admin
      const firstName = message.from?.first_name || '';
      const username = message.from?.username ? `@${message.from.username}` : 'no_username';
      const adminNotice = `🔔 NEW BOOK REQUEST\n\n📖 Book: ${requestedBookTitle}\n👤 User: ${firstName} (${username})\n🆔 UID:${chatId}\n\n👉 Reply directly to this message with the PDF/EPUB file to deliver it to the user automatically!`;

      if (adminChatId) {
        await sendTelegramMessage(botToken, adminChatId, adminNotice);
      }
      return respondOk(res);
    }
  } catch (err) {
    console.error('[telegram-webhook] Unhandled error during update processing:', err);
  }

  // Always return HTTP 200 OK so Telegram considers the update delivered
  return respondOk(res);
}

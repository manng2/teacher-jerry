const TELEGRAM_BOT_TOKEN = '6776053860:AAHAHf09ewxCayKihcmK5HvoFsEEmvQdRlI';

// Cloudflare Worker code
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Sends a Telegram response to the specified chat ID with the given message.
 * @param {string} chatId - The chat ID where the message will be sent.
 * @param {string} message - The message to send.
 * @returns {Response} - The response from the Telegram API.
 */
async function sendTelegramResponse(chatId, message, options = {}) {
  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const params = {
    chat_id: chatId,
    text: message,
    ...options,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      return new Response('Message sent successfully!', { status: 200 });
    } else {
      return new Response('Failed to send message.', { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return new Response('Error occurred while sending the message.', { status: 500 });
  }
}

/**
 * Handles incoming requests and responds with the appropriate action.
 * @param {Request} request - The incoming request to handle.
 * @returns {Response} - The response to the request.
 */
async function handleRequest(request) {
  const { method, headers } = request;

  const url = new URL(request.url);

  console.log('Timestamp::::::::', Date.now());
  // Check if the request is a POST request to /webhooks/telegram and has JSON content-type
  if (method === 'POST' && url.pathname == '/webhooks/telegram' && headers.get('content-type') === 'application/json') {
    const data = await request.json();
    console.log('Data::::::', data);
    const { message } = data;

    if (message && message.text) {
      const command = message.text.trim();

      if (command.startsWith('/p')) {
        const chatId = message.chat.id

        await handlePractice(chatId, 'Hello Jerry Nguyen')

        return new Response('OK', { status: 200 });
      }
    }
  }

  return new Response('OK', { status: 200 });
}

async function handlePractice(chatId, message) {
  return sendTelegramResponse(chatId, message, {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: 'A',
            callback_data: '1'
          },
        ],
      ],
    })
  })
}

import data from '../dictionary.json';
import { DictionaryModel } from './models';
import { findRandomByRange } from './utils';

let TELEGRAM_BOT_TOKEN = '';
const dictionary: DictionaryModel = data;
const dictionaryArr = Object.entries(dictionary);

interface Env {
  BOT_TOKEN: string;
}

/**
 * Sends a Telegram response to the specified chat ID with the given message.
 * @param {string} chatId - The chat ID where the message will be sent.
 * @param {string} message - The message to send.
 * @returns {Response} - The response from the Telegram API.
 */
async function sendTelegramResponse(chatId: number, message: string, options = {}) {
	const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  console.log('Sending message to apiUrl:::::', apiUrl);
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
async function handleRequest(request: Request) {
  // console.log('Event::::::', event);
	const { method, headers } = request;

	const url = new URL(request.url);

	// console.log('Timestamp::::::::', Date.now());
	if (method === 'POST' && url.pathname == '/webhooks/telegram' && headers.get('content-type') === 'application/json') {
		const data = await request.json();
		console.log('Data::::::', data);
		const { message, callback_query: callbackQuery } = data as any;

		if (message && message.text) {
			const command = message.text.trim();

			if (command.startsWith('/p')) {
				const chatId = message.chat.id;

				await handlePractice(chatId);
			}
		}

		if (callbackQuery) {
			const { message, data: answer } = callbackQuery;
			const chatId = message.chat.id;
			const question = message.text;

			await sendTelegramResponse(
				chatId,
				dictionary[answer].meaning === question ? `Correct answer! It is ${answer}` : `${answer} is not the answer!`
			);
		}
	}

	return new Response(`Jerry Nguyen, ${TELEGRAM_BOT_TOKEN}`, { status: 200 });
}

async function handlePractice(chatId: number) {
	const targetIdx = findRandomByRange(0, dictionaryArr.length - 1);
	const firstIdx = findRandomByRange(0, dictionaryArr.length - 1, [targetIdx]);
	const secondIdx = findRandomByRange(0, dictionaryArr.length - 1, [targetIdx, firstIdx]);
	const thirdIdx = findRandomByRange(0, dictionaryArr.length - 1, [targetIdx, firstIdx, secondIdx]);
	const inlineKeyboard = [
		{
			text: dictionaryArr[firstIdx][0],
			callback_data: dictionaryArr[firstIdx][0],
		},
		{
			text: dictionaryArr[secondIdx][0],
			callback_data: dictionaryArr[secondIdx][0],
		},
		{
			text: dictionaryArr[thirdIdx][0],
			callback_data: dictionaryArr[thirdIdx][0],
		},
	];
	const answerOrder = findRandomByRange(1, 4);
	const answerIdx = answerOrder - 1;

  console.log('Preparing to send message:::::');
	return sendTelegramResponse(chatId, dictionaryArr[targetIdx][1].meaning, {
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[
					...inlineKeyboard.slice(0, answerIdx),
					{
						text: dictionaryArr[targetIdx][0],
						callback_data: dictionaryArr[targetIdx][0],
					},
					...inlineKeyboard.slice(answerIdx),
				],
			],
		}),
	});
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    TELEGRAM_BOT_TOKEN = env.BOT_TOKEN;
    return handleRequest(request);
  }
}

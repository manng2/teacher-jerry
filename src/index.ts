import data from '../dictionary.json';
import { handlePractice } from './actions/handle-practice.action';
import { PROMPT } from './constants/prompt.constant';
import { DictionaryModel } from './models';
import { sendTelegramResponse } from './utils/telegram.util';

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

				await handlePractice(chatId, dictionaryArr, TELEGRAM_BOT_TOKEN);
			}
		}

		if (callbackQuery) {
			if (callbackQuery.message.text === PROMPT.DO_YOU_WANT_TO_CONTINUE) {
				const chatId = callbackQuery.message.chat.id;

				if (callbackQuery.data === PROMPT.YES) {
					console.log('Continue practice:::::');

					await handlePractice(chatId, dictionaryArr, TELEGRAM_BOT_TOKEN);
				} else {
					await sendTelegramResponse(chatId, PROMPT.THANK_YOU, TELEGRAM_BOT_TOKEN);
				}
			} else {
				console.log('Check answer:::::');

				const { message, data: answer } = callbackQuery;
				const chatId = message.chat.id;
				const question = message.text;
				const isCorrect = dictionary[answer].meaning === question;

				await sendTelegramResponse(
					chatId,
					isCorrect ? `Correct answer! It is ${answer}` : `${answer} is not the answer!`,
					TELEGRAM_BOT_TOKEN
				);

				if (isCorrect) {
					await askForContinue(chatId);
				}
			}
		}
	}

	return new Response(`Jerry Nguyen, ${TELEGRAM_BOT_TOKEN}`, { status: 200 });
}

async function askForContinue(chatId: number) {
	return sendTelegramResponse(chatId, PROMPT.DO_YOU_WANT_TO_CONTINUE, TELEGRAM_BOT_TOKEN, {
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[
					{
						text: PROMPT.YES,
						callback_data: PROMPT.YES,
					},
					{
						text: PROMPT.NO,
						callback_data: PROMPT.NO,
					},
				],
			],
		}),
	});
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		TELEGRAM_BOT_TOKEN = env.BOT_TOKEN;
		return handleRequest(request);
	},
};

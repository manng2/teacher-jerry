import { askForContinue, handlePractice } from "./actions/learning-vocab.action";
import { PROMPT } from "./constants/prompt.constant";
import { DictionaryArrModel, DictionaryModel } from "./models";
import { sendMessage, sendPhoto } from "./utils/telegram.util";

function isRequest(method: string, pathName: string, isJsonContentType: boolean) {
    return method === 'POST' && pathName == '/webhooks/telegram' && isJsonContentType;
}

function isPracticeFlow(command: string) {
    return command.startsWith('/p');
}

async function handleFlow(request: Request, dictionary: DictionaryModel, dictionaryArr: DictionaryArrModel[], token: string) {
    const { method, headers } = request;

	const url = new URL(request.url);

	if (isRequest(method, url.pathname, headers.get('content-type') === 'application/json')) {
		const data = await request.json();
		console.log('Data::::::', data);
		const { message, callback_query: callbackQuery } = data as any;

		if (message && message.text) {
			const command = message.text.trim();

			if (isPracticeFlow(command)) {
				const chatId = message.chat.id;

				await handlePractice(chatId, dictionaryArr, token);
			}
		}

		if (callbackQuery) {
			if (callbackQuery.message.text === PROMPT.DO_YOU_WANT_TO_CONTINUE) {
				const chatId = callbackQuery.message.chat.id;

				if (callbackQuery.data === PROMPT.YES) {
					console.log('Continue practice:::::');

					await handlePractice(chatId, dictionaryArr, token);
				} else {
					await sendMessage(chatId, PROMPT.THANK_YOU, token);
					await sendPhoto(chatId, 'https://picsum.photos/200/300', token, {
						caption: 'Goodbye!'
					})
				}
			} else {
				console.log('Check answer:::::');

				const { message, data: answer } = callbackQuery;
				const chatId = message.chat.id;
				const question = message.text;
				const isCorrect = dictionary[answer].meaning === question;

				await sendMessage(
					chatId,
					isCorrect ? `Correct answer! It is ${answer}` : `${answer} is not the answer!`,
					token
				);

				if (isCorrect) {
					await askForContinue(chatId, token);
				}
			}
		}
	}
}

export default {
    handleFlow
}

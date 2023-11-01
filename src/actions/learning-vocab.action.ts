import { PROMPT } from "../constants/prompt.constant";
import { DictionaryArrModel } from "../models";
import { findRandomByRange } from "../utils/common.util";
import { sendMessage } from "../utils/telegram.util";

export async function handlePractice(chatId: number, dictionaryArr: DictionaryArrModel[], token: string) {
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
	return sendMessage(chatId, dictionaryArr[targetIdx][1].meaning, token, {
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

export async function askForContinue(chatId: number, token: string) {
	return sendMessage(chatId, PROMPT.DO_YOU_WANT_TO_CONTINUE, token, {
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
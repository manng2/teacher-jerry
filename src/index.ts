import data from '../dictionary.json';
import bot from './bot';
import { DictionaryModel } from './models';

let TELEGRAM_BOT_TOKEN = '';
const dictionary: DictionaryModel = data;
const dictionaryArr = Object.entries(dictionary);

interface Env {
	BOT_TOKEN: string;
}

async function handleRequest(request: Request) {
	await bot.handleFlow(request, dictionary, dictionaryArr, TELEGRAM_BOT_TOKEN);
	return new Response(`Jerry Nguyen, ${TELEGRAM_BOT_TOKEN}`, { status: 200 });
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		TELEGRAM_BOT_TOKEN = env.BOT_TOKEN;
		return handleRequest(request);
	},
};

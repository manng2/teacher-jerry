export async function sendTelegramResponse(chatId: number, message: string, token: string, options = {}) {
	const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
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

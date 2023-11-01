export function findRandomByRange(start: number, end: number, exceptions: number[] = []) {
	let n: number | null;

	do {
		n = Math.floor(Math.random() * end) + start;
	} while (exceptions.includes(n));

	return n;
}

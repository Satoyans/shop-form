function getTextLength(text) {
	let all_count = 0;
	for (let char of [...text.split("")]) {
		const code_point_num = char.codePointAt(0);
		if (!code_point_num) continue;
		let now_count = 1;
		if (code_point_num >= 128) now_count += 1;
		if (code_point_num >= 2048) now_count += 1;
		if (code_point_num >= 65536) now_count += 1;
		all_count += now_count;
	}
	return all_count;
}

/**
 *
 * @param {string} text
 * @param {number} length
 * @param {string?} char
 * @returns {string}
 */
function padText(text, length, char = "") {
	const text_length = getTextLength(text);
	if (length === text_length) return text;
	if (length < text_length) {
		console.warn(`fill length < now length , ${length} < ${text_length}`);
		return text.slice(0, length);
	}
	//charが1文字以外になることを考慮してない
	return `${[...Array(length - getTextLength(text)).fill(char)].join("")}${text}`;
}

export { padText };

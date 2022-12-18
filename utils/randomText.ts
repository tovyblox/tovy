const randomTextFromArray = (texts: string[]) => {
	  return texts[Math.floor(Math.random() * texts.length)];
};
const randomText = (text: string) => {
	const coolTexts = [
		`Howdy, ${text}!`, 
		`Whats up, ${text}?`,
		`Hey, ${text}!`,
		`Hello, ${text}!`,
		`I\'m so glad to see you, ${text}!`,
		`Lovely to see you, ${text}!`,
	];
	const nightOnlyTexts = [
		`Good night, ${text}!`,
		`Good evening, ${text}!`,
		`Wonderful evening isnt it, ${text}?`,
	];

	const afternoonOnlyTexts = [
		`Good afternoon, ${text}!`,
		`Lovely afternoon, ${text}!`,
		`Good day, ${text}!`,
	];
	
	const morningOnlyTexts = [
		`Good morning, ${text}!`,
		`Lovely morning, ${text}!`,
		`Good day, ${text}!`,
	];
	const isTimeBased = Math.random() > 0.4;
	if (isTimeBased) return randomTextFromArray(coolTexts);
	const date = new Date();
	const hour = date.getHours();
	if (hour >= 18) return randomTextFromArray(nightOnlyTexts);
	if (hour >= 12) return randomTextFromArray(afternoonOnlyTexts);
	return randomTextFromArray(morningOnlyTexts);
}

export default randomText;
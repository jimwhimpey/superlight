/**
 * Returns a block of CSS with random colors (and timings)
 * from a pre-defined set of colors to animate through.
 * @return {String} CSS animation definition
 */
module.exports = function() {

	const colors = [
		'#151440',
		'#eb617d',
		'#732f6e',
		'#d94e8f',
		'#5bc3c8',
		'#e94954',
		'#ec6e58',
		'#6dbddb',
		'#73e986',
		'#4c835b',
		'#70b85d',
		'#459ecd',
		'#74f0cc',
	];

	const percentages = ['0%', '25%', '50%', '75%'];
	let selectedColors = [];

	percentages.forEach(percentage => {
		const randomIndex = Math.round(Math.random()*(colors.length-1));
		const randomColor = colors[randomIndex];
		selectedColors.push(randomColor);
		colors.splice(randomIndex, 1);
	});

	selectedColors = selectedColors.map((color, index) => {
		return `${percentages[index]} { color: ${color}; }`;
	});

	// Same color at the end
	selectedColors.push(`10${selectedColors[0]}`);

	return `@keyframes hypercolor {\n ${selectedColors.join('\n')}\n}`;

}

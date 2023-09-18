const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const adblocker = require("puppeteer-extra-plugin-adblocker");

puppeteer.use(StealthPlugin());
puppeteer.use(adblocker());

const getWeatherData = async () => {
	// * Constants
	const dailyUrl =
		"https://weather.com/weather/today/l/2d1071aa62ad1d1525436e1d64c194ebc0379856db14d3c451214e4ebe9ca5a623fcf9b3cfe70ebbd387b99750520570";
	const weeklyUrl =
		"https://weather.com/weather/tenday/l/2d1071aa62ad1d1525436e1d64c194ebc0379856db14d3c451214e4ebe9ca5a623fcf9b3cfe70ebbd387b99750520570";
	const MIN_WAIT = 4000;
	const MAX_WAIT = 8000;
	const data = {};

	// * Web Scrapping logic
	const browser = await puppeteer.launch({
		headless: true,
	});

	// Daily Weather Conditions
	const page = await browser.newPage();
	await page.goto(dailyUrl);

	const [currentTemp, maxTemp, minTemp] = await Promise.all([
		page.$eval(
			".CurrentConditions--tempValue--MHmYY",
			(element) => element.textContent
		),
		page.$eval(
			".CurrentConditions--tempHiLoValue--3T1DG > span:nth-child(1)",
			(element) => element.textContent
		),
		page.$eval(
			".CurrentConditions--tempHiLoValue--3T1DG > span:nth-child(2)",
			(element) => element.textContent
		),
	]);

	// ! Old Code
	// ---------------------------------------------------------------------------
	// const currentTemp = await page.$eval(
	// 	".CurrentConditions--tempValue--MHmYY",
	// 	(element) => {
	// 		return element.textContent;
	// 	}
	// );
	// const maxTemp = await page.$eval(
	// 	".CurrentConditions--tempHiLoValue--3T1DG > span:nth-child(1)",
	// 	(element) => {
	// 		return element.textContent;
	// 	}
	// );
	// const minTemp = await page.$eval(
	// 	".CurrentConditions--tempHiLoValue--3T1DG > span:nth-child(2)",
	// 	(element) => {
	// 		return element.textContent;
	// 	}
	// );
	// ---------------------------------------------------------------------------

	// Current Weather Temperatures
	// Removing the degree symbol and converting to Int
	data[0] = {
		maxTemp: parseInt(maxTemp.replace("°", "")),
		minTemp: parseInt(minTemp.replace("°", "")),
		currentTemp: parseInt(currentTemp.replace("°", "")),
	};

	// Waiting few seconds for anti bot detection
	const waitTime =
		Math.floor(Math.random() * (MAX_WAIT - MIN_WAIT + 1)) + MIN_WAIT;
	await page.waitForTimeout(waitTime);
	await page.goto(weeklyUrl);
	await page.waitForTimeout(waitTime);

	// Getting rest of today's data
	const precipitationChance = await page.$eval(
		"#detailIndex0 > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > span:nth-child(2)",
		(element) => {
			return element.textContent;
		}
	);

	let dayOfWeek = await page.$eval(
		"#detailIndex0 > div:nth-child(2) > div:nth-child(1) > h3:nth-child(1) > span:nth-child(1)",
		(element) => {
			return element.textContent;
		}
	);

	// clicking on the button to show the short description for weather forecast
	await page.click(
		".Disclosure--positionShowOpenSummary--2r38t > svg:nth-child(2)"
	);
	const weatherForecast = await page.$eval(
		"#detailIndex0 > summary:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > span:nth-child(2)",
		(element) => {
			return element.textContent;
		}
	);

	data[0] = {
		...data[0], // Keep the existing temperature data
		dayOfWeek: dayOfWeek.trim().slice(0, 3),
		forecast: weatherForecast,
		precipitation: parseInt(precipitationChance.replace("%", "")),
	};

	// Getting the rest of the week's data
	for (let i = 1; i <= 6; i++) {
		const detailIndex = `#detailIndex${i}`;

		const dayOfWeekSelector = `${detailIndex} > summary:nth-child(1) > div:nth-child(1) > div:nth-child(1) > h3:nth-child(1)`;
		const maxTempSelector = `${detailIndex} > summary:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > span:nth-child(1)`;
		const forecastSelector = `${detailIndex} > summary:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > span:nth-child(2)`;

		const dayOfWeek = await page.$eval(
			dayOfWeekSelector,
			(element) => element.textContent
		);

		const maxTemp = await page.$eval(
			maxTempSelector,
			(element) => element.textContent
		);

		const forecast = await page.$eval(
			forecastSelector,
			(element) => element.textContent
		);

		data[i] = {
			dayOfWeek: dayOfWeek.trim().slice(0, 3),
			maxTemp: parseFloat(maxTemp.replace("°", "")),
			forecast: forecast.trim(), // Remove extra white spaces if any
		};
	}

	await browser.close();
	return data;
};
// To print the result
getWeatherData().then((data) => console.log(data));

module.exports = {
	getWeatherData,
};

async function fetchWeather() {
	try {
		const data = await window.electron.requestWeather();
		console.log(data);
		var forecastData = data.daily.data;

		const weatherImages = {
			mostly_cloudy: {
				day: "mostly_cloudy.png",
				night: "mostly_cloudy_night.png",
			},
			cloud: {
				day: "cloudy.png",
				night: "cloudy.png",
			},
			overcast: {
				day: "cloudy.png",
				night: "cloudy.png",
			},
			fog: {
				day: "fog.png",
				night: "fog.png",
			},
			snow: {
				day: "snow.png",
				night: "snow.png",
			},
			hail: {
				day: "snow.png",
				night: "snow.png",
			},
			rain: {
				day: "rain.png",
				night: "rain.png",
			},
			freezing: {
				day: "freezing.png",
				night: "freezing.png",
			},
			storm: {
				day: "storm.png",
				night: "storm.png",
			},
			mostly_sunny: {
				day: "sunny.png",
				night: "night.png",
			},
			partly_sunny: {
				day: "partly_sunny.png",
				night: "partly_night.png",
			},
			sunny: {
				day: "sunny.png",
				night: "night.png",
			},
			"": {
				day: "question.png",
				night: "question.png",
			},
		};
		const weatherState = {
			mostly_cloudy: "mostly cloudy",
			mostly_sunny: "mostly sunny",
			partly_sunny: "partly sunny",
			tstorm: "thunder storm",
			light_rain: "light rain",
			rain_shower: "rain shower",
			psbl_rain: "possible rain",
		};

		const isDaytime = isDayTime(); // Custom function to determine if it's daytime

		let todayContent = "";
		let content = "";
		for (let i = 0; i < 7; i++) {
			const forecast = forecastData[i];

			// Was showing the wrong days of the week - UTC issue.
			// minus 1 for month because january starts off at 0
			const [year, month, day] = forecast.day.split("-").map(Number);
			const date = new Date(year, month - 1, day);
			console.log(date);

			const days = [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday",
			];
			const dayOfWeek = days[date.getDay()];

			// Check if forecast text contains any of the weather conditions
			let weatherCondition = "";
			for (const condition in weatherImages) {
				if (forecast.weather.toLowerCase().includes(condition)) {
					weatherCondition = condition;
					break;
				}
			}
			let weatherStateCondition = "";
			for (const condition in weatherState) {
				if (forecast.weather.toLowerCase().includes(condition)) {
					weatherStateCondition = weatherState[condition];
					break;
				}
			}

			if (weatherStateCondition === "") {
				// If no conditions were matched, use the original forecast.weather string
				weatherStateCondition = forecast.weather.toLowerCase();
			}

			// Get the corresponding image URL based on weather condition and day/night
			const imageUrl = weatherCondition
				? window.myAPI.getAssetPath(
						weatherImages[weatherCondition][isDaytime ? "day" : "night"]
				  )
				: window.myAPI.getAssetPath("question.png");

			if (forecast == forecastData[0]) {
				todayContent += `
			<div class="flex flex-col gap-3">
					<div class="flex flex-row w-full justify-between">
						<div
							class="today w-1/2 flex flex-col h-full justify-start text-clear-blue"
						>
							<h1 class="text-7xl">${Math.round(forecast.temperature)}°F</h1>
							<div class="text-2xl">
								<p>${weatherStateCondition}</p>
							</div>
						</div>
						<div class="flex">
							<img
								class="h-28 w-28"
								src="${imageUrl}" alt="${forecast.weather}"
							/>
						</div>
					</div>

					<hr class="opacity-25" />

					<div
						class="today flex flex-col h-full justify-start text-clear-blue"
					>
						<div class="text-2xl">
							<p>High ${Math.round(forecast.temperature_max)}°F</p>
							<p>Low ${Math.round(forecast.temperature_min)}°F</p>
						</div>
						<h1 class="text-2xl">Precipitation ${Math.round(
							forecast.probability.precipitation
						)}%</h1>
					</div>
				</div>

          `;
			} else {
				content += `
			<div
			class="flex flex-col gap-3 w-full text-clear-blue"
		>
			<div
				class="weekly-card-lane"
			>
				<h3 class="flex h-full w-1/3 justify-start place-items-center">
				${dayOfWeek}
				</h3>
				<h3
					class="flex flow-row h-full w-1/3 justify-center place-items-center"
				>
				${Math.round(forecast.temperature_max)}°F
				</h3>
				<div class="flex w-1/3 justify-end">
					<div class="flex w-12 h-12">
						<img src="${imageUrl}" alt="${forecast.weather}" />
					</div>
				</div>
			</div>
		</div>
          `;
			}
		}

		document.querySelector("#today-weather").innerHTML = todayContent;
		document.querySelector("#forecast-weather").innerHTML = content;
	} catch (err) {
		console.error(err);
	}
}

function isDayTime() {
	const now = new Date();
	const hours = now.getHours();
	return hours >= 6 && hours < 18; // Assume day time is between 6 AM and 6 PM
}

async function updateWeather() {
	const now = new Date();
	const hours = now.getHours();

	// Check if it's around 6 AM or 6 PM
	if (hours === 6 || hours === 18) {
		await fetchWeather();
		displayWeather();
	}
}

function updateWeatherDaily() {
	fetchWeather();
}

// Initial fetch on page load
fetchWeather();

// Schedule updates around 6 AM and 6 PM
setInterval(updateWeather, 60000); // Check every minute for simplicity

// Menu Stuff
function toggleDropDown(dropDown, menu) {
	menu.addEventListener("click", () => {
		dropDown.classList.toggle("hidden");
	});
}

toggleDropDown(
	document.getElementById("drop-down-1"),
	document.getElementById("menu-1")
);

function toggleLock() {
	const menuLock1 = document.getElementById("lock-menu-1");
	const container = document.getElementById("body");

	menuLock1.addEventListener("click", () => {
		container.classList.toggle("drag");
		console.log("ITS WORKING");
	});
}

toggleLock();
// Menu Stuff End

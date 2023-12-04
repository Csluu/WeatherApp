// Global flag
var isInitialLoad = true;

async function fetchWeather() {
	try {
		// Show the spinner on initial load
		if (isInitialLoad) {
			// Show the spinner only on initial load
			document
				.getElementById("daily-loading-spinner")
				.classList.remove("hidden");
			document
				.getElementById("weekly-loading-spinner")
				.classList.remove("hidden");
		}
		const data = await window.electron.requestWeather();
		console.log(data);
		var forecastData = data;
		console.log(forecastData);

		const weatherImages = {
			"mostly cloudy": {
				day: "mostly_cloudy.png",
				night: "mostly_cloudy_night.png",
			},
			cloud: {
				day: "cloudy.png",
				night: "cloudy.png",
			},
			drizzle: {
				day: "light_rain.png",
				night: "light_rain.png",
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
			shower: {
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
			"mostly sunny": {
				day: "sunny.png",
				night: "night.png",
			},
			"partly sunny": {
				day: "partly_sunny.png",
				night: "partly_night.png",
			},
			sunny: {
				day: "sunny.png",
				night: "night.png",
			},
			clear: {
				day: "sunny.png",
				night: "night.png",
			},
			"": {
				day: "question.png",
				night: "question.png",
			},
		};

		const isDaytime = isDayTime(); // Custom function to determine if it's daytime

		let todayContent = "";
		let content = "";
		for (let i = 0; i < 7; i++) {
			const forecast = forecastData[i];

			// Truncate forecast.forecast to 16 characters and add ellipsis if it was longer
			let truncatedForecast =
				forecast.forecast.length > 14
					? forecast.forecast.slice(0, 14) + "..."
					: forecast.forecast;

			const days = {
				sun: "Sunday",
				mon: "Monday",
				tue: "Tuesday",
				wed: "Wednesday",
				thu: "Thursday",
				fri: "Friday",
				sat: "Saturday",
			};

			const dayOfWeek = days[forecast.dayOfWeek.toLowerCase()];

			// Check if forecast text contains any of the weather conditions
			let weatherCondition = "";
			for (const condition in weatherImages) {
				if (forecast.forecast.toLowerCase().includes(condition)) {
					weatherCondition = condition;
					break;
				}
			}

			// Get the corresponding image URL based on weather condition and day/night
			const imageUrl = weatherCondition
				? window.myAPI.getAssetPath(
						weatherImages[weatherCondition][isDaytime ? "day" : "night"]
				  )
				: window.myAPI.getAssetPath("question.png");

			if (forecast == forecastData[0]) {
				todayContent += `
			<div class="flex flex-col gap-3 z-0">
					<div class="flex flex-row w-full justify-between">
						<div
							class="today w-2/3 flex flex-col h-full justify-start text-clear-blue"
						>
							<h1 class="text-7xl">${Math.round(forecast.currentTemp)}°F</h1>
							<div class="text-2xl">
								<p>${truncatedForecast}</p>
							</div>
						</div>
						<div class="flex">
							<img
								class="h-28 w-28"
								src="${imageUrl}" alt="${forecast.forecast}"
							/>
						</div>
					</div>

					<hr class="opacity-25" />

					<div
						class="today flex flex-col h-full justify-start text-clear-blue"
					>
						<div class="text-2xl">
							<p>High ${Math.round(forecast.maxTemp)}°F</p>
							<p>Low ${Math.round(forecast.minTemp)}°F</p>
						</div>
						<h1 class="text-2xl">Precipitation ${Math.round(forecast.precipitation)}%</h1>
					</div>
				</div>

          `;
			} else {
				content += `
			<div
			class="flex flex-col gap-3 w-full text-clear-blue z-0"
		>
			<div
				class="weekly-card-lane "
			>
				<h3 class="flex h-full w-1/3 justify-start place-items-center">
				${dayOfWeek}
				</h3>
				<h3
					class="flex flow-row h-full w-1/3 justify-center place-items-center"
				>
				${Math.round(forecast.maxTemp)}°F
				</h3>
				<div class="flex w-1/3 justify-end">
					<div class="flex w-12 h-12">
						<img src="${imageUrl}" alt="${forecast.forecast}" />
					</div>
				</div>
			</div>
		</div>
          `;
			}
		}

		document.querySelector("#today-weather").innerHTML = todayContent;
		document.querySelector("#forecast-weather").innerHTML = content;

		// Hide the spinner
		document.getElementById("daily-loading-spinner").classList.add("hidden");
		document.getElementById("weekly-loading-spinner").classList.add("hidden");

		// After the first successful load, set isInitialLoad to false
		isInitialLoad = false;
	} catch (err) {
		console.error(err);
		// Hide the spinner in case of error as well
		document.getElementById("daily-loading-spinner").classList.add("hidden");
		document.getElementById("weekly-loading-spinner").classList.add("hidden");
	}
}

function isDayTime() {
	const now = new Date();
	const hours = now.getHours();
	return hours >= 6 && hours < 18; // Assume day time is between 6 AM and 6 PM
}

function updateDelay() {
	const waitTime =
		Math.floor(Math.random() * (4000000 - 3600000 + 1)) + 3600000;
	return waitTime;
}

async function updateWeather() {
	await fetchWeather();
	console.log("Weather is updated");
}

// Initial fetch on page load
fetchWeather();

// Schedule updates around 6 AM and 6 PM

setInterval(updateWeather, updateDelay()); // Checks every hour

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
	const lockIcon = document.getElementById("lock-icon");
	const dailyContainer = document.getElementById("dailyBody");
	const weeklyContainer = document.getElementById("weeklyBody");
	const lockText = document.getElementById("lock-text");

	const lockedPath =
		"M6 22q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8h1V6q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6Zm6-5q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17ZM9 8h6V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6v2Z";
	const unlockedPath =
		"M6 8h9V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6H7q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8Zm6 9q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17Z";

	menuLock1.addEventListener("click", () => {
		const currentPath = lockIcon.getAttribute("d");

		if (currentPath === lockedPath) {
			lockIcon.setAttribute("d", unlockedPath);
		} else {
			lockIcon.setAttribute("d", lockedPath);
		}

		// Toggle text for Lock/Unlock
		if (lockText.innerHTML === "Lock") {
			lockText.innerHTML = "Unlock";
		} else {
			lockText.innerHTML = "Lock";
		}

		dailyContainer.classList.toggle("yes-drag");
		weeklyContainer.classList.toggle("yes-drag");
	});
}

["menu-1"].forEach((buttonId) => {
	document.getElementById(buttonId).addEventListener("click", function (event) {
		// Assuming the menu IDs are the button IDs without the "show-" prefix.
		const menuId = buttonId.replace("show-", "");
		document.getElementById(menuId).classList.remove("hidden");
		event.stopPropagation();
	});
});

function checkForMenuHide(event) {
	// The element that was clicked
	const clickedElement = event.target;

	// An array containing the IDs of all menus you want to manage
	const menuIds = ["drop-down-1"];

	// Loop through each menu ID
	menuIds.forEach((menuId) => {
		// Get the menu element by its ID
		const menu = document.getElementById(menuId);

		// Check if the clicked element is inside the menu or is the menu itself
		const isInsideMenu =
			menu.contains(clickedElement) || menu === clickedElement;

		if (!isInsideMenu) {
			// If the click was outside the menu, hide it
			menu.classList.add("hidden");
		}
	});
}
// Attach the function to the document
document.addEventListener("click", checkForMenuHide);

// Attach the function to the document
document.addEventListener("click", checkForMenuHide);

toggleLock();
// Menu Stuff End

// Request the current time from the main process
window.api.send("toMain", "request-current-time");

// Receive the current time from the main process
window.api.receive("fromMain", (data) => {
	document.getElementById("current-time").textContent = data;
});

function getCurrentTime() {
	// Request the current time from the main process
	window.api.send("toMain", "request-current-time");
}

// Call getCurrentTime now, and then every second
getCurrentTime();
setInterval(getCurrentTime, 1000);

// Receive the current time from the main process
window.api.receive("fromMain", (data) => {
	document.getElementById("current-time").textContent = data.time;
	document.getElementById("current-date").textContent = data.date;
});

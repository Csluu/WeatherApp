// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");
const axios = require("axios");
const currentWindow = require("electron").BrowserWindow.getFocusedWindow();
const path = require("path");
const { getWeatherData } = require("./webscrap");
// API and longitude and latitude nums
// const { API_KEY, LATITUDE_NUM, LONGITUDE_NUM } = require("./config.js");

// * Change this to "production" or "development" when in development in when ready for production
process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";

const store = new Store();

let mainWindow;

// * Change devTools and frame to false for production
const createMainWindow = () => {
	let { x, y } = store.get("windowPosition", { x: undefined, y: undefined });

	// Create the browser window.
	mainWindow = new BrowserWindow({
		x,
		y,
		width: isDev ? 1500 : 850,
		height: 535,
		transparent: true,
		resizable: false,
		frame: false,
		// icon: isWin
		// 	? path.join(__dirname, "./Renderer/assets/icons/icon.ico")
		// 	: path.join(__dirname, "./Renderer/assets/icons/icon.png"),
		webPreferences: {
			// Set this to false when in production
			devTools: true,
			nodeIntegration: true,
			// when using the preload script turn this to true to help with security reasons
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	// if (isDev) {
	// 	mainWindow.webContents.openDevTools();
	// }

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "./Renderer/index.html"));

	// Save window position when the window is closed.
	mainWindow.on("close", () => {
		let { x, y } = mainWindow.getBounds();
		store.set("windowPosition", { x, y });
	});

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()

	// Get the button element
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createMainWindow();

	// Remove mainWindow from memory on close to prevent memory leak
	mainWindow.on("closed", () => (mainWindow = null));

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (!isMac) {
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("close-window", () => {
	const window = BrowserWindow.getFocusedWindow();
	if (window) {
		window.close();
	}
});

ipcMain.on("minimize-window", () => {
	const window = BrowserWindow.getFocusedWindow();
	if (window) {
		window.minimize();
	}
});

// ! No longer in use
// ipcMain.handle("get-weather", async (event, location) => {
// 	const options = {
// 		method: "GET",
// 		url: "https://ai-weather-by-meteosource.p.rapidapi.com/daily",
// 		params: {
// 			lat: LATITUDE_NUM,
// 			lon: LONGITUDE_NUM,
// 			language: "en",
// 			units: "auto",
// 		},
// 		headers: {
// 			"X-RapidAPI-Key": API_KEY,
// 			"X-RapidAPI-Host": "ai-weather-by-meteosource.p.rapidapi.com",
// 		},
// 	};

// 	try {
// 		const response = await axios.request(options);
// 		return response.data;
// 	} catch (error) {
// 		console.error(error);
// 	}
// });

ipcMain.handle("get-weather", async () => {
	try {
		const data = await getWeatherData(); // Call your function here
		return data;
	} catch (error) {
		console.error(error);
	}
});

const days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

ipcMain.on("toMain", (event, args) => {
	if (args === "request-current-time") {
		const date = new Date();
		let hours = date.getHours();
		let minutes = date.getMinutes();
		const dayOfWeek = days[date.getDay()];
		const dayOfMonth = date.getDate();
		const month = months[date.getMonth()];

		// convert 24-hour time to 12-hour time format
		const period = hours >= 12 ? "PM" : "AM";
		hours = hours % 12;
		hours = hours ? hours : 12; // hour '0' should be '12'
		// Add leading zero if hours is a single digit
		hours = hours.toString().padStart(2, "0");
		minutes = minutes < 10 ? "0" + minutes : minutes; // padding zero if minutes less than '10'

		const time = `${hours}:${minutes} ${period}`;
		const formattedDate = `${dayOfWeek} ${dayOfMonth} ${month}`;

		event.reply("fromMain", { time, date: formattedDate });
	}
});

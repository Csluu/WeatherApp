const { contextBridge, ipcRenderer } = require("electron");
require('dotenv').config();

contextBridge.exposeInMainWorld("electron", {
	requestWeather: async (location) => {
		return await ipcRenderer.invoke("get-weather");
	},
	closeWindow: () => ipcRenderer.send("close-window"),
	minimizeWindow: () => ipcRenderer.send("minimize-window"),
});

privatekey = process.env.PRIVATE_KEY
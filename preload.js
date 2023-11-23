const path = require("path");
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	requestWeather: async () => {
		return await ipcRenderer.invoke("get-weather");
	},
	closeWindow: () => ipcRenderer.send("close-window"),
	minimizeWindow: () => ipcRenderer.send("minimize-window"),
});

function getAssetPath(asset) {
	if (process.env.NODE_ENV === "development") {
		return path.join(__dirname, "./Renderer/assets", asset);
	} else {
		// In production, point to the unpacked assets in the asar archive
		return path.join(
			process.resourcesPath,
			"app.asar.unpacked",
			"./Renderer/assets",
			asset
		);
	}
}

// Expose the function to the renderer process
contextBridge.exposeInMainWorld("myAPI", {
	getAssetPath,
});

contextBridge.exposeInMainWorld("api", {
	send: (channel, data) => {
		// whitelist channels
		let validChannels = ["toMain"];
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	receive: (channel, func) => {
		let validChannels = ["fromMain"];
		if (validChannels.includes(channel)) {
			// Deliberately strip event as it includes `sender`
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		}
	},
});

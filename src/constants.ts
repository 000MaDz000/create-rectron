import { OptionsType } from "./cli-options";

export const ELECTRON_FILE_CONTENT = (options: OptionsType) => `
if (process.env.NODE_ENV === "development") {
    ${options["--typescript"] ? `require("ts-node").register();\nrequire("../main/index.ts")` : `require("../main/index.js")`}
    }
    else {
        ${options["--typescript"] ? `require("./main/index.js");` : `require("../main/index.js")`}
}
`;

export const TYPESCRIPT_FILE_CONTENT = `import {app, BrowserWindow} from "electron";
import {join} from "path";
const DEV_URL = "http://localhost:3000";
const PRODUCTION_FILE = join(__dirname, "../index.html");
const createWindow = () => {
    const window = new BrowserWindow();
    if(process.env.NODE_ENV === "development") {
        window.loadURL(DEV_URL);
    }
    else {
        window.loadFile(PRODUCTION_FILE)
    }
    window.show();
}
app.whenReady().then(createWindow);
`;


export const NORMAL_FILE_CONTENT = `const { app, BrowserWindow } = require('electron');
const path = require('path');
const DEV_URL = "http://localhost:3000";
const PRODUCTION_FILE = path.join(__dirname, "../index.html");
const createWindow = () => {
    const window = new BrowserWindow();
    if (process.env.NODE_ENV === "development") {
        window.loadURL(DEV_URL);
    } else {
        window.loadFile(PRODUCTION_FILE);
    }
    window.show();
};
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
`;


export const INDEX_CSS_FILE_CONTENT = `@tailwind base;
@tailwind components;
@tailwind utilities;
@tailwind variants;
`;

export const TAILWIND_CONFIG_CONTENT = `/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
    "./src/**/*.{js,jsx,ts,tsx}",
],
theme: {
    extend: {},
    fontFamily: {
    main: ["main"]
    }
},
plugins: [],
}
`;

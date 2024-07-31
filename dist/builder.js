"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_spawn_1 = __importDefault(require("cross-spawn"));
const cli_options_1 = require("./cli-options");
const colors_1 = __importDefault(require("colors"));
const path_1 = require("path");
const promises_1 = require("fs/promises");
colors_1.default.enable();
(async () => {
    await cli_options_1.OptionsPromise;
    /* Dependecies installation */
    console.log("installing latest version of create-react-app globally".yellow, "\n");
    await new Promise((r) => {
        const process = (0, cross_spawn_1.default)("npm", ["install", "-g", "create-react-app@latest"], { "stdio": "inherit" });
        process.on("exit", () => r(undefined));
    });
    console.log("create-react-app installed".green, "\n");
    /* Create the react app */
    console.log("creating the react application".yellow);
    await new Promise((r) => {
        const args = ["create-react-app", cli_options_1.options.name];
        if (cli_options_1.options["--typescript"])
            args.push("--template", "typescript");
        const process = (0, cross_spawn_1.default)("npx", args, { stdio: "inherit" });
        process.on("exit", () => r(undefined));
    });
    console.log("react app created".green, "\n");
    // install application dependecies
    const newCWD = (0, path_1.join)(process.cwd(), cli_options_1.options.name);
    process.chdir(newCWD);
    console.log("installing dependecies..".yellow, "\n");
    await new Promise((r) => {
        const args = ["install", "nodemon", "typescript", "electron", "@types/electron", "ts-node", "cross-env"];
        if (cli_options_1.options["--tailwindcss"])
            args.push("tailwindcss");
        args.push("--save-dev");
        const process = (0, cross_spawn_1.default)("npm", args, { stdio: "inherit" });
        process.on("exit", () => r(undefined));
    });
    console.log("dependecies installed".green, "\n");
    console.log("creating the nedded files".yellow, "\n");
    const publicDir = (0, path_1.join)(newCWD, "public");
    const electronFile = (0, path_1.join)(publicDir, "electron.js");
    await (0, promises_1.writeFile)(electronFile, `
            if (process.env.NODE_ENV === "development") {
                ${cli_options_1.options["--typescript"] ? `require("ts-node").register();` : ""}
                require("../main/index.ts");
            }
            else {
                require("./main/index.js");
            }
            `);
    console.log(electronFile.green, "created".green);
    const typescriptFileContent = `
            import {app, BrowserWindow} from "electron";
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
    const normalFileContent = `
            const { app, BrowserWindow } = require('electron');
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
    const mainDir = (0, path_1.join)(newCWD, "main");
    const indexFile = (0, path_1.join)(newCWD, mainDir, "index." + (cli_options_1.options["--typescript"] ? "ts" : "js"));
    await (0, promises_1.writeFile)(indexFile, cli_options_1.options["--typescript"] ? typescriptFileContent : normalFileContent);
    console.log(indexFile.green, "created".green, "\n");
    const packageFile = (0, path_1.join)(newCWD, "package.json");
    const data = await import(packageFile);
    data.scripts.build = "react-scripts build && tsc ./main/index.ts --outDir ./build --esModuleInterop --skipLibCheck";
    data.scripts.main = "cross-env NODE_ENV=development nodemon -w ./main/* --ext js,mjs,cjs,json,ts --exec electron .";
    await (0, promises_1.writeFile)(packageFile, data);
    console.log(packageFile.green, "updated".green, "\n");
    if (cli_options_1.options["--tailwindcss"]) {
        const tailwindFile = (0, path_1.join)(newCWD, "tailwind.config.js");
        const IndexCssFile = (0, path_1.join)(newCWD, "src", "index.css");
        const indexCssContent = `
                @tailwind base;
                @tailwind components;
                @tailwind utilities;
                @tailwind variants;
            `;
        const tailwindContent = `
                /** @type {import('tailwindcss').Config} */
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
        await (0, promises_1.writeFile)(tailwindFile, tailwindContent);
        await (0, promises_1.writeFile)(IndexCssFile, indexCssContent);
    }
})();

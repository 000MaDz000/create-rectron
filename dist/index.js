"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield cli_options_1.OptionsPromise;
    /* Dependecies installation */
    console.log("installing latest version of create-react-app globally".yellow, "\n");
    yield new Promise((r) => {
        const process = (0, cross_spawn_1.default)("npm", ["install", "-g", "create-react-app@latest"], { "stdio": "inherit" });
        process.on("exit", () => r(undefined));
    });
    console.log("create-react-app installed".green, "\n");
    /* Create the react app */
    console.log("creating the react application".yellow);
    yield new Promise((r) => {
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
    yield new Promise((r) => {
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
    yield (0, promises_1.writeFile)(electronFile, `
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
    const indexFile = (0, path_1.join)(newCWD, mainDir, "index." + cli_options_1.options["--typescript"] ? "ts" : "js");
    yield (0, promises_1.writeFile)(indexFile, cli_options_1.options["--typescript"] ? typescriptFileContent : normalFileContent);
    console.log(indexFile.green, "created".green, "\n");
    const packageFile = (0, path_1.join)(newCWD, "package.json");
    const data = yield Promise.resolve(`${packageFile}`).then(s => __importStar(require(s)));
    data.scripts.build = "react-scripts build && tsc ./main/index.ts --outDir ./build --esModuleInterop --skipLibCheck";
    data.scripts.main = "cross-env NODE_ENV=development nodemon -w ./main/* --ext js,mjs,cjs,json,ts --exec electron .";
    yield (0, promises_1.writeFile)(packageFile, data);
    console.log(packageFile.green, "updated".green, "\n");
}))();

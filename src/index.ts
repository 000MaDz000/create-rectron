import spawn from "cross-spawn";
import { OptionsPromise, options } from "./cli-options";
import colors from "colors";
import { join } from "path";
import { writeFile } from "fs/promises";

colors.enable();

(
    async () => {
        await OptionsPromise;

        /* Dependecies installation */
        console.log("installing latest version of create-react-app globally".yellow, "\n");
        await new Promise((r) => {
            const process = spawn("npm", ["install", "-g", "create-react-app@latest"], { "stdio": "inherit" });
            process.on("exit", () => r(undefined));
        });
        console.log("create-react-app installed".green, "\n");


        /* Create the react app */
        console.log("creating the react application".yellow);
        await new Promise((r) => {
            const args = ["create-react-app", options.name as string];
            if (options["--typescript"]) args.push("--template", "typescript");

            const process = spawn("npx", args, { stdio: "inherit" });
            process.on("exit", () => r(undefined));
        });
        console.log("react app created".green, "\n");


        // install application dependecies
        const newCWD = join(process.cwd(), options.name as string);
        process.chdir(newCWD);

        console.log("installing dependecies..".yellow, "\n");
        await new Promise((r) => {
            const args = ["install", "nodemon", "typescript", "electron", "@types/electron", "ts-node", "cross-env"];
            if (options["--tailwindcss"]) args.push("tailwindcss");

            args.push("--save-dev");

            const process = spawn("npm", args, { stdio: "inherit" });
            process.on("exit", () => r(undefined));
        });
        console.log("dependecies installed".green, "\n");

        console.log("creating the nedded files".yellow, "\n");
        const publicDir = join(newCWD, "public");
        const electronFile = join(publicDir, "electron.js");

        await writeFile(electronFile,
            `
            if (process.env.NODE_ENV === "development") {
                ${options["--typescript"] ? `require("ts-node").register();` : ""}
                require("../main/index.ts");
            }
            else {
                require("./main/index.js");
            }
            `
        );

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

        const mainDir = join(newCWD, "main");
        const indexFile = join(newCWD, mainDir, "index." + options["--typescript"] ? "ts" : "js");
        await writeFile(indexFile, options["--typescript"] ? typescriptFileContent : normalFileContent);

        console.log(indexFile.green, "created".green, "\n");

        const packageFile = join(newCWD, "package.json");
        const data = await import(packageFile);
        data.scripts.build = "react-scripts build && tsc ./main/index.ts --outDir ./build --esModuleInterop --skipLibCheck";
        data.scripts.main = "cross-env NODE_ENV=development nodemon -w ./main/* --ext js,mjs,cjs,json,ts --exec electron .";
        await writeFile(packageFile, data);

        console.log(packageFile.green, "updated".green, "\n");

        if (options["--tailwindcss"]) {
            const tailwindFile = join(newCWD, "tailwind.config.js");
            const IndexCssFile = join(newCWD, "src", "index.css");
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
            await writeFile(tailwindFile, tailwindContent);
            await writeFile(IndexCssFile, indexCssContent);
        }

    }

)();


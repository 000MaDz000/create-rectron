import spawn from "cross-spawn";
import { OptionsPromise, options } from "./cli-options";
import colors from "colors";
import { join } from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import { ELECTRON_FILE_CONTENT, INDEX_CSS_FILE_CONTENT, NORMAL_FILE_CONTENT, TAILWIND_CONFIG_CONTENT, TYPESCRIPT_FILE_CONTENT } from "./constants";

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

        await writeFile(electronFile, ELECTRON_FILE_CONTENT(options));

        console.log(electronFile.green, "created".green);

        const typescriptFileContent = TYPESCRIPT_FILE_CONTENT;
        const normalFileContent = NORMAL_FILE_CONTENT;

        const mainDir = join(newCWD, "main");
        const indexFile = join(mainDir, "index." + (options["--typescript"] ? "ts" : "js"));
        await mkdir(mainDir).catch(() => { });
        await writeFile(indexFile, options["--typescript"] ? typescriptFileContent : normalFileContent).catch(() => { });

        console.log(indexFile.green, "created".green, "\n");





        const packageFile = join(newCWD, "package.json");
        const data = JSON.parse((await readFile(packageFile)).toString());
        data.main = "./build/electron.js";
        data.scripts.build = "react-scripts build" + (options["--typescript"] ? " && tsc ./main/index.ts --outDir ./build --esModuleInterop --skipLibCheck" : "");
        data.scripts.main = "cross-env NODE_ENV=development nodemon -w ./main/* --ext js,mjs,cjs,json,ts --exec electron .";
        await writeFile(packageFile, JSON.stringify(data));

        console.log(packageFile.green, "updated".green, "\n");




        if (options["--tailwindcss"]) {
            const tailwindFile = join(newCWD, "tailwind.config.js");
            const IndexCssFile = join(newCWD, "src", "index.css");

            const indexCssContent = options["--tailwindcss"] ? INDEX_CSS_FILE_CONTENT : ""
            const tailwindContent = TAILWIND_CONFIG_CONTENT;
            await writeFile(tailwindFile, tailwindContent);
            await writeFile(IndexCssFile, indexCssContent);
        }


        // set the config of ts-node
        if (options["--typescript"]) {
            const tsConfigFile = join(newCWD, "tsconfig.json");
            const content = JSON.parse((await readFile(tsConfigFile)).toString());
            content["ts-node"] = {
                "files": true,
                "compilerOptions": {
                    "module": "NodeNext"
                }
            }

            await writeFile(tsConfigFile, JSON.stringify(content));
        }


        // initial git commit
        try {
            await new Promise(r => {
                spawn("git", ["add", "*"]).on("exit", r);
            });

            await new Promise(r => {
                spawn("git", ["commit", "-m", "initial commit from create-rectron"]).on("exit", r);
            });

        }
        catch (err) {

        }
    }
)();


"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsPromise = exports.options = void 0;
const prompts_1 = require("@inquirer/prompts");
const validate_npm_package_name_1 = __importDefault(require("validate-npm-package-name"));
if (process.argv.indexOf("--help") !== -1) {
    console.log("not implemented yet");
    process.exit(0);
}
exports.options = {
    "name": null,
    "--typescript": false,
    "--tailwindcss": false,
};
// const argvStartIndex = 2;
// for (let argI = argvStartIndex; argvStartIndex < process.argv.length; argI++) {
//     const arg = process.argv[argI] as keyof OptionsType;
//     if (!arg) break; // nodejs many times pass undefined as argument
//     if ((arg in options) && arg !== "name") {
//         options[arg] = true;
//     }
//     else {
//         if (argI == argvStartIndex) {
//             options.name = arg;
//         }
//         else {
//             console.error("unknown argument: ", arg);
//             process.exit(1);
//         }
//     }
// }
exports.OptionsPromise = (0, prompts_1.input)({
    message: "application name:",
    required: true,
    validate(value) {
        return (0, validate_npm_package_name_1.default)(value).validForNewPackages;
    },
}).then((value) => {
    exports.options.name = value;
    return (0, prompts_1.select)({
        "message": "would you use typescript ?",
        "choices": [
            {
                "name": "yes",
                "value": "yes"
            },
            {
                "name": "no",
                "value": "no"
            },
        ]
    });
}).then(value => {
    if (value === "yes") {
        exports.options["--typescript"] = true;
    }
    return (0, prompts_1.select)({
        "message": "would you use tailwindcss?",
        "choices": [
            {
                "name": "yes",
                "value": "yes"
            },
            {
                "name": "no",
                "value": "no"
            },
        ]
    });
}).then(value => {
    if (value == "yes") {
        exports.options["--tailwindcss"] = true;
    }
});

import { select, input } from "@inquirer/prompts";
import validate from "validate-npm-package-name";

if (process.argv.indexOf("--help") !== -1) {
    console.log("not implemented yet")
    process.exit(0);
}

export type OptionsType = {
    name: null | string,
    "--typescript": boolean;
    "--tailwindcss": boolean;
}

export const options: OptionsType = {
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

export const OptionsPromise = input({
    message: "application name:",
    required: true,
    validate(value) {
        return validate(value).validForNewPackages;
    },
}).then((value) => {
    options.name = value;

    return select({
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
    })
}).then(value => {
    if (value === "yes") {
        options["--typescript"] = true;
    }

    return select({
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
        options["--tailwindcss"] = true;
    }
})



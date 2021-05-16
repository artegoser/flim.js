import { validator } from "./modules/flim-validator";
import * as api from "flim-api";
import * as readline from 'readline';

async function publish() {
    let db:any={};
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    db.name = await new Promise(resolve => {
        rl.question("name: ", resolve);
    }) || "";
    db.password = await new Promise(resolve => {
        rl.question("password: ", resolve);
    }) || "";
    if(!(db.name||db.password)) throw new Error("Unspecified parameter");
}

module.exports = publish;
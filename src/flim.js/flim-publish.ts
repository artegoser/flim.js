import { validator } from "./modules/flim-validator";
import * as Api from "flim-api";
import * as readline from 'readline';
import * as fs from "fs";
import { Logger } from "./modules/flim-logger";

async function publish() {
    let logger = new Logger();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    let name:string = await new Promise(resolve => {
        rl.question("name: ", resolve);
    }) || "";
    let password:string = await new Promise(resolve => {
        rl.question("password: ", resolve);
    }) || "";
    if(!(name||password)) {
        logger.warn("Unspecified parameter");
        process.exit(1);
    }
    let ppackage: any;
    try{
        ppackage = JSON.parse(`${fs.readFileSync("./flim.json")}`);
    } catch{
        logger.warn("File flim.json is not exists. \nСreate a file with the flim init command");
        process.exit(1);
    }
    if(validator(ppackage)){
        let api = new Api(name, password);
        logger.startFunc("Upload a package", async ctx=>{
            ctx.info("Publishing a package");
            let res = await api.uploadPackage(ppackage);
            if(res.code!==0){
                ctx.warn(JSON.stringify(res));
                ctx.done();
            } else{
                ctx.done();
                logger.ok(res.message);
            }
            console.timeEnd("final");
            process.exit(0);
        });
    } else{
        logger.warn("Some parameters are not specified");
    }
}

module.exports = publish;
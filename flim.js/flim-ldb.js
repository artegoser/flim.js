const fs = require("fs");
const readline = require('readline');
const logger = require("./modules/flim-logger");

function filter( obj, filtercheck) {
    let result = {}; 
    Object.keys(obj).forEach((key) => { if (filtercheck(obj[key])) result[key] = obj[key]; });
    return result;
};

class ldb{
    constructor(name){
        this.logger = new logger();
        this.name = name ? (name.endsWith(".flim") ? name : name+".flim") : "ldb.flim";
    }
    async create(){
        let db = {};
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        db.description = await new Promise(resolve => {
            rl.question("description: ", resolve);
        }) || "";
        db.license = await new Promise(resolve => {
            rl.question("license(MIT): ", resolve);
        }) || "MIT";
        db.keywords = await new Promise(resolve => {
            rl.question("keywords: ", (v)=>{
                if(v) resolve(v.split(/[, ]/));
                else resolve("");
            })
        });

        db = filter(db, val=>{
            return val !== "";
        });
        db.packages = {};

        rl.close();
        this.logger.info("Creating a localdb");
        fs.writeFile(this.name, JSON.stringify(db, null, "  "), err=>{
            if(err){
                this.logger.warn(err);
                return;
            }
            this.logger.info("Created a localdb");
            console.log(db);
        });
    }
    fcreate(){
        this.logger.info("Creating a localdb");
        fs.writeFile(this.name, JSON.stringify({
            license: "MIT",
            keywords: ["flim"],
            packages: {}
        }, null, "  "), err=>{
            if(err){
                this.logger.warn(err);
                return;
            }
            this.logger.info("Created a localdb");
            console.log({
                license: "MIT",
                keywords: ["flim"]
            });
        });
    }
    exit(err){
        this.logger.warn(err);
        process.exit(1);
    }
    async sadd(){
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let name = await new Promise(resolve => {
            rl.question("name: ", resolve);
        }) || false;
        if(!name) {
            this.exit("parameter not specified");
        }
        let title = await new Promise(resolve => {
            rl.question("title: ", resolve);
        }) || false;
        if(!title) {
            this.exit("parameter not specified");
        }
        let url = await new Promise(resolve => {
            rl.question("url: ", resolve);
        }) || false;
        if(!url) {
            this.exit("parameter not specified");
        }
        rl.close();
        let locdb;
        try{
             locdb = JSON.parse(fs.readFileSync(this.name, 'utf-8'));
        } catch(e){
            this.exit(e);
        }
        locdb.packages[name] = {title:title, url:url};
        fs.writeFile(this.name, JSON.stringify(locdb, null, "  "));
    }
    add(name, title, url){
        let locdb;
        try{
             locdb = JSON.parse(fs.readFileSync(this.name, 'utf-8'));
        } catch(e){
            this.exit(e);
        }
        locdb.packages[name] = {title:title, url:url};
        fs.writeFile(this.name, JSON.stringify(locdb, null, "  "));
    }
}

module.exports = ldb;
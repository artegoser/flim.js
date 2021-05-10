const fs = require("fs");
const readline = require('readline');

function filter( obj, filtercheck) {
    let result = {}; 
    Object.keys(obj).forEach((key) => { if (filtercheck(obj[key])) result[key] = obj[key]; })
    return result;
};

class ldb{
    constructor(name){
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

        rl.close();
        console.log(db);
        fs.writeFile(this.name, JSON.stringify(db, null, "  "));
    }
    fcreate(){
        fs.writeFile(this.name, JSON.stringify({
            license: "MIT",
            keywords: ["flim"]
        }, null, "  "));
    }
}

module.exports = ldb;
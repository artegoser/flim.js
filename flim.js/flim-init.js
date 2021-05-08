const { Listr } = require("listr2");
const fs = require("fs");
const readline = require('readline');

Object.filter = function( obj, filtercheck) {
    let result = {}; 
    Object.keys(obj).forEach((key) => { if (filtercheck(obj[key])) result[key] = obj[key]; })
    return result;
};

async function init(){
    let jsonflim = {};
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    jsonflim.name = await new Promise(resolve => {
        rl.question(`name(${process.cwd().split("\\")[process.cwd().split("\\").length-1]}): `, resolve)
    }) || process.cwd().split("\\")[process.cwd().split("\\").length-1];
    jsonflim.author = await new Promise(resolve => {
        rl.question("author: ", resolve)
    });
    jsonflim.version = await new Promise(resolve => {
        rl.question("version(1.0.0): ", resolve)
    }) || "1.0.0";
    jsonflim.type = await new Promise(resolve => {
        rl.question("type(flim): ", resolve)
    }) || "flim";
    jsonflim.license = await new Promise(resolve => {
        rl.question("license(MIT): ", resolve)
    }) || "MIT";
    jsonflim.keywords = await new Promise(resolve => {
        rl.question("keywords: ", (v)=>{
            if(v) resolve(v.split(/[, ]/));
            else resolve("");
        })
    });

    jsonflim = Object.filter(jsonflim, (val)=>{
        return val !== "" ? true : false
    });

    rl.close();
    console.log(jsonflim);
    fs.writeFile("./flim.json", JSON.stringify(jsonflim, null, "  "));
}

function fastinit(){
    let jsonflim = {};
    jsonflim.name = process.cwd().split("\\")[process.cwd().split("\\").length-1];
    jsonflim.version = "1.0.0";
    jsonflim.type = "flim";
    jsonflim.license = "MIT";
    console.log(jsonflim);
    fs.writeFile("./flim.json", JSON.stringify(jsonflim, null, "  "));
}

module.exports = {
    init:init,
    finit:fastinit
}
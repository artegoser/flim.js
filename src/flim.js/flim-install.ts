import { spawn } from "child_process";
import * as logUpdate from 'log-update';
import * as fetch from 'node-fetch';
import { Logger } from "./modules/flim-logger";
import * as fs from "fs";

function npm(pkg, g, resolve){
        let xc = g ? ["i"].concat(pkg,'-g') : ["i"].concat(pkg);
        const sp = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', xc);

        sp.stdout.on("data", data => {
            logUpdate(`  ${data}`.replace(/\n/g, "\n    "));
            logUpdate.done()
        });
        
        sp.stderr.on("data", data => {
            logUpdate(`  ${data}`.replace(/\n/g, "\n    "));
            logUpdate.done();
        });
        
        sp.on('error', (error) => {
            logUpdate(`  ${error.message}`.replace(/\n/g, "\n    "));
            logUpdate.done();
        });

        sp.on('exit', ()=>{
            if(resolve) resolve();
        });
}

function yarn(pkg, resolve){
    let xc = ["add"].concat(pkg)
    const sp = spawn(/^win/.test(process.platform) ? 'yarn.cmd' : 'yarn', xc);

    sp.stdout.on("data", data => {
        logUpdate(`  ${data}`.replace(/\n/g, "\n    "));
        logUpdate.done()
    });
    
    sp.stderr.on("data", data => {
        logUpdate(`  ${data}`.replace(/\n/g, "\n    "));
        logUpdate.done();
    });
    
    sp.on('error', (error) => {
        logUpdate(`  ${error.message}`.replace(/\n/g, "\n    "));
        logUpdate.done();
    });

    sp.on('exit', ()=>{
        if(resolve) resolve();
    });
}

class flim{
    mainlogger:Logger;
    index:any;
    constructor(pkg, g){
        pkg = Array.isArray(pkg) ? pkg[0] : pkg;
        this.mainlogger = new Logger();
        this.mainlogger.info(`flim version ${require("../../package.json").version}`);
        this.mainlogger.info(`The global flim index doesn't work in flim yet`);
        this.index = {};
        try{
          this.mainlogger.info(`Try to read flim-index.json in local storage`);
          this.index = fs.readFileSync(`${__dirname}\\flim-index.json`).toJSON();
          this.flimpkg(this.index[pkg], pkg, g);
        } catch{
          this.mainlogger.info(`Local index not found, using cdn.jsdelivr.net`);
          fetch(`https://cdn.jsdelivr.net/npm/${pkg}/flim.json`)
            .then(res => res.json())
            .then(json => {
                this.index[pkg] = json;
                this.flimpkg(this.index[pkg], pkg, g);
            }).catch(err=> {
                this.mainlogger.warn("Fetch Error"); 
                this.mainlogger.info("Trying to get package.json Instead of flim.json"); 
                fetch(`https://cdn.jsdelivr.net/npm/${pkg}/package.json`)
                .then(res => res.json())
                .then(json => {
                    this.index[pkg] = {};
                    this.index[pkg].type = "npm-node";
                    this.flimpkg(this.index[pkg], pkg, g);
                }).catch(()=>{
                    this.mainlogger.warn("Fetch Error"); 
                    console.log(err); 
                    process.exit(1);
                });
            });
        }
    }
    flimpkg(json, pkg, g){
        if(json.type=="flim"){
            this.mainlogger.warn("Sorry, flim type still in development")
            //later
        } else if(json.type=="npm-node"){
            this.mainlogger.startFunc(`npm-node setup for ${pkg}`, async ctx=>{
                await new Promise((res)=>{
                    npm(pkg, g, res);
                });
                ctx.done();
            });
        } else if(json.type=="yarn-node"){
            this.mainlogger.startFunc(`npm-yarn setup for ${pkg}`, async ctx=>{
                await new Promise((res)=>{
                    yarn(pkg, res);
                });
                ctx.done();
            });
        } else{
            this.mainlogger.warn(`this type (${json.type}) is not supported`);
        }
    }
}

module.exports = {
    npm:npm,
    yarn:yarn,
    flim:flim
}
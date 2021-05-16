import { spawn } from "child_process";
import * as logUpdate from 'log-update';
import * as fetch from 'node-fetch';
import { Logger } from "./modules/flim-logger";
import { Downloader } from "./modules/flim-downloads";
import * as api from "flim-api";

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
        this.index = {};
        try{
          const findex = new api();
          findex.getPackage(pkg).then((val)=>{
            this.index[pkg] = val;
            if(!this.index[pkg].code){
                this.mainlogger.info("Package found, download begins");
                this.flimpkg(this.index[pkg], pkg, g);
            } else this.mainlogger.warn(val)
          });
        } catch{
          this.mainlogger.info(`Package not found, using cdn.jsdelivr.net`);
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
        switch(json.type){
            case "flim-portable":
                this.mainlogger.startFunc(`!flim-portable setup for ${pkg}`, async ctx=>{
                    let downloader = new Downloader(json.url, json.filename, "  ");
                    downloader.ev.on("done", ()=>{
                        ctx.done();
                    });
                });
                break;
            case "npm-node":
                this.mainlogger.startFunc(`npm-node setup for ${pkg}`, async ctx=>{
                    await new Promise((res)=>{
                        npm(pkg, g, res);
                    });
                    ctx.done();
                });
                break;
            case "yarn-node":
                this.mainlogger.startFunc(`npm-yarn setup for ${pkg}`, async ctx=>{
                    await new Promise((res)=>{
                        yarn(pkg, res);
                    });
                    ctx.done();
                });
                break;
            default:
                this.mainlogger.warn(`this type (${json.type}) is not supported`);
                break;
        }
    }
}

module.exports = {
    npm:npm,
    yarn:yarn,
    flim:flim
}
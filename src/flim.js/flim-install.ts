import { spawn } from "child_process";
import * as logUpdate from 'log-update';
import { Logger } from "./modules/flim-logger";
import { Downloader } from "./modules/flim-downloads";
import * as api from "flim-api";

function npm(pkg: string | ConcatArray<string>, g: boolean, resolve:any){
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

function yarn(pkg:ConcatArray<string>|string, resolve:any){
    let xc = ["add"].concat(pkg);
    const sp = spawn(/^win/.test(process.platform) ? 'yarn.cmd' : 'yarn', xc);

    sp.stdout.on("data", data => {
        logUpdate(`  ${data}`.replace(/\n/g, "\n    "));
        logUpdate.done();
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
    constructor(pkg:string, g:boolean){
        pkg = Array.isArray(pkg) ? pkg[0] : pkg;
        this.mainlogger = new Logger();
        this.mainlogger.info(`flim version ${require("../../package.json").version}`);
        this.index = {};
        const findex = new api();
        findex.getPackage(pkg).then((val)=>{
        this.index[pkg] = val;
        if(!this.index[pkg].code){
            this.mainlogger.info("Package found, download begins");
            this.flimpkg(this.index[pkg], pkg, g);
        } else this.mainlogger.warn("Package not found");
        });
    }
    flimpkg(json, pkg, g){
        switch(json.type){
            case "flim-portable":
                this.mainlogger.startFunc(`!flim-portable setup for ${pkg}`, async ctx=>{
                    let downloader:Downloader = new Downloader(json.url, json.filename, "  ");
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
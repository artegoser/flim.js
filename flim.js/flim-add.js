const { spawn } = require("child_process");
const logUpdate = require('log-update');
const chalk = require('chalk');
const fetch = require('node-fetch');
const logger = require("./modules/flim-logger")
const fs = require("fs");

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
    constructor(pkg, g){
        pkg = Array.isArray(pkg) ? pkg[0] : pkg;
        this.i = 0;
        this.spinframes = process.platform !== 'win32' ? ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] : ['-', '\\', '|', '/'];
        this.mainlogger = new logger();
        this.mainlogger.info(`flim version ${require("../package.json").version}`);
        this.mainlogger.info(`The global flim index doesn't work in flim yet`);
        this.index = {};
        try{
          this.mainlogger.info(`Try to read flim-index.json in local storage`);
          this.index = fs.readFileSync(`${__dirname}\\flim-index.json`);
          this.flimpkg(this.index[pkg], pkg, g);
        } catch{
          this.mainlogger.info(`Local index not found, using cdn.jsdelivr.net`);
          this.mainlogger.info(`Getting ${pkg} from https://cdn.jsdelivr.net/npm/${pkg}/flim.json`);
          fetch(`https://cdn.jsdelivr.net/npm/${pkg}/flim.json`)
            .then(res => res.json())
            .then(json => {
                this.index[pkg] = json;
                this.flimpkg(this.index[pkg], pkg, g);
            }).catch(err=> {
                this.mainlogger.warn("Fetch Error"); 
                this.mainlogger.info("Trying to get package.json"); 
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
            this.startFunc(`npm-node setup for ${pkg}`, async ctx=>{
                await new Promise((res)=>{
                    npm(pkg, g, res);
                });
                ctx.done();
            });
        } else if(json.type=="yarn-node"){
            this.startFunc(`npm-yarn setup for ${pkg}`, async ctx=>{
                await new Promise((res)=>{
                    yarn(pkg, res);
                });
                ctx.done();
            });
        } else{
            this.warn(`this type (${json.type}) is not supported`);
        }
    }
    async startFunc(title,func,brackets=true){
        if(brackets) console.log(chalk.yellow(`flim run:  ${title} {`));
        else console.log(chalk.yellow(`flim run:  ${title} `))
        const funclogger = new logger("  ");
        let time = setInterval(()=>{
            this.next_frame();
            logUpdate(chalk.yellow(`${this.frame} ${title}`));
        }, 150);
        function done(){
            clearInterval(time);
            if(brackets) logUpdate(chalk.yellow(`}`));
            else logUpdate();
            logUpdate.done();
        }

        let context = {
            warn:funclogger.warn,
            ok:funclogger.ok,
            done:done,
            info:funclogger.info,
            log:funclogger.log
        }
        await func(context);
    }
    get frame(){
        return this.spinframes[this.i];
    }
    next_frame(){
        this.i = ++this.i % this.spinframes.length;
    }
}

module.exports = {
    npm:npm,
    yarn:yarn,
    flim:flim
}
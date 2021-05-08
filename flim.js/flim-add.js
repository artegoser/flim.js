const { spawn } = require("child_process");
const logUpdate = require('log-update');
const chalk = require('chalk');
const fetch = require('node-fetch');

const fs = require("fs");

function npm(pkg, g){
        let xc = g ? ["i"].concat(pkg,'-g') : ["i"].concat(pkg);
        const sp = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', xc);

        sp.stdout.on("data", data => {
            console.log(`${data}`);
        });
        
        sp.stderr.on("data", data => {
            console.log(`\u001b[41mflim warn:\u001b[0m ${data}`);
        });
        
        sp.on('error', (error) => {
            console.log(`\u001b[41mflim warn:\u001b[0m ${error.message}`);
        });
}

function yarn(pkg){
    let xc = ["add"].concat(pkg)
    const sp = spawn(/^win/.test(process.platform) ? 'yarn.cmd' : 'yarn', xc);

    sp.stdout.on("data", data => {
        console.log(`${data}`);
    });
    
    sp.stderr.on("data", data => {
        console.log(`\u001b[41mflim warn:\u001b[0m ${data}`);
    });
    
    sp.on('error', (error) => {
        console.log(`\u001b[41mflim warn:\u001b[0m ${error.message}`);
    });
}

class flim{
    constructor(pkg, g){
        pkg = Array.isArray(pkg) ? pkg[0] : pkg;
        this.i = 0;
        this.spinframes = process.platform !== 'win32' ? ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] : ['-', '\\', '|', '/'];

        this.info(`flim version ${require("../package.json").version}`);
        this.info(`The global flim index doesn't work in flim yet`);
        this.index = {};
        try{
          this.info(`Try to read flim-index.json in local storage`);
          this.index = fs.readFileSync(`${__dirname}\\flim-index.json`);
          this.flimpkg(this.index[pkg], pkg, g);
        } catch{
          this.info(`Local index not found, using cdn.jsdelivr.net`);
          this.info(`Getting ${pkg} from https://cdn.jsdelivr.net/npm/${pkg}/flim.json`);
          fetch(`https://cdn.jsdelivr.net/npm/${pkg}/flim.json`)
            .then(res => res.json())
            .then(json => {
                this.index[pkg] = json;
                this.flimpkg(this.index[pkg], pkg, g);
            }).catch(err=> {throw new Error(err)});
        }
    }
    flimpkg(json, pkg, g){
        if(json.type=="flim"){
            this.warn("Sorry, flim type still in development")
            //later
        } else if(json.type=="npm-node"){
            this.startFunc(`npm-node setup for ${pkg}`, ctx=>{
                let xc = g ? ["i"].concat(pkg,'-g') : ["i"].concat(pkg);
                const sp = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', xc);
                sp.stdout.on("data", data => {
                    ctx.log(`  ${data}`.replace(/\n/g, "\n    "));
                });
                sp.stderr.on("data", data => {
                    ctx.log(`  \u001b[41mflim warn:\u001b[0m ${data}`.replace(/\n/g, "\n    "));
                });
                sp.on('error', (error) => {
                    ctx.log(`  \u001b[41mflim warn:\u001b[0m ${error.message}`.replace(/\n/g, "\n    "));
                });
                sp.on('exit', ()=>{
                    ctx.done();
                });
            });
        } else if(json.type=="yarn-node"){
            this.startFunc(`npm-yarn setup for ${pkg}`, ctx=>{
                let xc = g ? ["add"].concat(pkg) : ["add"].concat(pkg);
                const sp = spawn(/^win/.test(process.platform) ? 'yarn.cmd' : 'yarn', xc);
                sp.stdout.on("data", data => {
                    ctx.log(`  ${data}`.replace(/\n/g, "\n    "));
                });
                sp.stderr.on("data", data => {
                    ctx.log(`  \u001b[41mflim warn:\u001b[0m ${data}`.replace(/\n/g, "\n    "));
                });
                sp.on('error', (error) => {
                    ctx.log(`  \u001b[41mflim warn:\u001b[0m ${error.message}`.replace(/\n/g, "\n    "));
                });
                sp.on('exit', ()=>{
                    ctx.done();
                });
            });
        } else{
            this.warn(`this type (${json.type}) is not supported`)
        }
    }
    startFunc(title,func, brackets=true){
        if(brackets) console.log(chalk.yellow(`flim run:  ${title} {`));
        else console.log(chalk.yellow(`flim run:  ${title} `))
        let time = setInterval(()=>{
            this.next_frame();
            logUpdate(chalk.yellow(`${this.frame} ${title}`));
        }, 150);

        function warn(msg){
            logUpdate("  "+chalk.black.bgWhite(`${chalk.bgRed.white("flim warn:")} ${msg} `));
            logUpdate.done();
        }
        function ok(msg){
            logUpdate("  "+chalk.black.bgWhite(`${chalk.bgGreen.white("flim ok:  ")} ${msg} `));
            logUpdate.done();
        }
        function done(){
            clearInterval(time);
            if(brackets) logUpdate(chalk.yellow(`}`));
            else logUpdate();
            logUpdate.done();
        }
        function info(msg){
            logUpdate("  "+chalk.black.bgWhite(`${chalk.bgBlue.white("flim info:")} ${msg} `));
            logUpdate.done();
        }
        function log(msg){
            logUpdate(msg);
            logUpdate.done();
        }

        let context = {
            warn:warn,
            ok:ok,
            done:done,
            info:info,
            log:log
        }
        func(context);
    }
    warn(msg){
        logUpdate.stderr(chalk.black.bgWhite(`${chalk.bgRed.white("flim warn:")} ${msg} `));
        logUpdate.stderr.done();
    }
    info(msg){
        logUpdate(chalk.black.bgWhite(`${chalk.bgBlue.white("flim info:")} ${msg} `));
        logUpdate.done();
    }
    ok(msg){
        logUpdate(chalk.black.bgWhite(`${chalk.bgGreen.white("flim ok:  ")} ${msg} `));
        logUpdate.done();
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
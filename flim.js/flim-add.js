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

        try{
          this.info(`Try to read local-flim-index.json`);
          let data = fs.readFileSync(`${__dirname}\\flim-index.json`);
          //later//
        } catch{
          this.warn(`Local index not found, using cdn.jsdelivr.net`);
          this.info(`Getting ${pkg} from https://cdn.jsdelivr.net/npm/${pkg}/flim.json`);
          fetch(`https://cdn.jsdelivr.net/npm/${pkg}/flim.json`)
            .then(res => res.json())
            .then(json => {
                if(json.type=="flim"){
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
                        let xc = g ? ["i"].concat(pkg,'-g') : ["i"].concat(pkg);
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
            }).catch((err)=>{
                this.warn(`Fetch error: ${err}`);
            });
        }

        // this.startFunc("setup", ctx=>{
        //     ctx.ok("come back soon");
        //     setTimeout(()=>ctx.warn("flim package manager is not working yet"), 1000);
        //     setTimeout(()=>ctx.info("flim package manager will start working soon"), 2000);
        //     setTimeout(ctx.done, 3000);
        // });
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
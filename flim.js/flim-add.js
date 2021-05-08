const { spawn } = require("child_process");
const logUpdate = require('log-update');
const chalk = require('chalk');
const { start } = require("repl");

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
    constructor(){
        this.i = 0;
        this.spinframes = process.platform !== 'win32' ? ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] : ['-', '\\', '|', '/'];
        this.info(`flim version ${require("../package.json").version}`);
        this.startFunc("setup", ctx=>{
            ctx.ok("come back soon");
            setTimeout(()=>ctx.warn("flim package manager is not working yet"), 1000);
            setTimeout(()=>ctx.info("flim package manager will start working soon"), 2000);
            setTimeout(ctx.done, 3000);
        });
    }
    startFunc(title,func){
        console.log(chalk.yellow(`flim run:  ${title} {`));
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
            logUpdate(chalk.yellow(`}`));
            logUpdate.done();
        }
        function info(msg){
            logUpdate("  "+chalk.black.bgWhite(`${chalk.bgBlue.white("flim info:")} ${msg} `));
            logUpdate.done();
        }

        let context = {
            warn:warn,
            ok:ok,
            done:done,
            info:info
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
import * as chalk from 'chalk';
import * as logUpdate from 'log-update';

export class Logger{
    tab:string;
    spinframes:Array<string>;
    i:number;
    constructor(tab=""){
        this.tab = tab;
        this.i = 0;
        this.spinframes = process.platform !== 'win32' ? ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] : ['-', '\\', '|', '/'];
    }
    warn(msg){
        logUpdate(this.tab+chalk.black.bgWhite(`${chalk.bgRed.white("flim warn:")} ${msg} `));
        logUpdate.done();
    }
    info(msg){
        logUpdate(this.tab+chalk.black.bgWhite(`${chalk.bgBlue.white("flim info:")} ${msg} `));
        logUpdate.done();
    }
    ok(msg){
        logUpdate(this.tab+chalk.black.bgWhite(`${chalk.bgGreen.white("flim:     ")} ${msg} `));
        logUpdate.done();
    }
    log(msg){
        logUpdate(this.tab+msg);
        logUpdate.done();
    }
    async startFunc(title:string,func,addinf:any=false,brackets=true){
        if(brackets) console.log(chalk.yellow(`flim run:  ${title.replace("!","")} {`));
        let time = setInterval(()=>{
            this.next_frame();
            if(!title.startsWith("!")){
                if(addinf) logUpdate(chalk.yellow(`${this.tab}${this.frame} ${title} ${addinf()}`));
                else logUpdate(chalk.yellow(`${this.tab}${this.frame} ${title}`));
            }
        }, 150);
        function done(){
            clearInterval(time);
            if(brackets) logUpdate(chalk.yellow(`}`));
            logUpdate.done();
        }

        let context = {
            warn:this.warn,
            ok:this.ok,
            done:done,
            info:this.info,
            log:this.log
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
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
    warn(msg: string){
        logUpdate(this.tab+chalk.black.bgWhite(`${chalk.bgRed.white("flim warn:")} ${msg} `));
        logUpdate.done();
    }
    info(msg: string){
        logUpdate(this.tab+chalk.black.bgWhite(`${chalk.bgBlue.white("flim info:")} ${msg} `));
        logUpdate.done();
    }
    ok(msg: string){
        logUpdate(this.tab+chalk.black.bgWhite(`${chalk.bgGreen.white("flim:     ")} ${msg} `));
        logUpdate.done();
    }
    log(msg: string){
        logUpdate(this.tab+msg);
        logUpdate.done();
    }
    async startFunc(title:string,func,addinf:any=false,brackets=true){
        let self = this;
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

        function warn(msg: string){
            logUpdate(self.tab+'  '+chalk.black.bgWhite(`${chalk.bgRed.white("flim warn:")} ${msg} `));
            logUpdate.done();
        }
        function info(msg: string){
            logUpdate(self.tab+'  '+chalk.black.bgWhite(`${chalk.bgBlue.white("flim info:")} ${msg} `));
            logUpdate.done();
        }
        function ok(msg: string){
            logUpdate(self.tab+'  '+chalk.black.bgWhite(`${chalk.bgGreen.white("flim:     ")} ${msg} `));
            logUpdate.done();
        }
        function log(msg: string){
            logUpdate(self.tab+'  '+msg);
            logUpdate.done();
        }

        let context = {
            warn:warn,
            ok:ok,
            done:done,
            info:info,
            log:log
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
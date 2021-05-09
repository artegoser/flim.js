const chalk = require('chalk');
const logUpdate = require('log-update');

class Logger{
    constructor(tab=""){
        this.tab = tab;
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
        logUpdate(this.tab+chalk.black.bgWhite(`${chalk.bgGreen.white("flim ok:  ")} ${msg} `));
        logUpdate.done();
    }
    log(msg){
        logUpdate(this.tab+msg);
        logUpdate.done();
    }
}

module.exports = Logger;
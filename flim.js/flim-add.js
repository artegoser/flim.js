const { spawn } = require("child_process");

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
    //later
}

module.exports = {
    npm:npm,
    yarn:yarn,
    flim:flim
}
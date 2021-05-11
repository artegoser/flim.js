const fetch = require("node-fetch");
const fs = require("fs");
const Logger = require("./flim-logger");

class Downloader{
  constructor(durl, path){
    this.Logger = new Logger("  ");
    this.url = new URL(durl);
    switch(this.url.protocol){
      case "http:":
      case "https:":
        this.Logger.startFunc(`Downloading ${this.url.pathname}`, async ctx=>{
          await this.downloadHttp(path);
          ctx.done();
        }, ()=>{
          return (this.bytes_written/this.bytes*100).toFixed(2)+"%";//this.bytes_written+"/"+this.bytes;
        }, false);
        break;
      default:
        this.Logger.warn(`"${this.url.protocol.slice(0, -1)}" protocol is not supported in flim`);
        break;
    }
  }
  async downloadHttp(path) {
      const res = await fetch(this.url.href);
      this.bytes = res.headers.get('content-length');
      const fileStream = fs.createWriteStream(path);
      let bytescheck = setInterval(()=>{
        this.bytes_written = fileStream.bytesWritten;
      }, 0);
      await new Promise((resolve, reject) => {
          res.body.pipe(fileStream);
          res.body.on("error", reject);
          fileStream.on("finish", ()=>{
            this.Logger.ok(`Downloaded ${path}`);
            clearInterval(bytescheck);
            resolve();
          });
        });
      }
}
module.exports = Downloader
import * as fetch from "node-fetch";
import { Logger } from "./flim-logger";
import * as fs from "fs";
import * as events from 'events';

export class Downloader{
  Logger:Logger;
  url:URL;
  bytes_written:number;
  bytes:number;
  ev:events;
  constructor(durl:string, path:string, tabs:string=""){
    this.ev = new events.EventEmitter();
    this.Logger = new Logger(tabs);
    this.url = new URL(durl);
    switch(this.url.protocol){
      case "http:":
      case "https:":
        this.Logger.startFunc(`Downloading ${path}`, async ctx=>{
          await this.downloadHttp(path);
          ctx.done();
          this.ev.emit("done");
        }, ()=>{
          return (this.bytes_written/this.bytes*100).toFixed(2)+"%";
        }, false);
        break;
      default:
        this.Logger.warn(`"${this.url.protocol.slice(0, -1)}" protocol is not supported in flim`);
        break;
    }
  }
  async downloadHttp(path:string) {
      const res = await fetch(this.url.href);
      this.bytes = res.headers.get('content-length');
      const fileStream = fs.createWriteStream(path);
      let bytescheck = setInterval(()=>{
        this.bytes_written = fileStream.bytesWritten;
      }, 0);
      await new Promise<void>((resolve, reject) => {
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
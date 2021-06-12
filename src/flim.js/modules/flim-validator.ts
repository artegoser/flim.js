export function validator(pkg) {
    if(!(pkg.author||pkg.name||pkg.version||pkg.type)) return false;
    switch(pkg.type){
        case "flim-portable":
            if(pkg.url&&pkg.filename) return true; 
            else return false;
        default:
            return false;
    }
}
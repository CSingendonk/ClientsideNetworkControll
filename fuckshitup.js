// this can really fuck shit up

const fuckshitup = (what,how,why,where,when,who) => { 
        try {
        const that = Array.from(Object.keys(who)); 
          that.forEach((these) => {
                who[these] = null;
                who.constructor[these] = who.constructor[these] ? null : 'fuck';
            })
        } catch (rrreo) {
        console.trace(who, rrreo);
}
    Array.from(Object.getOwnPropertyNames(who)).forEach((nameof) => { 

    try { 
    who.prototype[nameof] = null;
    } catch (rorre) {
        console.info(rorre); 
    }
    try {
        globalThis[who.prototype.name][nameof] = null;      
                     } catch (reror) {
        who[nameof] = null;
                    }
})}
const fuckitup = (() => {
if (Atomics.xor === null) {
    return;
}
fuckshitup(null,null,null,null,null,Atomics);
fuckshitup(null,null,null,null,null,performance);
fuckshitup(null,null,null,null,null,Reflect);
})()

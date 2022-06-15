"use strict";
/**
 * 
 * @returns function createWaiter(waiterName) which returns a waiter object
 * 
 * use:
 * var myWaiter = createWaiter('my Waiter');
 * myWaiter.condition = function(){...}; true/false
 * myWaiter.doRest = function(){...};
 * myWaiter.doError = function(){...};
 * console.log('before call of waiter ' +myWaiter.name);
 * myWaiter.start();
 * console.log('after call of waiter ' +myWaiter.name);
 */

 var default_waiter = {
    name: 'defaultWaiter',
    interval: 200, // check every 200ms
    max_count: 10, // 10*200ms = 10*0,2s = 2s
    condition: function () {
        return false
    }, //default: stop only if index === max_count
    doRest: function (){
        console.log(this.name + ': do the rest');
    },
    doError: function(){
        console.log(this.name + ': counter limit exceeded');
    },
    
    index: 0,
    waiter: function(okFunc, errorFunc){
        var that = this;
        // console.log(that);
        // console.log('okFunc, errorFunc', okFunc, errorFunc);
        var pr = new Promise((resolve, reject)=>{
            // console.log('resolve reject', resolve, reject);
            var stopKey = setInterval(function () {
                if (that.condition()) {
                    clearInterval(stopKey);
                    resolve();
                } else {
                    that.index++;
                    console.log(that.name + ' ' + that.index);
                    if (that.max_count > 0 && that.index >= that.max_count) {
                        clearInterval(stopKey);
                        // reject(new Error('errortext for reject'));
                        reject();
                    }
                }
            }, that.interval); // interval=200 means: check every 200ms
        }).then(okFunc).catch(errorFunc);
        return pr;
    },
    start: async function () {
        // var that = this;
        // await that.waiter(that.doRest, that.doError);
        await this.waiter(this.doRest, this.doError);
    }
};

export default function createWaiter(newname) {
    var newWaiter = Object.create(default_waiter);
    newWaiter.name = newname;
    return newWaiter;
};
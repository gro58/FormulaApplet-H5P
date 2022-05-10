"use strict";
/**
 * 
 * @returns function createWaiter() which returns a waiter object
 * 
 * 
 */
export default function createWaiter() {
    var default_waiter = {
        name: 'defaultWaiter',
        interval: 200, // interval=200 means: check every 200ms
        max_count: 10,
        condition: function () {
            return false
        }, //default: stop only if index === max_count
        notFulfilled: function () {
            console.log(this.name + ' not fulfilled')
        },
        doTheRest: function () {
            console.log(this.name + ' - do the Rest')
        },
        index: 0,
        increase: function () {
            this.index++;
            console.log(this.name + ': ' + this.index);
        },
        start: async function () {
            console.log(this.name + ' started');
            var self = this; //https://stackoverflow.com/questions/24634484/javascript-self-vs-this#24634723
            var stopKey = setInterval(function () {
                if (self.condition()) {
                    // condition fulfilled, do the rest
                    clearInterval(stopKey);
                    self.doTheRest();
                } else {
                    self.increase();
                    // max_count = 0: count to infinity
                    if (self.max_count > 0 && self.index >= self.max_count) {
                        // index reached max_count; do notFulfilled
                        clearInterval(stopKey);
                        self.notFulfilled();
                    }
                }
            }, self.interval); // interval=200 means: check every 200ms
        }
    };

    var newWaiter = Object.create(default_waiter);
    return newWaiter;
};
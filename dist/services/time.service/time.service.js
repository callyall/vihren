"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeService = void 0;
const rxjs_1 = require("rxjs");
const injectable_decorator_1 = require("../../decorators/injectable.decorator/injectable.decorator");
/**
 * A service that provides time related functions.
 */
let TimeService = class TimeService {
    /**
     * Set a timeout.
     * @param ms the time in milliseconds
     */
    sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }
    /**
     * Set a timeout.
     *
     * This will return an observable that will emit a value after the timeout.
     *
     * @param ms the time in milliseconds
     */
    sleepRx(ms) {
        return new rxjs_1.Observable((subscriber) => {
            const timeout = setTimeout(() => subscriber.next(), ms);
            return () => clearTimeout(timeout);
        });
    }
    /**
     * Create an interval.
     *
     * This will return an observable that will emit a value every `ms` milliseconds.
     *
     * @param ms the time in milliseconds.
     * @param scheduler an optional scheduler.
     */
    interval(ms, scheduler) {
        return (0, rxjs_1.interval)(ms, scheduler);
    }
};
exports.TimeService = TimeService;
exports.TimeService = TimeService = __decorate([
    (0, injectable_decorator_1.Injectable)({ shared: true })
], TimeService);
//# sourceMappingURL=time.service.js.map
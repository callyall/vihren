"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventCallbackSetupFunction = exports.Event = exports.EVENT_METADATA_KEY = void 0;
const callback_decorator_1 = require("../callback.decorator/callback.decorator");
const rxjs_1 = require("rxjs");
exports.EVENT_METADATA_KEY = 'method:event';
/**
 * Decorator to define a DOM event listener
 */
const Event = (args) => (target, propertyKey) => {
    (0, callback_decorator_1.callback)({
        callback: propertyKey,
        key: exports.EVENT_METADATA_KEY,
        data: args
    }, target.constructor, propertyKey);
};
exports.Event = Event;
/**
 * The logic that subscribes to the event and calls the callback method.
 *
 * This will be called internally, and you will not need to call it yourself.
 */
const eventCallbackSetupFunction = (metadata, instance) => {
    var _a;
    let observable = (0, rxjs_1.fromEvent)(instance.element, metadata.data.type)
        .pipe((0, rxjs_1.filter)((event) => event.target.matches(metadata.data.selector)));
    if ((_a = metadata.data.options) === null || _a === void 0 ? void 0 : _a.debounce) {
        observable = observable.pipe((0, rxjs_1.debounce)(() => { var _a; return (0, rxjs_1.interval)((_a = metadata.data.options) === null || _a === void 0 ? void 0 : _a.debounce); }));
    }
    return observable.subscribe((event) => instance.instance[metadata.callback](event));
};
exports.eventCallbackSetupFunction = eventCallbackSetupFunction;
//# sourceMappingURL=event.decorator.js.map
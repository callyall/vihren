"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentEventCallbackSetupFunction = exports.ComponentEvent = exports.COMPONENT_EVENT_METADATA_KEY = void 0;
const callback_decorator_1 = require("../callback.decorator/callback.decorator");
const rxjs_1 = require("rxjs");
const componentEventEmitter_1 = require("../../services/eventEmitter/componentEventEmitter");
exports.COMPONENT_EVENT_METADATA_KEY = 'method:componentEvent';
/**
 * Decorator to define a component event listener
 */
const ComponentEvent = (args) => (target, propertyKey) => {
    (0, callback_decorator_1.callback)({
        callback: propertyKey,
        key: exports.COMPONENT_EVENT_METADATA_KEY,
        data: args
    }, target.constructor, propertyKey);
};
exports.ComponentEvent = ComponentEvent;
/**
 * The logic that subscribes to the event emitter and calls the callback method.
 *
 * This will be called internally, and you will not need to call it yourself.
 */
const componentEventCallbackSetupFunction = (metadata, instance, iocContainer) => {
    var _a;
    const eventEmitter = iocContainer.resolve(componentEventEmitter_1.ComponentEventEmitter);
    let observable = eventEmitter.on(metadata.data.type);
    if ((_a = metadata.data.options) === null || _a === void 0 ? void 0 : _a.debounce) {
        observable = observable.pipe((0, rxjs_1.debounce)(() => { var _a; return (0, rxjs_1.interval)((_a = metadata.data.options) === null || _a === void 0 ? void 0 : _a.debounce); }));
    }
    return observable.subscribe((eventPayload) => instance.instance[metadata.callback](eventPayload));
};
exports.componentEventCallbackSetupFunction = componentEventCallbackSetupFunction;
//# sourceMappingURL=componentEvent.decorator.js.map
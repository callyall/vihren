"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicProperty = exports.DYNAMIC_PROPERTY_UPDATE_EVENT = void 0;
exports.DYNAMIC_PROPERTY_UPDATE_EVENT = 'dynamicPropertyUpdate';
const DynamicProperty = () => (target, property) => {
    if (typeof target['render'] != 'function') {
        throw new Error(`Property ${property} cannot be dynamic if the component is not dynamic`);
    }
    let storedValue;
    return {
        set: function (value) {
            storedValue = value;
            const event = new CustomEvent(exports.DYNAMIC_PROPERTY_UPDATE_EVENT, { detail: { component: this } });
            document.dispatchEvent(event);
        },
        get: function () {
            return storedValue;
        },
        enumerable: true,
        configurable: true
    };
};
exports.DynamicProperty = DynamicProperty;
//# sourceMappingURL=dynamicProperty.decorator.js.map
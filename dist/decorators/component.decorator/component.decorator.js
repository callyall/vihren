"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifecycleHook = exports.Component = exports.COMPONENT_METADATA_KEY = void 0;
const injectable_decorator_1 = require("../injectable.decorator/injectable.decorator");
exports.COMPONENT_METADATA_KEY = 'ioc:component';
const Component = (args) => (target) => {
    const metadata = (0, injectable_decorator_1.getInjectableMetadata)(target);
    metadata.selector = args.selector;
    metadata.template = args.template;
    metadata.lifecycleHooks = Object.values(LifecycleHook).filter((hook) => typeof target.prototype[hook] == 'function');
    metadata.isDynamic = typeof target.prototype['render'] == 'function';
    if (metadata.template && metadata.isDynamic) {
        throw new Error(`Component ${target.name} cannot have both a template and be dynamic`);
    }
    Reflect.defineMetadata(exports.COMPONENT_METADATA_KEY, metadata, target);
};
exports.Component = Component;
var LifecycleHook;
(function (LifecycleHook) {
    LifecycleHook["OnInit"] = "onInit";
    LifecycleHook["OnChange"] = "onChange";
    LifecycleHook["OnDestroy"] = "onDestroy";
})(LifecycleHook || (exports.LifecycleHook = LifecycleHook = {}));
//# sourceMappingURL=component.decorator.js.map
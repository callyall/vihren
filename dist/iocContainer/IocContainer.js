"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IocContainer = void 0;
const component_decorator_1 = require("../decorators/component.decorator/component.decorator");
const injectable_decorator_1 = require("../decorators/injectable.decorator/injectable.decorator");
const argumentModifier_decorator_1 = require("../decorators/argumentModifier.decorator/argumentModifier.decorator");
class IocContainer {
    constructor() {
        this.values = new Map();
        this.factories = new Map();
        this.argumentModifiers = new Map();
    }
    registerValue(key, value) {
        this.values.set(key, value);
    }
    registerFactory(key, factoryFunction) {
        this.factories.set(key, factoryFunction);
    }
    resolve(target, args, failIfNoShared = false) {
        var _a;
        const isClass = target instanceof Function;
        const key = isClass ? target.name : target;
        if (failIfNoShared && !this.values.has(key)) {
            throw new Error(`No shared instance found for key ${key}`);
        }
        const metadata = isClass
            ? ((_a = Reflect.getMetadata(injectable_decorator_1.INJECTABLE_METADATA_KEY, target)) !== null && _a !== void 0 ? _a : Reflect.getMetadata(component_decorator_1.COMPONENT_METADATA_KEY, target))
            : null;
        if (metadata && metadata.shared && !this.values.has(key) && !this.factories.has(key)) {
            throw new Error(`No shared instance found for key ${key}`);
        }
        if (this.values.has(key)) {
            return this.values.get(key);
        }
        if (metadata && metadata.params) {
            args = this.prepareArgs(target, metadata, args !== null && args !== void 0 ? args : new Map());
        }
        if (this.factories.has(key)) {
            const factory = this.factories.get(key);
            const instance = factory(args);
            if (metadata && metadata.shared) {
                this.values.set(key, instance);
            }
            return instance;
        }
        if (!isClass) {
            throw new Error(`No registration found for key ${key}`);
        }
        return this.defaultFactory(target, metadata, args);
    }
    registerArgumentModifier(key, modifierFunction) {
        this.argumentModifiers.set(key, modifierFunction);
    }
    defaultFactory(target, metadata, args) {
        var _a;
        if (!((_a = metadata === null || metadata === void 0 ? void 0 : metadata.params) === null || _a === void 0 ? void 0 : _a.length)) {
            return new target.prototype.constructor();
        }
        const params = metadata.params.map(param => {
            if (args === null || args === void 0 ? void 0 : args.has(param.name)) {
                return args.get(param.name);
            }
            if (this.values.has(param.name)) {
                return this.values.get(param.name);
            }
            if (this.factories.has(param.name)) {
                const factory = this.factories.get(param.name);
                return factory(args);
            }
            if (this.values.has(param.type.name)) {
                return this.values.get(param.type.name);
            }
            if (this.factories.has(param.type.name)) {
                const factory = this.factories.get(param.type.name);
                return factory(args);
            }
            if ([String.name, Number.name, Boolean.name].includes(param.type.name)) {
                throw new Error(`No value found for parameter ${param.name}`);
            }
            return this.resolve(param.type, args);
        });
        return new target.prototype.constructor(...params);
    }
    prepareArgs(target, metadata, args) {
        var _a;
        const modifierMetadata = Reflect.getMetadata(argumentModifier_decorator_1.ARGUMENT_MODIFIER_METADATA_KEY, target);
        if (!modifierMetadata) {
            return args;
        }
        (_a = metadata === null || metadata === void 0 ? void 0 : metadata.params) === null || _a === void 0 ? void 0 : _a.forEach((param, index) => {
            if (!modifierMetadata.has(index)) {
                return;
            }
            const argumentModifierMetadata = modifierMetadata.get(index);
            if (!this.argumentModifiers.has(argumentModifierMetadata.key)) {
                throw new Error(`No argument modifier function found for key ${argumentModifierMetadata.key}`);
            }
            const modifierFunction = this.argumentModifiers.get(argumentModifierMetadata.key);
            args = modifierFunction(argumentModifierMetadata, param, args);
        });
        return args;
    }
}
exports.IocContainer = IocContainer;
//# sourceMappingURL=IocContainer.js.map
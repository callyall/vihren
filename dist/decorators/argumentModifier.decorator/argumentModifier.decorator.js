"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.argumentModifier = exports.ARGUMENT_MODIFIER_METADATA_KEY = void 0;
require("reflect-metadata");
exports.ARGUMENT_MODIFIER_METADATA_KEY = 'argument:modifier';
const argumentModifier = (metadata, target, parameterIndex) => {
    var _a;
    const metadataMap = (_a = Reflect.getMetadata(exports.ARGUMENT_MODIFIER_METADATA_KEY, target)) !== null && _a !== void 0 ? _a : new Map();
    metadataMap.set(parameterIndex, metadata);
    Reflect.defineMetadata(exports.ARGUMENT_MODIFIER_METADATA_KEY, metadataMap, target);
};
exports.argumentModifier = argumentModifier;
//# sourceMappingURL=argumentModifier.decorator.js.map
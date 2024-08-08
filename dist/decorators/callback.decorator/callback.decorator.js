"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callback = exports.CALLBACK_METADATA_KEY = void 0;
require("reflect-metadata");
exports.CALLBACK_METADATA_KEY = 'method:callback';
const callback = (metadata, target, propertyKey) => {
    var _a, _b;
    const metadataMap = (_a = Reflect.getMetadata(exports.CALLBACK_METADATA_KEY, target)) !== null && _a !== void 0 ? _a : new Map();
    const methodMetadata = (_b = metadataMap.get(propertyKey)) !== null && _b !== void 0 ? _b : [];
    methodMetadata.push(metadata);
    metadataMap.set(propertyKey, methodMetadata);
    Reflect.defineMetadata(exports.CALLBACK_METADATA_KEY, metadataMap, target);
};
exports.callback = callback;
//# sourceMappingURL=callback.decorator.js.map
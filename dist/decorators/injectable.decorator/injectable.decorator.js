"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInjectableMetadata = exports.Injectable = exports.INJECTABLE_METADATA_KEY = void 0;
require("reflect-metadata");
exports.INJECTABLE_METADATA_KEY = 'ioc:injectable';
const Injectable = (args) => (target) => {
    Reflect.defineMetadata(exports.INJECTABLE_METADATA_KEY, (0, exports.getInjectableMetadata)(target, args), target);
};
exports.Injectable = Injectable;
const getInjectableMetadata = (target, args) => {
    const metadata = args || { shared: false };
    const paramTypes = Reflect.getMetadata('design:paramtypes', target);
    if (!paramTypes) {
        return metadata;
    }
    let result = /constructor\s*\([^)]*\)/.exec(target.toString());
    metadata.params = result[0]
        .replace(/constructor\s*\(/, '')
        .replace(')', '')
        .replace(/\s+/, '')
        .split(',')
        .filter((param) => param.trim() !== '')
        .map((param, i) => ({
        name: param.trim().split(' ')[0],
        type: paramTypes[i]
    }));
    return metadata;
};
exports.getInjectableMetadata = getInjectableMetadata;
//# sourceMappingURL=injectable.decorator.js.map
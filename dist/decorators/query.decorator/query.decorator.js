"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveElementCollection = exports.ActiveElementReference = exports.queryModifierFunction = exports.Query = exports.QUERY_METADATA_KEY = exports.ROOT_ELEMENT_KEY = void 0;
const argumentModifier_decorator_1 = require("../argumentModifier.decorator/argumentModifier.decorator");
exports.ROOT_ELEMENT_KEY = 'rootElement';
exports.QUERY_METADATA_KEY = 'argument:query';
const Query = (args) => (target, propertyKey, parameterIndex) => {
    var _a;
    const queryMetadata = {
        selector: args === null || args === void 0 ? void 0 : args.selector,
        multiple: (_a = args === null || args === void 0 ? void 0 : args.multiple) !== null && _a !== void 0 ? _a : false,
        parameterIndex,
    };
    if (queryMetadata.selector === undefined && queryMetadata.multiple) {
        throw new Error('Query cannot expect multiple results without a selector');
    }
    const metadata = {
        key: exports.QUERY_METADATA_KEY,
        data: queryMetadata,
    };
    (0, argumentModifier_decorator_1.argumentModifier)(metadata, target, parameterIndex);
};
exports.Query = Query;
const queryModifierFunction = (argumentMetadata, paramMetadata, args) => {
    if (!args.has(exports.ROOT_ELEMENT_KEY)) {
        throw new Error('No root element found');
    }
    const rootElement = args.get(exports.ROOT_ELEMENT_KEY);
    const queryMetadata = argumentMetadata.data;
    if (paramMetadata.type.name === ActiveElementReference.name) {
        if (!queryMetadata.selector) {
            throw new Error('ActiveElementReference cannot be used without a selector');
        }
        if (queryMetadata.multiple) {
            throw new Error('ActiveElementReference cannot be used with multiple results');
        }
        args.set(paramMetadata.name, new ActiveElementReference(rootElement, queryMetadata.selector));
        return args;
    }
    if (paramMetadata.type.name === ActiveElementCollection.name) {
        if (!queryMetadata.selector) {
            throw new Error('ActiveElementCollection cannot be used without a selector');
        }
        if (!queryMetadata.multiple) {
            throw new Error('ActiveElementCollection cannot be used with a single result');
        }
        args.set(paramMetadata.name, new ActiveElementCollection(rootElement, queryMetadata.selector));
        return args;
    }
    args.set(paramMetadata.name, queryMetadata.selector
        ? (queryMetadata.multiple
            ? rootElement.querySelectorAll(queryMetadata.selector)
            : rootElement.querySelector(queryMetadata.selector))
        : rootElement);
    return args;
};
exports.queryModifierFunction = queryModifierFunction;
class ActiveElementReference {
    constructor(rootElement, selector) {
        this.rootElement = rootElement;
        this.selector = selector;
    }
    get() {
        return this.rootElement.querySelector(this.selector);
    }
}
exports.ActiveElementReference = ActiveElementReference;
class ActiveElementCollection {
    constructor(rootElement, selector) {
        this.rootElement = rootElement;
        this.selector = selector;
    }
    get() {
        return Array.from(this.rootElement.querySelectorAll(this.selector));
    }
}
exports.ActiveElementCollection = ActiveElementCollection;
//# sourceMappingURL=query.decorator.js.map
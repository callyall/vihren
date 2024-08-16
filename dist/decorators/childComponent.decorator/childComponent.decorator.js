"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildComponentCollection = exports.ChildComponentReference = exports.childComponentModifierFunction = exports.ChildComponent = exports.CHILD_COMPONENT_METADATA_KEY = void 0;
const componentContainer_1 = require("../../componentContainer/componentContainer");
const argumentModifier_decorator_1 = require("../argumentModifier.decorator/argumentModifier.decorator");
const query_decorator_1 = require("../query.decorator/query.decorator");
exports.CHILD_COMPONENT_METADATA_KEY = 'childComponent:metadata';
/**
 * Decorator to inject a child component reference into a component
 */
const ChildComponent = (args) => (target, propertyKey, parameterIndex) => {
    var _a;
    const metadata = {
        key: exports.CHILD_COMPONENT_METADATA_KEY,
        data: {
            selector: args.selector,
            componentSelector: (_a = args.componentSelector) !== null && _a !== void 0 ? _a : args.selector,
            parameterIndex,
        },
    };
    (0, argumentModifier_decorator_1.argumentModifier)(metadata, target, parameterIndex);
};
exports.ChildComponent = ChildComponent;
/**
 * The logic that retrieves the child component instances and passes them to the component
 *
 * This will be called internally, and you will not need to call it yourself
 */
const childComponentModifierFunction = (argumentMetadata, paramMetadata, args) => {
    if (!args.has(query_decorator_1.ROOT_ELEMENT_KEY)) {
        throw new Error('No root element found');
    }
    if (!args.has(componentContainer_1.ComponentContainer.COMPONENT_CONTAINER_KEY)) {
        throw new Error('No component container found');
    }
    const rootElement = args.get(query_decorator_1.ROOT_ELEMENT_KEY);
    const componentContainer = args.get(componentContainer_1.ComponentContainer.COMPONENT_CONTAINER_KEY);
    args.set(paramMetadata.name, constructReference(paramMetadata.type === ChildComponentCollection, argumentMetadata.data.selector, argumentMetadata.data.componentSelector, rootElement, componentContainer));
    return args;
};
exports.childComponentModifierFunction = childComponentModifierFunction;
const constructReference = (multiple, selector, componentSelector, rootElement, componentContainer) => {
    if (multiple) {
        return new ChildComponentCollection(rootElement, selector, componentSelector, componentContainer);
    }
    return multiple
        ? new ChildComponentCollection(rootElement, selector, componentSelector, componentContainer)
        : new ChildComponentReference(rootElement, selector, componentSelector, componentContainer);
};
class AbstractComponentReference {
    constructor(rootElement, selector, componentSelector, componentContainer) {
        this.rootElement = rootElement;
        this.selector = selector;
        this.componentSelector = componentSelector;
        this.componentContainer = componentContainer;
    }
    getComponentInstance(element) {
        const instanceId = element.getAttribute('instance');
        if (!instanceId) {
            throw new Error('Instance id not found');
        }
        const instances = this.componentContainer.getComponentInstancesBySelector(this.componentSelector);
        return instances.get(instanceId);
    }
}
/**
 * Dynamic reference to a child component.
 */
class ChildComponentReference extends AbstractComponentReference {
    constructor(rootElement, selector, componentSelector, componentContainer) {
        super(rootElement, selector, componentSelector, componentContainer);
    }
    /**
     * Get the child component.
     */
    get() {
        const element = this.rootElement.querySelector(this.selector);
        if (!element) {
            throw new Error(`Element with selector ${this.selector} not found`);
        }
        return this.getComponentInstance(element);
    }
}
exports.ChildComponentReference = ChildComponentReference;
/**
 * Dynamic reference to a collection of child components.
 */
class ChildComponentCollection extends AbstractComponentReference {
    constructor(rootElement, selector, componentSelector, componentContainer) {
        super(rootElement, selector, componentSelector, componentContainer);
    }
    /**
     * Get all child components.
     */
    get() {
        const elements = this.rootElement.querySelectorAll(this.selector);
        if (!elements.length) {
            throw new Error(`Element with selector ${this.selector} not found`);
        }
        return Array.from(elements).map((element) => {
            const instance = this.getComponentInstance(element);
            if (!instance) {
                throw new Error(`Instance for element ${element.outerHTML} not found`);
            }
            return instance;
        });
    }
}
exports.ChildComponentCollection = ChildComponentCollection;
//# sourceMappingURL=childComponent.decorator.js.map
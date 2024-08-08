"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentContainer = void 0;
const mutation_interface_1 = require("../interfaces/mutation.interface");
const component_decorator_1 = require("../decorators/component.decorator/component.decorator");
const query_decorator_1 = require("../decorators/query.decorator/query.decorator");
const callback_decorator_1 = require("../decorators/callback.decorator/callback.decorator");
class ComponentContainer {
    constructor(root, iocContainer, changeDetector) {
        this.root = root;
        this.iocContainer = iocContainer;
        this.changeDetector = changeDetector;
        this.components = new Map();
        this.instances = new Map();
        this.callbackSetupFunctions = new Map();
        this.initComponents();
        this.$removedObserver = this
            .changeDetector
            .onRemoved()
            .subscribe({
            next: (mutation) => {
                const affectedComponents = this.getAffectedComponentData(mutation);
                for (let { selector, components, metadata } of affectedComponents) {
                    this.onRemoved(mutation, selector, components, metadata);
                }
            },
            complete: () => this.onDestroy(),
        });
        this.$addedObserver = this
            .changeDetector
            .onAdded()
            .subscribe({
            next: (mutation) => {
                const affectedComponents = this.getAffectedComponentData(mutation);
                for (let { selector, components, metadata } of affectedComponents) {
                    this.onAdded(mutation, selector, components, metadata);
                }
            },
        });
        this.$updatedObserver = this
            .changeDetector
            .onUpdated()
            .subscribe({
            next: (mutation) => {
                const affectedComponents = this.getAffectedComponentData(mutation);
                for (let { selector, components, metadata } of affectedComponents) {
                    this.onUpdated(mutation, selector, components, metadata);
                }
            },
        });
    }
    registerComponent(constructor) {
        const metadata = Reflect.getMetadata(component_decorator_1.COMPONENT_METADATA_KEY, constructor);
        const callbackMetadata = Reflect.getMetadata(callback_decorator_1.CALLBACK_METADATA_KEY, constructor);
        if (!metadata) {
            throw new Error('Component metadata not found');
        }
        const componentData = { constructor, metadata, callbackMetadata };
        this.components.set(metadata.selector, componentData);
        this.initComponent(componentData);
    }
    registerCallbackSetupFunction(key, callbackSetupFunction) {
        this.callbackSetupFunctions.set(key, callbackSetupFunction);
    }
    getComponentInstancesBySelector(selector) {
        var _a;
        return (_a = this.instances.get(selector)) !== null && _a !== void 0 ? _a : new Map();
    }
    initComponents() {
        for (let componentData of this.components.values()) {
            this.initComponent(componentData);
        }
    }
    initComponent(componentData) {
        var _a;
        let i = 0;
        for (let element of this.root.querySelectorAll(componentData.metadata.selector)) {
            let instances = this.instances.get(componentData.metadata.selector);
            if (!instances) {
                instances = new Map();
                this.instances.set(componentData.metadata.selector, instances);
            }
            let instanceId = element.getAttribute('instance');
            if (instanceId) {
                if (!Array.from(instances.keys()).includes(instanceId)) {
                    throw new Error(`Invalid instance id ${instanceId} for component ${componentData.metadata.selector}`);
                }
                continue;
            }
            const instance = this.iocContainer.resolve(componentData.constructor, this.constructArgs(element));
            if (componentData.metadata.lifecycleHooks.includes(component_decorator_1.LifecycleHook.OnInit)) {
                instance.onInit();
            }
            instanceId = `${componentData.constructor.name}-${new Date().getTime()}-${i}`;
            i++;
            const subscriptions = [];
            const instanceObject = { instance, element: element, subscriptions };
            for (let [_, metadataArr] of (_a = componentData.callbackMetadata) !== null && _a !== void 0 ? _a : []) {
                metadataArr.forEach((metadata) => {
                    const callbackSetupFunction = this.callbackSetupFunctions.get(metadata.key);
                    if (!callbackSetupFunction) {
                        throw new Error(`Callback setup function not found for key ${metadata.key}`);
                    }
                    subscriptions.push(callbackSetupFunction(metadata, instanceObject, this.iocContainer));
                });
            }
            element.setAttribute('instance', instanceId);
            instances.set(instanceId, instanceObject);
        }
    }
    constructArgs(element) {
        const args = element.dataset;
        const result = new Map();
        for (let [key, value] of Object.entries(args)) {
            result.set(key, value);
        }
        result.set(query_decorator_1.ROOT_ELEMENT_KEY, element);
        result.set(ComponentContainer.COMPONENT_CONTAINER_KEY, this);
        return result;
    }
    onRemoved(mutation, selector, components, metadata) {
        var _a;
        for (let i = 0; i < components.length; i++) {
            const instance = components[i];
            if (instance.element === mutation.element) {
                this.destroyInstance(instance, metadata);
                const instanceId = instance.element.getAttribute('instance');
                (_a = this.instances.get(selector)) === null || _a === void 0 ? void 0 : _a.delete(instanceId);
            }
            if (metadata.lifecycleHooks.includes(component_decorator_1.LifecycleHook.OnChange)) {
                instance.instance.onChange(mutation);
            }
        }
    }
    onAdded(mutation, selector, components, metadata) {
        for (let i = 0; i < components.length; i++) {
            const instance = components[i];
            if (metadata.lifecycleHooks.includes(component_decorator_1.LifecycleHook.OnChange)) {
                instance.instance.onChange(mutation);
            }
        }
        this.initComponents();
    }
    onUpdated(mutation, selector, components, metadata) {
        for (let i = 0; i < components.length; i++) {
            const instance = components[i];
            if (metadata.lifecycleHooks.includes(component_decorator_1.LifecycleHook.OnChange)) {
                instance.instance.onChange(mutation);
            }
        }
    }
    getAffectedComponentData(mutation) {
        var _a, _b;
        const found = [];
        for (let [selector, { metadata }] of this.components) {
            const instances = Array.from((_b = (_a = this.instances.get(selector)) === null || _a === void 0 ? void 0 : _a.values()) !== null && _b !== void 0 ? _b : []);
            found.push({
                selector,
                components: instances
                    .filter((instance) => {
                    return instance.element === mutation.element
                        || instance.element.contains(mutation.element)
                        || (mutation.type == mutation_interface_1.MutationType.Removed
                            && (instance.element.contains(mutation.target)
                                || instance.element === mutation.target));
                }),
                metadata,
            });
        }
        return found;
    }
    onDestroy() {
        for (let [selector, componentData] of this.components) {
            const instances = this.instances.get(selector);
            instances === null || instances === void 0 ? void 0 : instances.forEach((instance) => this.destroyInstance(instance, componentData.metadata));
            instances === null || instances === void 0 ? void 0 : instances.clear();
        }
        this.$removedObserver.unsubscribe();
        this.$addedObserver.unsubscribe();
        this.$updatedObserver.unsubscribe();
    }
    destroyInstance(instance, componentMetadata) {
        instance.subscriptions.forEach((subscription) => subscription.unsubscribe());
        if (componentMetadata.lifecycleHooks.includes(component_decorator_1.LifecycleHook.OnDestroy)) {
            instance.instance.onDestroy();
        }
    }
}
exports.ComponentContainer = ComponentContainer;
ComponentContainer.COMPONENT_CONTAINER_KEY = 'componentContainer';
//# sourceMappingURL=componentContainer.js.map
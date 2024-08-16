"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentContainer = void 0;
const rxjs_1 = require("rxjs");
const mutation_interface_1 = require("../interfaces/mutation.interface");
const component_decorator_1 = require("../decorators/component.decorator/component.decorator");
const query_decorator_1 = require("../decorators/query.decorator/query.decorator");
const callback_decorator_1 = require("../decorators/callback.decorator/callback.decorator");
const dynamicProperty_decorator_1 = require("../decorators/dynamicProperty.decorator/dynamicProperty.decorator");
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
                for (const { selector, components, metadata } of affectedComponents) {
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
                for (const { components, metadata } of affectedComponents) {
                    this.onAdded(mutation, components, metadata);
                }
            },
        });
        this.$updatedObserver = this
            .changeDetector
            .onUpdated()
            .subscribe({
            next: (mutation) => {
                const affectedComponents = this.getAffectedComponentData(mutation);
                for (const { components, metadata } of affectedComponents) {
                    this.onUpdated(mutation, components, metadata);
                }
            },
        });
        this.$dynamicPropertyListener = (0, rxjs_1.fromEvent)(document, dynamicProperty_decorator_1.DYNAMIC_PROPERTY_UPDATE_EVENT)
            .subscribe((event) => {
            var _a;
            const metadata = Reflect.getMetadata(component_decorator_1.COMPONENT_METADATA_KEY, event.detail.component.constructor);
            const result = Array.from((_a = this.instances.get(metadata.selector)) !== null && _a !== void 0 ? _a : [])
                .find((instance) => instance[1].instance === event.detail.component);
            if (!result) {
                return;
            }
            const instance = result[1];
            this.onUpdated({ type: mutation_interface_1.MutationType.Updated, element: instance.element, target: instance.element }, [instance], metadata);
        });
    }
    registerComponent(constructor) {
        const metadata = Reflect.getMetadata(component_decorator_1.COMPONENT_METADATA_KEY, constructor);
        const callbackMetadata = Reflect.getMetadata(callback_decorator_1.CALLBACK_METADATA_KEY, constructor);
        if (!metadata) {
            throw new Error('Component metadata not found');
        }
        const componentData = { constructor: constructor, metadata, callbackMetadata };
        this.components.set(metadata.selector, componentData);
        this.initComponent(componentData, this.root);
    }
    registerCallbackSetupFunction(key, callbackSetupFunction) {
        this.callbackSetupFunctions.set(key, callbackSetupFunction);
    }
    getComponentInstancesBySelector(selector) {
        var _a;
        return (_a = this.instances.get(selector)) !== null && _a !== void 0 ? _a : new Map();
    }
    initComponents(target) {
        for (const componentData of this.components.values()) {
            this.initComponent(componentData, target !== null && target !== void 0 ? target : this.root);
        }
    }
    initComponent(componentData, root) {
        var _a;
        let i = 0;
        for (const element of root.querySelectorAll(componentData.metadata.selector)) {
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
            if (componentData.metadata.template) {
                element.innerHTML = componentData.metadata.template;
            }
            const instance = this.iocContainer.resolve(componentData.constructor, this.constructArgs(element));
            if (componentData.metadata.isDynamic) {
                element.innerHTML = instance.render();
            }
            if (componentData.metadata.lifecycleHooks.includes(component_decorator_1.LifecycleHook.OnInit)) {
                instance.onInit();
            }
            instanceId = `${componentData.constructor.name}-${new Date().getTime()}-${i}`;
            i++;
            const subscriptions = [];
            const instanceObject = { instance, element: element, subscriptions };
            for (const keyValue of (_a = componentData.callbackMetadata) !== null && _a !== void 0 ? _a : []) {
                const metadataArr = keyValue[1];
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
        for (const [key, value] of Object.entries(args)) {
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
    onAdded(mutation, components, metadata) {
        for (let i = 0; i < components.length; i++) {
            const instance = components[i];
            if (metadata.lifecycleHooks.includes(component_decorator_1.LifecycleHook.OnChange)) {
                instance.instance.onChange(mutation);
            }
        }
        this.initComponents((mutation.target));
    }
    onUpdated(mutation, components, metadata) {
        for (let i = 0; i < components.length; i++) {
            const instance = components[i];
            if (metadata.lifecycleHooks.includes(component_decorator_1.LifecycleHook.OnChange)) {
                instance.instance.onChange(mutation);
            }
            if (metadata.isDynamic) {
                const newContent = instance.instance.render();
                if (instance.element.innerHTML !== newContent) {
                    instance.element.innerHTML = newContent;
                }
            }
        }
    }
    getAffectedComponentData(mutation) {
        var _a, _b;
        const found = [];
        for (const [selector, { metadata }] of this.components) {
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
        for (const [selector, componentData] of this.components) {
            const instances = this.instances.get(selector);
            instances === null || instances === void 0 ? void 0 : instances.forEach((instance) => this.destroyInstance(instance, componentData.metadata));
            instances === null || instances === void 0 ? void 0 : instances.clear();
        }
        this.$removedObserver.unsubscribe();
        this.$addedObserver.unsubscribe();
        this.$updatedObserver.unsubscribe();
        this.$dynamicPropertyListener.unsubscribe();
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
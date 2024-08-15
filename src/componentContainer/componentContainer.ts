import { Subscription } from "rxjs";
import { Mutation, MutationType } from "../interfaces/mutation.interface";
import { ComponentData } from "../interfaces/componentData.interface";
import { COMPONENT_METADATA_KEY, ComponentMetadata, LifecycleHook } from "../decorators/component.decorator/component.decorator";
import { OnInit } from "../interfaces/onInit.interface";
import { OnDestroy } from "../interfaces/onDestroy.interface";
import { OnChange } from "../interfaces/onChange.interface";
import { ComponentInstance } from "../interfaces/componentInstance.interface";
import { ROOT_ELEMENT_KEY } from "../decorators/query.decorator/query.decorator";
import { IocContainerInterface } from "../interfaces/IocContainer.interface";
import {
    CALLBACK_METADATA_KEY,
    CallbackMetadata,
    CallbackSetupFunction
} from "../decorators/callback.decorator/callback.decorator";
import { ChangeDetectorInterface } from "../interfaces/changeDetector.interface";

export class ComponentContainer {
    public static readonly COMPONENT_CONTAINER_KEY = 'componentContainer';

    private $removedObserver: Subscription
    private $addedObserver: Subscription
    private $updatedObserver: Subscription
    private components: Map<string, ComponentData> = new Map<string, ComponentData>();
    private instances: Map<string, Map<string, ComponentInstance<any>>> = new Map<string, Map<string, ComponentInstance<any>>>();
    private callbackSetupFunctions: Map<string, CallbackSetupFunction<any>> = new Map<string, CallbackSetupFunction<any>>();

    public constructor(
        private root: HTMLElement,
        private iocContainer: IocContainerInterface,
        private changeDetector: ChangeDetectorInterface
    ) {
        this.initComponents();
        this.$removedObserver = this
            .changeDetector
            .onRemoved()
            .subscribe({
                next: (mutation: Mutation) => {
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
                next: (mutation: Mutation) => {
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
                next: (mutation: Mutation) => {
                    const affectedComponents = this.getAffectedComponentData(mutation);

                    for (const { components, metadata } of affectedComponents) {
                        this.onUpdated(mutation, components, metadata);
                    }
                },
            });

    }

    public registerComponent(constructor: unknown): void {
        const metadata = Reflect.getMetadata(COMPONENT_METADATA_KEY, constructor as Function);
        const callbackMetadata = Reflect.getMetadata(CALLBACK_METADATA_KEY, constructor as Function);

        if (!metadata) {
            throw new Error('Component metadata not found');
        }

        const componentData = { constructor: (constructor as Function), metadata, callbackMetadata };

        this.components.set(metadata.selector, componentData);

        this.initComponent(componentData, this.root);
    }

    public registerCallbackSetupFunction<T>(key: string, callbackSetupFunction: CallbackSetupFunction<T>): void {
        this.callbackSetupFunctions.set(key, callbackSetupFunction);
    }

    public getComponentInstancesBySelector(selector: string): Map<string, ComponentInstance<any>> {
        return this.instances.get(selector) ?? new Map<string, ComponentInstance<any>>();
    }

    private initComponents(target?: HTMLElement): void {
        for (const componentData of this.components.values()) {
            this.initComponent(componentData, target ?? this.root);
        }
    }

    private initComponent(componentData: ComponentData, root: HTMLElement): void {
        let i = 0;
        for (const element of root.querySelectorAll(componentData.metadata.selector)) {
            let instances = this.instances.get(componentData.metadata.selector);

            if (!instances) {
                instances = new Map<string, ComponentInstance<any>>();
                this.instances.set(componentData.metadata.selector, instances);
            }

            let instanceId: string | null = element.getAttribute('instance');

            if (instanceId) {

                if (!Array.from(instances.keys()).includes(instanceId)) {
                    throw new Error(`Invalid instance id ${instanceId} for component ${componentData.metadata.selector}`);
                }

                continue;
            }

            if (componentData.metadata.template) {
                element.innerHTML = componentData.metadata.template;
            }

            const instance: any = this.iocContainer.resolve(componentData.constructor, this.constructArgs((element as HTMLElement)));

            if (componentData.metadata.lifecycleHooks.includes(LifecycleHook.OnInit)) {
                (instance as OnInit).onInit();
            }

            instanceId = `${componentData.constructor.name}-${new Date().getTime()}-${i}`;
            i++;

            const subscriptions: Subscription[] = [];
            const instanceObject = { instance, element: element as HTMLElement, subscriptions };

            for (const keyValue of componentData.callbackMetadata ?? []) {
                const metadataArr = keyValue[1] as CallbackMetadata<any>[];

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

    private constructArgs(element: HTMLElement): Map<string, any> {
        const args = element.dataset;
        const result = new Map<string, any>();

        for (const [key, value] of Object.entries(args)) {
            result.set(key, value);
        }

        result.set(ROOT_ELEMENT_KEY, element);
        result.set(ComponentContainer.COMPONENT_CONTAINER_KEY, this);

        return result;
    }

    private onRemoved(mutation: Mutation, selector: string, components: ComponentInstance<any>[], metadata: ComponentMetadata): void {
        for (let i = 0; i < components.length; i++) {
            const instance = components[i];

            if (instance.element === mutation.element) {
                this.destroyInstance(instance, metadata);

                const instanceId = instance.element.getAttribute('instance') as string;

                this.instances.get(selector)?.delete(instanceId);
            }

            if (metadata.lifecycleHooks.includes(LifecycleHook.OnChange)) {
                (instance.instance as OnChange).onChange(mutation);
            }
        }
    }

    private onAdded(mutation: Mutation, components: ComponentInstance<any>[], metadata: ComponentMetadata): void {
        for (let i = 0; i < components.length; i++) {
            const instance = components[i];

            if (metadata.lifecycleHooks.includes(LifecycleHook.OnChange)) {
                (instance.instance as OnChange).onChange(mutation);
            }
        }

        this.initComponents((mutation.target) as HTMLElement);
    }

    private onUpdated(mutation: Mutation, components: ComponentInstance<any>[], metadata: ComponentMetadata): void {
        for (let i = 0; i < components.length; i++) {
            const instance = components[i];

            if (metadata.lifecycleHooks.includes(LifecycleHook.OnChange)) {
                (instance.instance as OnChange).onChange(mutation);
            }
        }
    }

    private getAffectedComponentData(mutation: Mutation): Array<{ selector: string, components: ComponentInstance<any>[], metadata: ComponentMetadata }> {
        const found: Array<{ selector: string, components: ComponentInstance<any>[], metadata: ComponentMetadata }> = [];

        for (const [selector, { metadata }] of this.components) {
            const instances = Array.from(this.instances.get(selector)?.values() ?? []);

            found.push({
                selector,
                components: instances
                    .filter((instance) => {
                        return instance.element === mutation.element
                            || instance.element.contains(mutation.element)
                            || (
                                mutation.type == MutationType.Removed
                                && (
                                    instance.element.contains(mutation.target)
                                    || instance.element === mutation.target
                                )
                            )
                    }),
                metadata,
            })
        }

        return found;
    }

    private onDestroy(): void {
        for (const [selector, componentData] of this.components) {
            const instances = this.instances.get(selector);

            instances?.forEach((instance) => this.destroyInstance(instance, componentData.metadata));
            instances?.clear();
        }

        this.$removedObserver.unsubscribe();
        this.$addedObserver.unsubscribe();
        this.$updatedObserver.unsubscribe();
    }

    private destroyInstance(instance: ComponentInstance<any>, componentMetadata: ComponentMetadata): void {
        instance.subscriptions.forEach((subscription) => subscription.unsubscribe());

        if (componentMetadata.lifecycleHooks.includes(LifecycleHook.OnDestroy)) {
            (instance.instance as OnDestroy).onDestroy();
        }
    }
}
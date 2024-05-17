import { Observable, Subscription } from "rxjs";
import { Mutation, MutationType } from "../interfaces/mutation.interface";
import { ComponentData } from "../interfaces/componentData.interface";
import { COMPONENT_METADATA_KEY, ComponentMetadata, LifecycleHook } from "../decorators/component.decorator/component.decorator";
import { OnInit } from "../interfaces/onInit.interface";
import { OnDestroy } from "../interfaces/onDestroy.interface";
import { OnChange } from "../interfaces/onChange.interface";
import { ComponentInstance } from "../interfaces/componentInstance.interface";
import { ROOT_ELEMENT_KEY } from "../decorators/query.decorator/query.decorator";
import { IocContainerInterface } from "../interfaces/IocContainer.interface";
import { CALLBACK_METADATA_KEY, CallbackSetupFunction } from "../decorators/callback.decorator/callback.decorator";

export class ComponentContainer {
    public static readonly COMPONENT_CONTAINER_KEY = 'componentContainer';

    private $stateObserver: Subscription
    private components: Map<string, ComponentData> = new Map<string, ComponentData>();
    private instances: Map<string, Map<string, ComponentInstance<any>>> = new Map<string, Map<string, ComponentInstance<any>>>();
    private callbackSetupFunctions: Map<string, CallbackSetupFunction<any>> = new Map<string, CallbackSetupFunction<any>>();

    public constructor(private root: HTMLElement, private iocContainer: IocContainerInterface) {
        this.$stateObserver = this.setupObserver().subscribe({
            next: (mutation: Mutation) => this.onMutation(mutation),
            complete: () => this.onDestroy(),
            error: (error) => this.onError(error),
        });
    }

    public registerComponent(constructor: Function): void {
        const metadata = Reflect.getMetadata(COMPONENT_METADATA_KEY, constructor);
        const callbackMetadata = Reflect.getMetadata(CALLBACK_METADATA_KEY, constructor);

        if (!metadata) {
            throw new Error('Component metadata not found');
        }

        const componentData = { constructor, metadata, callbackMetadata };

        this.components.set(metadata.selector, componentData);

        this.initComponent(componentData);
    }

    public registerCallbackSetupFunction<T>(key: string, callbackSetupFunction: CallbackSetupFunction<T>): void {
        this.callbackSetupFunctions.set(key, callbackSetupFunction);
    }

    public getComponentInstancesBySelector(selector: string): Map<string, ComponentInstance<any>> {
        return this.instances.get(selector) ?? new Map<string, ComponentInstance<any>>();
    }

    private setupObserver(): Observable<Mutation> {
        if (!this.root.parentNode) {
            throw new Error('Root element does not have a parent node');
        }

        return new Observable<Mutation>(subscriber => {
            const observer = new MutationObserver((mutations: MutationRecord[]) => {
                let changed: Mutation[] = [];
                let added: Mutation[] = [];
                let removed: Mutation[] = [];

                for (let mutation of mutations) {
                    if (Array.from(mutation.removedNodes ?? []).find((node) => node === this.root)) {
                        subscriber.complete();
                        return;
                    }

                    if (!this.root.contains(mutation.target)) {
                        continue;
                    }

                    if (['attributes', 'characterData'].includes(mutation.type) && !changed.find((m) => m.element === mutation.target)) {
                        changed.push({ element: mutation.target, type: MutationType.Updated, target: mutation.target });
                    }

                    if (mutation.removedNodes) {
                        for (let node of mutation.removedNodes) {
                            if (!removed.find((m) => m.element === node)) {
                                removed.push({ element: node, type: MutationType.Removed, target: mutation.target });
                            }
                        }
                    }

                    if (mutation.addedNodes) {
                        try {
                            this.initComponents();
                        } catch (error) {
                            subscriber.error(error);
                            return;
                        }

                        for (let node of mutation.addedNodes) {
                            if (!added.find((m) => m.element === node)) {
                                added.push({ element: node, type: MutationType.Added, target: mutation.target });
                            }
                        }
                    }
                }

                changed = changed.filter((sm) => !removed.find((tm) => tm.element === sm.element));
                added = added.filter((sm) => !removed.find((tm) => tm.element === sm.element));

                removed.forEach((m) => subscriber.next(m));
                added.forEach((m) => subscriber.next(m));
                changed.forEach((m) => subscriber.next(m));
            });

            observer.observe(this.root.parentNode as Node, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
            });

            return () => observer.disconnect();
        });
    }

    private initComponents(): void {
        for (let componentData of this.components.values()) {
            this.initComponent(componentData);
        }
    }

    private initComponent(componentData: ComponentData): void {
        for (let element of this.root.querySelectorAll(componentData.metadata.selector)) {
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

            const instance: any = this.iocContainer.resolve(componentData.constructor, this.constructArgs((element as HTMLElement)));

            if (componentData.metadata.lifecycleHooks.includes(LifecycleHook.OnInit)) {
                (instance as OnInit).onInit();
            }

            instanceId = `${componentData.constructor.name}-${new Date().getTime()}`;

            const subscriptions: Subscription[] = [];
            const instanceObject = { instance, element: element as HTMLElement, subscriptions };

            for (let [_, metadataArr] of componentData.callbackMetadata ?? []) {
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

        for (let [key, value] of Object.entries(args)) {
            result.set(key, value);
        }

        result.set(ROOT_ELEMENT_KEY, element);
        result.set(ComponentContainer.COMPONENT_CONTAINER_KEY, this);

        return result;
    }

    private onMutation(mutation: Mutation): void {
        for (let [selector, { metadata }] of this.components) {
            const instances = Array.from(this.instances.get(selector)?.values() ?? []);

            instances
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
                })
                .forEach((instance) => {
                    const element = instance.element;

                    if (element === mutation.element && mutation.type == MutationType.Removed) {
                        this.destroyInstance(instance, metadata);

                        const instanceId = element.getAttribute('instance') as string;

                        this.instances.get(selector)?.delete(instanceId);

                        return;
                    }

                    if (metadata.lifecycleHooks.includes(LifecycleHook.OnChange)) {
                        (instance.instance as OnChange).onChange(mutation);
                    }
                });
        }
    }

    private onDestroy(): void {
        for (let [selector, componentData] of this.components) {
            const instances = this.instances.get(selector);

            instances?.forEach((instance) => this.destroyInstance(instance, componentData.metadata));
            instances?.clear();
        }

        this.$stateObserver.unsubscribe();
    }

    private destroyInstance(instance: ComponentInstance<any>, componentMetadata: ComponentMetadata): void {
        instance.subscriptions.forEach((subscription) => subscription.unsubscribe());

        if (componentMetadata.lifecycleHooks.includes(LifecycleHook.OnDestroy)) {
            (instance.instance as OnDestroy).onDestroy();
        }
    }

    private onError(error: Error): void {
        console.error(error.stack);
    }
}
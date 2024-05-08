import { Observable, Subscription, debounce, filter, fromEvent, interval } from "rxjs";
import { Mutation, MutationType } from "../Interfaces/mutation.interface";
import { ComponentData } from "../Interfaces/componentData.interface";
import { COMPONENT_METADATA_KEY, LifecycleHook } from "../Decorators/component.decorator/component.decorator";
import { OnInit } from "../Interfaces/onInit.interface";
import { OnDestroy } from "../Interfaces/onDestroy.interface";
import { OnChange } from "../Interfaces/onChange.interface";
import { ComponentInstance } from "../Interfaces/componentInstance.interface";
import { InjectableMetadata } from "../Decorators/injectable.decorator/injectable.decorator";
import { QUERY_METADATA_KEY, QueryMetadata } from "../Decorators/query.decorator/query.decorator";
import { EVENT_METADATA_KEY } from "../Decorators/event.decorator/event.decorator";
import { IocContainerInterface } from "../Interfaces/IocContainer.interface";

export class ComponentContainer<K extends keyof DocumentEventMap> {
    private $stateObserver: Subscription
    private components: Map<string, ComponentData<K>> = new Map<string, ComponentData<K>>();
    private instances: Map<string, ComponentInstance[]> = new Map<string, ComponentInstance[]>();

    public constructor(private root: HTMLElement, private iocContainer: IocContainerInterface) {
        this.$stateObserver = this.setupObserver().subscribe({
            next: (mutation: Mutation) => this.onMutation(mutation),
            complete: () => this.onDestroy(),
            error: (error) => this.onError(error),
        });
    }

    public registerComponent(constructor: Function): void {
        const metadata = Reflect.getMetadata(COMPONENT_METADATA_KEY, constructor);
        const eventMetadata = Reflect.getMetadata(EVENT_METADATA_KEY, constructor);

        if (!metadata) {
            throw new Error('Component metadata not found');
        }

        const componentData = { constructor, metadata, eventMetadata };

        this.components.set(metadata.selector, componentData);

        this.initComponent(componentData);
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

    private initComponent(componentData: ComponentData<K>): void {
        for (let element of this.root.querySelectorAll(componentData.metadata.selector)) {
            let instances: ComponentInstance[] | undefined = this.instances.get(componentData.metadata.selector);

            if (!instances) {
                instances = [];
                this.instances.set(componentData.metadata.selector, instances);
            }

            const instanceId: string | null = element.getAttribute('instance');

            if (instanceId) {
                const instancesLength = instances.length;

                if (instancesLength <= Number(instanceId)) {
                    throw new Error(`Invalid instance id ${instanceId} for component ${componentData.metadata.selector}`);
                }

                continue;
            }

            const instance: any = this.iocContainer.resolve(componentData.constructor, this.constructArgs(componentData.constructor, (element as HTMLElement)));

            if (componentData.metadata.lifecycleHooks.includes(LifecycleHook.OnInit)) {
                (instance as OnInit).onInit();
            }

            element.setAttribute('instance', (instances.length - 1).toString());

            const events = new Map<string, Subscription[]>();

            componentData.eventMetadata?.forEach((eventMetadataGroup) => {
                const $event = fromEvent(element, eventMetadataGroup.type);
                const subscriptions: Subscription[] = [];

                eventMetadataGroup.selectors.forEach((selector) => {
                    let observable = $event.pipe(filter((event) => (event.target as HTMLElement).matches(selector.selector)));

                    if (selector?.options?.debounce) {
                        observable = observable.pipe(debounce(() => interval(selector?.options?.debounce)));
                    }

                    subscriptions.push(
                        observable.subscribe((event) => instance[selector.callback](event))
                    );
                });

                events.set(eventMetadataGroup.type, subscriptions);
            })

            instances.push({ instance, element: element as HTMLElement, events });
        }
    }

    private constructArgs(constructor: Function, element: HTMLElement): Map<string, any> {
        const args = element.dataset;
        const result = new Map<string, any>();

        for (let [key, value] of Object.entries(args)) {
            result.set(key, value);
        }

        const metadata = Reflect.getMetadata(COMPONENT_METADATA_KEY, constructor) as InjectableMetadata

        metadata.params?.forEach((param: { name: string, type: Function }, index: number) => {
            const queryMetadata = Reflect.getMetadata(`${QUERY_METADATA_KEY}:${index}`, constructor) as QueryMetadata | undefined | null;

            if (!queryMetadata) {
                return;
            }

            if (!queryMetadata.selector) {
                result.set(param.name, element);

                return;
            }

            result.set(param.name, queryMetadata.multiple ? element.querySelectorAll(queryMetadata.selector) : element.querySelector(queryMetadata.selector));
        });

        return result;
    }

    private onMutation(mutation: Mutation): void {
        for (let [selector, { metadata }] of this.components) {
            const instances = this.instances.get(selector) ?? [];

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
                        if (instance.events) {
                            for (let subscriptions of instance.events.values()) {
                                subscriptions.forEach((subscription) => subscription.unsubscribe());
                            }
                        }

                        if (metadata.lifecycleHooks.includes(LifecycleHook.OnDestroy)) {
                            (instance.instance as OnDestroy).onDestroy();
                        }

                        const instanceId = Number(element.getAttribute('instance'));

                        this.instances.get(selector)?.splice(instanceId, 1);

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
            this.instances.get(selector)?.forEach((instance) => {
                for (let subscriptions of instance.events.values()) {
                    subscriptions.forEach((subscription) => subscription.unsubscribe());
                }

                if (componentData.metadata.lifecycleHooks.includes(LifecycleHook.OnDestroy)) {
                    (instance.instance as OnDestroy).onDestroy();
                }
            });
        }

        this.$stateObserver.unsubscribe();
    }

    private onError(error: Error): void {
        console.error(error.stack);
    }
}
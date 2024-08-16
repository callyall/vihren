import { InjectableMetadata, getInjectableMetadata } from "../injectable.decorator/injectable.decorator";

export const COMPONENT_METADATA_KEY = 'ioc:component';

/**
 * Decorator to define a component.
 *
 * Without using this decorator, the component will fail to register.
 */
export const Component = (args: ComponentMetadataInput): ClassDecorator => (target) => {
    const metadata = getInjectableMetadata(target) as ComponentMetadata;
    metadata.selector = args.selector;
    metadata.template = args.template;
    metadata.lifecycleHooks = Object.values(LifecycleHook).filter((hook: string) => typeof target.prototype[hook] == 'function') as LifecycleHook[];
    metadata.isDynamic = typeof target.prototype['render'] == 'function';

    if (metadata.template && metadata.isDynamic) {
        throw new Error(`Component ${target.name} cannot have both a template and be dynamic`);
    }

    Reflect.defineMetadata(COMPONENT_METADATA_KEY, metadata, target);
};

export interface ComponentMetadata extends InjectableMetadata, ComponentMetadataInput {
    lifecycleHooks: LifecycleHook[];
    isDynamic: boolean;
}

export interface ComponentMetadataInput {
    selector: string;
    template?: string;
}

export enum LifecycleHook {
    OnInit    = 'onInit',
    OnChange  = 'onChange',
    OnDestroy = 'onDestroy',
}

import { InjectableMetadata, getInjectableMetadata } from "../injectable.decorator/injectable.decorator";

export const COMPONENT_METADATA_KEY = 'ioc:component';

export const Component = (args: ComponentMetadataInput): ClassDecorator => (target) => {
    const metadata = getInjectableMetadata(target) as ComponentMetadata;
    metadata.selector = args.selector;
    metadata.lifecycleHooks = Object.values(LifecycleHook).filter((hook: string) => typeof target.prototype[hook] == 'function') as LifecycleHook[];

    Reflect.defineMetadata(COMPONENT_METADATA_KEY, metadata, target);
};

export interface ComponentMetadata extends InjectableMetadata, ComponentMetadataInput {
    lifecycleHooks: LifecycleHook[];
}

export interface ComponentMetadataInput {
    selector: string;
}

export enum LifecycleHook {
    OnInit    = 'onInit',
    OnChange  = 'onChange',
    OnDestroy = 'onDestroy',
}

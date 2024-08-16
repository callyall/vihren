import { InjectableMetadata } from "../injectable.decorator/injectable.decorator";
export declare const COMPONENT_METADATA_KEY = "ioc:component";
export declare const Component: (args: ComponentMetadataInput) => ClassDecorator;
export interface ComponentMetadata extends InjectableMetadata, ComponentMetadataInput {
    lifecycleHooks: LifecycleHook[];
    isDynamic: boolean;
}
export interface ComponentMetadataInput {
    selector: string;
    template?: string;
}
export declare enum LifecycleHook {
    OnInit = "onInit",
    OnChange = "onChange",
    OnDestroy = "onDestroy"
}

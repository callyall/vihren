import { CallbackSetupFunction } from "../callback.decorator/callback.decorator";
export declare const COMPONENT_EVENT_METADATA_KEY = "method:componentEvent";
export declare const ComponentEvent: (args: ComponentEventMetadata) => (target: Object, propertyKey: string | symbol) => void;
export declare const componentEventCallbackSetupFunction: CallbackSetupFunction<ComponentEventMetadata>;
export interface ComponentEventMetadata {
    type: string;
    options?: ComponentEventOptions;
}
export interface ComponentEventOptions {
    debounce?: number;
}

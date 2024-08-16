import { CallbackSetupFunction } from "../callback.decorator/callback.decorator";
export declare const COMPONENT_EVENT_METADATA_KEY = "method:componentEvent";
/**
 * Decorator to define a component event listener
 */
export declare const ComponentEvent: (args: ComponentEventMetadata) => (target: Object, propertyKey: string | symbol) => void;
/**
 * The logic that subscribes to the event emitter and calls the callback method.
 *
 * This will be called internally, and you will not need to call it yourself.
 */
export declare const componentEventCallbackSetupFunction: CallbackSetupFunction<ComponentEventMetadata>;
export interface ComponentEventMetadata {
    type: string;
    options?: ComponentEventOptions;
}
export interface ComponentEventOptions {
    debounce?: number;
}

import { CallbackSetupFunction } from "../callback.decorator/callback.decorator";
export declare const EVENT_METADATA_KEY = "method:event";
/**
 * Decorator to define a DOM event listener
 */
export declare const Event: (args: EventMetadata) => (target: Object, propertyKey: string | symbol) => void;
/**
 * The logic that subscribes to the event and calls the callback method.
 *
 * This will be called internally, and you will not need to call it yourself.
 */
export declare const eventCallbackSetupFunction: CallbackSetupFunction<EventMetadata>;
export type DomEvent = keyof DocumentEventMap;
export interface EventMetadata {
    type: DomEvent;
    selector: string;
    options?: EventOptions;
}
export interface EventOptions {
    debounce?: number;
}

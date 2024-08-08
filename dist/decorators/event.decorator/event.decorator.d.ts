import { CallbackSetupFunction } from "../callback.decorator/callback.decorator";
export declare const EVENT_METADATA_KEY = "method:event";
export declare const Event: (args: EventMetadata) => (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;
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

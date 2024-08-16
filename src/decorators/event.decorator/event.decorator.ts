import { callback, CallbackMetadata, CallbackSetupFunction } from "../callback.decorator/callback.decorator";
import { debounce, filter, fromEvent, interval, Subscription } from "rxjs";
import { ComponentInstance } from "../../interfaces/componentInstance.interface";

export const EVENT_METADATA_KEY = 'method:event';

/**
 * Decorator to define a DOM event listener
 */
export const Event = (args: EventMetadata) => (target: Object, propertyKey: string | symbol): void => {
    callback<EventMetadata>(
        {
            callback: propertyKey as string,
            key: EVENT_METADATA_KEY,
            data: args
        },
        target.constructor,
        propertyKey
    );
};

/**
 * The logic that subscribes to the event and calls the callback method.
 *
 * This will be called internally, and you will not need to call it yourself.
 */
export const eventCallbackSetupFunction: CallbackSetupFunction<EventMetadata> = (metadata: CallbackMetadata<EventMetadata>, instance: ComponentInstance<any>): Subscription => {
    let observable = fromEvent(instance.element, metadata.data.type)
        .pipe(filter((event: Event) => (event.target as HTMLElement).matches(metadata.data.selector)));

    if (metadata.data.options?.debounce) {
        observable = observable.pipe(debounce(() => interval(metadata.data.options?.debounce)));
    }   

    return observable.subscribe((event: Event) => instance.instance[metadata.callback](event));
};

export type DomEvent = keyof DocumentEventMap;

export interface EventMetadata {
    type: DomEvent;
    selector: string;
    options?: EventOptions;
}

export interface EventOptions {
    debounce?: number;
}

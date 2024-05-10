import { callback, CallbackMetadata, CallbackSetupFunction } from "../callback.decorator/callback.decorator";
import { IocContainerInterface } from "../../Interfaces/IocContainer.interface";
import { debounce, filter, fromEvent, interval, Subscription } from "rxjs";
import { ComponentInstance } from "../../Interfaces/componentInstance.interface";

export const EVENT_METADATA_KEY = 'method:event';

export const Event = (args: EventMetadata) => (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
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

export const eventCallbackSetupFunction: CallbackSetupFunction<EventMetadata> = (metadata: CallbackMetadata<EventMetadata>, instance: ComponentInstance<any>, iocContainer: IocContainerInterface): Subscription => {
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

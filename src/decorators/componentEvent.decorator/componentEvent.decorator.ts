import { callback, CallbackMetadata, CallbackSetupFunction } from "../callback.decorator/callback.decorator";
import { IocContainerInterface } from "../../interfaces/IocContainer.interface";
import { debounce, interval, Subscription } from "rxjs";
import { ComponentInstance } from "../../interfaces/componentInstance.interface";
import { ComponentEventEmitter, ComponentEventPayload } from "../../services/eventEmitter/componentEventEmitter";

export const COMPONENT_EVENT_METADATA_KEY = 'method:componentEvent';

export const ComponentEvent = (args: ComponentEventMetadata) => (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    callback<ComponentEventMetadata>(
        {
            callback: propertyKey as string,
            key: COMPONENT_EVENT_METADATA_KEY,
            data: args
        },
        target.constructor,
        propertyKey
    );
};

export const componentEventCallbackSetupFunction: CallbackSetupFunction<ComponentEventMetadata> = (metadata: CallbackMetadata<ComponentEventMetadata>, instance: ComponentInstance<any>, iocContainer: IocContainerInterface): Subscription => {
    const eventEmitter = iocContainer.resolve<ComponentEventEmitter>(ComponentEventEmitter);

    let observable = eventEmitter.on(metadata.data.type);

    if (metadata.data.options?.debounce) {
        observable = observable.pipe(debounce(() => interval(metadata.data.options?.debounce)));
    }

    return observable.subscribe((eventPayload: ComponentEventPayload<any, any>) => instance.instance[metadata.callback](eventPayload));
};

export interface ComponentEventMetadata {
    type: string;
    options?: ComponentEventOptions;
}

export interface ComponentEventOptions {
    debounce?: number;
}

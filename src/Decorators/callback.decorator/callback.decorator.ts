import "reflect-metadata";
import { Subscription } from "rxjs";
import { IocContainerInterface } from "../../Interfaces/IocContainer.interface";
import { ComponentInstance } from "../../Interfaces/componentInstance.interface";

export const CALLBACK_METADATA_KEY = 'method:callback';

export const callback = <T>(metadata: CallbackMetadata<T>, target: Object, propertyKey: string | symbol): void => {
    const metadataMap = Reflect.getMetadata(CALLBACK_METADATA_KEY, target) ?? new Map<string, CallbackMetadata<any>[]>();
    const methodMetadata = metadataMap.get(propertyKey as string) ?? [];

    methodMetadata.push(metadata);
    metadataMap.set(propertyKey as string, methodMetadata);

    Reflect.defineMetadata(CALLBACK_METADATA_KEY, metadataMap, target);
}

export interface CallbackMetadata<T> {
    callback: string,
    key: string;
    data: T;
}

export type CallbackSetupFunction<T> = (metadata: CallbackMetadata<T>, instance: ComponentInstance, iocContainer: IocContainerInterface) => Subscription;

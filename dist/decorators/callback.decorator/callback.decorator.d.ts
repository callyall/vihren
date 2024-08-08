import "reflect-metadata";
import { Subscription } from "rxjs";
import { IocContainerInterface } from "../../interfaces/IocContainer.interface";
import { ComponentInstance } from "../../interfaces/componentInstance.interface";
export declare const CALLBACK_METADATA_KEY = "method:callback";
export declare const callback: <T>(metadata: CallbackMetadata<T>, target: Object, propertyKey: string | symbol) => void;
export interface CallbackMetadata<T> {
    callback: string;
    key: string;
    data: T;
}
export type CallbackSetupFunction<T> = (metadata: CallbackMetadata<T>, instance: ComponentInstance<T>, iocContainer: IocContainerInterface) => Subscription;

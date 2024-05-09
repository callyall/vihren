import {ArgumentMetadata} from "../Decorators/argumentModifier.decorator/argumentModifier.decorator";

export type ModifierFunction<T> = (name: string, argumentMetadata: ArgumentMetadata<T>, args: Map<string, any>) => Map<string, any>;
export type FactoryFunction<T> = (args?: Map<string, any>) => T;

export interface IocContainerInterface {
    registerValue<T>(key: string, value: T): void;
    registerFactory<T>(key: string, factoryFunction: FactoryFunction<T>): void;
    resolve<T>(target: Function | string, args?: Map<string, any>): T;
    registerArgumentModifier<T>(key: string, modifierFunction: ModifierFunction<T>): void;
}

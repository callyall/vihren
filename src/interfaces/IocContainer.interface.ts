import { ArgumentMetadata } from "../decorators/argumentModifier.decorator/argumentModifier.decorator";
import { ParamMetadata } from "../decorators/injectable.decorator/injectable.decorator";

export type ModifierFunction<T> = (argumentMetadata: ArgumentMetadata<T>, paramMetadata: ParamMetadata, args: Map<string, any>) => Map<string, any>;
export type FactoryFunction<T> = (args?: Map<string, any>) => T;

export interface IocContainerInterface {
    registerValue<T>(key: string, value: T): void;
    registerFactory<T>(key: string, factoryFunction: FactoryFunction<T>): void;
    resolve<T>(target: Function | string, args?: Map<string, any>, failIfNoShared?: boolean): T;
    registerArgumentModifier<T>(key: string, modifierFunction: ModifierFunction<T>): void;
}

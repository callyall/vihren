import { FactoryFunction, IocContainerInterface, ModifierFunction } from "../interfaces/IocContainer.interface";
export declare class IocContainer implements IocContainerInterface {
    private values;
    private factories;
    private argumentModifiers;
    registerValue<T>(key: string, value: T): void;
    registerFactory<T>(key: string, factoryFunction: FactoryFunction<T>): void;
    resolve<T>(target: Function | string, args?: Map<string, any>, failIfNoShared?: boolean): T;
    registerArgumentModifier<T>(key: string, modifierFunction: ModifierFunction<T>): void;
    private defaultFactory;
    private prepareArgs;
}

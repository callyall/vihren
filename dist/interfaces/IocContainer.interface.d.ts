import { ArgumentMetadata } from "../decorators/argumentModifier.decorator/argumentModifier.decorator";
import { ParamMetadata } from "../decorators/injectable.decorator/injectable.decorator";
export type ModifierFunction<T> = (argumentMetadata: ArgumentMetadata<T>, paramMetadata: ParamMetadata, args: Map<string, any>) => Map<string, any>;
export type FactoryFunction<T> = (args?: Map<string, any>) => T;
/**
 * The IoC container hols the dependencies of the application and resolves them when needed.
 */
export interface IocContainerInterface {
    /**
     * Register a value that can be retrieved when needed.
     * @param key a string that represents the key of the value to be registered.
     * @param value the value to be registered.
     */
    registerValue<T>(key: string, value: T): void;
    /**
     * Register a factory function that will be called when the value is needed.
     * @param key a string that represents the key of the factory to be registered.
     * @param factoryFunction the factory function that will be called when the value is needed.
     */
    registerFactory<T>(key: string, factoryFunction: FactoryFunction<T>): void;
    /**
     * Retrieve a dependency
     * @param target a string or class name that represents the key of the class to be registered.
     * @param args The arguments that will be passed to the constructor of the class.
     * @param failIfNoShared If true, the method will throw an error if the class is not registered as shared instance.
     */
    resolve<T>(target: Function | string, args?: Map<string, any>, failIfNoShared?: boolean): T;
    /**
     * Register an argument modifier.
     *
     * Argument modifiers are constructor argument modifiers that modify the arguments before they are passed to the constructor.
     *
     * @param key the name of the modifier.
     * @param modifierFunction the modifier function that will be executed when the argument is resolved.
     */
    registerArgumentModifier<T>(key: string, modifierFunction: ModifierFunction<T>): void;
}

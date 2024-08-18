import { CallbackSetupFunction } from '../decorators/callback.decorator/callback.decorator';
import { ChangeDetectorInterface } from '../interfaces/changeDetector.interface';
import { ComponentInstance } from '../interfaces/componentInstance.interface';
import { FactoryFunction, IocContainerInterface, ModifierFunction } from '../interfaces/IocContainer.interface';
/**
 * The Application class is the main entry point of the application.
 */
export declare class Application {
    private readonly rootElement;
    private changeDetector;
    private componentContainer;
    private iocContainer;
    private features;
    /**
     * @param rootElement The root element of the application.
     * @param features If this argument is not passed, all the features will be enabled.
     * @param changedetector Only pass if you need to use a custom change detector.
     * @param iocContainer Only pass if you need to use a custom IoC container.
     */
    constructor(rootElement: HTMLElement, features?: Feature[], changedetector?: ChangeDetectorInterface, iocContainer?: IocContainerInterface);
    /**
     * Initialize the application.
     */
    init(): void;
    /**
     * @returns The features that are enabled in the application. The custom features are not included.
     */
    getEnabledFeatures(): Feature[];
    /**
     * Retrieve a value from the IoC container.
     */
    resolve<T>(target: Function | string, args?: Map<string, any>, failIfNoShared?: boolean): T;
    /**
     * @param key The name of the value or factory to be registered.
     * @param value The value or factory to be registered.
     */
    registerValueOrFactory<T>(key: string, value: T | FactoryFunction<T>): void;
    /**
     * @param key The name of the modifier.
     * @param modifierFunction The modifier function that will be executed when the argument is resolved.
     */
    registerArgumentModifier<T>(key: string, modifierFunction: ModifierFunction<T>): void;
    /**
     * @param constructor The constructor of the component to be registered.
     */
    registerComponent(constructor: unknown): void;
    /**
     * @param key The key of the callback setup function.
     * @param callbackSetupFunction The callback setup function that will be executed to set up the callback.
     */
    registerCallbackSetupFunction<T>(key: string, callbackSetupFunction: CallbackSetupFunction<T>): void;
    /**
     * @param selector The HTML query selector.
     */
    getComponentInstancesBySelector(selector: string): Map<string, ComponentInstance<any>>;
}
export declare enum Feature {
    CHILD_COMPONENT_DECORATOR = "CHILD_COMPONENT_DECORATOR",
    COMPONENT_EVENT_DECORATOR = "COMPONENT_EVENT_DECORATOR",
    EVENT_DECORATOR = "EVENT_DECORATOR",
    QUERY_DECORATOR = "QUERY_DECORATOR",
    TIME_SERVICE = "TIME_SERVICE"
}

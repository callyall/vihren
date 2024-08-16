import { ComponentInstance } from "../interfaces/componentInstance.interface";
import { IocContainerInterface } from "../interfaces/IocContainer.interface";
import { CallbackSetupFunction } from "../decorators/callback.decorator/callback.decorator";
import { ChangeDetectorInterface } from "../interfaces/changeDetector.interface";
/**
 * This is where the main logic of the application lives.
 *
 * This class is responsible for managing the components of the application.
 */
export declare class ComponentContainer {
    private root;
    private iocContainer;
    private changeDetector;
    static readonly COMPONENT_CONTAINER_KEY = "componentContainer";
    private $removedObserver;
    private $addedObserver;
    private $updatedObserver;
    private $dynamicPropertyListener;
    private components;
    private instances;
    private callbackSetupFunctions;
    constructor(root: HTMLElement, iocContainer: IocContainerInterface, changeDetector: ChangeDetectorInterface);
    /**
     * Registers a component with the container.
     *
     * After the component gets registered the component container will try to automatically initialize it.
     *
     * @param constructor
     */
    registerComponent(constructor: unknown): void;
    /**
     * Callback setup functions are used to set up public component methods as callbacks(event listeners, async method callbacks, etc.).
     */
    registerCallbackSetupFunction<T>(key: string, callbackSetupFunction: CallbackSetupFunction<T>): void;
    /**
     * Get component instances by selector.
     *
     * @param selector a valid query selector
     */
    getComponentInstancesBySelector(selector: string): Map<string, ComponentInstance<any>>;
    private initComponents;
    private initComponent;
    private constructArgs;
    private onRemoved;
    private onAdded;
    private onUpdated;
    private getAffectedComponentData;
    private onDestroy;
    private destroyInstance;
}

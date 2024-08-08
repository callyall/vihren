import { ComponentInstance } from "../interfaces/componentInstance.interface";
import { IocContainerInterface } from "../interfaces/IocContainer.interface";
import { CallbackSetupFunction } from "../decorators/callback.decorator/callback.decorator";
import { ChangeDetectorInterface } from "../interfaces/changeDetector.interface";
export declare class ComponentContainer {
    private root;
    private iocContainer;
    private changeDetector;
    static readonly COMPONENT_CONTAINER_KEY = "componentContainer";
    private $removedObserver;
    private $addedObserver;
    private $updatedObserver;
    private components;
    private instances;
    private callbackSetupFunctions;
    constructor(root: HTMLElement, iocContainer: IocContainerInterface, changeDetector: ChangeDetectorInterface);
    registerComponent(constructor: Function): void;
    registerCallbackSetupFunction<T>(key: string, callbackSetupFunction: CallbackSetupFunction<T>): void;
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

import { ChangeDetector } from '../changeDetector/changeDetector';
import { ComponentContainer } from '../componentContainer/componentContainer';
import { CallbackSetupFunction } from '../decorators/callback.decorator/callback.decorator';
import { CHILD_COMPONENT_METADATA_KEY, childComponentModifierFunction } from '../decorators/childComponent.decorator/childComponent.decorator';
import { COMPONENT_EVENT_METADATA_KEY, componentEventCallbackSetupFunction } from '../decorators/componentEvent.decorator/componentEvent.decorator';
import { EVENT_METADATA_KEY, eventCallbackSetupFunction } from '../decorators/event.decorator/event.decorator';
import { QUERY_METADATA_KEY, queryModifierFunction } from '../decorators/query.decorator/query.decorator';
import { ChangeDetectorInterface } from '../interfaces/changeDetector.interface';
import { ComponentInstance } from '../interfaces/componentInstance.interface';
import { FactoryFunction, IocContainerInterface, ModifierFunction } from '../interfaces/IocContainer.interface';
import { IocContainer } from '../iocContainer/IocContainer';
import { ComponentEventEmitter } from '../services/eventEmitter/componentEventEmitter';
import { TimeService } from '../services/time.service/time.service';

/**
 * The Application class is the main entry point of the application.
 */
export class Application {
    // The change detector is used to detect changes in the DOM tree.
    private changeDetector: ChangeDetectorInterface;
    // The component container takes care of component instantiation, updates and removal.
    private componentContainer: ComponentContainer;
    // The IoC container is used to resolve dependencies.
    private iocContainer: IocContainerInterface;
    // The features that are enabled in the application.
    private features: Feature[] = [
        Feature.CHILD_COMPONENT_DECORATOR,
        Feature.COMPONENT_EVENT_DECORATOR,
        Feature.EVENT_DECORATOR,
        Feature.QUERY_DECORATOR,
        Feature.TIME_SERVICE,
    ];

    /**
     * @param rootElement The root element of the application.
     * @param features If this argument is not passed, all the features will be enabled.
     * @param changedetector Only pass if you need to use a custom change detector.
     * @param iocContainer Only pass if you need to use a custom IoC container.
     */
    public constructor(
        private readonly rootElement: HTMLElement,
        features?: Feature[],
        changedetector?: ChangeDetectorInterface,
        iocContainer?: IocContainerInterface
    ) {
        if (!changedetector) {
            changedetector = new ChangeDetector(rootElement);
        }

        if (!iocContainer) {
            iocContainer = new IocContainer();
        }

        this.features = features || this.features;
        this.changeDetector = changedetector;
        this.iocContainer = iocContainer;
        this.componentContainer = new ComponentContainer(this.rootElement, this.iocContainer, this.changeDetector);

        this.features.forEach(feature => {
            switch (feature) {
                case Feature.CHILD_COMPONENT_DECORATOR:
                    // The @ChildComponent decorator is used to inject a child component instance into a component.
                    this.iocContainer.registerArgumentModifier(CHILD_COMPONENT_METADATA_KEY, childComponentModifierFunction);
                    break;
                case Feature.COMPONENT_EVENT_DECORATOR:
                    // The @ComponentEvent decorator is used to register a component event listener in the component.
                    this.componentContainer.registerCallbackSetupFunction(COMPONENT_EVENT_METADATA_KEY, componentEventCallbackSetupFunction);
                    // The ComponentEventEmitter is a special service that is used to emit component events.
                    this.iocContainer.registerValue(ComponentEventEmitter.name, new ComponentEventEmitter());
                    break;
                case Feature.EVENT_DECORATOR:
                    // The @Event decorator is used to register an event listener in the component.
                    this.componentContainer.registerCallbackSetupFunction(EVENT_METADATA_KEY, eventCallbackSetupFunction);
                    break;
                case Feature.QUERY_DECORATOR:
                    // The @Query decorator is used to inject a query selector result into a component.
                    this.iocContainer.registerArgumentModifier(QUERY_METADATA_KEY, queryModifierFunction);
                    break;
                case Feature.TIME_SERVICE:
                    // The TimeService is a service that provides a simple reactive timeout and interval functionality.
                    this.iocContainer.registerValue(TimeService.name, new TimeService());
                    break;
            }
        });
    }

    /**
     * Initialize the application.
     */
    public init(): void {
        this.componentContainer.init();
    }

    /**
     * @returns The features that are enabled in the application. The custom features are not included.
     */
    public getEnabledFeatures(): Feature[] {
        return this.features;
    }

    /**
     * Retrieve a value from the IoC container.
     */
    public resolve<T>(target: Function | string, args?: Map<string, any>, failIfNoShared?: boolean): T {
        return this.iocContainer.resolve<T>(target, args, failIfNoShared)
    }

    /**
     * @param key The name of the value or factory to be registered.
     * @param value The value or factory to be registered.
     */
    public registerValueOrFactory<T>(key: string, value: T|FactoryFunction<T>): void {
        if (typeof value !== 'function') {
            this.iocContainer.registerValue<T>(key, value as T);

            return;
        }

        this.iocContainer.registerFactory<T>(key, value as FactoryFunction<T>);
    }

    /**
     * @param key The name of the modifier.
     * @param modifierFunction The modifier function that will be executed when the argument is resolved.
     */
    public registerArgumentModifier<T>(key: string, modifierFunction: ModifierFunction<T>): void {
        this.iocContainer.registerArgumentModifier<T>(key, modifierFunction);
    }

    /**
     * @param constructor The constructor of the component to be registered.
     */
    public registerComponent(constructor: unknown): void {
        this.componentContainer.registerComponent(constructor);
    }

    /**
     * @param key The key of the callback setup function.
     * @param callbackSetupFunction The callback setup function that will be executed to set up the callback.
     */
    public registerCallbackSetupFunction<T>(key: string, callbackSetupFunction: CallbackSetupFunction<T>): void {
        this.componentContainer.registerCallbackSetupFunction(key, callbackSetupFunction);
    }

    /**
     * @param selector The HTML query selector. 
     */
    public getComponentInstancesBySelector(selector: string): Map<string, ComponentInstance<any>> {
        return this.componentContainer.getComponentInstancesBySelector(selector);
    }
}

export enum Feature {
    CHILD_COMPONENT_DECORATOR = 'CHILD_COMPONENT_DECORATOR',
    COMPONENT_EVENT_DECORATOR = 'COMPONENT_EVENT_DECORATOR',
    EVENT_DECORATOR           = 'EVENT_DECORATOR',
    QUERY_DECORATOR           = 'QUERY_DECORATOR',
    TIME_SERVICE              = 'TIME_SERVICE',
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feature = exports.Application = void 0;
const changeDetector_1 = require("../changeDetector/changeDetector");
const componentContainer_1 = require("../componentContainer/componentContainer");
const childComponent_decorator_1 = require("../decorators/childComponent.decorator/childComponent.decorator");
const componentEvent_decorator_1 = require("../decorators/componentEvent.decorator/componentEvent.decorator");
const event_decorator_1 = require("../decorators/event.decorator/event.decorator");
const query_decorator_1 = require("../decorators/query.decorator/query.decorator");
const IocContainer_1 = require("../iocContainer/IocContainer");
const componentEventEmitter_1 = require("../services/eventEmitter/componentEventEmitter");
const time_service_1 = require("../services/time.service/time.service");
/**
 * The Application class is the main entry point of the application.
 */
class Application {
    /**
     * @param rootElement The root element of the application.
     * @param features If this argument is not passed, all the features will be enabled.
     * @param changedetector Only pass if you need to use a custom change detector.
     * @param iocContainer Only pass if you need to use a custom IoC container.
     */
    constructor(rootElement, features, changedetector, iocContainer) {
        this.rootElement = rootElement;
        // The features that are enabled in the application.
        this.features = [
            Feature.CHILD_COMPONENT_DECORATOR,
            Feature.COMPONENT_EVENT_DECORATOR,
            Feature.EVENT_DECORATOR,
            Feature.QUERY_DECORATOR,
            Feature.TIME_SERVICE,
        ];
        if (!changedetector) {
            changedetector = new changeDetector_1.ChangeDetector(rootElement);
        }
        if (!iocContainer) {
            iocContainer = new IocContainer_1.IocContainer();
        }
        this.features = features || this.features;
        this.changeDetector = changedetector;
        this.iocContainer = iocContainer;
        this.componentContainer = new componentContainer_1.ComponentContainer(this.rootElement, this.iocContainer, this.changeDetector);
        this.features.forEach(feature => {
            switch (feature) {
                case Feature.CHILD_COMPONENT_DECORATOR:
                    // The @ChildComponent decorator is used to inject a child component instance into a component.
                    this.iocContainer.registerArgumentModifier(childComponent_decorator_1.CHILD_COMPONENT_METADATA_KEY, childComponent_decorator_1.childComponentModifierFunction);
                    break;
                case Feature.COMPONENT_EVENT_DECORATOR:
                    // The @ComponentEvent decorator is used to register a component event listener in the component.
                    this.componentContainer.registerCallbackSetupFunction(componentEvent_decorator_1.COMPONENT_EVENT_METADATA_KEY, componentEvent_decorator_1.componentEventCallbackSetupFunction);
                    // The ComponentEventEmitter is a special service that is used to emit component events.
                    this.iocContainer.registerValue(componentEventEmitter_1.ComponentEventEmitter.name, new componentEventEmitter_1.ComponentEventEmitter());
                    break;
                case Feature.EVENT_DECORATOR:
                    // The @Event decorator is used to register an event listener in the component.
                    this.componentContainer.registerCallbackSetupFunction(event_decorator_1.EVENT_METADATA_KEY, event_decorator_1.eventCallbackSetupFunction);
                    break;
                case Feature.QUERY_DECORATOR:
                    // The @Query decorator is used to inject a query selector result into a component.
                    this.iocContainer.registerArgumentModifier(query_decorator_1.QUERY_METADATA_KEY, query_decorator_1.queryModifierFunction);
                    break;
                case Feature.TIME_SERVICE:
                    // The TimeService is a service that provides a simple reactive timeout and interval functionality.
                    this.iocContainer.registerValue(time_service_1.TimeService.name, new time_service_1.TimeService());
                    break;
            }
        });
    }
    /**
     * Initialize the application.
     */
    init() {
        this.componentContainer.init();
    }
    /**
     * @returns The features that are enabled in the application. The custom features are not included.
     */
    getEnabledFeatures() {
        return this.features;
    }
    /**
     * Retrieve a value from the IoC container.
     */
    resolve(target, args, failIfNoShared) {
        return this.iocContainer.resolve(target, args, failIfNoShared);
    }
    /**
     * @param key The name of the value or factory to be registered.
     * @param value The value or factory to be registered.
     */
    registerValueOrFactory(key, value) {
        if (typeof value !== 'function') {
            this.iocContainer.registerValue(key, value);
            return;
        }
        this.iocContainer.registerFactory(key, value);
    }
    /**
     * @param key The name of the modifier.
     * @param modifierFunction The modifier function that will be executed when the argument is resolved.
     */
    registerArgumentModifier(key, modifierFunction) {
        this.iocContainer.registerArgumentModifier(key, modifierFunction);
    }
    /**
     * @param constructor The constructor of the component to be registered.
     */
    registerComponent(constructor) {
        this.componentContainer.registerComponent(constructor);
    }
    /**
     * @param key The key of the callback setup function.
     * @param callbackSetupFunction The callback setup function that will be executed to set up the callback.
     */
    registerCallbackSetupFunction(key, callbackSetupFunction) {
        this.componentContainer.registerCallbackSetupFunction(key, callbackSetupFunction);
    }
    /**
     * @param selector The HTML query selector.
     */
    getComponentInstancesBySelector(selector) {
        return this.componentContainer.getComponentInstancesBySelector(selector);
    }
}
exports.Application = Application;
var Feature;
(function (Feature) {
    Feature["CHILD_COMPONENT_DECORATOR"] = "CHILD_COMPONENT_DECORATOR";
    Feature["COMPONENT_EVENT_DECORATOR"] = "COMPONENT_EVENT_DECORATOR";
    Feature["EVENT_DECORATOR"] = "EVENT_DECORATOR";
    Feature["QUERY_DECORATOR"] = "QUERY_DECORATOR";
    Feature["TIME_SERVICE"] = "TIME_SERVICE";
})(Feature = exports.Feature || (exports.Feature = {}));
//# sourceMappingURL=application.js.map
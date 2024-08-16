import {
    EVENT_METADATA_KEY,
    CHILD_COMPONENT_METADATA_KEY,
    COMPONENT_EVENT_METADATA_KEY,
    QUERY_METADATA_KEY,
    ChangeDetector,
    ComponentContainer,
    ComponentEventEmitter,
    IocContainer,
    childComponentModifierFunction,
    componentEventCallbackSetupFunction,
    eventCallbackSetupFunction,
    queryModifierFunction,
    TimeService
} from "../src";

import { InputComponent } from "./components/input.component/input.component";
import { FormComponent } from "./components/form.component/form.component";
import { CounterComponent } from "./components/counter.component/counter.component";
import { CounterService } from "./services/counter.service";
import { Dashboard } from "./components/dashboard.component/dashboard.component";

window.onload = function () {
    // We first need a root element to start the application.
    const rootElement = document.getElementById('app') as HTMLElement;

    // The IoC container is used to resolve dependencies.
    const iocContainer = new IocContainer();

    // Argument modifiers are constructor argument modifiers that modify the arguments before they are passed to the constructor.
    // The @Query decorator is used to inject a query selector result into a component.
    iocContainer.registerArgumentModifier(QUERY_METADATA_KEY, queryModifierFunction);
    // The @ChildComponent decorator is used to inject a child component instance into a component.
    iocContainer.registerArgumentModifier(CHILD_COMPONENT_METADATA_KEY, childComponentModifierFunction);

    // We register the services and components in the IoC container.
    iocContainer.registerValue(ComponentEventEmitter.name, new ComponentEventEmitter());
    iocContainer.registerValue(TimeService.name, new TimeService());
    // This factory function will only be executed when we request the value.
    iocContainer.registerFactory<CounterService>(CounterService.name, () => new CounterService(iocContainer.resolve(TimeService.name)));

    // The change detector is used to detect changes in the DOM tree.
    const changeDetector = new ChangeDetector(rootElement);

    // The component container takes care of component instantiation, updates and removal.
    const componentContainer = new ComponentContainer(rootElement, iocContainer, changeDetector);

    // Callback decorators are used to register callback methods in the component.
    // The @Event decorator is used to register an event listener in the component.
    componentContainer.registerCallbackSetupFunction(EVENT_METADATA_KEY, eventCallbackSetupFunction);
    // The @ComponentEvent decorator is used to register a component event listener in the component.
    componentContainer.registerCallbackSetupFunction(COMPONENT_EVENT_METADATA_KEY, componentEventCallbackSetupFunction);

    // We register the components in the component container.
    componentContainer.registerComponent(InputComponent);
    componentContainer.registerComponent(FormComponent);
    componentContainer.registerComponent(CounterComponent);
    componentContainer.registerComponent(Dashboard);
}

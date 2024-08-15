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

import { InputComponent } from "./components/input.component";
import { FormComponent } from "./components/form.component";
import { CounterComponent } from "./components/counter.component";
import { CounterService } from "./services/counter.service";

window.onload = function () {
    const rootElement = document.getElementById('app') as HTMLElement;

    const iocContainer = new IocContainer();
    iocContainer.registerArgumentModifier(QUERY_METADATA_KEY, queryModifierFunction);
    iocContainer.registerArgumentModifier(CHILD_COMPONENT_METADATA_KEY, childComponentModifierFunction);
    iocContainer.registerValue(ComponentEventEmitter.name, new ComponentEventEmitter());
    iocContainer.registerValue(TimeService.name, new TimeService());
    iocContainer.registerFactory<CounterService>(CounterService.name, () => new CounterService(iocContainer.resolve(TimeService.name)));

    const changeDetector = new ChangeDetector(rootElement);

    const componentContainer = new ComponentContainer(rootElement, iocContainer, changeDetector);

    componentContainer.registerCallbackSetupFunction(EVENT_METADATA_KEY, eventCallbackSetupFunction);
    componentContainer.registerCallbackSetupFunction(COMPONENT_EVENT_METADATA_KEY, componentEventCallbackSetupFunction);
    componentContainer.registerComponent(InputComponent);
    componentContainer.registerComponent(FormComponent);
    componentContainer.registerComponent(CounterComponent);
}

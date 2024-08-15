export { ComponentContainer } from './componentContainer/componentContainer';

// Decorators
export { argumentModifier, ArgumentMetadata } from './decorators/argumentModifier.decorator/argumentModifier.decorator';
export { callback, CallbackMetadata, CallbackSetupFunction } from './decorators/callback.decorator/callback.decorator';
export {
    CHILD_COMPONENT_METADATA_KEY,
    ChildComponent,
    childComponentModifierFunction,
    ChildComponentReference,
    ChildComponentCollection,
    ChildComponentMetadata,
} from './decorators/childComponent.decorator/childComponent.decorator';
export {
    COMPONENT_METADATA_KEY,
    Component,
    ComponentMetadata,
    ComponentMetadataInput,
    LifecycleHook,
} from './decorators/component.decorator/component.decorator';
export {
    COMPONENT_EVENT_METADATA_KEY,
    ComponentEvent,
    componentEventCallbackSetupFunction,
    ComponentEventMetadata,
    ComponentEventOptions,
} from './decorators/componentEvent.decorator/componentEvent.decorator';
export {
    EVENT_METADATA_KEY,
    Event,
    eventCallbackSetupFunction,
    DomEvent,
    EventMetadata,
    EventOptions,
} from './decorators/event.decorator/event.decorator';
export {
    Injectable,
    getInjectableMetadata,
    InjectableMetadata,
    ParamMetadata,
    InjectableMetadataInput,
} from './decorators/injectable.decorator/injectable.decorator';
export {
    ROOT_ELEMENT_KEY,
    QUERY_METADATA_KEY,
    Query,
    queryModifierFunction,
    ActiveElementReference,
    ActiveElementCollection,
    QueryInputMetadata,
    QueryMetadata,
} from './decorators/query.decorator/query.decorator';

// Interfaces
export { ChangeDetectorInterface } from './interfaces/changeDetector.interface';
export { ComponentData } from './interfaces/componentData.interface';
export { ComponentInstance } from './interfaces/componentInstance.interface';
export { IocContainerInterface } from './interfaces/IocContainer.interface';
export { Mutation, MutationType} from './interfaces/mutation.interface';
export { OnChange } from './interfaces/onChange.interface';
export { OnDestroy } from './interfaces/onDestroy.interface';
export { OnInit } from './interfaces/onInit.interface';

// Interface implementations
export { IocContainer } from './iocContainer/IocContainer';
export { ChangeDetector } from './changeDetector/changeDetector';

// Services
export { ComponentEventEmitter, ComponentEventPayload } from './services/eventEmitter/componentEventEmitter';
export { TimeService } from './services/timeService/timeService';

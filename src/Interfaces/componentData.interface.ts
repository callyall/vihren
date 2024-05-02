import { ComponentMetadata } from "../Decorators/component.decorator";
import { EventMetadataGroup } from "../Decorators/event.decorator";

export interface ComponentData<K extends keyof DocumentEventMap> {
    constructor: Function;
    metadata: ComponentMetadata;
    eventMetadata?: EventMetadataGroup<K>[];
};

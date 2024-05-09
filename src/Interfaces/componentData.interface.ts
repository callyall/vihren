import { ComponentMetadata } from "../Decorators/component.decorator/component.decorator";
import { CallbackMetadata } from "../Decorators/callback.decorator/callback.decorator";

export interface ComponentData {
    constructor: Function;
    metadata: ComponentMetadata;
    callbackMetadata?: Map<string, CallbackMetadata<any>[]>;
}

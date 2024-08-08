import { ComponentMetadata } from "../decorators/component.decorator/component.decorator";
import { CallbackMetadata } from "../decorators/callback.decorator/callback.decorator";
export interface ComponentData {
    constructor: Function;
    metadata: ComponentMetadata;
    callbackMetadata?: Map<string, CallbackMetadata<any>[]>;
}

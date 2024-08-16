export declare const DYNAMIC_PROPERTY_UPDATE_EVENT = "dynamicPropertyUpdate";
/**
 * Decorator to define a dynamic property.
 *
 * This decorator will create getters and setters for the property that will trigger a render when the value is updated.
 */
export declare const DynamicProperty: () => (target: unknown, property: string) => any;
export interface DynamicPropertyUpdateEventDetail {
    component: any;
}

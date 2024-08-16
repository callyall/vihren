export declare const DYNAMIC_PROPERTY_UPDATE_EVENT = "dynamicPropertyUpdate";
export declare const DynamicProperty: () => (target: unknown, property: string) => any;
export interface DynamicPropertyUpdateEventDetail {
    component: any;
}

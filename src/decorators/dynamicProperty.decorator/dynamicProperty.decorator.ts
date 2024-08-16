export const DYNAMIC_PROPERTY_UPDATE_EVENT = 'dynamicPropertyUpdate';

export const DynamicProperty = () => (target: unknown, property: string): any => {
    if (typeof (target as any)['render'] != 'function') {
        throw new Error(`Property ${property} cannot be dynamic if the component is not dynamic`);
    }

    let storedValue: unknown;

    return {
        set: function (value: unknown): void {
            storedValue = value;

            const event = new CustomEvent<DynamicPropertyUpdateEventDetail>(DYNAMIC_PROPERTY_UPDATE_EVENT, { detail: { component: this } });
            document.dispatchEvent(event);
        },
        get: function (): unknown {
            return storedValue;
        },
        enumerable: true,
        configurable: true
    };
}

export interface DynamicPropertyUpdateEventDetail {
    component: any;
}

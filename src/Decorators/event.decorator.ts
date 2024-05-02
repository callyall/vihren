export const EVENT_METADATA_KEY = 'method:event';

export const Event = <K extends keyof DocumentEventMap>(args: EventMetadatInput<K>) => (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const metadata = (Reflect.getMetadata(EVENT_METADATA_KEY, target.constructor) ?? []) as EventMetadataGroup<K>[];

    const group = metadata.find((group) => group.type === args.type);

    if (group) {
        group.selectors.push({ selector: args.selector, options: args.options, callback: propertyKey as string});

        Reflect.defineMetadata(EVENT_METADATA_KEY, metadata, target.constructor);

        return;
    }

    metadata.push({
        type: args.type,
        selectors: [{ selector: args.selector, options: args.options, callback: propertyKey as string }]
    });

    Reflect.defineMetadata(EVENT_METADATA_KEY, metadata, target.constructor);
};

export interface EventMetadataGroup<K extends keyof DocumentEventMap> {
    type: K,
    selectors: EventMetadataSelector[]
};

export interface EventMetadatInput<K extends keyof DocumentEventMap> {
    type: K,
    selector: string,
    options?: EventOptions
};

export interface EventMetadataSelector {
    selector: string;
    callback: string;
    options?: EventOptions;
};

export interface EventOptions {
    debounce?: number;
};

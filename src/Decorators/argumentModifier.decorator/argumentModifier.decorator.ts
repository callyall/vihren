import "reflect-metadata";

export const ARGUMENT_MODIFIER_METADATA_KEY = 'argument:modifier';

export const argumentModifier = <T>(metadata: ArgumentMetadata<T>, target: Function, parameterIndex: number): void => {
    const metadataMap = Reflect.getMetadata(ARGUMENT_MODIFIER_METADATA_KEY, target) ?? new Map<number, ArgumentMetadata<any>>();

    metadataMap.set(parameterIndex, metadata);

    Reflect.defineMetadata(ARGUMENT_MODIFIER_METADATA_KEY, metadataMap, target);
};

export interface ArgumentMetadata<T> {
    key: string;
    data: T
}

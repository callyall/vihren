import "reflect-metadata";
export declare const INJECTABLE_METADATA_KEY = "ioc:injectable";
/**
 * Decorator to define a class as injectable.
 *
 * The shared property is used to determine if the class should be shared across all object or a new instance should be instantiated every time.
 */
export declare const Injectable: (args?: InjectableMetadata) => ClassDecorator;
export declare const getInjectableMetadata: (target: Function, args?: InjectableMetadataInput) => InjectableMetadata;
export interface InjectableMetadata extends InjectableMetadataInput {
    params?: ParamMetadata[];
}
export interface ParamMetadata {
    name: string;
    type: Function;
}
export interface InjectableMetadataInput {
    shared: boolean;
}

import "reflect-metadata";
export declare const INJECTABLE_METADATA_KEY = "ioc:injectable";
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

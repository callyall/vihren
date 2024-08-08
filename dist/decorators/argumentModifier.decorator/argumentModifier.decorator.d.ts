import "reflect-metadata";
export declare const ARGUMENT_MODIFIER_METADATA_KEY = "argument:modifier";
export declare const argumentModifier: <T>(metadata: ArgumentMetadata<T>, target: Function, parameterIndex: number) => void;
export interface ArgumentMetadata<T> {
    key: string;
    data: T;
}

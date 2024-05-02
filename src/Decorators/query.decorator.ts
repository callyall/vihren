export const QUERY_METADATA_KEY = 'argument:query';

export const Query = (args?: QueryInputMetadata) => (target: Function, propertyKey: unknown, parameterIndex: number): void => {
    const metadata: QueryMetadata = {
        selector: args?.selector,
        multiple: args?.multiple ?? false,
        parameterIndex
    }

    Reflect.defineMetadata(`${QUERY_METADATA_KEY}:${parameterIndex}`, metadata, target);
};

export interface QueryInputMetadata {
    selector?: string;
    multiple?: boolean;
};

export interface QueryMetadata {
    selector?: string;
    multiple: boolean;
    parameterIndex: number;
};
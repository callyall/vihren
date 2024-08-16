import "reflect-metadata";

export const INJECTABLE_METADATA_KEY = 'ioc:injectable';

/**
 * Decorator to define a class as injectable.
 *
 * The shared property is used to determine if the class should be shared across all object or a new instance should be instantiated every time.
 */
export const Injectable = (args?: InjectableMetadata): ClassDecorator => (target) => {
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, getInjectableMetadata(target, args), target);
};

export const getInjectableMetadata = (target: Function, args?: InjectableMetadataInput): InjectableMetadata => {
    const metadata: InjectableMetadata = args || { shared: false };
    const paramTypes = Reflect.getMetadata('design:paramtypes', target);

    if (!paramTypes) {
        return metadata;
    }

    const result = /constructor\s*\([^)]*\)/.exec(target.toString()) as RegExpExecArray;

    metadata.params = result[0]
        .replace(/constructor\s*\(/, '')
        .replace(')', '')
        .replace(/\s+/, '')
        .split(',')
        .filter((param) => param.trim() !== '')
        .map((param, i) => ({
            name: param.trim().split(' ')[0],
            type: paramTypes[i]
        }));

    return metadata;    
}

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

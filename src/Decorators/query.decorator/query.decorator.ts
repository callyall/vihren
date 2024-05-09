import { ArgumentMetadata, argumentModifier } from "../argumentModifier.decorator/argumentModifier.decorator";
import { ModifierFunction } from "../../Interfaces/IocContainer.interface";

export const ROOT_ELEMENT_KEY = 'rootElement';
export const QUERY_METADATA_KEY = 'argument:query';

export const Query = (args?: QueryInputMetadata) => (target: Function, propertyKey: unknown, parameterIndex: number): void => {
    const queryMetadata: QueryMetadata = {
        selector: args?.selector,
        multiple: args?.multiple ?? false,
        parameterIndex,
    }

    if (queryMetadata.selector === undefined && queryMetadata.multiple) {
        throw new Error('Query cannot expect multiple results without a selector');
    }

    const metadata: ArgumentMetadata<QueryMetadata> = {
        key: QUERY_METADATA_KEY,
        data: queryMetadata,
    };

    argumentModifier<QueryMetadata>(metadata, target, parameterIndex);
}

export const queryModifier: ModifierFunction<QueryMetadata> = (name: string, argumentMetadata: ArgumentMetadata<QueryMetadata>, args: Map<string, any>): Map<string, any> => {
    if (!args.has(ROOT_ELEMENT_KEY)) {
        throw new Error('No root element found');
    }

    const rootElement = args.get(ROOT_ELEMENT_KEY) as HTMLElement;
    const queryMetadata: QueryMetadata = argumentMetadata.data as QueryMetadata;

    args.set(
        name,
        queryMetadata.selector
            ? (
                queryMetadata.multiple
                    ? rootElement.querySelectorAll(queryMetadata.selector)
                    : rootElement.querySelector(queryMetadata.selector)
            )
            : rootElement
    );

    return args;
}

export interface QueryInputMetadata {
    selector?: string;
    multiple?: boolean;
}

export interface QueryMetadata {
    selector?: string;
    multiple: boolean;
    parameterIndex: number;
}
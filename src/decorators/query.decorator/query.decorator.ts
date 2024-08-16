import { ArgumentMetadata, argumentModifier } from "../argumentModifier.decorator/argumentModifier.decorator";
import { ModifierFunction } from "../../interfaces/IocContainer.interface";
import { ParamMetadata } from "../injectable.decorator/injectable.decorator";

export const ROOT_ELEMENT_KEY = 'rootElement';
export const QUERY_METADATA_KEY = 'argument:query';

/**
 * Decorator to inject a query selector result into a component
 *
 * The results can be either dynamic or static, and can be a single result or a collection of results.
 */
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

/**
 * The logic that retrieves the elements and passes them to the component
 *
 * This will be called internally, and you will not need to call it yourself
 */
export const queryModifierFunction: ModifierFunction<QueryMetadata> = (argumentMetadata: ArgumentMetadata<QueryMetadata>, paramMetadata: ParamMetadata, args: Map<string, any>): Map<string, any> => {
    if (!args.has(ROOT_ELEMENT_KEY)) {
        throw new Error('No root element found');
    }

    const rootElement = args.get(ROOT_ELEMENT_KEY) as HTMLElement;
    const queryMetadata: QueryMetadata = argumentMetadata.data as QueryMetadata;

    if (paramMetadata.type.name === ActiveElementReference.name) {
        if (!queryMetadata.selector) {
            throw new Error('ActiveElementReference cannot be used without a selector');
        }

        if (queryMetadata.multiple) {
            throw new Error('ActiveElementReference cannot be used with multiple results');
        }

        args.set(paramMetadata.name, new ActiveElementReference(rootElement, queryMetadata.selector));
        return args;
    }

    if (paramMetadata.type.name === ActiveElementCollection.name) {
        if (!queryMetadata.selector) {
            throw new Error('ActiveElementCollection cannot be used without a selector');
        }

        if (!queryMetadata.multiple) {
            throw new Error('ActiveElementCollection cannot be used with a single result');
        }

        args.set(paramMetadata.name, new ActiveElementCollection(rootElement, queryMetadata.selector));
        return args;
    }

    args.set(
        paramMetadata.name,
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

/**
 * Dynamic reference to an HTML element.
 */
export class ActiveElementReference {
    public constructor(private rootElement: HTMLElement, private selector: string) {}

    /**
     * Get the element.
     */
    public get(): HTMLElement | null {
        return this.rootElement.querySelector(this.selector);
    }
}

/**
 * Dynamic reference to a collection of HTML elements.
 */
export class ActiveElementCollection {
    public constructor(private rootElement: HTMLElement, private selector: string) {}

    /**
     * Get the elements.
     */
    public get(): HTMLElement[] {
        return Array.from(this.rootElement.querySelectorAll(this.selector));
    }
}

export interface QueryInputMetadata {
    selector?: string;
    multiple?: boolean;
}

export interface QueryMetadata extends QueryInputMetadata{
    multiple: boolean;
    parameterIndex: number;
}
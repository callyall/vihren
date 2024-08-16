import { ModifierFunction } from "../../interfaces/IocContainer.interface";
export declare const ROOT_ELEMENT_KEY = "rootElement";
export declare const QUERY_METADATA_KEY = "argument:query";
/**
 * Decorator to inject a query selector result into a component
 *
 * The results can be either dynamic or static, and can be a single result or a collection of results.
 */
export declare const Query: (args?: QueryInputMetadata) => (target: Function, propertyKey: unknown, parameterIndex: number) => void;
/**
 * The logic that retrieves the elements and passes them to the component
 *
 * This will be called internally, and you will not need to call it yourself
 */
export declare const queryModifierFunction: ModifierFunction<QueryMetadata>;
/**
 * Dynamic reference to an HTML element.
 */
export declare class ActiveElementReference {
    private rootElement;
    private selector;
    constructor(rootElement: HTMLElement, selector: string);
    /**
     * Get the element.
     */
    get(): HTMLElement | null;
}
/**
 * Dynamic reference to a collection of HTML elements.
 */
export declare class ActiveElementCollection {
    private rootElement;
    private selector;
    constructor(rootElement: HTMLElement, selector: string);
    /**
     * Get the elements.
     */
    get(): HTMLElement[];
}
export interface QueryInputMetadata {
    selector?: string;
    multiple?: boolean;
}
export interface QueryMetadata extends QueryInputMetadata {
    multiple: boolean;
    parameterIndex: number;
}

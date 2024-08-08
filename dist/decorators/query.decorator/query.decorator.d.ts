import { ModifierFunction } from "../../interfaces/IocContainer.interface";
export declare const ROOT_ELEMENT_KEY = "rootElement";
export declare const QUERY_METADATA_KEY = "argument:query";
export declare const Query: (args?: QueryInputMetadata) => (target: Function, propertyKey: unknown, parameterIndex: number) => void;
export declare const queryModifierFunction: ModifierFunction<QueryMetadata>;
export declare class ActiveElementReference {
    private rootElement;
    private selector;
    constructor(rootElement: HTMLElement, selector: string);
    get(): HTMLElement | null;
}
export declare class ActiveElementCollection {
    private rootElement;
    private selector;
    constructor(rootElement: HTMLElement, selector: string);
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

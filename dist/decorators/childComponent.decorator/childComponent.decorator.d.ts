import { ComponentContainer } from "../../componentContainer/componentContainer";
import { ComponentInstance } from "../../interfaces/componentInstance.interface";
import { ModifierFunction } from "../../interfaces/IocContainer.interface";
export declare const CHILD_COMPONENT_METADATA_KEY = "childComponent:metadata";
export declare const ChildComponent: (args: ChildComponentMetadataInput) => (target: Function, propertyKey: unknown, parameterIndex: number) => void;
export declare const childComponentModifierFunction: ModifierFunction<ChildComponentMetadata>;
declare abstract class AbstractComponentReference<T> {
    protected rootElement: HTMLElement;
    protected selector: string;
    protected componentSelector: string;
    protected componentContainer: ComponentContainer;
    protected constructor(rootElement: HTMLElement, selector: string, componentSelector: string, componentContainer: ComponentContainer);
    protected getComponentInstance(element: HTMLElement): ComponentInstance<T> | undefined;
}
export declare class ChildComponentReference<T> extends AbstractComponentReference<T> {
    constructor(rootElement: HTMLElement, selector: string, componentSelector: string, componentContainer: ComponentContainer);
    get(): ComponentInstance<T> | undefined;
}
export declare class ChildComponentCollection<T> extends AbstractComponentReference<T> {
    constructor(rootElement: HTMLElement, selector: string, componentSelector: string, componentContainer: ComponentContainer);
    get(): ComponentInstance<T>[];
}
export interface ChildComponentMetadataInput {
    selector: string;
    componentSelector?: string;
}
export interface ChildComponentMetadata extends ChildComponentMetadataInput {
    componentSelector: string;
    parameterIndex: number;
}
export {};

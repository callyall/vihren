import { ComponentContainer } from "../../componentContainer/componentContainer";
import { ComponentInstance } from "../../interfaces/componentInstance.interface";
import { ModifierFunction } from "../../interfaces/IocContainer.interface";
export declare const CHILD_COMPONENT_METADATA_KEY = "childComponent:metadata";
/**
 * Decorator to inject a child component reference into a component
 */
export declare const ChildComponent: (args: ChildComponentMetadataInput) => (target: Function, propertyKey: unknown, parameterIndex: number) => void;
/**
 * The logic that retrieves the child component instances and passes them to the component
 *
 * This will be called internally, and you will not need to call it yourself
 */
export declare const childComponentModifierFunction: ModifierFunction<ChildComponentMetadata>;
declare abstract class AbstractComponentReference<T> {
    protected rootElement: HTMLElement;
    protected selector: string;
    protected componentSelector: string;
    protected componentContainer: ComponentContainer;
    protected constructor(rootElement: HTMLElement, selector: string, componentSelector: string, componentContainer: ComponentContainer);
    protected getComponentInstance(element: HTMLElement): ComponentInstance<T> | undefined;
}
/**
 * Dynamic reference to a child component.
 */
export declare class ChildComponentReference<T> extends AbstractComponentReference<T> {
    constructor(rootElement: HTMLElement, selector: string, componentSelector: string, componentContainer: ComponentContainer);
    /**
     * Get the child component.
     */
    get(): ComponentInstance<T> | undefined;
}
/**
 * Dynamic reference to a collection of child components.
 */
export declare class ChildComponentCollection<T> extends AbstractComponentReference<T> {
    constructor(rootElement: HTMLElement, selector: string, componentSelector: string, componentContainer: ComponentContainer);
    /**
     * Get all child components.
     */
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

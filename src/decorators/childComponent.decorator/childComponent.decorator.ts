import { ComponentContainer } from "../../componentContainer/componentContainer";
import { ComponentInstance } from "../../interfaces/componentInstance.interface";
import { ArgumentMetadata, argumentModifier } from "../argumentModifier.decorator/argumentModifier.decorator";
import { ModifierFunction } from "../../interfaces/IocContainer.interface";
import { ParamMetadata } from "../injectable.decorator/injectable.decorator";
import { ROOT_ELEMENT_KEY } from "../query.decorator/query.decorator";

export const CHILD_COMPONENT_METADATA_KEY = 'childComponent:metadata';

/**
 * Decorator to inject a child component reference into a component
 */
export const ChildComponent = (args: ChildComponentMetadataInput) => (target: Function, propertyKey: unknown, parameterIndex: number): void => {

    const metadata: ArgumentMetadata<ChildComponentMetadata> = {
        key: CHILD_COMPONENT_METADATA_KEY,
        data: {
            selector: args.selector,
            componentSelector: args.componentSelector ?? args.selector,
            parameterIndex,
        },
    };

    argumentModifier<ChildComponentMetadata>(metadata, target, parameterIndex);
};

/**
 * The logic that retrieves the child component instances and passes them to the component
 *
 * This will be called internally, and you will not need to call it yourself
 */
export const childComponentModifierFunction: ModifierFunction<ChildComponentMetadata> = (argumentMetadata: ArgumentMetadata<ChildComponentMetadata>, paramMetadata: ParamMetadata, args: Map<string, any>): Map<string, any> => {
    if (!args.has(ROOT_ELEMENT_KEY)) {
        throw new Error('No root element found');
    }

    if (!args.has(ComponentContainer.COMPONENT_CONTAINER_KEY)) {
        throw new Error('No component container found');
    }

    const rootElement = args.get(ROOT_ELEMENT_KEY) as HTMLElement;
    const componentContainer = args.get(ComponentContainer.COMPONENT_CONTAINER_KEY) as ComponentContainer;

    args.set(paramMetadata.name, constructReference(paramMetadata.type === ChildComponentCollection, argumentMetadata.data.selector, argumentMetadata.data.componentSelector, rootElement, componentContainer));

    return args;
}

const constructReference = (multiple: boolean, selector: string, componentSelector: string, rootElement: HTMLElement, componentContainer: ComponentContainer): AbstractComponentReference<any> => {
    if (multiple) {
        return new ChildComponentCollection(rootElement, selector, componentSelector, componentContainer);
    }

    return multiple
        ? new ChildComponentCollection(rootElement, selector, componentSelector, componentContainer)
        : new ChildComponentReference(rootElement, selector, componentSelector, componentContainer);
}

abstract class AbstractComponentReference<T> {
    protected constructor(protected rootElement: HTMLElement, protected selector: string, protected componentSelector: string, protected componentContainer: ComponentContainer) {}

    protected getComponentInstance(element: HTMLElement): ComponentInstance<T> | undefined {
        const instanceId = element.getAttribute('instance');

        if (!instanceId) {
            throw new Error('Instance id not found');
        }

        const instances = this.componentContainer.getComponentInstancesBySelector(this.componentSelector);

        return instances.get(instanceId);
    }
}

/**
 * Dynamic reference to a child component.
 */
export class ChildComponentReference<T> extends AbstractComponentReference<T> {
    public constructor(rootElement: HTMLElement, selector: string, componentSelector: string, componentContainer: ComponentContainer) {
        super(rootElement, selector, componentSelector, componentContainer);
    }

    /**
     * Get the child component.
     */
    public get(): ComponentInstance<T> | undefined {
        const element = this.rootElement.querySelector(this.selector);

        if (!element) {
            throw new Error(`Element with selector ${this.selector} not found`);
        }

        return this.getComponentInstance(element as HTMLElement);
    }
}

/**
 * Dynamic reference to a collection of child components.
 */
export class ChildComponentCollection<T> extends AbstractComponentReference<T> {
    public constructor(rootElement: HTMLElement, selector: string, componentSelector: string, componentContainer: ComponentContainer) {
        super(rootElement, selector, componentSelector, componentContainer);
    }

    /**
     * Get all child components.
     */
    public get(): ComponentInstance<T>[] {
        const elements = this.rootElement.querySelectorAll(this.selector);

        if (!elements.length) {
            throw new Error(`Element with selector ${this.selector} not found`);
        }

        return Array.from(elements).map((element) => {
            const instance = this.getComponentInstance(element as HTMLElement);

            if (!instance) {
                throw new Error(`Instance for element ${(element as HTMLElement).outerHTML} not found`);
            }

            return instance as ComponentInstance<T>;
        });
    }
}

export interface ChildComponentMetadataInput {
    selector: string;
    componentSelector?: string;
}

export interface ChildComponentMetadata extends ChildComponentMetadataInput {
    componentSelector: string;
    parameterIndex: number;
}

import { Component, ComponentEventEmitter, Event, Query } from "../../../src";

/**
 * The @Component decorator is used to declare a class as a component.
 * This is the simplest type of component, it does not have a template and it is not dynamic.
 * It will get instantiated when the selector is found in the DIM
 */
@Component({ selector: '.input-component' })
export class InputComponent {

    /**
     * The @Query decorator is used to inject a query selector result into a component.
     */
    public constructor(
        @Query({ selector: 'input', multiple: false }) public readonly input: HTMLInputElement,
        private readonly eventEmitter: ComponentEventEmitter,
    ) {}

    /**
     * The @Event decorator is used to declare a method as an event listener.
     * The event listener will automatically be removed when the component gets destroyed.
     */
    @Event({ type: 'keyup', selector: 'input', options: { debounce: 100 } })
    public keyup(): void {
        if (this.input.readOnly) {
            return;
        }

        const isValid = this.isValid();

        this.eventEmitter.emit<string, boolean>('inputValidation', { source: this.input.type, data: isValid });

        if (isValid) {
            this.input.classList.remove('is-invalid');
            return;
        }

        if (!this.input.classList.contains('is-invalid')) {
            this.input.classList.add('is-invalid');
        }
    }

    private isValid(): boolean {
        if (this.input.type === 'email') {
            return this.getValue().includes('@');
        }

        return this.getValue().length > 5;
    }

    public getValue(): string {
        return this.input.value;
    }

    public toggle(): boolean {
        this.input.readOnly = !this.input.readOnly;

        return this.input.readOnly;
    }
}

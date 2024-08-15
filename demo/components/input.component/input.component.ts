import { Component, ComponentEventEmitter, Event, Query } from "../../../src";

@Component({ selector: '.input-component' })
export class InputComponent {
    public constructor(
        @Query({ selector: 'input', multiple: false }) public readonly input: HTMLInputElement,
        private readonly eventEmitter: ComponentEventEmitter,
    ) {}

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

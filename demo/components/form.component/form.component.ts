import {
    ChildComponent,
    ChildComponentCollection,
    Component, ComponentEvent, ComponentEventPayload,
    ComponentInstance,
    Event,
    OnDestroy,
    Query
} from "../../../src";
import { InputComponent } from "../input.component/input.component";
import template from "./form.component.html"

/**
 * The @Component decorator is used to declare a class as a component.
 * In addition to that this component is using a html template that is passed to the decorator.
 * This template will be rendered once when the component is created, but is not dynamic, and it will not be updated automatically.
 */
export @Component({ selector: '#form-component', template })
class FormComponent implements OnDestroy {
    private inputValidity: Map<string, boolean> = new Map<string, boolean>([['email', false], ['password', false]]);

    /**
     * The @ChildComponent decorator is used to inject a child component instance into a component.
     * The @Query decorator is used to inject a query selector result into a component.
     */
    public constructor(
        // @ChildComponent({ selector: '#email-component', componentSelector: '.input-component' }) private emailComponent: ChildComponentReference<InputComponent>,
        // @ChildComponent({ selector: '#password-component', componentSelector: '.input-component' }) private passwordComponent: ChildComponentReference<InputComponent>,
        @ChildComponent({ selector: '.input-component' }) private readonly inputs: ChildComponentCollection<InputComponent>,
        @Query({ selector: '#submit', multiple: false }) private readonly submitButton: HTMLButtonElement,
    ) {
        this.submitButton.disabled = true;
    }

    private isValid(): boolean {
        return Array.from(this.inputValidity.values()).reduce((acc, curr) => acc && curr, true);
    }

    /**
     * The @Event decorator is used to declare a method as an event listener.
     * The event listener will automatically be removed when the component gets destroyed.
     */
    @Event({ type: 'click', selector: '#submit' })
    public onSubmit(e: Event): void {
        e.preventDefault();

        if (!this.isValid()) {
            return;
        }

        this.submitButton.disabled = true;
        this.inputs.get().forEach((input: ComponentInstance<InputComponent>) => input.instance.toggle());
        const div = document.createElement('div');
        div.id = 'counter-component';

        document.getElementById('app')?.prepend(div);
    }

    /**
     * THe @ComponentEvent decorator is used to declare a method as a component event listener.
     * THe component event is emitted by the ComponentEventEmitter.
     * This listener will automatically be removed when the component gets destroyed.
     */
    @ComponentEvent({ type: 'inputValidation' })
    public onValidate(payload: ComponentEventPayload<string, boolean>): void {
        this.inputValidity.set(payload.source, payload.data);

        if (this.isValid()) {
            this.submitButton.disabled = false;
            return;
        }

        this.submitButton.disabled = true;
    }

    public onDestroy(): void {
        const div = document.createElement('div');
        div.id = 'dashboard';
        div.dataset.name = `${this.inputs.get()[0].instance.getValue()} - ${this.inputs.get()[1].instance.getValue()}`;

        document.getElementById('app')?.appendChild(div);
    }
}

import {
    ChildComponent,
    ChildComponentCollection,
    Component, ComponentEvent, ComponentEventPayload,
    ComponentInstance,
    Event,
    OnDestroy,
    Query
} from "../../src";
import {InputComponent} from "./input.component";

export @Component({ selector: '#form-component' })
class FormComponent implements OnDestroy {
    private inputValidity: Map<string, boolean> = new Map<string, boolean>([['email', false], ['password', false]]);

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

    @Event({ type: 'click', selector: '#submit' })
    public onSubmit(e: Event): void {
        e.preventDefault();

        if (!this.isValid()) {
            return;
        }

        this.submitButton.disabled = true;
        this.inputs.get().forEach((input: ComponentInstance<InputComponent>) => input.instance.toggle());
        const div = document.createElement('div');
        div.innerHTML = '<h1></h1>'

        div.classList.add('row', 'mt-4', 'p-5', 'bg-primary', 'text-white', 'rounded', 'justify-content-center');
        div.id = 'counter-component';

        document.getElementById('app')?.prepend(div);
    }

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
        div.innerHTML = `
          <h1>You are logged in</h1>
          <p>${this.inputs.get()[0].instance.getValue()} - ${this.inputs.get()[1].instance.getValue()}</p>
        `;

        div.classList.add('row', 'mt-4', 'p-5', 'bg-primary', 'text-white', 'rounded', 'justify-content-center');

        document.getElementById('app')?.appendChild(div);
    }
}

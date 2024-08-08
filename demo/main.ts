import {interval, map, Observable, Subscription} from "rxjs";
import {
    EVENT_METADATA_KEY,
    CHILD_COMPONENT_METADATA_KEY,
    COMPONENT_EVENT_METADATA_KEY,
    QUERY_METADATA_KEY,
    ChangeDetector,
    ChildComponentCollection,
    ComponentContainer,
    ComponentEventEmitter,
    ComponentEventPayload,
    ComponentInstance,
    IocContainer,
    OnDestroy,
    OnInit,
    ChildComponent,
    childComponentModifierFunction,
    Component,
    ComponentEvent,
    componentEventCallbackSetupFunction,
    Event,
    eventCallbackSetupFunction,
    Injectable,
    Query,
    queryModifierFunction,
} from "../src";

@Component({ selector: '.input-component' })
class InputComponent {
    public constructor(
        @Query({ selector: 'input', multiple: false }) public input: HTMLInputElement,
        private eventEmitter: ComponentEventEmitter,
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

@Component({ selector: '#form-component' })
class FormComponent implements OnDestroy {
    private inputValidity: Map<string, boolean> = new Map<string, boolean>([['email', false], ['password', false]]);

    public constructor(
        // @ChildComponent({ selector: '#email-component', componentSelector: '.input-component' }) private emailComponent: ChildComponentReference<InputComponent>,
        // @ChildComponent({ selector: '#password-component', componentSelector: '.input-component' }) private passwordComponent: ChildComponentReference<InputComponent>,
        @ChildComponent({ selector: '.input-component' }) private inputs: ChildComponentCollection<InputComponent>,
        @Query({ selector: '#submit', multiple: false }) private submitButton: HTMLButtonElement,
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

@Injectable({ shared: true })
class CounterService {
    private counter: number = 10;
    private counter$: Observable<number> = interval(1000).pipe(
        map(() => {
            this.counter--;

            if (this.counter < 0) {
                this.counter = 10;
            }

            return this.counter;
        })
    );

    public getCounter(): Observable<number> {
        return this.counter$;
    }
}

@Component({ selector: '#counter-component' })
class CounterComponent implements OnInit, OnDestroy {
    private counterSubscription: Subscription | null = null;

    public constructor(
        private counterService: CounterService,
        @Query() private rootElement: HTMLDivElement,
        @Query({ selector: 'h1' }) private header: HTMLHeadingElement,
    ) {
    }

    public onInit(): void {
        this.counterService.getCounter().subscribe((counter: number) => {
            if (counter === 0) {
                this.rootElement.remove();
            }

            this.header.textContent = `Redirecting in ${counter}`;
        });
    }

    public onDestroy(): void {
        this.counterSubscription?.unsubscribe();
        document.getElementById('form-component')?.remove();
    }
}

window.onload = function () {
    const rootElement = document.getElementById('app') as HTMLElement;

    const iocContainer = new IocContainer();
    iocContainer.registerArgumentModifier(QUERY_METADATA_KEY, queryModifierFunction);
    iocContainer.registerArgumentModifier(CHILD_COMPONENT_METADATA_KEY, childComponentModifierFunction);
    iocContainer.registerValue(ComponentEventEmitter.name, new ComponentEventEmitter());
    iocContainer.registerValue(CounterService.name, new CounterService());


    const componentContainer = new ComponentContainer(
        rootElement,
        iocContainer,
        new ChangeDetector(rootElement)
    );
    componentContainer.registerCallbackSetupFunction(EVENT_METADATA_KEY, eventCallbackSetupFunction);
    componentContainer.registerCallbackSetupFunction(COMPONENT_EVENT_METADATA_KEY, componentEventCallbackSetupFunction);
    componentContainer.registerComponent(InputComponent);
    componentContainer.registerComponent(FormComponent);
    componentContainer.registerComponent(CounterComponent);
}

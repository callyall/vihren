import { map, Observable, Subscription, take } from "rxjs";
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
    TimeService
} from "../src";

@Component({ selector: '.input-component' })
class InputComponent {
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

@Component({ selector: '#form-component' })
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

@Injectable({ shared: true })
class CounterService {
    public constructor(private readonly timeService: TimeService) {}

    public getCounter(): Observable<number> {
        return this.timeService.interval(1000)
            .pipe(
                take(11),
                map((number) => 10 - number)
            )
    }
}

@Component({ selector: '#counter-component' })
class CounterComponent implements OnInit, OnDestroy {
    private counterSubscription: Subscription | null = null;

    public constructor(
        @Query() private readonly rootElement: HTMLDivElement,
        @Query({ selector: 'h1' }) private readonly header: HTMLHeadingElement,
        private readonly counterService: CounterService,
    ) {
    }

    public onInit(): void {
        this
            .counterService
            .getCounter()
            .subscribe({
                next: (counter: number) => this.header.textContent = `Redirecting in ${counter}`,
                complete: () => this.rootElement.remove(),
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
    iocContainer.registerValue(TimeService.name, new TimeService());
    iocContainer.registerFactory<CounterService>(CounterService.name, () => new CounterService(iocContainer.resolve(TimeService.name)));

    const changeDetector = new ChangeDetector(rootElement);

    const componentContainer = new ComponentContainer(rootElement, iocContainer, changeDetector);

    componentContainer.registerCallbackSetupFunction(EVENT_METADATA_KEY, eventCallbackSetupFunction);
    componentContainer.registerCallbackSetupFunction(COMPONENT_EVENT_METADATA_KEY, componentEventCallbackSetupFunction);
    componentContainer.registerComponent(InputComponent);
    componentContainer.registerComponent(FormComponent);
    componentContainer.registerComponent(CounterComponent);
}

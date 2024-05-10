import { Component } from "./Decorators/component.decorator/component.decorator";
import { OnDestroy } from "./Interfaces/onDestroy.interface";
import { OnInit } from "./Interfaces/onInit.interface";
import { ComponentContainer } from "./componentContainer/componentContainer";
import { Query, QUERY_METADATA_KEY, queryModifierFunction } from "./Decorators/query.decorator/query.decorator";
import { Observable, Subscription, interval, map } from "rxjs";
import { Injectable } from "./Decorators/injectable.decorator/injectable.decorator";
import { Event, EVENT_METADATA_KEY, eventCallbackSetupFunction } from "./Decorators/event.decorator/event.decorator";
import { IocContainer } from "./iocContainer/IocContainer";
import { CHILD_COMPONENT_METADATA_KEY, ChildComponent, childComponentModifierFunction, ChildComponentReference } from "./Decorators/childComponent.decorator/childComponent.decorator";

interface InputComponentInterface {
    isValid(): boolean;
    getValue(): string;
}

@Component({ selector: '#email-component' })
class EmailComponent implements InputComponentInterface {
    public constructor(
        @Query({ selector: 'input', multiple: false }) public input: HTMLInputElement,
    ) {}

    @Event({ type: 'keyup', selector: 'input', options: { debounce: 100 } })
    public keyup(): void {
        if (this.isValid()) {
            this.input.classList.remove('is-invalid');
            return;
        }

        if (!this.input.classList.contains('is-invalid')) {
            this.input.classList.add('is-invalid');
        }
    }

    public isValid(): boolean {
        return this.getValue().includes('@');
    }

    public getValue(): string {
        return this.input.value;
    }
}

@Component({ selector: '#password-component' })
class PasswordComponent implements InputComponentInterface {
    public constructor(
        @Query({ selector: 'input', multiple: false }) public input: HTMLInputElement,
    ) {}

    @Event({ type: 'keyup', selector: 'input', options: { debounce: 100 } })
    public keyup(): void {
        if (this.isValid()) {
            this.input.classList.remove('is-invalid');
            return;
        }

        if (!this.input.classList.contains('is-invalid')) {
            this.input.classList.add('is-invalid');
        }
    }

    public isValid(): boolean {
        return this.getValue().length > 5;
    }

    public getValue(): string {
        return this.input.value;
    }
}

@Component({ selector: '#form-component' })
class FormComponent implements OnDestroy {
    public constructor(
        @ChildComponent({ selector: '#email-component' }) public emailComponent: ChildComponentReference<EmailComponent>,
        @ChildComponent({ selector: '#password-component' }) public passwordComponent: ChildComponentReference<PasswordComponent>,
        @Query({ selector: '#submit', multiple: false }) public submitButton: HTMLButtonElement,
    ) {}

    private isValid(): boolean {
        return !!(this.emailComponent.get()?.instance.isValid() && this.passwordComponent.get()?.instance.isValid());
    }

    @Event({ type: 'click', selector: '#submit' })
    public onSubmit(e: Event): void {
        e.preventDefault();

        if (!this.isValid()) {
            return;
        }

        this.submitButton.disabled = true;
        const div = document.createElement('div');
        div.innerHTML = '<h1></h1>'

        div.classList.add('row', 'mt-4', 'p-5', 'bg-primary', 'text-white', 'rounded', 'justify-content-center');
        div.id = 'counter-component';

        document.getElementById('app')?.prepend(div);
    }

    public onDestroy(): void {
        const div = document.createElement('div');
        div.innerHTML = `
          <h1>You are logged in</h1>
          <p>Lorem ipsum...</p>
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
    const iocContainer = new IocContainer();
    iocContainer.registerArgumentModifier(QUERY_METADATA_KEY, queryModifierFunction);
    iocContainer.registerArgumentModifier(CHILD_COMPONENT_METADATA_KEY, childComponentModifierFunction);
    iocContainer.registerValue(CounterService.name, new CounterService());

    const componentContainer = new ComponentContainer(document.getElementById('app') as HTMLElement, iocContainer);
    componentContainer.registerCallbackSetupFunction(EVENT_METADATA_KEY, eventCallbackSetupFunction);
    componentContainer.registerComponent(EmailComponent);
    componentContainer.registerComponent(PasswordComponent);
    componentContainer.registerComponent(FormComponent);
    componentContainer.registerComponent(CounterComponent);
}

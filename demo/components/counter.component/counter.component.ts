import { Component, DynamicComponent, DynamicProperty, OnDestroy, OnInit, Query } from "../../../src";
import { Subscription } from "rxjs";
import { CounterService } from "../../services/counter.service";

/**
 * The @Component decorator is used to declare a class as a component.
 * In addition to that this is a dynamic component, because it implements the DynamicComponent interface.
 * This means that when a change in the dom happens the render method will be called and if needed the component will be rendered again.
 * The @DynamicProperty decorator is used to declare a property as a dynamic.
 * This means that every time this property gets updated the component will be force render again.
 */
@Component({ selector: '#counter-component' })
export class CounterComponent implements OnInit, OnDestroy, DynamicComponent {
    /**
     * The @DynamicProperty decorator is used to declare a property as a dynamic.
     * This means that every time this property gets updated the component will emit a custom event that will force the component to render again.
     */
    @DynamicProperty()
    private headerText: string = 'Redirecting in ';

    private counterSubscription: Subscription | null = null;

    public constructor(
        @Query() private readonly rootElement: HTMLDivElement,
        private readonly counterService: CounterService,
    ) {
    }

    public onInit(): void {
       this.counterSubscription = this
            .counterService
            .getCounter()
            .subscribe({
                next: (counter: number) => this.headerText = `Redirecting in ${counter}`,
                complete: () => this.rootElement.remove(),
            });
    }

    public onDestroy(): void {
        this.counterSubscription?.unsubscribe();
        document.getElementById('form-component')?.remove();
    }

    public render(): string {
        return `
            <div class="row mt-4 p-5 bg-primary text-white rounded justify-content-center">
                <h1>${this.headerText}</h1>
            </div>
        `;
    }
}

import { Component, DynamicComponent, DynamicProperty, OnDestroy, OnInit, Query } from "../../../src";
import { Subscription } from "rxjs";
import { CounterService } from "../../services/counter.service";

@Component({ selector: '#counter-component' })
export class CounterComponent implements OnInit, OnDestroy, DynamicComponent {
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

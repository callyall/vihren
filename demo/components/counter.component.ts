import { Component, OnDestroy, OnInit, Query } from "../../src";
import { Subscription } from "rxjs";
import { CounterService } from "../services/counter.service";

@Component({ selector: '#counter-component' })
export class CounterComponent implements OnInit, OnDestroy {
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

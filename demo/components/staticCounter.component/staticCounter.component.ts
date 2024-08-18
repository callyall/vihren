import { Component, Event, Query } from "../../../src";

/**
 * This is a static component
 */
@Component({ selector: '.counter' })
export class StaticCounterComponent {
    private count: number = 0;

    /**
     * The @Query decorator is used to inject a query selector result into a component.
     */
    public constructor(@Query({ selector: 'p', multiple: false }) private readonly text: HTMLInputElement) {}

    /**
     * The @Event decorator is used to declare a method as an event listener.
     * The event listener will automatically be removed when the component gets destroyed.
     */
    @Event({ type: 'click', selector: 'button' })
    public onCLick(): void {
        this.count++;
        this.text.innerHTML = `Number of clicks ${this.count}`;
    }
}

import { Component, Event, DynamicComponent, DynamicProperty } from "../../../src";

/**
 * This is a dynamic component
 */
@Component({ selector: '.counter' })
export class DynamicCounterComponent implements DynamicComponent {
    /**
     * A property decorated with the dynamic decorator will trigger a re-render every time it gets updated.
     */
    @DynamicProperty()
    private count: number = 0;

    /**
     * The @Event decorator is used to declare a method as an event listener.
     * The event listener will automatically be removed when the component gets destroyed.
     */
    @Event({ type: 'click', selector: 'button' })
    public onCLick(): void {
        this.count++;
    }

    /**
     * The render method will be called every time a change is detected.
     */
    public render(): string {
        return `
            <h4>Counter component</h2>
            <p>Number of clicks ${this.count}</p>
            <button class="btn btn-primary">Click Me</button>
        `;
    }
}

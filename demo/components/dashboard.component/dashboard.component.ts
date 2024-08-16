import {Component, Event, DynamicProperty, DynamicComponent, OnInit} from "../../../src";

/**
 * The @Component decorator is used to declare a class as a component.
 * In addition to that this is a dynamic component, because it implements the DynamicComponent interface.
 * This means that when a change in the dom happens the render method will be called and if needed the component will be rendered again.
 * The @DynamicProperty decorator is used to declare a property as a dynamic.
 * This means that every time this property gets updated the component will be force render again.
 */
@Component({ selector: '#dashboard' })
export class Dashboard implements DynamicComponent, OnInit {
    /**
     * The @DynamicProperty decorator is used to declare a property as a dynamic.
     * This means that every time this property gets updated the component will emit a custom event that will force the component to render again.
     */
    @DynamicProperty()
    private title: string = 'You are logged in.';

    public constructor(private readonly name: string) {}

    public onInit(): void {
        setTimeout(() => {
            this.title = 'I changed dynamically! Click me to change again!';
        }, 3000);
    }

    /**
     * The @Event decorator is used to declare a method as an event listener.
     * The event listener will automatically be removed when the component gets destroyed.
     */
    @Event({ type: 'click', selector: '#title' })
    public onClick() {
        this.title = 'You clicked me and I changed dynamically!';
    }

    public render(): string {
        return `
            <div class="row mt-4 p-5 bg-primary text-white rounded justify-content-center">
                <h1 id="title">${this.title}</h1>
                <p>${this.name}</p>
            </div>
        `;
    }
}

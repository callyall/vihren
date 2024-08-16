import {Component, Event, DynamicProperty, DynamicComponent, OnInit} from "../../../src";

@Component({ selector: '#dashboard' })
export class Dashboard implements DynamicComponent, OnInit {
    @DynamicProperty()
    private title: string = 'You are logged in.';

    public constructor(private readonly name: string) {}

    public onInit(): void {
        setTimeout(() => {
            this.title = 'I changed dynamically! Click me to change again!';
        }, 3000);
    }

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

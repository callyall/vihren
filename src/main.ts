import { Component } from "./Decorators/component.decorator/component.decorator";
import { Mutation } from "./Interfaces/mutation.interface";
import { OnChange } from "./Interfaces/onChange.interface";
import { OnDestroy } from "./Interfaces/onDestroy.interface";
import { OnInit } from "./Interfaces/onInit.interface";
import { ComponentContainer } from "./componentContainer/componentContainer";
import { Query } from "./Decorators/query.decorator/query.decorator";
import { Observable, Subscription, interval, map, share } from "rxjs";
import { Injectable } from "./Decorators/injectable.decorator/injectable.decorator";
import { Event } from "./Decorators/event.decorator/event.decorator";
import { IocContainer } from "./iocContainer/IocContainer";

@Injectable({ shared: true })
class ExampleService {
    private $second: Observable<number>;
    private second: number = -1;

    public constructor() {
        this.$second = interval(1000).pipe(
            map(() => {
                if (this.second == 59) {
                    this.second = 0;

                    return this.second;
                }

                this.second++;

                return this.second;
            }),
            share()
        );
    }

    public getSecond(): Observable<number> {
        return this.$second;
    }
}

@Component({ selector: '.example-component' })
class ExampleComponent implements OnInit, OnChange, OnDestroy {
    private clicks: number = 0;
    private $second: Subscription | null = null;

    public constructor(
        @Query() private element: HTMLElement,
        @Query({ selector: ':scope > .title' }) private title: HTMLHeadingElement,
        @Query({ selector: ':scope > .second' }) private second: HTMLParagraphElement,
        @Query({ selector: '#input' }) private input: HTMLParagraphElement,
        private name: string,
        private age: number,
        private exampleService: ExampleService
    ) {}
    public onDestroy(): void {
        // unsubscribe from all subscriptions to prevent memory leaks
        this.$second?.unsubscribe();
    }

    public onChange(mutation: Mutation): void {
        // Todo: some mutation handling here
    }

    public onInit(): void {
        this.title.innerText = `Hello, my name is ${this.name} and I am ${this.age} years old. Please click me!`;
        this.$second = this.exampleService.getSecond().subscribe((second) => {
            this.second.innerText = `Second: ${second}`;
        });
    }

    @Event({ type: 'click', selector: '.title' })
    public titleClick(): void {
        this.clicks += 1;

        this.title.innerHTML = `Number of clicks: ${this.clicks}`;
    }

    @Event({ type: 'click', selector: 'button' })
    public buttonClick(): void {
        const child = document.createElement('div');
        child.classList.add('example-component');
        child.innerHTML = `<h1 class="title">Child title</h1><p class="second"></p>`;
        child.dataset.name = this.input.innerText.includes(' ') ? 'Child' : this.input.innerText;
        child.dataset.age = '5';

        this.element.parentElement?.appendChild(child);
    }

    @Event({ type: 'keyup', selector: '#name', options: { debounce: 100 } })
    public keyUp(event: KeyboardEvent): void {
        const value = (event.target as HTMLInputElement).value;

        this.input.innerText = value.length > 0 ? value : "What's your name?";
    }
}

window.onload = function () {
    const iocContainer = new IocContainer();
    iocContainer.registerValue(ExampleService.name, new ExampleService());

    const componentContainer = new ComponentContainer(document.getElementById('app') as HTMLElement, iocContainer);

    componentContainer.registerComponent(ExampleComponent);
}

import { Component } from "../Decorators/component.decorator/component.decorator";
import { Query } from "../Decorators/query.decorator/query.decorator";
import { OnChange } from "../Interfaces/onChange.interface";
import { OnDestroy } from "../Interfaces/onDestroy.interface";
import { OnInit } from "../Interfaces/onInit.interface";
import { ComponentContainer } from "./componentContainer";
import {  Injectable  } from "../Decorators/injectable.decorator/injectable.decorator";
import { Event } from "../Decorators/event.decorator/event.decorator";
import { IocContainer } from "../iocContainer/IocContainer";

describe('ComponentContainer', () => {
    const iocContainer = new IocContainer();
    @Injectable({ shared: true })
    class TestService {
        public wasInit: boolean = false;
        public wasDestroyed: boolean = false;
        public wasChanged: boolean = false;
        public wasClicked: boolean = false;
    }

    const service = new TestService();

    iocContainer.registerValue(TestService.name, service);

    it('Should fail to instantiate a component container', () => {
        expect(() => new ComponentContainer(document.createElement('div'), iocContainer)).toThrow('Root element does not have a parent node');
    });

    document.body.innerHTML = `
            <div id="parent">
                <div id="app">
                    <div class="test-component">
                        <button id="click">Click me</button>
                    </div>
                    <div class="test-component">
                        <button id="click">Click me</button>
                    </div>
                    <div class="test-component-2" data-name="tester"></div>
                </div>
                <div id="app2">
                    <div class="test-component">
                        <button id="click">Click me</button>
                    </div>
                    <div class="test-component">
                        <button id="click">Click me</button>
                    </div>
                    <div class="test-component-2" data-name="tester"></div>
                </div>
            </div>
        `;
    const rootElement = document.getElementById('app') as HTMLElement;
    const container = new ComponentContainer(rootElement, iocContainer);

    @Component({ selector: '.test-component' })
    class TestComponent implements OnInit, OnChange, OnDestroy {
        public constructor(
            @Query()
            private element: HTMLElement,
            @Query({ selector: 'div', multiple: true })
            private divs: HTMLElement[],
            private service: TestService
        ) {}

        public onInit(): void {
            this.service.wasInit = true;
        }

        public onDestroy(): void {
            this.service.wasDestroyed = true;
        }

        public onChange(): void {
            this.service.wasChanged = true;
        }

        @Event({ selector: '#click1', type: 'click', options: { debounce: 1000 } })
        public debouncedClick(): void {

        }

        @Event({ selector: '#click', type: 'click' })
        public click(): void {
            this.service.wasClicked = true;
        }
    }

    @Component({ selector: '.test-component-2' })
    class TestComponent2 {
        public constructor(
            @Query()
            private element: HTMLElement,
            private name: string
        ) {}
    }

    container.registerComponent(TestComponent);
    container.registerComponent(TestComponent2);

    it('Should fail to register a component', () => {
        document.getElementById('parent')?.appendChild(document.createElement('div'));
        expect(() => container.registerComponent(class {})).toThrow('Component metadata not found')
    });

    it ('Should update a component', () => {
        document.querySelector('.test-component')?.appendChild(document.createElement('div'));

        expect(service.wasChanged).toBe(true);
    });

    it('Should trigger a click event', () => {
        document.getElementById('click')?.click();

        expect(service.wasClicked).toBe(true);
    });

    it('Should destroy a component', async () => {
        document.querySelector('.test-component')?.remove();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(service.wasDestroyed).toBe(true);
    });

    it('Should trigger invalid instance id exception', async () => {
        const logSpy = jest.spyOn(global.console, 'error');

        const div = document.createElement('div');
        div.classList.add('test-component-2');
        div.setAttribute('instance', '20');
        rootElement.appendChild(div);

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(logSpy).toHaveBeenCalledWith(
            expect.stringContaining('Invalid instance id 20 for component .test-component-2')
        );

        logSpy.mockRestore();
    });

    it('Should destroy all components', async () => {
        service.wasDestroyed = false;
        const rootElement = document.getElementById('app2') as HTMLElement;
        const container = new ComponentContainer(rootElement, iocContainer);

        container.registerComponent(TestComponent);
        container.registerComponent(TestComponent2);

        rootElement.remove();
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(service.wasDestroyed).toBe(true);
    });

    afterAll(() => {
        rootElement.remove();
    });
});
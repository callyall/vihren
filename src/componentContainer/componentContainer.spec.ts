import { Component } from "../decorators/component.decorator/component.decorator";
import { Query, QUERY_METADATA_KEY, queryModifierFunction } from "../decorators/query.decorator/query.decorator";
import { OnChange } from "../interfaces/onChange.interface";
import { OnDestroy } from "../interfaces/onDestroy.interface";
import { OnInit } from "../interfaces/onInit.interface";
import { ComponentContainer } from "./componentContainer";
import { Injectable } from "../decorators/injectable.decorator/injectable.decorator";
import { Event, EVENT_METADATA_KEY, eventCallbackSetupFunction } from "../decorators/event.decorator/event.decorator";
import { IocContainer } from "../iocContainer/IocContainer";
import { callback } from "../decorators/callback.decorator/callback.decorator";

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

    iocContainer.registerArgumentModifier(QUERY_METADATA_KEY, queryModifierFunction);
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
                <div id="app3">
                    <div class="test-component-3"><div>
                <div>
            </div>
        `;
    const rootElement = document.getElementById('app') as HTMLElement;
    const container = new ComponentContainer(rootElement, iocContainer);
    container.registerCallbackSetupFunction(EVENT_METADATA_KEY, eventCallbackSetupFunction);

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

        expect(service.wasChanged).toEqual(true);
    });

    it('Should trigger a click event', () => {
        document.getElementById('click')?.click();

        expect(service.wasClicked).toEqual(true);
    });

    it('Should destroy a component', async () => {
        const element = document.querySelector('.test-component');
        const instanceId = element?.getAttribute('instance') as string;

        expect(container.getComponentInstancesBySelector('.test-component')?.has(instanceId)).toEqual(true);

        element?.remove();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(service.wasDestroyed).toEqual(true);
        expect(container.getComponentInstancesBySelector('.test-component')?.has(instanceId)).toEqual(false);
    });

    it('Should trigger invalid instance id exception', done => {
        const logSpy = jest.spyOn(global.console, 'error');

        logSpy.mockImplementation((e) => {
            expect(e).toContain('Invalid instance id 20 for component .test-component-2');

            logSpy.mockRestore();
            done();
        });

        const div = document.createElement('div');
        div.classList.add('test-component-2');
        div.setAttribute('instance', '20');
        rootElement.appendChild(div);
    });

    it('Should get component instances by selector', () => {
       const componentInstances = container.getComponentInstancesBySelector('.test-component-2');

       expect(componentInstances).toBeInstanceOf(Map);
       expect(componentInstances.size).toEqual(1);
    });

    it('Should destroy all components', async () => {
        //service.wasDestroyed = false;
        const rootElement = document.getElementById('app2') as HTMLElement;
        const container = new ComponentContainer(rootElement, iocContainer);
        container.registerCallbackSetupFunction(EVENT_METADATA_KEY, eventCallbackSetupFunction);

        container.registerComponent(TestComponent);
        container.registerComponent(TestComponent2);

        rootElement.remove();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(container.getComponentInstancesBySelector('.test-component')?.size).toEqual(0);
        expect(container.getComponentInstancesBySelector('.test-component-2')?.size).toEqual(0);
    });

    it('Should throw callback setup function not found for key test', () => {
        @Component({ selector: '.test-component-3' })
        class OddComponent {
            public onSomething() {}
        }

        callback({ callback: 'onSomething', key: 'test', data: '' }, OddComponent, 'onSomething');

        const rootElement = document.getElementById('app3') as HTMLElement;
        const container = new ComponentContainer(rootElement, iocContainer);
        container.registerCallbackSetupFunction(EVENT_METADATA_KEY, eventCallbackSetupFunction);

        expect(() => container.registerComponent(OddComponent)).toThrow('Callback setup function not found for key test');
    });

    afterAll(() => {
        rootElement.remove();
    });
});

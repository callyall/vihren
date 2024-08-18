import { Component } from "../decorators/component.decorator/component.decorator";
import { OnChange } from "../interfaces/onChange.interface";
import { OnInit } from "../interfaces/onInit.interface";
import { ComponentContainer } from "./componentContainer";
import { IocContainer } from "../iocContainer/IocContainer";
import { Mutation, MutationType } from "../interfaces/mutation.interface";
import { QUERY_METADATA_KEY, queryModifierFunction } from "../decorators/query.decorator/query.decorator";
import { OnDestroy } from "../interfaces/onDestroy.interface";
import { ChangeDetector } from "../changeDetector/changeDetector";
import { Event, EVENT_METADATA_KEY, eventCallbackSetupFunction } from "../decorators/event.decorator/event.decorator";
import {
    DYNAMIC_PROPERTY_UPDATE_EVENT, DynamicProperty,
    DynamicPropertyUpdateEventDetail
} from "../decorators/dynamicProperty.decorator/dynamicProperty.decorator";
import { DynamicComponent } from "../interfaces/dynamicComponent.interface";
import { ComponentInstance } from "../interfaces/componentInstance.interface";

const iocContainer = new IocContainer();
iocContainer.registerArgumentModifier(QUERY_METADATA_KEY, queryModifierFunction);

const setupDomAndContainer = (): { rootElement: HTMLElement, container: ComponentContainer } => {
    document.body.innerHTML = `
            <div id="parent">
                <div id="app">
                    <div class="test-component" id="one" data-test="1">
                        <button id="click">Click me</button>
                    </div>
                    <div class="test-component" id="two">
                        <button id="click">Click me</button>
                    </div>
                    <div class="another-test-component"></div>
                </div>
            </div>
        `;

    const rootElement = document.getElementById('app') as HTMLElement;
    const container = new ComponentContainer(
        rootElement,
        iocContainer,
        new ChangeDetector(rootElement)
    );

    // This is intentional
    container.init();
    container.init();

    return {rootElement, container};
}

describe('ComponentContainer', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('Should fail to register a component', () => {
        const { container} = setupDomAndContainer();

        document.getElementById('parent')?.appendChild(document.createElement('div'));

        expect(() => container.registerComponent(class {
        })).toThrow('Component metadata not found');
        document.getElementById('app')?.remove();
    });

    it('Should initialise a component', done => {
        const { container} = setupDomAndContainer();

        @Component({selector: '.test-component'})
        class TestComponent implements OnInit {
            public constructor(@Query() private rootElement: HTMLElement) {
            }

            public onInit(): void {
                // Just check for id=one
                if (this.rootElement.id === 'one') {
                    expect(true).toEqual(true);
                    document.getElementById('app')?.remove();
                    done();
                }
            }
        }

        container.registerComponent(TestComponent);
    });

    it('Should update a component', done => {
        const { container} = setupDomAndContainer();

        let detectChange = true;

        @Component({selector: '.test-component'})
        class TestComponent implements OnInit, OnChange {

            public constructor(@Query() private rootElement: HTMLElement) {
            }

            public onInit(): void {
                // Just check for id=one
                if (this.rootElement.id === 'one') {
                    document.getElementById('one')?.appendChild(document.createElement('div'));
                }
            }

            public onChange(mutation: Mutation): void {
                if (!detectChange) {
                    return;
                }

                if (mutation.type === MutationType.Updated) {
                    expect(true).toEqual(true);
                    done();

                    detectChange = false;
                }
            }
        }

        container.registerComponent(TestComponent);
    });

    it('Should destroy a component', done => {
        const { container} = setupDomAndContainer();

        let detectDestruction = true;

        @Component({selector: '.test-component'})
        class TestComponent implements OnInit, OnDestroy {
            public constructor(@Query() private rootElement: HTMLElement) {
            }

            public onInit(): void {
                this.rootElement.remove();
            }

            public onDestroy(): void {
                if (detectDestruction) {
                    expect(true).toEqual(true);
                    done();
                    detectDestruction = false;
                }
            }
        }

        container.registerComponent(TestComponent);

    });

    it('Should trigger invalid instance id error', done => {
        const logSpy = jest.spyOn(global.console, 'error');

        logSpy.mockImplementation((e) => {
            expect(e).toContain('Invalid instance id 20 for component .test-component');

            logSpy.mockRestore();
            done();
        });

        const { container} = setupDomAndContainer();

        @Component({selector: '.test-component'})
        class TestComponent {
        }

        document.getElementById('two')?.setAttribute('instance', '20');

        try {
            container.registerComponent(TestComponent);
        } catch (e) {
            expect((e as Error).message).toContain('Invalid instance id 20 for component .test-component');
            done();
        }
    });

    it('Should fail to setup a callback function', () => {
        const { container} = setupDomAndContainer();

        @Component({selector: '.test-component'})
        class TestComponent {
            public constructor(@Query() private rootElement: HTMLElement) {
            }

            @Event({type: 'click', selector: '#submit'})
            public onClick(): void {

            }
        }

        expect(() => container.registerComponent(TestComponent)).toThrow(/Callback setup function not found for key/);
    });

    it('Should setup a callback function', () => {
        const { container} = setupDomAndContainer();

        @Component({selector: '.test-component'})
        class TestComponent {
            public constructor(@Query() private rootElement: HTMLElement) {
            }

            @Event({type: 'click', selector: '#submit'})
            public onClick(): void {

            }
        }

        container.registerCallbackSetupFunction(EVENT_METADATA_KEY, eventCallbackSetupFunction);
        container.registerComponent(TestComponent);

        expect(true);
    });

    it('Should retrieve component instances by selector', () => {
        const { container} = setupDomAndContainer();

        @Component({selector: '.test-component'})
        class TestComponent {
            public constructor(@Query() private rootElement: HTMLElement) {
            }
        }

        container.registerComponent(TestComponent);

        expect(container.getComponentInstancesBySelector('.none').size).toEqual(0);
        expect(container.getComponentInstancesBySelector('.test-component').size).toEqual(2);
    });

    it('Should detect change in the parent when child gets removed', done => {
        document.body.innerHTML = `
            <div>
                <div id="app">
                    <div id="parent">
                         <div id="child">
                         </div>
                    </div>
                </div>
            </div>
        `;

        const rootElement = document.getElementById('app') as HTMLElement;
        const container = new ComponentContainer(
            rootElement,
            iocContainer,
            new ChangeDetector(rootElement)
        );

        container.init();

        let detectChange = true;

        @Component({selector: '#parent'})
        class ParentComponent implements OnChange {
            public onChange(mutation: Mutation): void {
                if (!detectChange) {
                    return;
                }

                if (mutation.type === MutationType.Removed) {
                    expect(true).toEqual(true);
                    done();

                    detectChange = false;
                }
            }
        }

        @Component({selector: '#child'})
        class ChildComponent {
        }

        container.registerComponent(ParentComponent);
        container.registerComponent(ChildComponent);

        document.getElementById('child')?.remove();
    });

    it('Should render a component with a template', () => {
        const { container} = setupDomAndContainer();

        @Component({
            selector: '.test-component',
            template: '<div class="template">Hello World</div>'
        })
        class TestComponent {
            public constructor(@Query() private rootElement: HTMLElement) {
            }
        }

        container.registerComponent(TestComponent);

        expect(container.getComponentInstancesBySelector('.test-component').size).toEqual(2);

        const rendered = document.querySelectorAll('.test-component > .template');

        expect(rendered.length).toEqual(2);

        Array.from(rendered).forEach((element) => {
            expect(element.textContent).toEqual('Hello World');
        });
    });

    it('Should fail to rerender update a dynamic component', () => {
        setupDomAndContainer();

        const before = document.getElementById('app')?.innerHTML;

        const event = new CustomEvent<DynamicPropertyUpdateEventDetail>(DYNAMIC_PROPERTY_UPDATE_EVENT, { detail: { component: {} } });
        document.dispatchEvent(event);

        expect(document.getElementById('app')?.innerHTML).toEqual(before);
    });

    it('Should rerender update a dynamic component', async () => {
        const { container} = setupDomAndContainer();

        @Component({ selector: '.another-test-component' })
        class DynamicTestComponent implements DynamicComponent{
            @DynamicProperty()
            public name: string = 'John Doe'

            public render(): string {
                return `<div class="template">Hello ${this.name}</div>`;
            }
        }

        container.registerComponent(DynamicTestComponent);

        expect(container.getComponentInstancesBySelector('.another-test-component').size).toEqual(1);

        const rendered = document.querySelectorAll('.another-test-component > .template');

        expect(rendered.length).toEqual(1);

        Array.from(rendered).forEach((element) => {
            expect(element.textContent).toEqual('Hello John Doe');
        });

        const componentElement: HTMLElement = document.querySelector('.another-test-component') as HTMLElement;
        const instanceId: string = componentElement.getAttribute('instance') as string;
        const instance: ComponentInstance<DynamicTestComponent> = container.getComponentInstancesBySelector('.another-test-component').get(instanceId) as ComponentInstance<DynamicTestComponent>;

        instance.instance.name = 'Mister Tester';

        await new Promise(resolve => setTimeout(resolve, 1000));

        const updated = document.querySelectorAll('.another-test-component > .template');

        expect(updated.length).toEqual(1);

        Array.from(updated).forEach((element) => {
            expect(element.textContent).toEqual('Hello Mister Tester');
        });
    });
});

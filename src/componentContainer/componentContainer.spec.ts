import { Component } from "../decorators/component.decorator/component.decorator";
import { OnChange } from "../interfaces/onChange.interface";
import { OnInit } from "../interfaces/onInit.interface";
import { ComponentContainer } from "./componentContainer";
import { IocContainer } from "../iocContainer/IocContainer";
import { Mutation, MutationType } from "../interfaces/mutation.interface";
import { Query, QUERY_METADATA_KEY, queryModifierFunction } from "../decorators/query.decorator/query.decorator";
import { OnDestroy } from "../interfaces/onDestroy.interface";
import { ChangeDetector } from "../changeDetector/changeDetector";
import { Event, EVENT_METADATA_KEY, eventCallbackSetupFunction } from "../decorators/event.decorator/event.decorator";

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
                </div>
            </div>
        `;

    const rootElement = document.getElementById('app') as HTMLElement;
    const container = new ComponentContainer(
        rootElement,
        iocContainer,
        new ChangeDetector(rootElement)
    );

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
});

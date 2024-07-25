import {Component} from "../decorators/component.decorator/component.decorator";
import {OnChange} from "../interfaces/onChange.interface";
import {OnInit} from "../interfaces/onInit.interface";
import {ComponentContainer} from "./componentContainer";
import {IocContainer} from "../iocContainer/IocContainer";
import {Mutation, MutationType} from "../interfaces/mutation.interface";
import {Query, QUERY_METADATA_KEY, queryModifierFunction} from "../decorators/query.decorator/query.decorator";
import {OnDestroy} from "../interfaces/onDestroy.interface";

const iocContainer = new IocContainer();
iocContainer.registerArgumentModifier(QUERY_METADATA_KEY, queryModifierFunction);

const setupDomAndContainer = () => {
    document.body.innerHTML = `
            <div id="parent">
                <div id="app">
                    <div class="test-component" id="one">
                        <button id="click">Click me</button>
                    </div>
                    <div class="test-component" id="two">
                        <button id="click">Click me</button>
                    </div>
                </div>
            </div>
        `;

    const rootElement = document.getElementById('app') as HTMLElement;
    const container = new ComponentContainer(rootElement, iocContainer);

    return { rootElement, container };
}

describe('ComponentContainer', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('Should fail to instantiate a component container', () => {
        expect(() => new ComponentContainer(document.createElement('div'), iocContainer)).toThrow('Root element does not have a parent node');
    });

    it('Should fail to register a component', () => {
        const { rootElement, container } = setupDomAndContainer();

        document.getElementById('parent')?.appendChild(document.createElement('div'));

        expect(() => container.registerComponent(class {})).toThrow('Component metadata not found');
        document.getElementById('app')?.remove();
    });

    it('Should initialise a component', done => {
        const { rootElement, container } = setupDomAndContainer();

        @Component({ selector: '.test-component' })
        class TestComponent implements OnInit {
            public constructor(@Query() private rootElement: HTMLElement) { }

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
        const { rootElement, container } = setupDomAndContainer();

        let detectChange = true;

        @Component({ selector: '.test-component' })
        class TestComponent implements OnInit, OnChange {

            public constructor(@Query() private rootElement: HTMLElement) { }

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
        const { rootElement, container } = setupDomAndContainer();

        let detectDestruction = true;

        @Component({ selector: '.test-component' })
        class TestComponent implements OnInit, OnDestroy {
            public constructor(@Query() private rootElement: HTMLElement) { }

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

        const { rootElement, container } = setupDomAndContainer();

        @Component({ selector: '.test-component' })
        class TestComponent {}

        document.getElementById('two')?.setAttribute('instance', '20');

        try {
            container.registerComponent(TestComponent);
        } catch (e) {
            expect((e as Error).message).toContain('Invalid instance id 20 for component .test-component');
            done();
        }
    });
});

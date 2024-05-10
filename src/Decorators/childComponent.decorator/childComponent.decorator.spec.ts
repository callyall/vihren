import { ROOT_ELEMENT_KEY } from "../query.decorator/query.decorator";
import { CHILD_COMPONENT_METADATA_KEY, ChildComponent, ChildComponentCollection, ChildComponentMetadata, childComponentModifierFunction, ChildComponentReference } from "./childComponent.decorator";
import { ARGUMENT_MODIFIER_METADATA_KEY, ArgumentMetadata } from "../argumentModifier.decorator/argumentModifier.decorator";
import { ComponentContainer } from "../../componentContainer/componentContainer";
import { ComponentInstance } from "../../Interfaces/componentInstance.interface";

describe('ChildComponentDecorator', () => {
    class TestComponent {
        public constructor(public readonly id: number) {
        }
    }

    it('Should define ChildComponentMetadata', () => {
        class TestComponent {
            constructor(@ChildComponent({selector: 'test'}) test: string) {
            }
        }

        const metadata = Reflect.getMetadata(ARGUMENT_MODIFIER_METADATA_KEY, TestComponent) as Map<number, ArgumentMetadata<ChildComponentMetadata>>;

        expect(metadata).toBeDefined();
        expect(metadata.size).toEqual(1);

        const childComponentMetadata = metadata.get(0) as ArgumentMetadata<ChildComponentMetadata>;

        expect(childComponentMetadata).toBeDefined();
        expect(childComponentMetadata.key).toEqual(CHILD_COMPONENT_METADATA_KEY);
        expect(childComponentMetadata.data.selector).toEqual('test');
        expect(childComponentMetadata.data.parameterIndex).toEqual(0);
    });

    it('Should fail to modify arguments', () => {
        const args = new Map<string, any>();

        expect(() => {
            childComponentModifierFunction(
                {
                    key: CHILD_COMPONENT_METADATA_KEY,
                    data: {selector: 'test', parameterIndex: 0}
                },
                {
                    name: 'test',
                    type: ChildComponentReference<any>
                },
                args
            )
        }).toThrow('No root element found');

        expect(() => {
            childComponentModifierFunction(
                {
                    key: CHILD_COMPONENT_METADATA_KEY,
                    data: {selector: 'test', parameterIndex: 0}
                },
                {
                    name: 'test',
                    type: ChildComponentCollection<any>
                },
                args
            )
        }).toThrow('No root element found');

        args.set(ROOT_ELEMENT_KEY, document.createElement('div'));

        expect(() => {
            childComponentModifierFunction(
                {
                    key: CHILD_COMPONENT_METADATA_KEY,
                    data: {selector: 'test', parameterIndex: 0}
                },
                {
                    name: 'test',
                    type: ChildComponentReference<any>
                },
                args
            )
        }).toThrow('No component container found');

        expect(() => {
            childComponentModifierFunction(
                {
                    key: CHILD_COMPONENT_METADATA_KEY,
                    data: {selector: 'test', parameterIndex: 0}
                },
                {
                    name: 'test',
                    type: ChildComponentCollection<any>
                },
                args
            )
        }).toThrow('No component container found');
    });

    it('Should modify arguments', () => {
        document.body.innerHTML = `<div id="app"><div id="component"><div class="child" instance="0"></div><div class="child" instance="1"></div></div></div>`;

        const componentContainer = {
            getComponentInstancesBySelector: jest
                .fn()
                .mockReturnValue(new Map<string, ComponentInstance<TestComponent>>(
                    [
                        [
                            "0",
                            {
                                element: Array.from(document.querySelectorAll('.child'))[0] as HTMLElement,
                                instance: new TestComponent(0),
                                subscriptions: [],
                            }
                        ],
                        [
                            "1",
                            {
                                element: Array.from(document.querySelectorAll('.child'))[1] as HTMLElement,
                                instance: new TestComponent(1),
                                subscriptions: [],
                            }
                        ]
                    ]
                ))
        } as unknown as ComponentContainer;

        const args = new Map<string, any>();
        args.set(ROOT_ELEMENT_KEY, document.getElementById('component'));
        args.set(ComponentContainer.COMPONENT_CONTAINER_KEY, componentContainer);

        let result = childComponentModifierFunction(
            {
                key: CHILD_COMPONENT_METADATA_KEY,
                data: {
                    selector: '.child',
                    parameterIndex: 0
                }
            },
            {
                name: 'test',
                type: ChildComponentReference<TestComponent>
            },
            args
        ).get('test');

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(ChildComponentReference);
        expect(result.get()).toBeDefined();

        result = childComponentModifierFunction(
            {
                key: CHILD_COMPONENT_METADATA_KEY,
                data: {
                    selector: '.child',
                    parameterIndex: 0
                }
            },
            {
                name: 'test',
                type: ChildComponentCollection<TestComponent>
            },
            args
        ).get('test');

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(ChildComponentCollection);
        expect(result.get().length).toEqual(2);
    });

    it('Should test ChildComponentReference', () => {
        const instances = new Map<string, ComponentInstance<any>>();
        const componentContainer = {
            getComponentInstancesBySelector: jest.fn().mockReturnValue(instances)
        } as unknown as ComponentContainer

        expect(() => {
            document.body.innerHTML= `<div id="component"></div>`;
            const reference = new ChildComponentReference(document.getElementById('component') as HTMLElement, '.child', componentContainer);

            reference.get();
        }).toThrow('Element with selector .child not found');

        expect(() => {
            document.body.innerHTML= `<div id="component"><div class="child"></div></div>`;
            const reference = new ChildComponentReference(document.getElementById('component') as HTMLElement, '.child', componentContainer);

            reference.get();
        }).toThrow('Instance id not found');

        document.body.innerHTML = `<div id="app"><div id="component"><div class="child" instance="0"></div><div class="child" instance="1"></div></div></div>`;

        instances.set('0', {
            element: Array.from(document.querySelectorAll('.child'))[0] as HTMLElement,
            instance: new TestComponent(0),
            subscriptions: [],
        })

        instances.set('1', {
            element: Array.from(document.querySelectorAll('.child'))[1] as HTMLElement,
            instance: new TestComponent(1),
            subscriptions: [],
        });

        const reference = new ChildComponentReference(document.getElementById('component') as HTMLElement, '.child', componentContainer);

        expect(reference.get()).toBeDefined();
    });

    it('Should test ChildComponentCollection', () => {
        const instances = new Map<string, ComponentInstance<any>>();
        const componentContainer = {
            getComponentInstancesBySelector: jest.fn().mockReturnValue(instances)
        } as unknown as ComponentContainer

        expect(() => {
            document.body.innerHTML= `<div id="component"></div>`;
            const reference = new ChildComponentCollection(document.getElementById('component') as HTMLElement, '.child', componentContainer);

            reference.get();
        }).toThrow('Element with selector .child not found');

        expect(() => {
            document.body.innerHTML= `<div id="component"><div class="child"></div></div>`;
            const reference = new ChildComponentCollection(document.getElementById('component') as HTMLElement, '.child', componentContainer);

            reference.get();
        }).toThrow('Instance id not found');

        expect(() => {
            document.body.innerHTML = `<div id="component"><div class="child" instance="NOPE"></div></div>`;

            const reference = new ChildComponentCollection(document.getElementById('component') as HTMLElement, '.child', componentContainer);

            reference.get();
        }).toThrow('Instance for element <div class="child" instance="NOPE"></div> not found')

        document.body.innerHTML = `<div id="app"><div id="component"><div class="child" instance="0"></div><div class="child" instance="1"></div></div></div>`;

        instances.set('0', {
            element: Array.from(document.querySelectorAll('.child'))[0] as HTMLElement,
            instance: new TestComponent(0),
            subscriptions: [],
        })

        instances.set('1', {
            element: Array.from(document.querySelectorAll('.child'))[1] as HTMLElement,
            instance: new TestComponent(1),
            subscriptions: [],
        });

        const reference = new ChildComponentCollection(document.getElementById('component') as HTMLElement, '.child', componentContainer);

        expect(reference.get()).toBeDefined();
    });
});
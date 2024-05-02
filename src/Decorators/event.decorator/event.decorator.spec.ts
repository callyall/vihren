import { Event, EventMetadataGroup } from './event.decorator';
import 'reflect-metadata';

describe('Event Decorator', () => {
    test('Should define metadata for an event dataset', () => {
        class TestClass {
            @Event({ type: 'click', selector: 'button' })
            public onClick() { }

            @Event({ type: 'click', selector: 'a', options: { debounce: 100 } })
            public onSecondClick() { }

            @Event({ type: 'keyup', selector: 'input' })
            public onKeyUp() { }

            @Event({ type: 'change', selector: 'select' })
            public onChange() { }
        }

        const metadata = Reflect.getMetadata('method:event', TestClass) as EventMetadataGroup<any>[];

        expect(metadata).toBeDefined();
        expect(metadata.length).toBe(3);

        [
            {
                type: 'click',
                selectors: [
                    {
                        selector: 'button',
                        callback: 'onClick'
                    },
                    {
                        selector: 'a',
                        callback: 'onSecondClick',
                        options: {
                            debounce: 100
                        }
                    },
                ]
            },
            {
                type: 'keyup',
                selectors: [{ selector: 'input', callback: 'onKeyUp' }]
            },
            {
                type: 'change',
                selectors: [{ selector: 'select', callback: 'onChange' }]
            }
        ]
            .forEach((groupt, i) => {
                const group = metadata.find((group) => group.type === groupt.type) as EventMetadataGroup<any>;

                expect(group).toBeDefined();
                expect(group.selectors.sort()).toEqual(groupt.selectors.sort());
            });
    });
});
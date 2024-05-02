import { QUERY_METADATA_KEY, Query, QueryMetadata } from './query.decorator';
import 'reflect-metadata';

describe('QueryDecorator', () => {
    it('Should define QueryMetadata without selector and multiple = false ', () => {
        class TestComponent { 
            constructor(@Query() query: string) {}
        };

        const metadata = Reflect.getMetadata(`${QUERY_METADATA_KEY}:${0}`, TestComponent) as QueryMetadata;

        expect(metadata).toBeDefined();
        expect(metadata.selector).toBeUndefined();
        expect(metadata.multiple).toEqual(false);
        expect(metadata.parameterIndex).toEqual(0);
    });

    it('Should throw an error', () => {
        expect(() => {
            const target = class { 
                constructor(query: string) {}
            };

            Query({ multiple: true })(target, undefined, 0);
        }).toThrow('Query cannot expect multiple results without a selector');
    });

    it('Should define QueryMetadata with selector and multiple = false ', () => {
        const selector = 'test';
        const multiple = false;
        const index = 1;

        class TestComponent { 
            constructor(someParam: string, @Query({ selector, multiple }) query: string) {}
        };

        const metadata = Reflect.getMetadata(`${QUERY_METADATA_KEY}:${index}`, TestComponent) as QueryMetadata;

        expect(metadata).toBeDefined();
        expect(metadata.selector).toEqual(selector);
        expect(metadata.multiple).toEqual(multiple);
        expect(metadata.parameterIndex).toEqual(index);
    });

    it('Should define QueryMetadata with selector and multiple = true ', () => {
        const selector = 'test';
        const multiple = true;
        const index = 1;

        class TestComponent { 
            constructor(someParam: string, @Query({ selector, multiple }) query: string) {}
        };

        const metadata = Reflect.getMetadata(`${QUERY_METADATA_KEY}:${index}`, TestComponent) as QueryMetadata;

        expect(metadata).toBeDefined();
        expect(metadata.selector).toEqual(selector);
        expect(metadata.multiple).toEqual(multiple);
        expect(metadata.parameterIndex).toEqual(index);
    });
});
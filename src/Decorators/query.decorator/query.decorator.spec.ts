import {QUERY_METADATA_KEY, Query, QueryMetadata, queryModifier, ROOT_ELEMENT_KEY} from './query.decorator';
import 'reflect-metadata';
import { ARGUMENT_MODIFIER_METADATA_KEY, ArgumentMetadata } from "../argumentModifier.decorator/argumentModifier.decorator";

describe('QueryDecorator', () => {
    it('Should define QueryMetadata without selector and multiple = false ', () => {
        class TestComponent { 
            constructor(@Query() query: string) {}
        }

        const metadata = Reflect.getMetadata(ARGUMENT_MODIFIER_METADATA_KEY, TestComponent) as Map<number, ArgumentMetadata<QueryMetadata>>;

        expect(metadata).toBeDefined();
        expect(metadata.size).toEqual(1);

        const queryMetadata = metadata.get(0) as ArgumentMetadata<QueryMetadata>;

        expect(queryMetadata).toBeDefined();
        expect(queryMetadata.key).toEqual(QUERY_METADATA_KEY);
        expect(queryMetadata.data.selector).toBeUndefined();
        expect(queryMetadata.data.multiple).toEqual(false);
        expect(queryMetadata.data.parameterIndex).toEqual(0);
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
        }

        const metadata = Reflect.getMetadata(ARGUMENT_MODIFIER_METADATA_KEY, TestComponent) as Map<number, ArgumentMetadata<QueryMetadata>>;

        expect(metadata).toBeDefined();
        expect(metadata.size).toEqual(1);

        const queryMetadata = metadata.get(1) as ArgumentMetadata<QueryMetadata>;

        expect(queryMetadata).toBeDefined();
        expect(queryMetadata.data.selector).toEqual(selector);
        expect(queryMetadata.data.multiple).toEqual(multiple);
        expect(queryMetadata.data.parameterIndex).toEqual(index);
    });

    it('Should define QueryMetadata with selector and multiple = true ', () => {
        const selector = 'test';
        const multiple = true;
        const index = 1;

        class TestComponent { 
            constructor(someParam: string, @Query({ selector, multiple }) query: string) {}
        }

        const metadata = Reflect.getMetadata(ARGUMENT_MODIFIER_METADATA_KEY, TestComponent) as Map<number, ArgumentMetadata<QueryMetadata>>;

        expect(metadata).toBeDefined();
        expect(metadata.size).toEqual(1);

        const queryMetadata = metadata.get(1) as ArgumentMetadata<QueryMetadata>;

        expect(queryMetadata).toBeDefined();
        expect(queryMetadata.data.selector).toEqual(selector);
        expect(queryMetadata.data.multiple).toEqual(multiple);
        expect(queryMetadata.data.parameterIndex).toEqual(index);
    });

    it('Should fail to modify arguments', () => {
        expect(() => {
            queryModifier(
                'test',
                { key: QUERY_METADATA_KEY, data: { multiple: false, parameterIndex: 0 }},
                new Map<string, any>()
            );
        }).toThrow('No root element found');
    });

    it('Should modify arguments', () => {
        document.body.innerHTML = `
            <div id="app">
              <div id="child"></div>
              <div></div>
            </div>
        `;
        const rootElement = document.getElementById('app') as HTMLElement;
        const name = 'test';

        const args = new Map<string, any>();
        args.set(ROOT_ELEMENT_KEY, rootElement);

        let result = queryModifier(
            name,
            { key: QUERY_METADATA_KEY, data: { multiple: false, parameterIndex: 0 }},
            args
        );

        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name)).toEqual(rootElement);

        result = queryModifier(
            name,
            { key: QUERY_METADATA_KEY, data: { selector: '#child', multiple: false, parameterIndex: 0 }},
            args
        );

        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name)).toEqual(document.getElementById('child'));

        result = queryModifier(
            name,
            { key: QUERY_METADATA_KEY, data: { selector: 'div', multiple: true, parameterIndex: 0 }},
            args
        );

        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name)).toEqual(rootElement.querySelectorAll('div'));
    });
});
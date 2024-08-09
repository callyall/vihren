import { QUERY_METADATA_KEY, Query, QueryMetadata, queryModifierFunction, ROOT_ELEMENT_KEY, ActiveElementReference, ActiveElementCollection } from './query.decorator';
import 'reflect-metadata';
import { ARGUMENT_MODIFIER_METADATA_KEY, ArgumentMetadata } from "../argumentModifier.decorator/argumentModifier.decorator";

describe('QueryDecorator', () => {
    it('Should define QueryMetadata without selector and multiple = false ', () => {
        class TestComponent { 
            constructor(@Query() query: string) { console.log(query); }
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
                constructor(query: string) { console.log(query); }
            };

            Query({ multiple: true })(target, undefined, 0);
        }).toThrow('Query cannot expect multiple results without a selector');
    });

    it('Should define QueryMetadata with selector and multiple = false ', () => {
        const selector = 'test';
        const multiple = false;
        const index = 1;

        class TestComponent { 
            constructor(someParam: string, @Query({ selector, multiple }) query: string) { console.log(someParam, query); }
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
            constructor(someParam: string, @Query({ selector, multiple }) query: string) { console.log(someParam, query); }
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
            queryModifierFunction(
                { key: QUERY_METADATA_KEY, data: { multiple: false, parameterIndex: 0 }},
                { name: 'test', type: HTMLElement },
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

        let result = queryModifierFunction(
            { key: QUERY_METADATA_KEY, data: { multiple: false, parameterIndex: 0 }},
            { name, type: HTMLElement },
            args
        );

        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name)).toEqual(rootElement);

        result = queryModifierFunction(
            { key: QUERY_METADATA_KEY, data: { selector: '#child', multiple: false, parameterIndex: 0 }},
            { name, type: HTMLElement },
            args
        );

        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name)).toEqual(document.getElementById('child'));

        result = queryModifierFunction(
            { key: QUERY_METADATA_KEY, data: { selector: 'div', multiple: true, parameterIndex: 0 }},
            { name, type: NodeList },
            args
        );

        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name)).toEqual(rootElement.querySelectorAll('div'));

        result = queryModifierFunction(
            { key: QUERY_METADATA_KEY, data: { selector: 'div', multiple: false, parameterIndex: 0 }},
            { name, type: ActiveElementReference as Function },
            args
        );

        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name).get()).toEqual(rootElement.querySelector('div'));

        result = queryModifierFunction(
            { key: QUERY_METADATA_KEY, data: { selector: 'div', multiple: true, parameterIndex: 0 }},
            { name, type: ActiveElementCollection as Function },
            args
        );

        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name).get()).toEqual(Array.from(rootElement.querySelectorAll('div')));

        expect(() => {
            queryModifierFunction(
                { key: QUERY_METADATA_KEY, data: { multiple: false, parameterIndex: 0 }},
                { name, type: ActiveElementReference as Function },
                args
            );
        }).toThrow('ActiveElementReference cannot be used without a selector');

        expect(() => {
            queryModifierFunction(
                { key: QUERY_METADATA_KEY, data: { selector: 'div', multiple: true, parameterIndex: 0 }},
                { name, type: ActiveElementReference as Function },
                args
            );
        }).toThrow('ActiveElementReference cannot be used with multiple results');

        expect(() => {
            queryModifierFunction(
                { key: QUERY_METADATA_KEY, data: { multiple: true, parameterIndex: 0 }},
                { name, type: ActiveElementCollection as Function },
                args
            );
        }).toThrow('ActiveElementCollection cannot be used without a selector');

        expect(() => {
            queryModifierFunction(
                { key: QUERY_METADATA_KEY, data: { selector: 'div', multiple: false, parameterIndex: 0 }},
                { name, type: ActiveElementCollection as Function },
                args
            );
        }).toThrow('ActiveElementCollection cannot be used with a single result');
    });
});
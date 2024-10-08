import { INJECTABLE_METADATA_KEY, Injectable, InjectableMetadata } from "./injectable.decorator";


describe('Injectable Decorator', () => {
    it('Should define shared with no constructor parameters', () => {
        const target = class {
            constructor() { }
        }

        const shared = true;

        Injectable({ shared })(target);

        const metadata = Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) as InjectableMetadata;

        expect(metadata).toBeDefined();
        expect(metadata.shared).toEqual(shared);
        expect(metadata.params).toBeUndefined();
    });

    it('Should define not shared with no constructor parameters', () => {
        const target = class {
            constructor() { }
        }

        const shared = false;

        Injectable({ shared })(target);

        const metadata = Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) as InjectableMetadata;

        expect(metadata).toBeDefined();
        expect(metadata.shared).toEqual(shared);
        expect(metadata.params).toBeUndefined();
    });

    it('Should define shared with constructor parameters', () => {
        const target = class {
            constructor(name: string, age: number) { console.log(name, age); }
        }

        const params = [
            { name: 'name', type: String },
            { name: 'age', type: Number }
        ]

        Reflect.defineMetadata('design:paramtypes', params.map(param => param.type), target);

        const shared = true;

        Injectable({ shared })(target);

        const metadata = Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) as InjectableMetadata;

        expect(metadata).toBeDefined();
        expect(metadata.shared).toEqual(shared);
        expect(metadata.params).toBeDefined();
        expect(metadata.params?.sort()).toEqual(params.sort());
    });

    it('Should define not shared with constructor parameters', () => {
        const target = class {
            constructor(name: string, age: number) { console.log(name, age); }
        }

        const params = [
            { name: 'name', type: String },
            { name: 'age', type: Number }
        ]

        Reflect.defineMetadata('design:paramtypes', params.map(param => param.type), target);

        const shared = false;

        Injectable({ shared })(target);

        const metadata = Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) as InjectableMetadata;

        expect(metadata).toBeDefined();
        expect(metadata.shared).toEqual(shared);
        expect(metadata.params).toBeDefined();
        expect(metadata.params?.sort()).toEqual(params.sort());
    });
});
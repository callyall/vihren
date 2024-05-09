import { argumentModifier } from "./argumentModifier.decorator";

describe('ArgumentModifierDecorator', () => {
    it('Should define metadata', () => {
        class Test {}

        expect(Reflect.getMetadata('argument:modifier', Test)).toBeUndefined();

        const firstMeta = { key: 'test', data: 'test' };

        argumentModifier(firstMeta, Test, 0);

        let metadata = Reflect.getMetadata('argument:modifier', Test) as Map<number, any>;

        expect(metadata).toBeDefined();
        expect(metadata).toBeInstanceOf(Map);
        expect(metadata.size).toEqual(1);
        expect(metadata.get(0)).toEqual(firstMeta);

        const secondMeta = { key: 'test2', data: 'test2' };

        argumentModifier(secondMeta, Test, 1);

        metadata = Reflect.getMetadata('argument:modifier', Test) as Map<number, any>;

        expect(metadata.size).toEqual(2);
        expect(metadata.get(1)).toEqual(secondMeta);
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argumentModifier_decorator_1 = require("./argumentModifier.decorator");
describe('ArgumentModifierDecorator', () => {
    it('Should define metadata', () => {
        class Test {
        }
        expect(Reflect.getMetadata('argument:modifier', Test)).toBeUndefined();
        const firstMeta = { key: 'test', data: 'test' };
        (0, argumentModifier_decorator_1.argumentModifier)(firstMeta, Test, 0);
        let metadata = Reflect.getMetadata('argument:modifier', Test);
        expect(metadata).toBeDefined();
        expect(metadata).toBeInstanceOf(Map);
        expect(metadata.size).toEqual(1);
        expect(metadata.get(0)).toEqual(firstMeta);
        const secondMeta = { key: 'test2', data: 'test2' };
        (0, argumentModifier_decorator_1.argumentModifier)(secondMeta, Test, 1);
        metadata = Reflect.getMetadata('argument:modifier', Test);
        expect(metadata.size).toEqual(2);
        expect(metadata.get(1)).toEqual(secondMeta);
    });
});
//# sourceMappingURL=argumentModifier.decorator.spec.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const injectable_decorator_1 = require("./injectable.decorator");
describe('Injectable Decorator', () => {
    it('Should define shared with no constructor parameters', () => {
        const target = class {
            constructor() { }
        };
        const shared = true;
        (0, injectable_decorator_1.Injectable)({ shared })(target);
        const metadata = Reflect.getMetadata(injectable_decorator_1.INJECTABLE_METADATA_KEY, target);
        expect(metadata).toBeDefined();
        expect(metadata.shared).toEqual(shared);
        expect(metadata.params).toBeUndefined();
    });
    it('Should define not shared with no constructor parameters', () => {
        const target = class {
            constructor() { }
        };
        const shared = false;
        (0, injectable_decorator_1.Injectable)({ shared })(target);
        const metadata = Reflect.getMetadata(injectable_decorator_1.INJECTABLE_METADATA_KEY, target);
        expect(metadata).toBeDefined();
        expect(metadata.shared).toEqual(shared);
        expect(metadata.params).toBeUndefined();
    });
    it('Should define shared with constructor parameters', () => {
        var _a;
        const target = class {
            constructor(name, age) { }
        };
        const params = [
            { name: 'name', type: String },
            { name: 'age', type: Number }
        ];
        Reflect.defineMetadata('design:paramtypes', params.map(param => param.type), target);
        const shared = true;
        (0, injectable_decorator_1.Injectable)({ shared })(target);
        const metadata = Reflect.getMetadata(injectable_decorator_1.INJECTABLE_METADATA_KEY, target);
        expect(metadata).toBeDefined();
        expect(metadata.shared).toEqual(shared);
        expect(metadata.params).toBeDefined();
        expect((_a = metadata.params) === null || _a === void 0 ? void 0 : _a.sort()).toEqual(params.sort());
    });
    it('Should define not shared with constructor parameters', () => {
        var _a;
        const target = class {
            constructor(name, age) { }
        };
        const params = [
            { name: 'name', type: String },
            { name: 'age', type: Number }
        ];
        Reflect.defineMetadata('design:paramtypes', params.map(param => param.type), target);
        const shared = false;
        (0, injectable_decorator_1.Injectable)({ shared })(target);
        const metadata = Reflect.getMetadata(injectable_decorator_1.INJECTABLE_METADATA_KEY, target);
        expect(metadata).toBeDefined();
        expect(metadata.shared).toEqual(shared);
        expect(metadata.params).toBeDefined();
        expect((_a = metadata.params) === null || _a === void 0 ? void 0 : _a.sort()).toEqual(params.sort());
    });
});
//# sourceMappingURL=injectable.decorator.spec.js.map
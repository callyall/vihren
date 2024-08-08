"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const callback_decorator_1 = require("./callback.decorator");
describe('CallbackDecorator', () => {
    it('Should define metadata', () => {
        class Test {
            callback() { }
        }
        let metadata = Reflect.getMetadata(callback_decorator_1.CALLBACK_METADATA_KEY, Test);
        expect(metadata).toBeUndefined();
        const meta = { key: 'test', data: 'test' };
        // @ts-ignore
        (0, callback_decorator_1.callback)(meta, Test, 'callback');
        metadata = Reflect.getMetadata(callback_decorator_1.CALLBACK_METADATA_KEY, Test);
        expect(metadata).toBeDefined();
        expect(metadata.get('callback')).toBeInstanceOf(Array);
        expect(metadata.get('callback').length).toEqual(1);
        expect(metadata.get('callback')[0]).toEqual(meta);
        // @ts-ignore
        (0, callback_decorator_1.callback)(meta, Test, 'callback');
        metadata = Reflect.getMetadata(callback_decorator_1.CALLBACK_METADATA_KEY, Test);
        expect(metadata.get('callback').length).toEqual(2);
        expect(metadata.get('callback')[1]).toEqual(meta);
    });
});
//# sourceMappingURL=callback.decorator.spec.js.map
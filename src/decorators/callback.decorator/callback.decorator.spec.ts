import "reflect-metadata";
import { callback, CALLBACK_METADATA_KEY } from "./callback.decorator";

describe('CallbackDecorator', () => {
   it('Should define metadata', () => {
       class Test {
           public callback(): void {}
       }

       let metadata = Reflect.getMetadata(CALLBACK_METADATA_KEY, Test);

       expect(metadata).toBeUndefined();

       const meta = { key: 'test', data: 'test', callback: 'test' };

       callback(meta, Test, 'callback');

       metadata = Reflect.getMetadata(CALLBACK_METADATA_KEY, Test);
       expect(metadata).toBeDefined();
       expect(metadata.get('callback')).toBeInstanceOf(Array);
       expect(metadata.get('callback').length).toEqual(1);
       expect(metadata.get('callback')[0]).toEqual(meta);

       callback(meta, Test, 'callback');

       metadata = Reflect.getMetadata(CALLBACK_METADATA_KEY, Test);

       expect(metadata.get('callback').length).toEqual(2);
       expect(metadata.get('callback')[1]).toEqual(meta);
   });
});

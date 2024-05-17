import { ComponentEventEmitter } from "./componentEventEmitter";

describe('ComponentEventEmitter', () => {
    it('Should emit event', done => {
       const eventEmitter = new ComponentEventEmitter();

       const subscription = eventEmitter.on('test').subscribe((data) => {

           expect(data.source).toBe('testSource');
           expect(data.data).toBe('test');

           subscription.unsubscribe();
           done();
       });

        eventEmitter.emit('test', { source: 'testSource', data: 'test' });
    });
});

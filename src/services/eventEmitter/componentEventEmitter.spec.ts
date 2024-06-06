import { ComponentEventEmitter } from "./componentEventEmitter";

describe('ComponentEventEmitter', () => {
    it('Should emit event', done => {
       const eventEmitter = new ComponentEventEmitter();

       const subscription = eventEmitter.on('test').subscribe((data) => {

           expect(data.source).toEqual('testSource');
           expect(data.data).toEqual('test');

           subscription.unsubscribe();
           done();
       });

        eventEmitter.emit('test', { source: 'testSource', data: 'test' });
    });
});

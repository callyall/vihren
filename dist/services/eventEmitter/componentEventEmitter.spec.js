"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const componentEventEmitter_1 = require("./componentEventEmitter");
describe('ComponentEventEmitter', () => {
    it('Should emit event', done => {
        const eventEmitter = new componentEventEmitter_1.ComponentEventEmitter();
        const subscription = eventEmitter.on('test').subscribe((data) => {
            expect(data.source).toEqual('testSource');
            expect(data.data).toEqual('test');
            subscription.unsubscribe();
            done();
        });
        eventEmitter.emit('test', { source: 'testSource', data: 'test' });
    });
});
//# sourceMappingURL=componentEventEmitter.spec.js.map
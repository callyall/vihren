"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const changeDetector_1 = require("./changeDetector");
const mutation_interface_1 = require("../interfaces/mutation.interface");
const setupDomainDetector = () => {
    document.body.innerHTML = `
            <div id="parent">
                <div id="app">
                    <div id="one"><div>
                    <div id="two"></div>
                    <div id="three">
                      <dive id="four"></dive>
                    </div>
                </div>
            </div>
        `;
    return new changeDetector_1.ChangeDetector(document.getElementById('app'));
};
describe('ChangeDetector', () => {
    it('Should fail to instantiate the change detector', () => {
        expect(() => new changeDetector_1.ChangeDetector(document.createElement('div'))).toThrow('Root element does not have a parent node');
    });
    afterEach(() => {
        document.body.innerHTML = '';
    });
    it('Should detect a removed node', done => {
        var _a;
        const changeDetector = setupDomainDetector();
        const subscription = changeDetector
            .onRemoved()
            .subscribe((mutation) => {
            if (mutation.type === mutation_interface_1.MutationType.Removed && mutation.element.id === 'four') {
                done();
                subscription.unsubscribe();
            }
        });
        (_a = document.getElementById('four')) === null || _a === void 0 ? void 0 : _a.remove();
    });
    it('Should detect an added node', done => {
        var _a;
        const changeDetector = setupDomainDetector();
        const subscription = changeDetector
            .onAdded()
            .subscribe((mutation) => {
            if (mutation.type === mutation_interface_1.MutationType.Added && mutation.element.id === 'five') {
                done();
                subscription.unsubscribe();
            }
        });
        const element = document.createElement('div');
        element.id = 'five';
        (_a = document.getElementById('app')) === null || _a === void 0 ? void 0 : _a.appendChild(element);
    });
    it('Should detect updated node', done => {
        var _a;
        const changeDetector = setupDomainDetector();
        const subscription = changeDetector
            .onUpdated()
            .subscribe((mutation) => {
            const element = mutation.element;
            if (mutation.type === mutation_interface_1.MutationType.Updated
                && element.id === 'one'
                && element.classList.contains('test')) {
                done();
                subscription.unsubscribe();
            }
        });
        (_a = document.getElementById('one')) === null || _a === void 0 ? void 0 : _a.classList.add('test');
    });
});
//# sourceMappingURL=changeDetector.spec.js.map
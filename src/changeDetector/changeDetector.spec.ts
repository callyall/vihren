import { ChangeDetector } from "./changeDetector";
import { Mutation, MutationType } from "../interfaces/mutation.interface";

const setupDomainDetector = (): ChangeDetector => {
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

    return new ChangeDetector(document.getElementById('app') as HTMLElement);
}

describe('ChangeDetector', () => {
    it('Should fail to instantiate the change detector', () => {
        expect(() => new ChangeDetector(document.createElement('div'))).toThrow('Root element does not have a parent node');
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('Should detect a removed node', done => {
        const changeDetector = setupDomainDetector();

        const subscription = changeDetector
            .onRemoved()
            .subscribe((mutation: Mutation) => {
                if (mutation.type === MutationType.Removed && (mutation.element as HTMLElement).id === 'four') {
                    done();
                    subscription.unsubscribe();
                }
            });

        document.getElementById('four')?.remove();
    });

    it('Should detect an added node', done => {
        const changeDetector = setupDomainDetector();

        const subscription = changeDetector
            .onAdded()
            .subscribe((mutation: Mutation) => {
                if (mutation.type === MutationType.Added && (mutation.element as HTMLElement).id === 'five') {
                    done();
                    subscription.unsubscribe();
                }
            });

        const element = document.createElement('div');
        element.id = 'five';
        document.getElementById('app')?.appendChild(element);
    });

    it('Should detect updated node', done => {
        const changeDetector = setupDomainDetector();

        const subscription = changeDetector
            .onUpdated()
            .subscribe((mutation: Mutation) => {
                const element = mutation.element as HTMLElement;

                if (
                    mutation.type === MutationType.Updated
                    && element.id === 'one'
                    && element.classList.contains('test')
                ) {
                    done();
                    subscription.unsubscribe();
                }
            });

        document.getElementById('one')?.classList.add('test');
    });
});
import { EMPTY } from 'rxjs';
import { Component } from '../decorators/component.decorator/component.decorator';
import { Application, Feature } from './application';

describe('Application', () => {
    it('Should create an instance of Application with the default features', () => {
        const app = new Application(document.body);

        expect(app).toBeInstanceOf(Application);

        expect(app.getEnabledFeatures()).toEqual([
            Feature.CHILD_COMPONENT_DECORATOR,
            Feature.COMPONENT_EVENT_DECORATOR,
            Feature.EVENT_DECORATOR,
            Feature.QUERY_DECORATOR,
            Feature.TIME_SERVICE,
        ]);

        app.init();
    });

    it('Should create an instance of Application with custom features', () => {
        const app = new Application(document.body, [Feature.TIME_SERVICE]);

        expect(app).toBeInstanceOf(Application);

        expect(app.getEnabledFeatures()).toEqual([Feature.TIME_SERVICE]);

        app.init();
    });

    it('Should register and resolve a value and a factory', () => {
        const app = new Application(document.body);
        const name = 'John Doe';
        const age = 30;

        app.registerValueOrFactory<string>('name', name);
        expect(app.resolve<string>('name')).toEqual(name);

        app.registerValueOrFactory<number>('ageFactory', () => age);
        expect(app.resolve<number>('ageFactory')).toEqual(age);
    });

    it('Should register an argument modifier', () => {
        const app = new Application(document.body);

        app.registerArgumentModifier<string>('test', (argumentMetadata, paramMetadata, args) => args);

        expect(true);
    });

    it('Should register a callback setup function', () => {
        const app = new Application(document.body);

        app.registerCallbackSetupFunction('test', () => EMPTY.subscribe());

        expect(true);
    });

    it('Should register a component and retrieve it by selector', () => {
        document.body.innerHTML = `<div id="test"></div>`;

        const app = new Application(document.body);

        @Component({ selector: '#test' })
        class TestComponent {}

        app.registerComponent(TestComponent);

        app.init();

        expect(app.getComponentInstancesBySelector('#test').size).toEqual(1);
    });
});

import { Component } from "../decorators/component.decorator/component.decorator";
import { Injectable, ParamMetadata } from "../decorators/injectable.decorator/injectable.decorator";
import { IocContainer } from "./IocContainer";
import { ArgumentMetadata, argumentModifier } from "../decorators/argumentModifier.decorator/argumentModifier.decorator";

describe('IocContainer', () => {
    it('Should register a value', () => {
        const container = new IocContainer();
        const key = 'testKey';
        const value = 'testValue';

        expect(() => container.resolve(key)).toThrow(`No registration found for key ${key}`);

        container.registerValue(key, value);

        expect(container.resolve(key)).toEqual(value);
    });

    it('Should register a value factory', () => {
        const container = new IocContainer();
        const key = 'testKey';
        const value = 'testValue';

        expect(() => container.resolve(key)).toThrow(`No registration found for key ${key}`);

        container.registerFactory(key, () => value);

        expect(container.resolve(key)).toEqual(value);
    });

    it('Should register an undecorated object', () => {
        const container = new IocContainer();
        class TestClass { }

        const key = TestClass.name;

        expect(() => container.resolve(key)).toThrow(`No registration found for key ${key}`);

        container.registerFactory(key, () => new TestClass());

        expect(container.resolve(key)).toBeInstanceOf(TestClass);
    });

    it('Should register a decorated object', () => {
        const container = new IocContainer();
        @Injectable({ shared: true })
        class TestClass { }

        const key = TestClass.name;
        const instnace = new TestClass();

        expect(() => container.resolve(key)).toThrow(`No registration found for key ${key}`);

        container.registerValue(key, instnace);

        expect(container.resolve(TestClass)).toStrictEqual(instnace);
    });

    it('Should register a shared decorated object factory with dependencies', () => {
        const container = new IocContainer();
        @Injectable({ shared: true })
        class TestClass {
            constructor(public test: string) { }
        }

        const key = TestClass.name;

        expect(() => container.resolve(TestClass)).toThrow(`No shared instance found for key ${key}`);

        container.registerFactory(key, (args) => new TestClass(args?.get('test')));

        const instnace = container.resolve<TestClass>(TestClass, new Map<string, any>([['test', 'testValue']]));

        expect(instnace).toBeInstanceOf(TestClass);
        expect(instnace.test).toEqual('testValue');

        const instnace2 = container.resolve<TestClass>(TestClass, new Map<string, any>([['test', 'testValue2']]));

        expect(instnace2).toStrictEqual(instnace);
    });

    it('Should register a not shared decorated object factory with dependencies', () => {
        const container = new IocContainer();
        @Injectable({ shared: false })
        class TestClass {
            constructor(public test: string) { }
        }

        const key = TestClass.name;

        expect(() => container.resolve(TestClass)).toThrow(`No value found for parameter test`);

        container.registerFactory(key, (args) => new TestClass(args?.get('test')));

        const instnace = container.resolve<TestClass>(TestClass, new Map<string, any>([['test', 'testValue']]));

        expect(instnace).toBeInstanceOf(TestClass);
        expect(instnace.test).toEqual('testValue');

        const instnace2 = container.resolve<TestClass>(TestClass, new Map<string, any>([['test', 'testValue2']]));

        expect(instnace2).not.toEqual(instnace);
    });

    it('Should trigger the default factory', () => {
        const container = new IocContainer();
        container.registerValue('test', 'testValue');
        container.registerValue('testServiceValue', 'testServiceValue');

        class TestClass { }

        @Injectable({ shared: false })
        class TestService {
            constructor(public testServiceValue: string) { }
        }

        @Injectable({ shared: false })
        class TestService2 { }

        @Injectable({ shared: false })
        class TestService3 { }

        @Injectable({ shared: false })
        class TestClass2 { 
            constructor(public test: string, public service: TestService) { }
        }

        @Component({ selector: '.test' })
        class TestClass3 {
            constructor(public test1: string, public service: TestService2, public test2: string, public service2: TestService3) { }
        }

        container.registerFactory(TestService2.name, () => new TestService2());
        container.registerFactory('test2', () => 'world');
        container.registerValue('test1', 'hello');
        container.registerValue(TestService3.name, new TestService3());

        let instance: any = container.resolve<TestClass>(TestClass);

        expect(instance).toBeInstanceOf(TestClass);

        instance = container.resolve<TestClass2>(TestClass2);

        expect(instance).toBeInstanceOf(TestClass2);
        expect(instance.service).toBeInstanceOf(TestService);
        expect(instance.test).toEqual('testValue');
        expect(instance.service.testServiceValue).toEqual('testServiceValue');

        instance = container.resolve<TestClass2>(TestClass2, new Map<string, any>([['test', 'alteredValue'], ['testServiceValue', 'atleredServiceValue']]));

        expect(instance).toBeInstanceOf(TestClass2);
        expect(instance.service).toBeInstanceOf(TestService);
        expect(instance.test).toEqual('alteredValue');
        expect(instance.service.testServiceValue).toEqual('atleredServiceValue');

        instance = container.resolve<TestClass3>(TestClass3);

        expect(instance).toBeInstanceOf(TestClass3);
        expect(instance.service).toBeInstanceOf(TestService2);
        expect(instance.test1).toEqual('hello');
        expect(instance.test2).toEqual('world');
        expect(instance.service2).toBeInstanceOf(TestService3);
    });

    it('Should throw mo argument modifier function found for key test', () => {
        @Injectable({ shared: false })
        class Test {
            constructor(public test: string) { }
        }

        const data = 'testMessage';

        argumentModifier({ key: 'test', data }, Test as Function, 0);

        const container = new IocContainer();

        expect(() => container.resolve(Test)).toThrow(`No argument modifier function found for key test`);
    });

    it('Should modify an argument', () => {
        @Injectable({ shared: false })
        class Test {
            constructor(public first: string, public test: string) { }
        }

        const data = 'testMessage';

        argumentModifier({ key: 'test', data }, Test as Function, 1);

        const container = new IocContainer();
        container.registerArgumentModifier('test',(argumentMetadata: ArgumentMetadata<string>, paramMetadata: ParamMetadata, args: Map<string, any>): Map<string, any> => {
            args.set('test', argumentMetadata.data);

            return args;
        });

        const instance = container.resolve(Test, new Map<string, any>([['first', 'test']])) as Test;

        expect(instance.test).toEqual(data);
    });

    it('Should modify an argument with multiple arguments', () => {
        const container = new IocContainer();

        expect(() => container.resolve('Test', undefined, true)).toThrow('No shared instance found for key Test');
    });
});

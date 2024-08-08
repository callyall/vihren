"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_decorator_1 = require("../decorators/component.decorator/component.decorator");
const injectable_decorator_1 = require("../decorators/injectable.decorator/injectable.decorator");
const IocContainer_1 = require("./IocContainer");
const argumentModifier_decorator_1 = require("../decorators/argumentModifier.decorator/argumentModifier.decorator");
describe('IocContainer', () => {
    it('Should register a value', () => {
        const container = new IocContainer_1.IocContainer();
        const key = 'testKey';
        const value = 'testValue';
        expect(() => container.resolve(key)).toThrow(`No registration found for key ${key}`);
        container.registerValue(key, value);
        expect(container.resolve(key)).toEqual(value);
    });
    it('Should register a value factory', () => {
        const container = new IocContainer_1.IocContainer();
        const key = 'testKey';
        const value = 'testValue';
        expect(() => container.resolve(key)).toThrow(`No registration found for key ${key}`);
        container.registerFactory(key, () => value);
        expect(container.resolve(key)).toEqual(value);
    });
    it('Should register an undecorated object', () => {
        const container = new IocContainer_1.IocContainer();
        class TestClass {
        }
        const key = TestClass.name;
        expect(() => container.resolve(key)).toThrow(`No registration found for key ${key}`);
        container.registerFactory(key, () => new TestClass());
        expect(container.resolve(key)).toBeInstanceOf(TestClass);
    });
    it('Should register a decorated object', () => {
        const container = new IocContainer_1.IocContainer();
        let TestClass = class TestClass {
        };
        TestClass = __decorate([
            (0, injectable_decorator_1.Injectable)({ shared: true })
        ], TestClass);
        const key = TestClass.name;
        const instnace = new TestClass();
        expect(() => container.resolve(key)).toThrow(`No registration found for key ${key}`);
        container.registerValue(key, instnace);
        expect(container.resolve(TestClass)).toStrictEqual(instnace);
    });
    it('Should register a shared decorated object factory with dependencies', () => {
        const container = new IocContainer_1.IocContainer();
        let TestClass = class TestClass {
            constructor(test) {
                this.test = test;
            }
        };
        TestClass = __decorate([
            (0, injectable_decorator_1.Injectable)({ shared: true }),
            __metadata("design:paramtypes", [String])
        ], TestClass);
        const key = TestClass.name;
        expect(() => container.resolve(TestClass)).toThrow(`No shared instance found for key ${key}`);
        container.registerFactory(key, (args) => new TestClass(args === null || args === void 0 ? void 0 : args.get('test')));
        const instnace = container.resolve(TestClass, new Map([['test', 'testValue']]));
        expect(instnace).toBeInstanceOf(TestClass);
        expect(instnace.test).toEqual('testValue');
        const instnace2 = container.resolve(TestClass, new Map([['test', 'testValue2']]));
        expect(instnace2).toStrictEqual(instnace);
    });
    it('Should register a not shared decorated object factory with dependencies', () => {
        const container = new IocContainer_1.IocContainer();
        let TestClass = class TestClass {
            constructor(test) {
                this.test = test;
            }
        };
        TestClass = __decorate([
            (0, injectable_decorator_1.Injectable)({ shared: false }),
            __metadata("design:paramtypes", [String])
        ], TestClass);
        const key = TestClass.name;
        expect(() => container.resolve(TestClass)).toThrow(`No value found for parameter test`);
        container.registerFactory(key, (args) => new TestClass(args === null || args === void 0 ? void 0 : args.get('test')));
        const instnace = container.resolve(TestClass, new Map([['test', 'testValue']]));
        expect(instnace).toBeInstanceOf(TestClass);
        expect(instnace.test).toEqual('testValue');
        const instnace2 = container.resolve(TestClass, new Map([['test', 'testValue2']]));
        expect(instnace2).not.toEqual(instnace);
    });
    it('Should trigger the default factory', () => {
        const container = new IocContainer_1.IocContainer();
        container.registerValue('test', 'testValue');
        container.registerValue('testServiceValue', 'testServiceValue');
        class TestClass {
        }
        let TestService = class TestService {
            constructor(testServiceValue) {
                this.testServiceValue = testServiceValue;
            }
        };
        TestService = __decorate([
            (0, injectable_decorator_1.Injectable)({ shared: false }),
            __metadata("design:paramtypes", [String])
        ], TestService);
        let TestService2 = class TestService2 {
        };
        TestService2 = __decorate([
            (0, injectable_decorator_1.Injectable)({ shared: false })
        ], TestService2);
        let TestService3 = class TestService3 {
        };
        TestService3 = __decorate([
            (0, injectable_decorator_1.Injectable)({ shared: false })
        ], TestService3);
        let TestClass2 = class TestClass2 {
            constructor(test, service) {
                this.test = test;
                this.service = service;
            }
        };
        TestClass2 = __decorate([
            (0, injectable_decorator_1.Injectable)({ shared: false }),
            __metadata("design:paramtypes", [String, TestService])
        ], TestClass2);
        let TestClass3 = class TestClass3 {
            constructor(test1, service, test2, service2) {
                this.test1 = test1;
                this.service = service;
                this.test2 = test2;
                this.service2 = service2;
            }
        };
        TestClass3 = __decorate([
            (0, component_decorator_1.Component)({ selector: '.test' }),
            __metadata("design:paramtypes", [String, TestService2, String, TestService3])
        ], TestClass3);
        container.registerFactory(TestService2.name, () => new TestService2());
        container.registerFactory('test2', () => 'world');
        container.registerValue('test1', 'hello');
        container.registerValue(TestService3.name, new TestService3());
        let instance = container.resolve(TestClass);
        expect(instance).toBeInstanceOf(TestClass);
        instance = container.resolve(TestClass2);
        expect(instance).toBeInstanceOf(TestClass2);
        expect(instance.service).toBeInstanceOf(TestService);
        expect(instance.test).toEqual('testValue');
        expect(instance.service.testServiceValue).toEqual('testServiceValue');
        instance = container.resolve(TestClass2, new Map([['test', 'alteredValue'], ['testServiceValue', 'atleredServiceValue']]));
        expect(instance).toBeInstanceOf(TestClass2);
        expect(instance.service).toBeInstanceOf(TestService);
        expect(instance.test).toEqual('alteredValue');
        expect(instance.service.testServiceValue).toEqual('atleredServiceValue');
        instance = container.resolve(TestClass3);
        expect(instance).toBeInstanceOf(TestClass3);
        expect(instance.service).toBeInstanceOf(TestService2);
        expect(instance.test1).toEqual('hello');
        expect(instance.test2).toEqual('world');
        expect(instance.service2).toBeInstanceOf(TestService3);
    });
    it('Should throw mo argument modifier function found for key test', () => {
        let Test = class Test {
            constructor(test) {
                this.test = test;
            }
        };
        Test = __decorate([
            (0, injectable_decorator_1.Injectable)({ shared: false }),
            __metadata("design:paramtypes", [String])
        ], Test);
        const data = 'testMessage';
        (0, argumentModifier_decorator_1.argumentModifier)({ key: 'test', data }, Test, 0);
        const container = new IocContainer_1.IocContainer();
        expect(() => container.resolve(Test)).toThrow(`No argument modifier function found for key test`);
    });
    it('Should modify an argument', () => {
        let Test = class Test {
            constructor(first, test) {
                this.first = first;
                this.test = test;
            }
        };
        Test = __decorate([
            (0, injectable_decorator_1.Injectable)({ shared: false }),
            __metadata("design:paramtypes", [String, String])
        ], Test);
        const data = 'testMessage';
        (0, argumentModifier_decorator_1.argumentModifier)({ key: 'test', data }, Test, 1);
        const container = new IocContainer_1.IocContainer();
        container.registerArgumentModifier('test', (argumentMetadata, paramMetadata, args) => {
            args.set('test', argumentMetadata.data);
            return args;
        });
        const instance = container.resolve(Test, new Map([['first', 'test']]));
        expect(instance.test).toEqual(data);
    });
    it('Should modify an argument with multiple arguments', () => {
        const container = new IocContainer_1.IocContainer();
        expect(() => container.resolve('Test', undefined, true)).toThrow('No shared instance found for key Test');
    });
});
//# sourceMappingURL=iocContainer.spec.js.map
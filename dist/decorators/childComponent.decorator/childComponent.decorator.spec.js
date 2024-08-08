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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const query_decorator_1 = require("../query.decorator/query.decorator");
const childComponent_decorator_1 = require("./childComponent.decorator");
const argumentModifier_decorator_1 = require("../argumentModifier.decorator/argumentModifier.decorator");
const componentContainer_1 = require("../../componentContainer/componentContainer");
describe('ChildComponentDecorator', () => {
    class TestComponent {
        constructor(id) {
            this.id = id;
        }
    }
    it('Should define ChildComponentMetadata', () => {
        let TestComponent = class TestComponent {
            constructor(test) {
            }
        };
        TestComponent = __decorate([
            __param(0, (0, childComponent_decorator_1.ChildComponent)({ selector: 'test' })),
            __metadata("design:paramtypes", [String])
        ], TestComponent);
        const metadata = Reflect.getMetadata(argumentModifier_decorator_1.ARGUMENT_MODIFIER_METADATA_KEY, TestComponent);
        expect(metadata).toBeDefined();
        expect(metadata.size).toEqual(1);
        const childComponentMetadata = metadata.get(0);
        expect(childComponentMetadata).toBeDefined();
        expect(childComponentMetadata.key).toEqual(childComponent_decorator_1.CHILD_COMPONENT_METADATA_KEY);
        expect(childComponentMetadata.data.selector).toEqual('test');
        expect(childComponentMetadata.data.parameterIndex).toEqual(0);
    });
    it('Should fail to modify arguments', () => {
        const args = new Map();
        expect(() => {
            (0, childComponent_decorator_1.childComponentModifierFunction)({
                key: childComponent_decorator_1.CHILD_COMPONENT_METADATA_KEY,
                data: { selector: 'test', parameterIndex: 0, componentSelector: 'test' }
            }, {
                name: 'test',
                type: (childComponent_decorator_1.ChildComponentReference)
            }, args);
        }).toThrow('No root element found');
        expect(() => {
            (0, childComponent_decorator_1.childComponentModifierFunction)({
                key: childComponent_decorator_1.CHILD_COMPONENT_METADATA_KEY,
                data: { selector: 'test', parameterIndex: 0, componentSelector: 'test' }
            }, {
                name: 'test',
                type: (childComponent_decorator_1.ChildComponentCollection)
            }, args);
        }).toThrow('No root element found');
        args.set(query_decorator_1.ROOT_ELEMENT_KEY, document.createElement('div'));
        expect(() => {
            (0, childComponent_decorator_1.childComponentModifierFunction)({
                key: childComponent_decorator_1.CHILD_COMPONENT_METADATA_KEY,
                data: { selector: 'test', parameterIndex: 0, componentSelector: 'test' }
            }, {
                name: 'test',
                type: (childComponent_decorator_1.ChildComponentReference)
            }, args);
        }).toThrow('No component container found');
        expect(() => {
            (0, childComponent_decorator_1.childComponentModifierFunction)({
                key: childComponent_decorator_1.CHILD_COMPONENT_METADATA_KEY,
                data: { selector: 'test', parameterIndex: 0, componentSelector: 'test' }
            }, {
                name: 'test',
                type: (childComponent_decorator_1.ChildComponentCollection)
            }, args);
        }).toThrow('No component container found');
    });
    it('Should modify arguments', () => {
        document.body.innerHTML = `<div id="app"><div id="component"><div class="child" instance="0"></div><div class="child" instance="1"></div></div></div>`;
        const componentContainer = {
            getComponentInstancesBySelector: jest
                .fn()
                .mockReturnValue(new Map([
                [
                    "0",
                    {
                        element: Array.from(document.querySelectorAll('.child'))[0],
                        instance: new TestComponent(0),
                        subscriptions: [],
                    }
                ],
                [
                    "1",
                    {
                        element: Array.from(document.querySelectorAll('.child'))[1],
                        instance: new TestComponent(1),
                        subscriptions: [],
                    }
                ]
            ]))
        };
        const args = new Map();
        args.set(query_decorator_1.ROOT_ELEMENT_KEY, document.getElementById('component'));
        args.set(componentContainer_1.ComponentContainer.COMPONENT_CONTAINER_KEY, componentContainer);
        let result = (0, childComponent_decorator_1.childComponentModifierFunction)({
            key: childComponent_decorator_1.CHILD_COMPONENT_METADATA_KEY,
            data: {
                selector: '.child',
                componentSelector: '.child',
                parameterIndex: 0
            }
        }, {
            name: 'test',
            type: (childComponent_decorator_1.ChildComponentReference)
        }, args).get('test');
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(childComponent_decorator_1.ChildComponentReference);
        expect(result.get()).toBeDefined();
        result = (0, childComponent_decorator_1.childComponentModifierFunction)({
            key: childComponent_decorator_1.CHILD_COMPONENT_METADATA_KEY,
            data: {
                selector: '.child',
                componentSelector: '.child',
                parameterIndex: 0
            }
        }, {
            name: 'test',
            type: (childComponent_decorator_1.ChildComponentCollection)
        }, args).get('test');
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(childComponent_decorator_1.ChildComponentCollection);
        expect(result.get().length).toEqual(2);
    });
    it('Should test ChildComponentReference', () => {
        const instances = new Map();
        const componentContainer = {
            getComponentInstancesBySelector: jest.fn().mockReturnValue(instances)
        };
        expect(() => {
            document.body.innerHTML = `<div id="component"></div>`;
            const reference = new childComponent_decorator_1.ChildComponentReference(document.getElementById('component'), '.child', '.child', componentContainer);
            reference.get();
        }).toThrow('Element with selector .child not found');
        expect(() => {
            document.body.innerHTML = `<div id="component"><div class="child"></div></div>`;
            const reference = new childComponent_decorator_1.ChildComponentReference(document.getElementById('component'), '.child', '.child', componentContainer);
            reference.get();
        }).toThrow('Instance id not found');
        document.body.innerHTML = `<div id="app"><div id="component"><div class="child" instance="0"></div><div class="child" instance="1"></div></div></div>`;
        instances.set('0', {
            element: Array.from(document.querySelectorAll('.child'))[0],
            instance: new TestComponent(0),
            subscriptions: [],
        });
        instances.set('1', {
            element: Array.from(document.querySelectorAll('.child'))[1],
            instance: new TestComponent(1),
            subscriptions: [],
        });
        const reference = new childComponent_decorator_1.ChildComponentReference(document.getElementById('component'), '.child', '.child', componentContainer);
        expect(reference.get()).toBeDefined();
    });
    it('Should test ChildComponentCollection', () => {
        const instances = new Map();
        const componentContainer = {
            getComponentInstancesBySelector: jest.fn().mockReturnValue(instances)
        };
        expect(() => {
            document.body.innerHTML = `<div id="component"></div>`;
            const reference = new childComponent_decorator_1.ChildComponentCollection(document.getElementById('component'), '.child', '.child', componentContainer);
            reference.get();
        }).toThrow('Element with selector .child not found');
        expect(() => {
            document.body.innerHTML = `<div id="component"><div class="child"></div></div>`;
            const reference = new childComponent_decorator_1.ChildComponentCollection(document.getElementById('component'), '.child', '.child', componentContainer);
            reference.get();
        }).toThrow('Instance id not found');
        expect(() => {
            document.body.innerHTML = `<div id="component"><div class="child" instance="NOPE"></div></div>`;
            const reference = new childComponent_decorator_1.ChildComponentCollection(document.getElementById('component'), '.child', '.child', componentContainer);
            reference.get();
        }).toThrow('Instance for element <div class="child" instance="NOPE"></div> not found');
        document.body.innerHTML = `<div id="app"><div id="component"><div class="child" instance="0"></div><div class="child" instance="1"></div></div></div>`;
        instances.set('0', {
            element: Array.from(document.querySelectorAll('.child'))[0],
            instance: new TestComponent(0),
            subscriptions: [],
        });
        instances.set('1', {
            element: Array.from(document.querySelectorAll('.child'))[1],
            instance: new TestComponent(1),
            subscriptions: [],
        });
        const reference = new childComponent_decorator_1.ChildComponentCollection(document.getElementById('component'), '.child', '.child', componentContainer);
        expect(reference.get()).toBeDefined();
    });
});
//# sourceMappingURL=childComponent.decorator.spec.js.map
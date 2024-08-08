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
const component_decorator_1 = require("../decorators/component.decorator/component.decorator");
const componentContainer_1 = require("./componentContainer");
const IocContainer_1 = require("../iocContainer/IocContainer");
const mutation_interface_1 = require("../interfaces/mutation.interface");
const query_decorator_1 = require("../decorators/query.decorator/query.decorator");
const changeDetector_1 = require("../changeDetector/changeDetector");
const event_decorator_1 = require("../decorators/event.decorator/event.decorator");
const iocContainer = new IocContainer_1.IocContainer();
iocContainer.registerArgumentModifier(query_decorator_1.QUERY_METADATA_KEY, query_decorator_1.queryModifierFunction);
const setupDomAndContainer = () => {
    document.body.innerHTML = `
            <div id="parent">
                <div id="app">
                    <div class="test-component" id="one" data-test="1">
                        <button id="click">Click me</button>
                    </div>
                    <div class="test-component" id="two">
                        <button id="click">Click me</button>
                    </div>
                </div>
            </div>
        `;
    const rootElement = document.getElementById('app');
    const container = new componentContainer_1.ComponentContainer(rootElement, iocContainer, new changeDetector_1.ChangeDetector(rootElement));
    return { rootElement, container };
};
describe('ComponentContainer', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });
    it('Should fail to register a component', () => {
        var _a, _b;
        const { rootElement, container } = setupDomAndContainer();
        (_a = document.getElementById('parent')) === null || _a === void 0 ? void 0 : _a.appendChild(document.createElement('div'));
        expect(() => container.registerComponent(class {
        })).toThrow('Component metadata not found');
        (_b = document.getElementById('app')) === null || _b === void 0 ? void 0 : _b.remove();
    });
    it('Should initialise a component', done => {
        const { rootElement, container } = setupDomAndContainer();
        let TestComponent = class TestComponent {
            constructor(rootElement) {
                this.rootElement = rootElement;
            }
            onInit() {
                var _a;
                // Just check for id=one
                if (this.rootElement.id === 'one') {
                    expect(true).toEqual(true);
                    (_a = document.getElementById('app')) === null || _a === void 0 ? void 0 : _a.remove();
                    done();
                }
            }
        };
        TestComponent = __decorate([
            (0, component_decorator_1.Component)({ selector: '.test-component' }),
            __param(0, (0, query_decorator_1.Query)()),
            __metadata("design:paramtypes", [HTMLElement])
        ], TestComponent);
        container.registerComponent(TestComponent);
    });
    it('Should update a component', done => {
        const { rootElement, container } = setupDomAndContainer();
        let detectChange = true;
        let TestComponent = class TestComponent {
            constructor(rootElement) {
                this.rootElement = rootElement;
            }
            onInit() {
                var _a;
                // Just check for id=one
                if (this.rootElement.id === 'one') {
                    (_a = document.getElementById('one')) === null || _a === void 0 ? void 0 : _a.appendChild(document.createElement('div'));
                }
            }
            onChange(mutation) {
                if (!detectChange) {
                    return;
                }
                if (mutation.type === mutation_interface_1.MutationType.Updated) {
                    expect(true).toEqual(true);
                    done();
                    detectChange = false;
                }
            }
        };
        TestComponent = __decorate([
            (0, component_decorator_1.Component)({ selector: '.test-component' }),
            __param(0, (0, query_decorator_1.Query)()),
            __metadata("design:paramtypes", [HTMLElement])
        ], TestComponent);
        container.registerComponent(TestComponent);
    });
    it('Should destroy a component', done => {
        const { rootElement, container } = setupDomAndContainer();
        let detectDestruction = true;
        let TestComponent = class TestComponent {
            constructor(rootElement) {
                this.rootElement = rootElement;
            }
            onInit() {
                this.rootElement.remove();
            }
            onDestroy() {
                if (detectDestruction) {
                    expect(true).toEqual(true);
                    done();
                    detectDestruction = false;
                }
            }
        };
        TestComponent = __decorate([
            (0, component_decorator_1.Component)({ selector: '.test-component' }),
            __param(0, (0, query_decorator_1.Query)()),
            __metadata("design:paramtypes", [HTMLElement])
        ], TestComponent);
        container.registerComponent(TestComponent);
    });
    it('Should trigger invalid instance id error', done => {
        var _a;
        const logSpy = jest.spyOn(global.console, 'error');
        logSpy.mockImplementation((e) => {
            expect(e).toContain('Invalid instance id 20 for component .test-component');
            logSpy.mockRestore();
            done();
        });
        const { rootElement, container } = setupDomAndContainer();
        let TestComponent = class TestComponent {
        };
        TestComponent = __decorate([
            (0, component_decorator_1.Component)({ selector: '.test-component' })
        ], TestComponent);
        (_a = document.getElementById('two')) === null || _a === void 0 ? void 0 : _a.setAttribute('instance', '20');
        try {
            container.registerComponent(TestComponent);
        }
        catch (e) {
            expect(e.message).toContain('Invalid instance id 20 for component .test-component');
            done();
        }
    });
    it('Should fail to setup a callback function', () => {
        const { rootElement, container } = setupDomAndContainer();
        let TestComponent = class TestComponent {
            constructor(rootElement) {
                this.rootElement = rootElement;
            }
            onClick() {
            }
        };
        __decorate([
            (0, event_decorator_1.Event)({ type: 'click', selector: '#submit' }),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestComponent.prototype, "onClick", null);
        TestComponent = __decorate([
            (0, component_decorator_1.Component)({ selector: '.test-component' }),
            __param(0, (0, query_decorator_1.Query)()),
            __metadata("design:paramtypes", [HTMLElement])
        ], TestComponent);
        expect(() => container.registerComponent(TestComponent)).toThrow(/Callback setup function not found for key/);
    });
    it('Should setup a callback function', () => {
        const { rootElement, container } = setupDomAndContainer();
        let TestComponent = class TestComponent {
            constructor(rootElement) {
                this.rootElement = rootElement;
            }
            onClick() {
            }
        };
        __decorate([
            (0, event_decorator_1.Event)({ type: 'click', selector: '#submit' }),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestComponent.prototype, "onClick", null);
        TestComponent = __decorate([
            (0, component_decorator_1.Component)({ selector: '.test-component' }),
            __param(0, (0, query_decorator_1.Query)()),
            __metadata("design:paramtypes", [HTMLElement])
        ], TestComponent);
        container.registerCallbackSetupFunction(event_decorator_1.EVENT_METADATA_KEY, event_decorator_1.eventCallbackSetupFunction);
        container.registerComponent(TestComponent);
        expect(true);
    });
    it('Should retrieve component instances by selector', () => {
        const { rootElement, container } = setupDomAndContainer();
        let TestComponent = class TestComponent {
            constructor(rootElement) {
                this.rootElement = rootElement;
            }
        };
        TestComponent = __decorate([
            (0, component_decorator_1.Component)({ selector: '.test-component' }),
            __param(0, (0, query_decorator_1.Query)()),
            __metadata("design:paramtypes", [HTMLElement])
        ], TestComponent);
        container.registerComponent(TestComponent);
        expect(container.getComponentInstancesBySelector('.none').size).toEqual(0);
        expect(container.getComponentInstancesBySelector('.test-component').size).toEqual(2);
    });
    it('Should detect change in the parent when child gets removed', done => {
        var _a;
        document.body.innerHTML = `
            <div>
                <div id="app">
                    <div id="parent">
                         <div id="child">
                         </div>
                    </div>
                </div>
            </div>
        `;
        const rootElement = document.getElementById('app');
        const container = new componentContainer_1.ComponentContainer(rootElement, iocContainer, new changeDetector_1.ChangeDetector(rootElement));
        let detectChange = true;
        let ParentComponent = class ParentComponent {
            onChange(mutation) {
                if (!detectChange) {
                    return;
                }
                if (mutation.type === mutation_interface_1.MutationType.Removed) {
                    expect(true).toEqual(true);
                    done();
                    detectChange = false;
                }
            }
        };
        ParentComponent = __decorate([
            (0, component_decorator_1.Component)({ selector: '#parent' })
        ], ParentComponent);
        let ChildComponent = class ChildComponent {
        };
        ChildComponent = __decorate([
            (0, component_decorator_1.Component)({ selector: '#child' })
        ], ChildComponent);
        container.registerComponent(ParentComponent);
        container.registerComponent(ChildComponent);
        (_a = document.getElementById('child')) === null || _a === void 0 ? void 0 : _a.remove();
    });
});
//# sourceMappingURL=componentContainer.spec.js.map
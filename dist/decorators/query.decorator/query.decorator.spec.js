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
const query_decorator_1 = require("./query.decorator");
require("reflect-metadata");
const argumentModifier_decorator_1 = require("../argumentModifier.decorator/argumentModifier.decorator");
describe('QueryDecorator', () => {
    it('Should define QueryMetadata without selector and multiple = false ', () => {
        let TestComponent = class TestComponent {
            constructor(query) { }
        };
        TestComponent = __decorate([
            __param(0, (0, query_decorator_1.Query)()),
            __metadata("design:paramtypes", [String])
        ], TestComponent);
        const metadata = Reflect.getMetadata(argumentModifier_decorator_1.ARGUMENT_MODIFIER_METADATA_KEY, TestComponent);
        expect(metadata).toBeDefined();
        expect(metadata.size).toEqual(1);
        const queryMetadata = metadata.get(0);
        expect(queryMetadata).toBeDefined();
        expect(queryMetadata.key).toEqual(query_decorator_1.QUERY_METADATA_KEY);
        expect(queryMetadata.data.selector).toBeUndefined();
        expect(queryMetadata.data.multiple).toEqual(false);
        expect(queryMetadata.data.parameterIndex).toEqual(0);
    });
    it('Should throw an error', () => {
        expect(() => {
            const target = class {
                constructor(query) { }
            };
            (0, query_decorator_1.Query)({ multiple: true })(target, undefined, 0);
        }).toThrow('Query cannot expect multiple results without a selector');
    });
    it('Should define QueryMetadata with selector and multiple = false ', () => {
        const selector = 'test';
        const multiple = false;
        const index = 1;
        let TestComponent = class TestComponent {
            constructor(someParam, query) { }
        };
        TestComponent = __decorate([
            __param(1, (0, query_decorator_1.Query)({ selector, multiple })),
            __metadata("design:paramtypes", [String, String])
        ], TestComponent);
        const metadata = Reflect.getMetadata(argumentModifier_decorator_1.ARGUMENT_MODIFIER_METADATA_KEY, TestComponent);
        expect(metadata).toBeDefined();
        expect(metadata.size).toEqual(1);
        const queryMetadata = metadata.get(1);
        expect(queryMetadata).toBeDefined();
        expect(queryMetadata.data.selector).toEqual(selector);
        expect(queryMetadata.data.multiple).toEqual(multiple);
        expect(queryMetadata.data.parameterIndex).toEqual(index);
    });
    it('Should define QueryMetadata with selector and multiple = true ', () => {
        const selector = 'test';
        const multiple = true;
        const index = 1;
        let TestComponent = class TestComponent {
            constructor(someParam, query) { }
        };
        TestComponent = __decorate([
            __param(1, (0, query_decorator_1.Query)({ selector, multiple })),
            __metadata("design:paramtypes", [String, String])
        ], TestComponent);
        const metadata = Reflect.getMetadata(argumentModifier_decorator_1.ARGUMENT_MODIFIER_METADATA_KEY, TestComponent);
        expect(metadata).toBeDefined();
        expect(metadata.size).toEqual(1);
        const queryMetadata = metadata.get(1);
        expect(queryMetadata).toBeDefined();
        expect(queryMetadata.data.selector).toEqual(selector);
        expect(queryMetadata.data.multiple).toEqual(multiple);
        expect(queryMetadata.data.parameterIndex).toEqual(index);
    });
    it('Should fail to modify arguments', () => {
        expect(() => {
            (0, query_decorator_1.queryModifierFunction)({ key: query_decorator_1.QUERY_METADATA_KEY, data: { multiple: false, parameterIndex: 0 } }, { name: 'test', type: HTMLElement }, new Map());
        }).toThrow('No root element found');
    });
    it('Should modify arguments', () => {
        document.body.innerHTML = `
            <div id="app">
              <div id="child"></div>
              <div></div>
            </div>
        `;
        const rootElement = document.getElementById('app');
        const name = 'test';
        const args = new Map();
        args.set(query_decorator_1.ROOT_ELEMENT_KEY, rootElement);
        let result = (0, query_decorator_1.queryModifierFunction)({ key: query_decorator_1.QUERY_METADATA_KEY, data: { multiple: false, parameterIndex: 0 } }, { name, type: HTMLElement }, args);
        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name)).toEqual(rootElement);
        result = (0, query_decorator_1.queryModifierFunction)({ key: query_decorator_1.QUERY_METADATA_KEY, data: { selector: '#child', multiple: false, parameterIndex: 0 } }, { name, type: HTMLElement }, args);
        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name)).toEqual(document.getElementById('child'));
        result = (0, query_decorator_1.queryModifierFunction)({ key: query_decorator_1.QUERY_METADATA_KEY, data: { selector: 'div', multiple: true, parameterIndex: 0 } }, { name, type: NodeList }, args);
        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name)).toEqual(rootElement.querySelectorAll('div'));
        result = (0, query_decorator_1.queryModifierFunction)({ key: query_decorator_1.QUERY_METADATA_KEY, data: { selector: 'div', multiple: false, parameterIndex: 0 } }, { name, type: query_decorator_1.ActiveElementReference }, args);
        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name).get()).toEqual(rootElement.querySelector('div'));
        result = (0, query_decorator_1.queryModifierFunction)({ key: query_decorator_1.QUERY_METADATA_KEY, data: { selector: 'div', multiple: true, parameterIndex: 0 } }, { name, type: query_decorator_1.ActiveElementCollection }, args);
        expect(result).toBeDefined();
        expect(result.size).toEqual(2);
        expect(result.get(name).get()).toEqual(Array.from(rootElement.querySelectorAll('div')));
        expect(() => {
            (0, query_decorator_1.queryModifierFunction)({ key: query_decorator_1.QUERY_METADATA_KEY, data: { multiple: false, parameterIndex: 0 } }, { name, type: query_decorator_1.ActiveElementReference }, args);
        }).toThrow('ActiveElementReference cannot be used without a selector');
        expect(() => {
            (0, query_decorator_1.queryModifierFunction)({ key: query_decorator_1.QUERY_METADATA_KEY, data: { selector: 'div', multiple: true, parameterIndex: 0 } }, { name, type: query_decorator_1.ActiveElementReference }, args);
        }).toThrow('ActiveElementReference cannot be used with multiple results');
        expect(() => {
            (0, query_decorator_1.queryModifierFunction)({ key: query_decorator_1.QUERY_METADATA_KEY, data: { multiple: true, parameterIndex: 0 } }, { name, type: query_decorator_1.ActiveElementCollection }, args);
        }).toThrow('ActiveElementCollection cannot be used without a selector');
        expect(() => {
            (0, query_decorator_1.queryModifierFunction)({ key: query_decorator_1.QUERY_METADATA_KEY, data: { selector: 'div', multiple: false, parameterIndex: 0 } }, { name, type: query_decorator_1.ActiveElementCollection }, args);
        }).toThrow('ActiveElementCollection cannot be used with a single result');
    });
});
//# sourceMappingURL=query.decorator.spec.js.map
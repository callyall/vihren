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
require("reflect-metadata");
const callback_decorator_1 = require("../callback.decorator/callback.decorator");
const IocContainer_1 = require("../../iocContainer/IocContainer");
const rxjs_1 = require("rxjs");
const componentEvent_decorator_1 = require("./componentEvent.decorator");
const componentEventEmitter_1 = require("../../services/eventEmitter/componentEventEmitter");
describe('Component Event Decorator', () => {
    it('Should define metadata for a component event dataset', () => {
        class TestClass {
            onClick() { }
            onSecondClick() { }
            onKeyUp() { }
            onChange() { }
        }
        __decorate([
            (0, componentEvent_decorator_1.ComponentEvent)({ type: 'click' }),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestClass.prototype, "onClick", null);
        __decorate([
            (0, componentEvent_decorator_1.ComponentEvent)({ type: 'click', options: { debounce: 100 } }),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestClass.prototype, "onSecondClick", null);
        __decorate([
            (0, componentEvent_decorator_1.ComponentEvent)({ type: 'keyup' }),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestClass.prototype, "onKeyUp", null);
        __decorate([
            (0, componentEvent_decorator_1.ComponentEvent)({ type: 'change' }),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestClass.prototype, "onChange", null);
        const metadata = Reflect.getMetadata(callback_decorator_1.CALLBACK_METADATA_KEY, TestClass);
        expect(metadata).toBeDefined();
        expect(metadata.size).toEqual(4);
        [
            {
                callback: 'onClick',
                key: componentEvent_decorator_1.COMPONENT_EVENT_METADATA_KEY,
                data: { type: 'click' }
            },
            {
                callback: 'onSecondClick',
                key: componentEvent_decorator_1.COMPONENT_EVENT_METADATA_KEY,
                data: { type: 'click', options: { debounce: 100 } }
            },
            {
                callback: 'onKeyUp',
                key: componentEvent_decorator_1.COMPONENT_EVENT_METADATA_KEY,
                data: { type: 'keyup' }
            },
            {
                callback: 'onChange',
                key: componentEvent_decorator_1.COMPONENT_EVENT_METADATA_KEY,
                data: { type: 'change' }
            }
        ]
            .forEach((metadataEntry) => {
            const storedArray = metadata.get(metadataEntry.callback);
            expect(storedArray).toBeInstanceOf(Array);
            expect(storedArray.length).toEqual(1);
            expect(storedArray[0]).toEqual(metadataEntry);
        });
    });
    it('Should setup component event', done => {
        const metadata = {
            callback: 'onClick',
            key: componentEvent_decorator_1.COMPONENT_EVENT_METADATA_KEY,
            data: { type: 'click', options: { debounce: 100 } }
        };
        const instance = {
            element: document.getElementById('component'),
            instance: {
                onClick: jest.fn((data) => {
                    expect(data).toEqual({ source: null, data: null });
                    done();
                })
            },
            subscriptions: []
        };
        const iocContainer = new IocContainer_1.IocContainer();
        const eventEmitter = new componentEventEmitter_1.ComponentEventEmitter();
        iocContainer.registerValue(componentEventEmitter_1.ComponentEventEmitter.name, eventEmitter);
        expect((0, componentEvent_decorator_1.componentEventCallbackSetupFunction)(metadata, instance, iocContainer)).toBeInstanceOf(rxjs_1.Subscription);
        eventEmitter.emit('click', { source: null, data: null });
    });
});
//# sourceMappingURL=componentEvent.decorator.spec.js.map
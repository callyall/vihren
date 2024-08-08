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
const event_decorator_1 = require("./event.decorator");
require("reflect-metadata");
const callback_decorator_1 = require("../callback.decorator/callback.decorator");
const IocContainer_1 = require("../../iocContainer/IocContainer");
const rxjs_1 = require("rxjs");
describe('Event Decorator', () => {
    it('Should define metadata for an event dataset', () => {
        class TestClass {
            onClick() { }
            onSecondClick() { }
            onKeyUp() { }
            onChange() { }
        }
        __decorate([
            (0, event_decorator_1.Event)({ type: 'click', selector: 'button' }),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestClass.prototype, "onClick", null);
        __decorate([
            (0, event_decorator_1.Event)({ type: 'click', selector: 'a', options: { debounce: 100 } }),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestClass.prototype, "onSecondClick", null);
        __decorate([
            (0, event_decorator_1.Event)({ type: 'keyup', selector: 'input' }),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestClass.prototype, "onKeyUp", null);
        __decorate([
            (0, event_decorator_1.Event)({ type: 'change', selector: 'select' }),
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
                key: event_decorator_1.EVENT_METADATA_KEY,
                data: { type: 'click', selector: 'button' }
            },
            {
                callback: 'onSecondClick',
                key: event_decorator_1.EVENT_METADATA_KEY,
                data: { type: 'click', selector: 'a', options: { debounce: 100 } }
            },
            {
                callback: 'onKeyUp',
                key: event_decorator_1.EVENT_METADATA_KEY,
                data: { type: 'keyup', selector: 'input' }
            },
            {
                callback: 'onChange',
                key: event_decorator_1.EVENT_METADATA_KEY,
                data: { type: 'change', selector: 'select' }
            }
        ]
            .forEach((metadataEntry) => {
            const storedArray = metadata.get(metadataEntry.callback);
            expect(storedArray).toBeInstanceOf(Array);
            expect(storedArray.length).toEqual(1);
            expect(storedArray[0]).toEqual(metadataEntry);
        });
    });
    it('Should setup event', done => {
        var _a;
        document.body.innerHTML = `<div id="component"><button></button></div>`;
        const metadata = {
            callback: 'onClick',
            key: event_decorator_1.EVENT_METADATA_KEY,
            data: { type: 'click', selector: 'button', options: { debounce: 100 } }
        };
        const instance = {
            element: document.getElementById('component'),
            instance: {
                onClick: jest.fn(() => {
                    expect(true).toBeTruthy();
                    done();
                })
            },
            subscriptions: []
        };
        const iocContainer = new IocContainer_1.IocContainer();
        expect((0, event_decorator_1.eventCallbackSetupFunction)(metadata, instance, iocContainer)).toBeInstanceOf(rxjs_1.Subscription);
        (_a = document.querySelector('button')) === null || _a === void 0 ? void 0 : _a.click();
    });
});
//# sourceMappingURL=event.decorator.spec.js.map
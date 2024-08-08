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
exports.ComponentEventEmitter = void 0;
const injectable_decorator_1 = require("../../decorators/injectable.decorator/injectable.decorator");
const rxjs_1 = require("rxjs");
let ComponentEventEmitter = class ComponentEventEmitter {
    constructor() {
        this.subject = new rxjs_1.Subject();
    }
    emit(type, data) {
        this.subject.next({ type, data });
    }
    on(type) {
        return this
            .subject
            .asObservable()
            .pipe((0, rxjs_1.filter)((e) => e.type === type), (0, rxjs_1.map)((e) => e.data));
    }
};
exports.ComponentEventEmitter = ComponentEventEmitter;
exports.ComponentEventEmitter = ComponentEventEmitter = __decorate([
    (0, injectable_decorator_1.Injectable)({ shared: true }),
    __metadata("design:paramtypes", [])
], ComponentEventEmitter);
//# sourceMappingURL=componentEventEmitter.js.map
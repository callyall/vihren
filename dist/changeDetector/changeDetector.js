"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeDetector = void 0;
const mutation_interface_1 = require("../interfaces/mutation.interface");
const rxjs_1 = require("rxjs");
/**
 * Detects changes in the DOM.
 */
class ChangeDetector extends rxjs_1.Observable {
    constructor(rootElement) {
        if (!rootElement.parentNode) {
            throw new Error('Root element does not have a parent node');
        }
        super((subscriber) => this.init(subscriber));
        this.rootElement = rootElement;
        this.mutationObserver = null;
        this.subscribers = [];
    }
    init(subscriber) {
        this.subscribers.push(subscriber);
        if (!this.mutationObserver) {
            this.startMutationObserver();
        }
        return () => this.onTeardown(subscriber);
    }
    startMutationObserver() {
        this.mutationObserver = new MutationObserver((mutations) => {
            var _a;
            let updated = [];
            let added = [];
            const removed = [];
            for (const mutation of mutations) {
                if (Array.from((_a = mutation.removedNodes) !== null && _a !== void 0 ? _a : []).find((node) => node === this.rootElement)) {
                    this.detach();
                    return;
                }
                if (!this.rootElement.contains(mutation.target)) {
                    continue;
                }
                if (['attributes', 'characterData'].includes(mutation.type) && !updated.find((m) => m.element === mutation.target)) {
                    updated.push({ element: mutation.target, type: mutation_interface_1.MutationType.Updated, target: mutation.target });
                }
                if (mutation.removedNodes) {
                    for (const node of mutation.removedNodes) {
                        if (!removed.find((m) => m.element === node)) {
                            removed.push({ element: node, type: mutation_interface_1.MutationType.Removed, target: mutation.target });
                        }
                    }
                }
                if (mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (!added.find((m) => m.element === node)) {
                            added.push({ element: node, type: mutation_interface_1.MutationType.Added, target: mutation.target });
                        }
                    }
                }
            }
            updated = updated.filter((sm) => !removed.find((tm) => tm.element === sm.element));
            added = added.filter((sm) => !removed.find((tm) => tm.element === sm.element));
            removed.forEach((m) => this.subscribers.forEach((subscriber) => subscriber.next(m)));
            added.forEach((m) => this.subscribers.forEach((subscriber) => subscriber.next(m)));
            updated.forEach((m) => this.subscribers.forEach((subscriber) => subscriber.next(m)));
        });
        this.mutationObserver.observe(this.rootElement.parentNode, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        });
    }
    onTeardown(subscriber) {
        const index = this.subscribers.indexOf(subscriber);
        if (index) {
            this.subscribers.splice(index, 1);
        }
    }
    detach() {
        var _a;
        (_a = this.mutationObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        this.subscribers.forEach((subscriber) => subscriber.complete());
    }
    onRemoved() {
        return this.pipe((0, rxjs_1.filter)((mutation) => mutation.type === mutation_interface_1.MutationType.Removed));
    }
    onAdded() {
        return this.pipe((0, rxjs_1.filter)((mutation) => mutation.type === mutation_interface_1.MutationType.Added));
    }
    onUpdated() {
        return this.pipe((0, rxjs_1.filter)((mutation) => mutation.type === mutation_interface_1.MutationType.Updated));
    }
}
exports.ChangeDetector = ChangeDetector;
//# sourceMappingURL=changeDetector.js.map
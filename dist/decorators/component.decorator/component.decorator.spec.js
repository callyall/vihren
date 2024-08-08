"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_decorator_1 = require("./component.decorator");
describe('Component Decorator', () => {
    [
        {
            target: class {
            },
            selector: '.example-component',
            lifecycleHooks: [],
        },
        {
            target: class {
                onInit() { }
            },
            selector: '.example-component-1',
            lifecycleHooks: [component_decorator_1.LifecycleHook.OnInit],
        },
        {
            target: class {
                onChange() { }
            },
            selector: '.example-component-2',
            lifecycleHooks: [component_decorator_1.LifecycleHook.OnChange],
        },
        {
            target: class {
                onDestroy() { }
            },
            selector: '.example-component-3',
            lifecycleHooks: [component_decorator_1.LifecycleHook.OnDestroy],
        },
        {
            target: class {
                onInit() { }
                onChange() { }
                onDestroy() { }
            },
            selector: '.example-component-4',
            lifecycleHooks: [component_decorator_1.LifecycleHook.OnInit, component_decorator_1.LifecycleHook.OnChange, component_decorator_1.LifecycleHook.OnDestroy],
        }
    ]
        .forEach(({ target, selector, lifecycleHooks }, i) => {
        it(`Should define metadata for a component dataset ${i}`, () => {
            (0, component_decorator_1.Component)({ selector })(target);
            const metadata = Reflect.getMetadata(component_decorator_1.COMPONENT_METADATA_KEY, target);
            expect(metadata).toBeDefined();
            expect(metadata.selector).toEqual(selector);
            expect(metadata.lifecycleHooks).toBeDefined();
            expect(metadata.lifecycleHooks.sort()).toEqual(lifecycleHooks.sort());
            expect(metadata.shared).toEqual(false);
        });
    });
});
//# sourceMappingURL=component.decorator.spec.js.map
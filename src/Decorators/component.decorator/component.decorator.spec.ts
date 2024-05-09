import { COMPONENT_METADATA_KEY, Component, ComponentMetadata, LifecycleHook } from "./component.decorator";
import { OnChange } from "../../Interfaces/onChange.interface";
import { OnDestroy } from "../../Interfaces/onDestroy.interface";
import { OnInit } from "../../Interfaces/onInit.interface";

describe('Component Decorator', () => {
    [
        {
            target: class { },
            selector: '.example-component',
            lifecycleHooks: [],
        },
        {
            target: class implements OnInit {
                onInit() { }
            },
            selector: '.example-component-1',
            lifecycleHooks: [LifecycleHook.OnInit],
        },
        {
            target: class implements OnChange {
                onChange() { }
            },
            selector: '.example-component-2',
            lifecycleHooks: [LifecycleHook.OnChange],
        },
        {
            target: class implements OnDestroy {
                onDestroy() { }
            },
            selector: '.example-component-3',
            lifecycleHooks: [LifecycleHook.OnDestroy],
        },
        {
            target: class implements OnInit, OnChange, OnDestroy {
                onInit() { }
                onChange() { }
                onDestroy() { }
            },
            selector: '.example-component-4',
            lifecycleHooks: [LifecycleHook.OnInit, LifecycleHook.OnChange, LifecycleHook.OnDestroy],
        }
    ]
        .forEach(({ target, selector, lifecycleHooks }, i) => {
            it(`Should define metadata for a component dataset ${i}`, () => {
                Component({ selector })(target);
        
                const metadata = Reflect.getMetadata(COMPONENT_METADATA_KEY, target) as ComponentMetadata;
        
                expect(metadata).toBeDefined();
                expect(metadata.selector).toBe(selector);
                expect(metadata.lifecycleHooks).toBeDefined();
                expect(metadata.lifecycleHooks.sort()).toEqual(lifecycleHooks.sort());
                expect(metadata.shared).toEqual(false);
            });
        });
});

import { COMPONENT_METADATA_KEY, Component, ComponentMetadata, LifecycleHook } from "./component.decorator";
import { OnChange } from "../../interfaces/onChange.interface";
import { OnDestroy } from "../../interfaces/onDestroy.interface";
import { OnInit } from "../../interfaces/onInit.interface";

describe('Component Decorator', (): void => {
    [
        {
            target: class { },
            selector: '.example-component',
            lifecycleHooks: [],
        },
        {
            target: class implements OnInit {
                onInit(): void { }
            },
            selector: '.example-component-1',
            lifecycleHooks: [LifecycleHook.OnInit],
        },
        {
            target: class implements OnChange {
                onChange(): void { }
            },
            selector: '.example-component-2',
            lifecycleHooks: [LifecycleHook.OnChange],
        },
        {
            target: class implements OnDestroy {
                onDestroy(): void { }
            },
            selector: '.example-component-3',
            lifecycleHooks: [LifecycleHook.OnDestroy],
        },
        {
            target: class implements OnInit, OnChange, OnDestroy {
                onInit(): void { }
                onChange(): void { }
                onDestroy(): void { }
            },
            selector: '.example-component-4',
            lifecycleHooks: [LifecycleHook.OnInit, LifecycleHook.OnChange, LifecycleHook.OnDestroy],
        }
    ]
        .forEach(({ target, selector, lifecycleHooks }, i): void => {
            it(`Should define metadata for a component dataset ${i}`, (): void => {
                Component({ selector })(target);
        
                const metadata = Reflect.getMetadata(COMPONENT_METADATA_KEY, target) as ComponentMetadata;
        
                expect(metadata).toBeDefined();
                expect(metadata.selector).toEqual(selector);
                expect(metadata.lifecycleHooks).toBeDefined();
                expect(metadata.lifecycleHooks.sort()).toEqual(lifecycleHooks.sort());
                expect(metadata.shared).toEqual(false);
            });
        });
});

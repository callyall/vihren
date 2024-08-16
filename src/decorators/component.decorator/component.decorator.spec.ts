import { COMPONENT_METADATA_KEY, Component, ComponentMetadata, LifecycleHook } from "./component.decorator";
import { OnChange } from "../../interfaces/onChange.interface";
import { OnDestroy } from "../../interfaces/onDestroy.interface";
import { OnInit } from "../../interfaces/onInit.interface";
import { DynamicComponent } from "../../interfaces/dynamicComponent.interface";

describe('Component Decorator', (): void => {
    [
        {
            target: class { },
            selector: '.example-component',
            lifecycleHooks: [],
            template: undefined,
            isDynamic: false,
        },
        {
            target: class implements OnInit {
                onInit(): void { }
            },
            selector: '.example-component-1',
            lifecycleHooks: [LifecycleHook.OnInit],
            template: undefined,
            isDynamic: false,
        },
        {
            target: class implements OnChange {
                onChange(): void { }
            },
            selector: '.example-component-2',
            lifecycleHooks: [LifecycleHook.OnChange],
            template: undefined,
            isDynamic: false,
        },
        {
            target: class implements OnDestroy {
                onDestroy(): void { }
            },
            selector: '.example-component-3',
            lifecycleHooks: [LifecycleHook.OnDestroy],
            template: 'hello',
            isDynamic: false,
        },
        {
            target: class implements OnInit, OnChange, OnDestroy, DynamicComponent {
                onInit(): void { }
                onChange(): void { }
                onDestroy(): void { }

                render(): string { return 'hello'; }
            },
            selector: '.example-component-4',
            lifecycleHooks: [LifecycleHook.OnInit, LifecycleHook.OnChange, LifecycleHook.OnDestroy],
            template: undefined,
            isDynamic: true,
        }
    ]
        .forEach(({ target, selector, lifecycleHooks, template, isDynamic }, i): void => {
            it(`Should define metadata for a component dataset ${i}`, (): void => {
                Component({ selector, template })(target);
        
                const metadata = Reflect.getMetadata(COMPONENT_METADATA_KEY, target) as ComponentMetadata;

                expect(metadata).toBeDefined();
                expect(metadata.selector).toEqual(selector);
                expect(metadata.lifecycleHooks).toBeDefined();
                expect(metadata.lifecycleHooks.sort()).toEqual(lifecycleHooks.sort());
                expect(metadata.shared).toEqual(false);
                expect(metadata.template).toEqual(template);
                expect(metadata.isDynamic).toEqual(isDynamic);
            });
        });

    it('Should throw an error if a component is both dynamic and has a template', (): void => {
        const target = class implements DynamicComponent {
            render(): string { return 'hello'; }
        };

        expect((): void => {
            Component({ selector: '.example-component', template: 'hello' })(target);
        }).toThrowError(`Component ${target.name} cannot have both a template and be dynamic`);
    });
});

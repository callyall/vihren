import { Component } from "../Decorators/component.decorator/component.decorator";
import { Query } from "../Decorators/query.decorator/query.decorator";
import { OnChange } from "../Interfaces/onChange.interface";
import { OnDestroy } from "../Interfaces/onDestroy.interface";
import { OnInit } from "../Interfaces/onInit.interface";
import { ComponentContainer } from "./componentContainer";


describe('ComponentContainer', () => {
    it('Should register a component', () => {
        document.body.innerHTML = `
            <div>
                <div id="app">
                    <div class="test-component"></div>
                    <div class="test-component-2" data-name="tester"></div>
                </div>
            </div>
        `;
        const rootElement = document.getElementById('app') as HTMLElement;
        const container = new ComponentContainer(rootElement);

        @Component({ selector: '.test-component' })
        class TestComponent implements OnInit, OnChange, OnDestroy { 
            public constructor(
                @Query()
                private element: HTMLElement
            ) {}

            public onInit(): void {
            }

            public onDestroy(): void {
                console.log('destroyed');
            }

            public onChange(): void {
            }
        }


        @Component({ selector: '.test-component-2' })
        class TestComponent2 { 
            public constructor(
                @Query()
                private element: HTMLElement,
                private name: string
            ) {}
        }
        expect(() => container.registerComponent(class {})).toThrow('Component metadata not found')

        container.registerComponent(TestComponent);
        container.registerComponent(TestComponent2);

        rootElement.innerHTML = '';
    });
});
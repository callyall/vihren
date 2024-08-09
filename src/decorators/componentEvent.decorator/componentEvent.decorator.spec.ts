import 'reflect-metadata';
import { CALLBACK_METADATA_KEY, CallbackMetadata } from "../callback.decorator/callback.decorator";
import { ComponentInstance } from "../../interfaces/componentInstance.interface";
import { IocContainer } from "../../iocContainer/IocContainer";
import { Subscription } from "rxjs";
import { COMPONENT_EVENT_METADATA_KEY, ComponentEvent, componentEventCallbackSetupFunction, ComponentEventMetadata } from "./componentEvent.decorator";
import { ComponentEventEmitter } from "../../services/eventEmitter/componentEventEmitter";

describe('Component Event Decorator', () => {
    it('Should define metadata for a component event dataset', () => {
        class TestClass {
            @ComponentEvent({ type: 'click' })
            public onClick(): void { }

            @ComponentEvent({ type: 'click', options: { debounce: 100 } })
            public onSecondClick(): void { }

            @ComponentEvent({ type: 'keyup' })
            public onKeyUp(): void { }

            @ComponentEvent({ type: 'change' })
            public onChange(): void { }
        }

        const metadata = Reflect.getMetadata(CALLBACK_METADATA_KEY, TestClass) as Map<string, CallbackMetadata<ComponentEventMetadata>[]>;

        expect(metadata).toBeDefined();
        expect(metadata.size).toEqual(4);

        [
            {
                callback: 'onClick',
                key: COMPONENT_EVENT_METADATA_KEY,
                data: { type: 'click' }
            },
            {
                callback: 'onSecondClick',
                key: COMPONENT_EVENT_METADATA_KEY,
                data: { type: 'click', options: { debounce: 100 } }
            },
            {
                callback: 'onKeyUp',
                key: COMPONENT_EVENT_METADATA_KEY,
                data: { type: 'keyup' }
            },
            {
                callback: 'onChange',
                key: COMPONENT_EVENT_METADATA_KEY,
                data: { type: 'change' }
            }
        ]
            .forEach((metadataEntry) => {
                const storedArray = metadata.get(metadataEntry.callback) as CallbackMetadata<ComponentEventMetadata>[];

                expect(storedArray).toBeInstanceOf(Array);
                expect(storedArray.length).toEqual(1);
                expect(storedArray[0]).toEqual(metadataEntry);
            });
    });

    it('Should setup component event', done => {

        const metadata: CallbackMetadata<ComponentEventMetadata> = {
            callback: 'onClick',
            key: COMPONENT_EVENT_METADATA_KEY,
            data: { type: 'click', options: { debounce: 100 } }
        };

        const instance: ComponentInstance<any> = {
            element: document.getElementById('component') as HTMLElement,
            instance: {
                onClick: jest.fn((data): void => {
                    expect(data).toEqual({ source: null, data: null });
                    done();
                })
            },
            subscriptions: []
        };

        const iocContainer = new IocContainer();
        const eventEmitter = new ComponentEventEmitter();
        iocContainer.registerValue(ComponentEventEmitter.name, eventEmitter);

        expect(componentEventCallbackSetupFunction(metadata, instance, iocContainer)).toBeInstanceOf(Subscription);

        eventEmitter.emit('click', { source: null, data: null });
    });
});

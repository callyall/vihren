import { Event, EVENT_METADATA_KEY, eventCallbackSetupFunction, EventMetadata } from './event.decorator';
import 'reflect-metadata';
import { CALLBACK_METADATA_KEY, CallbackMetadata } from "../callback.decorator/callback.decorator";
import { ComponentInstance } from "../../Interfaces/componentInstance.interface";
import { IocContainer } from "../../iocContainer/IocContainer";
import { Subscription } from "rxjs";

describe('Event Decorator', () => {
    it('Should define metadata for an event dataset', () => {
        class TestClass {
            @Event({ type: 'click', selector: 'button' })
            public onClick() { }

            @Event({ type: 'click', selector: 'a', options: { debounce: 100 } })
            public onSecondClick() { }

            @Event({ type: 'keyup', selector: 'input' })
            public onKeyUp() { }

            @Event({ type: 'change', selector: 'select' })
            public onChange() { }
        }

        const metadata = Reflect.getMetadata(CALLBACK_METADATA_KEY, TestClass) as Map<string, CallbackMetadata<EventMetadata>[]>;

        expect(metadata).toBeDefined();
        expect(metadata.size).toBe(4);

        [
            {
                callback: 'onClick',
                key: EVENT_METADATA_KEY,
                data: { type: 'click', selector: 'button' }
            },
            {
                callback: 'onSecondClick',
                key: EVENT_METADATA_KEY,
                data: { type: 'click', selector: 'a', options: { debounce: 100 } }
            },
            {
                callback: 'onKeyUp',
                key: EVENT_METADATA_KEY,
                data: { type: 'keyup', selector: 'input' }
            },
            {
                callback: 'onChange',
                key: EVENT_METADATA_KEY,
                data: { type: 'change', selector: 'select' }
            }
        ]
            .forEach((metadataEntry) => {
                const storedArray = metadata.get(metadataEntry.callback) as CallbackMetadata<EventMetadata>[];

                expect(storedArray).toBeInstanceOf(Array);
                expect(storedArray.length).toBe(1);
                expect(storedArray[0]).toEqual(metadataEntry);
            });
    });

    it('Should setup event', async () => {
        document.body.innerHTML = `<div id="component"><button></button></div>`;

        const metadata: CallbackMetadata<EventMetadata> = {
           callback: 'onClick',
           key: EVENT_METADATA_KEY,
           data: { type: 'click', selector: 'button', options: { debounce: 100 } }
        };

        const instance: ComponentInstance = {
            element: document.getElementById('component') as HTMLElement,
            instance: {
                onClick: jest.fn()
            },
            subscriptions: []
        };

        const iocContainer = new IocContainer();

        expect(eventCallbackSetupFunction(metadata, instance, iocContainer)).toBeInstanceOf(Subscription);

        document.querySelector('button')?.click();
        // Simulate debounce
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(instance.instance.onClick).toHaveBeenCalled();
    });
});
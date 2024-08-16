import { DynamicComponent } from "../../interfaces/dynamicComponent.interface";
import {
    DYNAMIC_PROPERTY_UPDATE_EVENT,
    DynamicProperty,
    DynamicPropertyUpdateEventDetail
} from "./dynamicProperty.decorator";
import { fromEvent } from "rxjs";

describe('DynamicProperty', () => {
    it('should create an instance', done => {
        const target = class implements DynamicComponent {
            public test: string = 'hello';

            render(): string {
                return 'hello';
            }
        }

        const result = DynamicProperty()(target.prototype, 'test');

        expect(typeof result.set).toEqual('function');
        expect(typeof result.get).toEqual('function');
        expect(result.enumerable).toEqual(true);
        expect(result.configurable).toEqual(true);

        const listener = fromEvent<CustomEvent<DynamicPropertyUpdateEventDetail>>(document, DYNAMIC_PROPERTY_UPDATE_EVENT)
             .subscribe(() => {
                 expect(result.get()).toEqual('world');
                 listener.unsubscribe();

                 done();
             });

        result.set('world');
    });

    it('should throw an error if the component is not dynamic', () => {
        const target = class {
            public test: string = 'hello';
        }

        expect(() => DynamicProperty()(target.prototype, 'test'))
            .toThrowError('Property test cannot be dynamic if the component is not dynamic');
    });
});

import { COMPONENT_METADATA_KEY } from "../Decorators/component.decorator/component.decorator";
import { INJECTABLE_METADATA_KEY, InjectableMetadata } from "../Decorators/injectable.decorator/injectable.decorator";
import { IocContainerInterface } from "../Interfaces/IocContainer.interface";

export class IocContainer implements IocContainerInterface {
    private values: Map<string, any> = new Map<string, any>();
    private factories: Map<string, (args?: Map<string, any>) => any> = new Map<string, (args?: Map<string, any>) => any>();

    public registerValue<T>(key: string, value: T): void {
        this.values.set(key, value);
    }

    public registerFactory<T>(key: string, factory: (args?: Map<string, any>) => T): void {
        this.factories.set(key, factory);
    }

    public resolve<T>(target: Function | string, args?: Map<string, any>): T {
        const isClass = target instanceof Function;
        const key = isClass ? target.name : target;
        const metadata = isClass
            ? (Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) ?? Reflect.getMetadata(COMPONENT_METADATA_KEY, target)) as InjectableMetadata
            : null;

        if (metadata && metadata.shared && !this.values.has(key) && !this.factories.has(key)) {
            throw new Error(`No shared instance found for key ${key}`);
        }

        if (this.values.has(key)) {
            return this.values.get(key);
        }

        if (this.factories.has(key)) {
            const factory = this.factories.get(key) as (args?: Map<string, any>) => T;
            const instance = factory(args);

            if (metadata && metadata.shared) {
                this.values.set(key, instance);
            }

            return instance;
        }

        if (!isClass) {
            throw new Error(`No registration found for key ${key}`);
        }

        return this.defaultFactory(target as Function, metadata, args);
    }

    private defaultFactory(target: Function, metadata: InjectableMetadata | null, args?: Map<string, any>): any {
        if (!metadata?.params?.length) {
            return new target.prototype.constructor();
        }

        const params = metadata.params.map(param => {
            if (args?.has(param.name)) {
                return args.get(param.name);
            }

            if (this.values.has(param.name)) {
                return this.values.get(param.name);
            }

            if (this.factories.has(param.name)) {
                const factory = this.factories.get(param.name) as (args?: Map<string, any>) => any;

                return factory(args);
            }

            if (this.values.has(param.type.name)) {
                return this.values.get(param.type.name);
            }

            if (this.factories.has(param.type.name)) {
                const factory = this.factories.get(param.type.name) as (args?: Map<string, any>) => any;

                return factory(args);
            }

            if ([String.name, Number.name, Boolean.name].includes(param.type.name)) {
                throw new Error(`No value found for parameter ${param.name}`);
            }

            return this.resolve(param.type, args);
        });

        return new target.prototype.constructor(...params);
    }
}
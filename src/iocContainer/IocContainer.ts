import { COMPONENT_METADATA_KEY } from "../decorators/component.decorator/component.decorator";
import { INJECTABLE_METADATA_KEY, InjectableMetadata } from "../decorators/injectable.decorator/injectable.decorator";
import { FactoryFunction, IocContainerInterface, ModifierFunction } from "../interfaces/IocContainer.interface";
import { ARGUMENT_MODIFIER_METADATA_KEY, ArgumentMetadata } from "../decorators/argumentModifier.decorator/argumentModifier.decorator";

export class IocContainer implements IocContainerInterface {
    private values: Map<string, any> = new Map<string, any>();
    private factories: Map<string, FactoryFunction<any>> = new Map<string, FactoryFunction<any>>();
    private argumentModifiers: Map<string, ModifierFunction<any>> = new Map<string, ModifierFunction<any>>();

    public registerValue<T>(key: string, value: T): void {
        this.values.set(key, value);
    }

    public registerFactory<T>(key: string, factoryFunction: FactoryFunction<T>): void {
        this.factories.set(key, factoryFunction);
    }

    public resolve<T>(target: Function | string, args?: Map<string, any>, failIfNoShared: boolean = false): T {
        const isClass = target instanceof Function;
        const key = isClass ? target.name : target;

        if (failIfNoShared && !this.values.has(key)) {
            throw new Error(`No shared instance found for key ${key}`);
        }

        const metadata = isClass
            ? (Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) ?? Reflect.getMetadata(COMPONENT_METADATA_KEY, target)) as InjectableMetadata
            : null;

        if (metadata && metadata.shared && !this.values.has(key) && !this.factories.has(key)) {
            throw new Error(`No shared instance found for key ${key}`);
        }

        if (this.values.has(key)) {
            return this.values.get(key);
        }

        if (metadata && metadata.params) {
            args = this.prepareArgs(target as Function, metadata, args ?? new Map<string, any>());
        }

        if (this.factories.has(key)) {
            const factory = this.factories.get(key) as FactoryFunction<T>;
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

    public registerArgumentModifier<T>(key: string, modifierFunction: ModifierFunction<T>): void {
        this.argumentModifiers.set(key, modifierFunction);
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

    private prepareArgs(target: Function, metadata: InjectableMetadata, args: Map<string, any>): Map<string, any> {
        const modifierMetadata = Reflect.getMetadata(ARGUMENT_MODIFIER_METADATA_KEY, target) as Map<number, ArgumentMetadata<any>>;
        
        if (!modifierMetadata) {
            return args;
        }

        metadata?.params?.forEach((param, index) => {
            if (!modifierMetadata.has(index)) {
                return;
            }
            
            const argumentModifierMetadata = modifierMetadata.get(index) as ArgumentMetadata<any>;

            if (!this.argumentModifiers.has(argumentModifierMetadata.key)) {
                throw new Error(`No argument modifier function found for key ${argumentModifierMetadata.key}`);
            }

            const modifierFunction = this.argumentModifiers.get(argumentModifierMetadata.key) as ModifierFunction<any>;
            
            args = modifierFunction(argumentModifierMetadata, param, args);
        });

        return args;
    }
}

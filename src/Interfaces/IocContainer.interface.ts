export interface IocContainerInterface {
    registerValue<T>(key: string, value: T): void;
    registerFactory<T>(key: string, factory: (args?: Map<string, any>) => T): void;
    resolve<T>(target: Function | string, args?: Map<string, any>): T;
}

export type Constructor<T = object> = new (...args: GenericType[]) => T;
export type GenericType = object | number | string | object[] | number[] | string[] | HTMLElement | null;

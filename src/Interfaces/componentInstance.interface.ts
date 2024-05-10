import { Subscription } from "rxjs";

export interface ComponentInstance<T extends any> {
    element: HTMLElement;
    instance: T;
    subscriptions: Subscription[];
}
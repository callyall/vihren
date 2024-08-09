import { Subscription } from "rxjs";

export interface ComponentInstance<T> {
    element: HTMLElement;
    instance: T;
    subscriptions: Subscription[];
}
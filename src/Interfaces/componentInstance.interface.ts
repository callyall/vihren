import { Subscription } from "rxjs";

export interface ComponentInstance {
    element: HTMLElement;
    instance: any;
    subscriptions: Subscription[];
}
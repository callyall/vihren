import { Mutation } from "../interfaces/mutation.interface";
import { Observable } from "rxjs";
import { ChangeDetectorInterface } from "../interfaces/changeDetector.interface";
/**
 * Detects changes in the DOM.
 */
export declare class ChangeDetector extends Observable<Mutation> implements ChangeDetectorInterface {
    private readonly rootElement;
    private mutationObserver;
    private subscribers;
    constructor(rootElement: HTMLElement);
    private init;
    private startMutationObserver;
    private onTeardown;
    private detach;
    onRemoved(): Observable<Mutation>;
    onAdded(): Observable<Mutation>;
    onUpdated(): Observable<Mutation>;
}

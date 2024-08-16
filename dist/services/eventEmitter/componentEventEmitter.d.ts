import { Observable } from "rxjs";
/**
 * This is a special service that emits component events.
 *
 * This service is used to pass data from one component to another.
 */
export declare class ComponentEventEmitter {
    private subject;
    constructor();
    /**
     * Emit an event.
     */
    emit<S, D>(type: string, data: ComponentEventPayload<S, D>): void;
    /**
     * Listen for an event
     *
     * If you are using the @CompnentEvent decorator, you don't need to use this method as it will be called automatically.
     */
    on<S, D>(type: string): Observable<ComponentEventPayload<S, D>>;
}
export interface ComponentEventPayload<S, D> {
    source: S;
    data: D;
}

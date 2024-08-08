import { Observable } from "rxjs";
export declare class ComponentEventEmitter {
    private subject;
    constructor();
    emit<S, D>(type: string, data: ComponentEventPayload<S, D>): void;
    on<S, D>(type: string): Observable<ComponentEventPayload<S, D>>;
}
export interface ComponentEventPayload<S, D> {
    source: S;
    data: D;
}

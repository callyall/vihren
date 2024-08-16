import { Injectable } from "../../decorators/injectable.decorator/injectable.decorator";
import { filter, map, Observable, Subject } from "rxjs";

/**
 * This is a special service that emits component events.
 *
 * This service is used to pass data from one component to another.
 */
@Injectable({ shared: true })
export class ComponentEventEmitter {
    private subject: Subject<ComponentEventData<any, any>>;

    public constructor() {
        this.subject = new Subject<ComponentEventData<any, any>>();
    }

    /**
     * Emit an event.
     */
    public emit<S, D>(type: string, data: ComponentEventPayload<S, D>): void {
        this.subject.next({ type, data });
    }

    /**
     * Listen for an event
     *
     * If you are using the @CompnentEvent decorator, you don't need to use this method as it will be called automatically.
     */
    public on<S, D>(type: string): Observable<ComponentEventPayload<S, D>> {
        return this
            .subject
            .asObservable()
            .pipe(
                filter((e) => e.type === type),
                map((e) => e.data)
            );
    }
}

export interface ComponentEventPayload<S,D> {
    source: S,
    data: D,
}

interface ComponentEventData<S, D> {
    type: string;
    data: ComponentEventPayload<S, D>;
}

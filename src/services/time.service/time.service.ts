import { interval, Observable, SchedulerLike, Subscriber } from "rxjs";
import { Injectable } from "../../decorators/injectable.decorator/injectable.decorator";

/**
 * A service that provides time related functions.
 */
@Injectable({ shared: true })
export class TimeService {

    /**
     * Set a timeout.
     * @param ms the time in milliseconds
     */
    public sleep(ms: number): Promise<void> {
        return new Promise<void>((r) => setTimeout(r, ms));
    }

    /**
     * Set a timeout.
     *
     * This will return an observable that will emit a value after the timeout.
     *
     * @param ms the time in milliseconds
     */
    public sleepRx(ms: number): Observable<void> {
        return new Observable((subscriber: Subscriber<void>) => {
            const timeout = setTimeout(() => subscriber.next(), ms);

            return () => clearTimeout(timeout);
        });
    }

    /**
     * Create an interval.
     *
     * This will return an observable that will emit a value every `ms` milliseconds.
     *
     * @param ms the time in milliseconds.
     * @param scheduler an optional scheduler.
     */
    public interval(ms: number, scheduler?: SchedulerLike): Observable<number> {
        return interval(ms, scheduler);
    }
}

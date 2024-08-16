import { Observable, SchedulerLike } from "rxjs";
/**
 * A service that provides time related functions.
 */
export declare class TimeService {
    /**
     * Set a timeout.
     * @param ms the time in milliseconds
     */
    sleep(ms: number): Promise<void>;
    /**
     * Set a timeout.
     *
     * This will return an observable that will emit a value after the timeout.
     *
     * @param ms the time in milliseconds
     */
    sleepRx(ms: number): Observable<void>;
    /**
     * Create an interval.
     *
     * This will return an observable that will emit a value every `ms` milliseconds.
     *
     * @param ms the time in milliseconds.
     * @param scheduler an optional scheduler.
     */
    interval(ms: number, scheduler?: SchedulerLike): Observable<number>;
}

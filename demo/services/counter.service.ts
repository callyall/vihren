import { Injectable, TimeService} from "../../src";
import { map, Observable, take } from "rxjs";

// The @Injectable decorator is used to declare if a class instance should be shared or an instance should be created for each request.
@Injectable({ shared: true })
export class CounterService {
    public constructor(private readonly timeService: TimeService) {}

    public getCounter(): Observable<number> {
        return this.timeService.interval(1000)
            .pipe(
                take(11),
                map((number) => 10 - number)
            )
    }
}

import { Injectable } from "../../src";

@Injectable({
    // This means that the service will be a singleton.
    // If you want to create a new instance of the service every time it is injected, set this to false.
    shared: true
})
export class UserDetailsService {
    private name: string = '';
    private age: number = 0;

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getAge(): number {
        return this.age;
    }

    public setAge(age: number): void {
        this.age = age;
    }
}

import { Component, OnInit, Query } from "../../../src";
import { UserDetailsService } from "../../services/userDetails.service";

@Component({ selector: '.user-form' })
export class UserFormComponent implements OnInit {

    public constructor(
        private readonly name: string,
        private readonly age: number,
        private readonly userDetailsService: UserDetailsService,
        @Query({ selector: '#age' }) private readonly nameInput: HTMLInputElement,
        @Query({ selector: '#name' }) private readonly ageInput: HTMLInputElement
    ) { }

    public onInit(): void {
        // Setting the initial values of the input fields
        this.nameInput.value = this.name;
        this.ageInput.value = this.age.toString();

        // Storing the values in the user details service
        this.userDetailsService.setName(this.name);
        this.userDetailsService.setAge(this.age);

        const app = document.getElementById('app') as HTMLElement;

        // Constructing the user details component
        const div = document.createElement('div');
        div.classList.add('user-details');
        div.innerHTML = '<p></p>';

        app.appendChild(div);
    }
}

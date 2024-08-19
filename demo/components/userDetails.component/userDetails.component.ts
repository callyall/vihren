import { Component, OnInit, Query } from "../../../src";
import { UserDetailsService } from "../../services/userDetails.service";

@Component({ selector: '.user-details' })
export class UserDetailsComponent implements OnInit {
    public constructor(
        private readonly userDetailsService: UserDetailsService,
        // This will inject the paragraph element that is in the user-details component.
        @Query({ selector: 'p' }) private readonly paragraph: HTMLParagraphElement
    ) { }

    public onInit(): void {
        this.paragraph.innerHTML = `Name: ${this.userDetailsService.getName()}<br>Age: ${this.userDetailsService.getAge()}`;
    }
}

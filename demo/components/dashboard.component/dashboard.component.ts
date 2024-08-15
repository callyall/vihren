import { Component, OnInit, Query } from "../../../src";
import template from './dashboard.component.html'

@Component({ selector: '#dashboard', template })
export class Dashboard implements OnInit {
    public constructor(
        @Query({ selector: '#name' }) public readonly nameParagraph: HTMLParagraphElement,
        public readonly name: string,
    ) {}

    public onInit(): void {
        this.nameParagraph.innerHTML = this.name;
    }
}

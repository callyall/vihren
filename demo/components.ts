import { Application } from "../src";
import { DynamicCounterComponent } from "./components/dynamicCounter.component/dynamicCounter.component";
import { StaticCounterComponent } from "./components/staticCounter.component/staticCounter.component";
import { TemplateCounterComponent } from "./components/templateCounter.component/templateCounter.component";

window.onload = function () {
    const staticApp = new Application(document.getElementById('static') as HTMLElement);
    staticApp.registerComponent(StaticCounterComponent);
    staticApp.init();

    const templateApp = new Application(document.getElementById('template') as HTMLElement);
    templateApp.registerComponent(TemplateCounterComponent);
    templateApp.init();

    const dynamicApp = new Application(document.getElementById('dynamic') as HTMLElement);
    dynamicApp.registerComponent(DynamicCounterComponent);
    dynamicApp.init();
}

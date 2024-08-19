import { Application } from "../src";
// Go to /components for implementation details
import { StaticCounterComponent } from "./components/staticCounter.component/staticCounter.component";

window.onload = function () {
    // Instantiate the app
    const app = new Application(document.getElementById('app') as HTMLElement);

    // Register the component
    app.registerComponent(StaticCounterComponent);

    // Initialize the app
    app.init();
}

import { TimeService, Application } from "../src";

import { InputComponent } from "./components/input.component/input.component";
import { FormComponent } from "./components/form.component/form.component";
import { CounterComponent } from "./components/counter.component/counter.component";
import { CounterService } from "./services/counter.service";
import { Dashboard } from "./components/dashboard.component/dashboard.component";

window.onload = function () {
    // We first need a root element to start the application.
    const rootElement = document.getElementById('app') as HTMLElement;
    const app = new Application(rootElement);

    // Then the components and dependencies will be registered
    app.registerComponent(InputComponent);
    app.registerComponent(FormComponent);
    app.registerComponent(CounterComponent);
    app.registerComponent(Dashboard);
    app.registerValueOrFactory(CounterService.name, () => new CounterService(app.resolve(TimeService)));

    // Finally we need to initialize the application.
    app.init();
}

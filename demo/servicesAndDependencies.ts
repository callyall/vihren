import { Application } from "../src";
import { UserDetailsComponent } from "./components/userDetails.component/userDetails.component";
import { UserFormComponent } from "./components/userForm.component/userForm.component";
import { UserDetailsService } from "./services/userDetails.service";


window.onload = function () {
    // Instantiate the app
    const app = new Application(document.getElementById('app') as HTMLElement);

    // Register the components
    app.registerComponent(UserFormComponent);
    app.registerComponent(UserDetailsComponent);

    // We are sharing these values with the application. They will be stored in the app's IoC container.
    app.registerValueOrFactory('name', 'John Doe');
    app.registerValueOrFactory('age', 30);
    
    // This is a factory that will create an instance of UserDetailsService when needed.
    // If the service is declared as shared it will run only once and store the result,
    // otherwise it will run every time the service is requested.
    app.registerValueOrFactory(UserDetailsService.name, () => new UserDetailsService());
    // Instead of using a factory we can share the service instance right away:
    //app.registerValueOrFactory(UserDetailsService.name, new UserDetailsService());

    // Initialize the app
    app.init();
}

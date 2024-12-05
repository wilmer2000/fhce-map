import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styles: [
    `
      :host {
        display: flex;
        width: 100vw;
        height: 100vh;
      }
    `,
  ],
})
export class AppComponent {}

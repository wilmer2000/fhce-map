import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalService } from './services/modal.service';
import { AsyncPipe } from '@angular/common';
import { ModalComponent } from './components/modal/modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, ModalComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
export class AppComponent {
  private readonly modalService = inject(ModalService);
  modalVisible = this.modalService.modalState$;
}

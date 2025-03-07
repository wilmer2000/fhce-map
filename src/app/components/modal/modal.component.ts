import { Component, inject } from '@angular/core';

import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  private readonly modalService = inject(ModalService);
  readonly modalContent = this.modalService.modalState$.subscribe((modalContent) => {})

  closeModal(): void {
    this.modalService.closeModal();
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { take } from 'rxjs';

import { IModal, ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
})
export class ModalComponent implements OnInit {
  modalContent: IModal;
  private readonly modalService = inject(ModalService);

  ngOnInit(): void {
    this.modalService.modalState$.pipe(
      take(1)
    ).subscribe((modalContent: IModal) => {
      console.log(modalContent);
      this.modalContent = modalContent;
    });
  }

  closeModal(): void {
    this.modalService.closeModal();
  }
}

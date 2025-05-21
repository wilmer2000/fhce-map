import { Component, inject, OnInit } from '@angular/core';
import { take } from 'rxjs';

import { IModal, ModalService } from '../../services/modal.service';
import { MapTypePipe } from '../../pipes/map-type.pipe';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  imports: [MapTypePipe],
})
export class ModalComponent implements OnInit {
  modalContent: IModal;
  private readonly modalService = inject(ModalService);

  ngOnInit(): void {
    this.modalService.modalState$.pipe(take(1)).subscribe((modalContent: IModal) => {
      this.modalContent = modalContent;
    });
  }

  closeModal(): void {
    this.modalService.closeModal();
  }
}

import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export interface IModal {
  isOpen: boolean;
  content: never | null
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalState = signal<IModal>({ isOpen: false, content: null });
  modalState$: Observable<IModal> = toObservable(this.modalState);

  openModal(content = null): void {
    const newState = {
      isOpen: true,
      content
    };
    this.modalState.set(newState);
  }

  closeModal(): void {
    const newState = {
      isOpen: false,
      content: null
    };
    this.modalState.set(newState);
  }
}

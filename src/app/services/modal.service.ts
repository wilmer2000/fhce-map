import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { EMapType } from '../interfaces/building.interface';

export interface IModal {
  isOpen: boolean;
  content: {
    photo?: string;
    title?: string;
    type?: EMapType;
    description?: string;
    btnMore?: string;
    logos?: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalState = signal<IModal>({ isOpen: false, content: {} });
  modalState$: Observable<IModal> = toObservable(this.modalState);

  openModal(content = {}): void {
    const newState = {
      isOpen: true,
      content,
    };
    this.modalState.set(newState);
  }

  closeModal(): void {
    const newState = {
      isOpen: false,
      content: {},
    };
    this.modalState.set(newState);
  }
}

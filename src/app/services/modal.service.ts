import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { EMapType } from '../interfaces/building.interface';

export interface IModal {
  isOpen?: boolean;
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
  providedIn: 'root'
})
export class ModalService {
  private modalState = signal<IModal>({ isOpen: false, content: {} });
  modalState$: Observable<IModal> = toObservable(this.modalState);

  static buildModalContent(obj: any): IModal {
    console.log(obj);
    return {
      content: {
        photo: obj.photo,
        title: obj.title,
        type: obj.type,
        description: obj.description,
        btnMore: obj.btnMore,
        logos: obj.logos
      }
    };
  }

  openModal(modal: IModal): void {
    const newState = { ...modal, isOpen: true };
    this.modalState.set(newState);
  }

  closeModal(): void {
    const newState = {
      isOpen: false,
      content: {}
    };
    this.modalState.set(newState);
  }
}

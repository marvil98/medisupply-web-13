import { Component, effect, Input, signal } from '@angular/core';
import { TranslatePipe } from '../pipes/translate.pipe';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-status-message',
  imports: [TranslatePipe, MatIconModule, NgClass, CommonModule],
  templateUrl: './status-message.html',
  styleUrl: './status-message.css',
})
export class StatusMessage {
  @Input() type: 'success' | 'error' = 'success';
  @Input() messageKey: string = '';
  @Input() float = false;
  @Input() duration?: number;

  visible = signal(true);

  ngOnInit(): void {
    if (this.duration && this.duration > 0) {
      setTimeout(() => this.visible.set(false), this.duration);
    }
  }
}

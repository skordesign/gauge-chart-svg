import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [CommonModule, NxWelcomeComponent],
  selector: 'mfe-one-mf-one-entry',
  template: `<mfe-one-nx-welcome></mfe-one-nx-welcome>`,
})
export class RemoteEntryComponent {}

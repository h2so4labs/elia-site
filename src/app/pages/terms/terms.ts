import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terms.html',
  styleUrls: ['./terms.scss']
})
export class TermsComponent {
  updatedOn = '10 Jan 2026';
}
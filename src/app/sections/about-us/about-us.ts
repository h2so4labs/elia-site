import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Stat = { value: string; label: string };
type Highlight = { icon: string; title: string; text: string };

@Component({
  selector: 'app-about-us',
  standalone: true,            // ✅ avoids NG2012 issue
  imports: [CommonModule],     // ✅ for *ngFor
  templateUrl: './about-us.html',
  styleUrls: ['./about-us.scss']
})
export class AboutUsComponent {
  highlights: Highlight[] = [
    {
      icon: 'bi-award',
      title: 'Curated Quality',
      text: 'Premium ingredients, thoughtful plating, and consistent standards.'
    },
    {
      icon: 'bi-cup-straw',
      title: 'Signature Bar',
      text: 'Classic cocktails and seasonal creations crafted by skilled mixologists.'
    },
    {
      icon: 'bi-heart',
      title: 'Warm Hospitality',
      text: 'From greetings to last call—service that feels personal and polished.'
    }
  ];

  stats: Stat[] = [
    { value: '8+', label: 'Years of Hospitality' },
    { value: '40+', label: 'Signature Cocktails' },
    { value: '10K+', label: 'Happy Guests' }
  ];
}
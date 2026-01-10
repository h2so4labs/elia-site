import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type RibbonItem = {
  icon: string;
  title: string;
  text: string;
};

type OfferCard = {
  icon: string;
  title: string;
  text: string;
};

@Component({
  selector: 'app-experience',
  standalone: true,            // ✅ REQUIRED
  imports: [CommonModule],     // ✅ REQUIRED for *ngFor/*ngIf
  templateUrl: './experience.html',
  styleUrls: ['./experience.scss']
})
export class ExperienceComponent {
  ribbon: RibbonItem[] = [
    { icon: 'bi-stars', title: 'Signature Experience', text: 'Chef-led plates, premium pours, and a vibe that stays with you.' },
    { icon: 'bi-cup-straw', title: 'Cocktail Atelier', text: 'Seasonal infusions and classics crafted with precision.' },
    { icon: 'bi-music-note-beamed', title: 'Evening Energy', text: 'Curated playlists and nights that feel effortlessly elevated.' },
    { icon: 'bi-people', title: 'Private Celebrations', text: 'Birthdays, proposals, and corporate dinners—handled seamlessly.' }
  ];

  offers: OfferCard[] = [
    { icon: 'bi-lamp', title: 'Design-forward Interiors', text: 'Warm lighting, rich textures, and modern elegance throughout.' },
    { icon: 'bi-fire', title: 'Bold Flavors', text: 'Globally inspired comfort plates with a contemporary finish.' },
    { icon: 'bi-calendar-event', title: 'Events & Experiences', text: 'Live nights, tastings, and seasonal specials—always something new.' }
  ];
}
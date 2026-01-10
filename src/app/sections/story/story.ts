import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type InfoCard = {
  icon: string;
  title: string;
  lines: string[];
  link?: { label: string; href: string };
};

@Component({
  selector: 'app-story',
  standalone: true,              // ✅ MUST be true
  imports: [CommonModule],       // ✅ for *ngFor, *ngIf
  templateUrl: './story.html',   // adjust if yours is story.component.html
  styleUrls: ['./story.scss']    // adjust if yours is story.component.scss
})
export class StoryComponent {
  cards: InfoCard[] = [
    {
      icon: 'bi-geo-alt',
      title: 'Locate Us',
      lines: ['D-4, Ring Rd, opposite pillar number 184, Rajouri Garden, Delhi, 110027'],
      link: { label: 'Get Directions', href: 'https://maps.app.goo.gl/65i2Ad8nzois6SZu8' }
    },
    {
      icon: 'bi-clock',
      title: 'Open Hours',
      lines: ['Everyday', '12:00 PM - 1:00 AM']
    },
    {
      icon: 'bi-calendar2-check',
      title: 'Reservation',
      lines: ['+91 9083833434', '+91 9083833535'],
      link: { label: 'Call Now', href: 'tel:+919083833434' }
    }
  ];
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type FooterLink = { label: string; href: string };
type Social = { icon: string; href: string; label: string };

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent {
  year = new Date().getFullYear();

  quickLinks: FooterLink[] = [
    { label: 'Home', href: '/#home' },
    { label: 'About', href: '/#about' },
    { label: 'Menu', href: '#menu' },
    // { label: 'Reservation', href: '#reservation' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/#contact' }
  ];

  legalLinks: FooterLink[] = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' }
  ];

  socials: Social[] = [
    { icon: 'bi-instagram', href: 'https://www.instagram.com/eliadelhi/?hl=en', label: 'Instagram' },
    { icon: 'bi-facebook', href: 'https://www.facebook.com/eliadelhi/', label: 'Facebook' },
    // { icon: 'bi-youtube', href: 'https://youtube.com/', label: 'YouTube' },
    { icon: 'bi-google', href: 'https://share.google/bgvOg4Sm9NZpzw8rd', label: 'Google' }
  ];
}
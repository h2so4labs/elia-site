import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

type Category = 'all' | 'food' | 'bar' | 'ambience';

type GalleryItem = {
  category: Exclude<Category, 'all'>;
  src: string;
  title: string;
  subtitle?: string;
};

@Component({
  selector: 'app-gallery',
  standalone: true,                 // ✅ avoids NG2012
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.scss'],
})
export class GalleryComponent {
  selected: Category = 'all';

  items: GalleryItem[] = [
    // FOOD
    { category: 'food', src: 'assets/gallery/food/food-1.jpg', title: 'Plated Perfection', subtitle: 'Chef specials' },
    { category: 'food', src: 'assets/gallery/food/food-1.jpg', title: 'Signature Bites', subtitle: 'Handcrafted' },
    { category: 'food', src: 'assets/gallery/food/food-1.jpg', title: 'Global Comfort', subtitle: 'Bold flavors' },
    { category: 'food', src: 'assets/gallery/food/food-1.jpg', title: 'Dessert Moments', subtitle: 'Sweet finish' },

    // BAR
    { category: 'bar', src: 'assets/gallery/bar/bar-1.jpg', title: 'Cocktail Atelier', subtitle: 'Seasonal infusions' },
    { category: 'bar', src: 'assets/gallery/bar/bar-1.jpg', title: 'Classic Spirits', subtitle: 'Premium pours' },
    { category: 'bar', src: 'assets/gallery/bar/bar-1.jpg', title: 'Signature Mixes', subtitle: 'Crafted to order' },
    { category: 'bar', src: 'assets/gallery/bar/bar-1.jpg', title: 'Nightcap Ready', subtitle: 'Late evenings' },

    // AMBIENCE
    { category: 'ambience', src: 'assets/gallery/ambience/ambience-1.jpg', title: 'Warm Lighting', subtitle: 'Elegant vibe' },
    { category: 'ambience', src: 'assets/gallery/ambience/ambience-1.jpg', title: 'Luxury Seating', subtitle: 'Comfort first' },
    { category: 'ambience', src: 'assets/gallery/ambience/ambience-1.jpg', title: 'Bar Energy', subtitle: 'Social nights' },
    { category: 'ambience', src: 'assets/gallery/ambience/ambience-1.jpg', title: 'Dinner Mood', subtitle: 'Refined ambience' },
  ];

  get filtered(): GalleryItem[] {
    if (this.selected === 'all') return this.items;
    return this.items.filter(i => i.category === this.selected);
  }

  // Lightbox state
  lightboxOpen = false;
  lightboxIndex = 0;

  openLightbox(index: number) {
    this.lightboxIndex = index;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    document.body.style.overflow = '';
  }

  prev() {
    const n = this.filtered.length;
    this.lightboxIndex = (this.lightboxIndex - 1 + n) % n;
  }

  next() {
    const n = this.filtered.length;
    this.lightboxIndex = (this.lightboxIndex + 1) % n;
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (!this.lightboxOpen) return;

    if (e.key === 'Escape') this.closeLightbox();
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
  }

  setCategory(c: Category) {
    this.selected = c;
    // reset lightbox index so it doesn't go out of bounds when switching
    this.lightboxIndex = 0;
  }

  trackBySrc(_: number, item: GalleryItem) {
    return item.src;
  }
}
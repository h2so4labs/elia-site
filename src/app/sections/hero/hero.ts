import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,            // ✅ required to avoid NG2012
  imports: [CommonModule],     // ✅ for *ngIf / *ngFor
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss']
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroEl', { static: true }) heroEl!: ElementRef<HTMLElement>;

  /** Content */
  @Input() eyebrow = 'ELIA • KITCHEN & BAR';
  @Input() headlinePrefix = 'Your perfect night for';
  @Input() keywords: string[] = ['Signature Cocktails', 'Modern Dining', 'Private Events', 'Live Nights'];
  @Input() description =
    'Premium plates, crafted cocktails, and a luxurious ambience—built for celebrations and late-evening conversations.';

  /** CTAs */
  @Input() primaryCtaLabel = 'View Menu';
  @Input() primaryCtaHref = '/menu.pdf';
  @Input() secondaryCtaLabel = 'Reserve';
  @Input() secondaryCtaHref = '#reservation';

  /** Scroll indicator target */
  @Input() scrollTarget = '#story';

  /** Background slider */
  @Input() slides: string[] = [
    'assets/hero.jpg',
    'assets/hero-2.jpg',
    'assets/hero-3.jpg'
  ];
  @Input() slideIntervalMs = 5500;

  /** Animated keyword interval */
  @Input() keywordIntervalMs = 2200;

  /** Quick info (right card) */
  @Input() locationLine = 'D-4, Ring Rd, opposite pillar number 184, Rajouri Garden, Delhi, 110027';
  @Input() hoursLine = 'Everyday • 12:00 PM – 1:00 AM';
  @Input() phoneDisplay = '+91 9083833535';
  @Input() phoneHref = 'tel:+919083833535';

  /** State */
  activeSlide = 0;
  activeKeyword = 0;

  parallaxY = 0;
  private heroTop = 0;
  private ticking = false;

  private slideTimer?: number;
  private keywordTimer?: number;

  ngAfterViewInit(): void {
    this.measure();
    this.startTimers();
    this.updateParallax();
  }

  ngOnDestroy(): void {
    if (this.slideTimer) window.clearInterval(this.slideTimer);
    if (this.keywordTimer) window.clearInterval(this.keywordTimer);
  }

  @HostListener('window:resize')
  onResize() {
    this.measure();
    this.updateParallax();
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.updateParallax();
      this.ticking = false;
    });
  }

  scrollDown() {
    const id = this.scrollTarget.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private startTimers() {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    // background slides
    if (!reduceMotion && this.slides?.length > 1) {
      this.slideTimer = window.setInterval(() => {
        this.activeSlide = (this.activeSlide + 1) % this.slides.length;
      }, this.slideIntervalMs);
    }

    // keyword rotation
    if (!reduceMotion && this.keywords?.length > 1) {
      this.keywordTimer = window.setInterval(() => {
        this.activeKeyword = (this.activeKeyword + 1) % this.keywords.length;
      }, this.keywordIntervalMs);
    }
  }

  private measure() {
    const rect = this.heroEl.nativeElement.getBoundingClientRect();
    this.heroTop = rect.top + window.scrollY;
  }

  private updateParallax() {
    const y = window.scrollY;
    const raw = (y - this.heroTop) * 0.16;
    const parallax = Math.min(70, Math.max(-10, raw));

    // ✅ write directly to CSS variable (no template binding changes)
    this.heroEl.nativeElement.style.setProperty('--parallax-y', `${parallax}px`);
  }
}
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter, Subscription } from 'rxjs';

type NavItem = {
  label: string;
  route: string;      // '' for home, 'gallery' for /gallery
  fragment?: string;  // 'about' -> #about
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule], // ✅ RouterModule included (safe + useful)
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  phoneDisplay = '+91 9083833434';
  phoneHref = 'tel:+919083833434';

  // Optional: second phone (can show in offcanvas)
  phone2Display = '+91 9083833535';
  phone2Href = 'tel:+919083833535';

  // Dynamic header state
  scrolled = false;

  // Active link state
  activeRoute = '';
  activeFragment = '';

  nav = [
    { label: 'Home', route: '', fragment: '/', blank: false },
    { label: 'About', route: '', fragment: '#about', blank: false },
    { label: 'Menu', route: '', fragment: '/menu.pdf', blank: true },
    { label: 'Gallery', route: '', fragment: '/gallery', blank: false },
    { label: 'Contact', route: '', fragment: '#contact', blank: false }
  ];

  getFragmentByLabel(label: string): string | undefined {
    const item = this.nav.find(navItem => navItem.label === label);
    // console.log(item?.fragment)
    return item?.fragment;
  }

  private sub?: Subscription;

  constructor(
    private router: Router,
    private viewport: ViewportScroller
  ) { }

  ngOnInit(): void {
    // Initial states
    this.updateScrolledState();
    this.updateActiveFromUrl(this.router.url);

    // Update active + handle fragment scroll after navigation
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects || e.url;
        this.updateActiveFromUrl(url);

        // If URL contains a fragment, scroll to it
        const frag = (url.split('#')[1] || '').trim();
        if (frag) {
          // small delay to ensure DOM is painted
          setTimeout(() => this.viewport.scrollToAnchor(frag), 60);
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.updateScrolledState();
  }

  private updateScrolledState() {
    this.scrolled = window.scrollY > 10;
  }

  private updateActiveFromUrl(url: string) {
    const [pathPart, fragPart] = url.split('#');
    // pathPart could be '/', '/gallery', '/privacy' etc
    const cleanPath = (pathPart || '').replace(/^\//, ''); // remove leading '/'
    this.activeRoute = cleanPath; // '' for home
    this.activeFragment = fragPart || '';
  }

  isActive(item: NavItem) {
    const routeMatch = (item.route || '') === (this.activeRoute || '');
    const fragMatch = (item.fragment || '') === (this.activeFragment || '');
    // If item has fragment -> match both route and fragment
    if (item.fragment) return routeMatch && fragMatch;
    // If item has no fragment -> match only route
    return routeMatch;
  }

  async navigate(item: { label: string; route: string; fragment?: string }) {
    const fragment = item.fragment;

    await this.router.navigate([item.route], { fragment: fragment || undefined });

    // ✅ Robust scroll: wait for DOM to have the element (important when coming from /gallery, /privacy, etc.)
    if (fragment) this.scrollToIdWhenReady(fragment);
  }

  private scrollToIdWhenReady(id: string) {
    const maxTries = 40;     // 40 * 50ms = 2 seconds
    const delay = 50;
    let tries = 0;

    const tryScroll = () => {
      const el = document.getElementById(id);

      if (el) {
        const header = document.querySelector('.site-header') as HTMLElement | null;
        const offset = (header?.offsetHeight ?? 0) + 8;

        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        return;
      }

      tries++;
      if (tries < maxTries) setTimeout(tryScroll, delay);
    };

    tryScroll();
  }

  reserveNow() {
    // Navigate to reservation section on home (adjust fragment if your section id differs)
    this.router.navigate([''], { fragment: 'contact' });
  }
}
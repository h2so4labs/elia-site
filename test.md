Below are the **entire updated files**. Changes included:

1) **Table toolbar layout fixed**: the **Export data** button is now placed **under the “Search, filter…” text** (left side), so the right side doesn’t look stacked/cramped.
2) **More spacing throughout**: increased vertical spacing between major sections + slightly larger padding in key cards so the dashboard feels more “premium” and breathable.

---

# 1) `dashboard-home.component.ts` (ENTIRE FILE)

```ts
// src/app/pages/dashboard/dashboard-home/dashboard-home.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgbDate,
  NgbDateStruct,
  NgbDatepickerModule,
  NgbPaginationModule,
  NgbPopover,
  NgbPopoverModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { CheckinStoreService } from '../../../core/checkin-store.service';
import { Checkin, Gender } from '../../../core/checkin.model';

type Preset = 'today' | 'yesterday' | 'custom';

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function ngbDateToJsDate(d: NgbDate): Date {
  return new Date(d.year, d.month - 1, d.day);
}
function toNgbDate(s: NgbDateStruct): NgbDate {
  return new NgbDate(s.year, s.month, s.day ?? 1);
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    NgbPaginationModule,
    NgbTooltipModule,
    NgbDatepickerModule,
    NgbPopoverModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
})
export class DashboardHomeComponent {
  private store = inject(CheckinStoreService);

  // data
  checkins = signal<Checkin[]>(this.store.getSnapshot());

  // table filters
  search = signal('');
  genderFilter = signal<'' | Gender>('');
  page = signal(1);
  pageSize = signal(8);

  // date filter
  preset = signal<Preset>('today');

  // range selection
  fromDate = signal<NgbDate | null>(null);
  toDate = signal<NgbDate | null>(null);
  hoveredDate = signal<NgbDate | null>(null);

  /**
   * ng-bootstrap expects a function for popperOptions (v19).
   * Prevents overflow + allows flipping within viewport.
   */
  popperOptions = (options: any) => {
    const existing = options?.modifiers ?? [];
    return {
      ...options,
      modifiers: [
        ...existing,
        { name: 'offset', options: { offset: [0, 10] } },
        { name: 'preventOverflow', options: { boundary: 'viewport', padding: 12 } },
        {
          name: 'flip',
          options: {
            boundary: 'viewport',
            padding: 12,
            fallbackPlacements: ['bottom-end', 'top-end', 'bottom-start', 'top-start'],
          },
        },
      ],
    };
  };

  constructor() {
    this.store.checkins$.subscribe(list => this.checkins.set(list));
    this.setToday();
  }

  rangeLabel = computed(() => {
    const f = this.fromDate();
    const t = this.toDate();
    const fmt = (d: NgbDate) =>
      `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

    if (f && t) return `${fmt(f)} → ${fmt(t)}`;
    if (f && !t) return `${fmt(f)} → Pick end`;
    return `Pick start → Pick end`;
  });

  startDateStruct = computed<{ year: number; month: number }>(() => {
    const f = this.fromDate();
    if (f) return { year: f.year, month: f.month };
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // Presets
  setToday(pop?: NgbPopover) {
    this.preset.set('today');
    const now = new Date();
    const d = new NgbDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
    this.fromDate.set(d);
    this.toDate.set(d);
    this.page.set(1);
    pop?.close();
  }

  setYesterday(pop?: NgbPopover) {
    this.preset.set('yesterday');
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const d = new NgbDate(y.getFullYear(), y.getMonth() + 1, y.getDate());
    this.fromDate.set(d);
    this.toDate.set(d);
    this.page.set(1);
    pop?.close();
  }

  openRangePicker(pop: NgbPopover) {
    this.preset.set('custom');
    pop.open();
  }

  clearRange() {
    this.preset.set('custom');
    this.fromDate.set(null);
    this.toDate.set(null);
    this.page.set(1);
  }

  // Range selection
  onDateSelection(dateStruct: NgbDateStruct, pop?: NgbPopover) {
    this.preset.set('custom');

    const date = toNgbDate(dateStruct);
    const from = this.fromDate();
    const to = this.toDate();

    if (!from && !to) {
      this.fromDate.set(date);
      this.toDate.set(null);
      this.page.set(1);
      return;
    }

    if (from && !to && (date.after(from) || date.equals(from))) {
      this.toDate.set(date);
      this.page.set(1);
      pop?.close(); // auto-close after end date
      return;
    }

    // restart range
    this.fromDate.set(date);
    this.toDate.set(null);
    this.page.set(1);
  }

  onDayHover(dateStruct: NgbDateStruct | null) {
    this.hoveredDate.set(dateStruct ? toNgbDate(dateStruct) : null);
  }

  isHovered(dateStruct: NgbDateStruct): boolean {
    const date = toNgbDate(dateStruct);
    const from = this.fromDate();
    const to = this.toDate();
    const hovered = this.hoveredDate();
    return !!(from && !to && hovered && date.after(from) && date.before(hovered));
  }

  isInside(dateStruct: NgbDateStruct): boolean {
    const date = toNgbDate(dateStruct);
    const from = this.fromDate();
    const to = this.toDate();
    return !!(from && to && date.after(from) && date.before(to));
  }

  isRange(dateStruct: NgbDateStruct): boolean {
    const date = toNgbDate(dateStruct);
    const from = this.fromDate();
    const to = this.toDate();
    return !!(
      (from && date.equals(from)) ||
      (to && date.equals(to)) ||
      this.isInside(dateStruct) ||
      this.isHovered(dateStruct)
    );
  }

  activeRange = computed(() => {
    const from = this.fromDate();
    const to = this.toDate();

    if (from && !to) {
      const d = ngbDateToJsDate(from);
      return { start: startOfDay(d), end: endOfDay(d) };
    }
    if (from && to) {
      return { start: startOfDay(ngbDateToJsDate(from)), end: endOfDay(ngbDateToJsDate(to)) };
    }

    const now = new Date();
    return { start: startOfDay(now), end: endOfDay(now) };
  });

  // Date-filtered dataset
  dateFiltered = computed(() => {
    const { start, end } = this.activeRange();
    return this.checkins().filter(c => {
      const dt = new Date(c.createdAtIso);
      return dt >= start && dt <= end;
    });
  });

  // Stats based on dateFiltered
  stats = computed(() => {
    const data = this.dateFiltered();
    const totalCheckins = data.length;
    const totalPax = data.reduce((sum, x) => sum + (x.pax || 0), 0);
    const male = data.filter(x => x.gender === 'Male').length;
    const female = data.filter(x => x.gender === 'Female').length;
    const other = data.filter(x => x.gender === 'Other').length;
    const avgPax = totalCheckins ? +(totalPax / totalCheckins).toFixed(2) : 0;
    return { totalCheckins, totalPax, male, female, other, avgPax };
  });

  // Apply search + gender on top of date filter
  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const g = this.genderFilter();

    return this.dateFiltered().filter(x => {
      const matchesQuery =
        !q ||
        x.fullName.toLowerCase().includes(q) ||
        x.phoneNumber.includes(q) ||
        (x.comments || '').toLowerCase().includes(q);

      const matchesGender = !g || x.gender === g;
      return matchesQuery && matchesGender;
    });
  });

  collectionSize = computed(() => this.filtered().length);

  paged = computed(() => {
    const p = this.page();
    const size = this.pageSize();
    const start = (p - 1) * size;
    return this.filtered().slice(start, start + size);
  });

  // Charts based on dateFiltered
  genderChart = computed<ChartConfiguration<'doughnut'>>(() => {
    const s = this.stats();
    return {
      type: 'doughnut',
      data: {
        labels: ['Male', 'Female', 'Other'],
        datasets: [
          {
            data: [s.male, s.female, s.other],
            backgroundColor: ['#2f8de4', '#ff4d8d', '#ff9f40'],
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    };
  });

  paxTrendChart = computed<ChartConfiguration<'bar'>>(() => {
    const last = [...this.dateFiltered()].slice(0, 10).reverse();
    return {
      type: 'bar',
      data: {
        labels: last.map(x =>
          new Date(x.createdAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        ),
        datasets: [
          {
            data: last.map(x => x.pax),
            label: 'Pax (last 10)',
            backgroundColor: 'rgba(59, 130, 246, 0.90)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1.5,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
      },
    };
  });

  // UI handlers
  onSearchChange(v: string) {
    this.search.set(v);
    this.page.set(1);
  }

  onGenderChange(v: '' | Gender) {
    this.genderFilter.set(v);
    this.page.set(1);
  }

  exportData() {
    alert('Export is not implemented yet.');
  }

  clearData() {
    if (confirm('Clear all mock check-ins?')) {
      this.store.clear();
      this.page.set(1);
      this.setToday();
    }
  }
}
```

---

# 2) `dashboard-home.component.html` (ENTIRE FILE)

```html
<!-- src/app/pages/dashboard/dashboard-home/dashboard-home.component.html -->

<div class="container-fluid dash-page">
  <!-- Header -->
  <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
    <div>
      <div class="d-flex align-items-center gap-3">
        <div class="rounded-4 p-2 text-white shadow-sm page-icon"
             style="background: linear-gradient(135deg,#3b82f6,#9333ea);">
          <i class="bi bi-speedometer2 fs-4"></i>
        </div>

        <div>
          <h1 class="h4 mb-0">Dashboard Overview</h1>
          <div class="text-muted">Analytics for public check-ins</div>
        </div>
      </div>
    </div>

    <button class="btn btn-outline-danger" (click)="clearData()">
      <i class="bi bi-trash me-1"></i> Clear mock data
    </button>
  </div>

  <!-- Date filter -->
  <div class="card border-0 shadow-soft section">
    <div class="card-body py-3 py-md-4">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <div class="filter-title">
            <i class="bi bi-calendar3 me-2 text-primary"></i>
            <span class="fw-semibold">Date filter</span>
          </div>

          <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn"
                    [class.btn-primary]="preset() === 'today'"
                    [class.btn-outline-primary]="preset() !== 'today'"
                    (click)="setToday(rangePop)">
              Today
            </button>

            <button type="button" class="btn"
                    [class.btn-primary]="preset() === 'yesterday'"
                    [class.btn-outline-primary]="preset() !== 'yesterday'"
                    (click)="setYesterday(rangePop)">
              Yesterday
            </button>

            <button type="button" class="btn"
                    [class.btn-primary]="preset() === 'custom'"
                    [class.btn-outline-primary]="preset() !== 'custom'"
                    (click)="openRangePicker(rangePop)">
              Custom
            </button>
          </div>
        </div>

        <!-- Range trigger -->
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm range-trigger"
          (click)="openRangePicker(rangePop)"
          [ngbPopover]="rangeTpl"
          #rangePop="ngbPopover"
          [popoverClass]="'range-popover'"
          [popperOptions]="popperOptions"
          placement="bottom-end"
          container="body"
          [autoClose]="'outside'"
          triggers="manual">
          <div class="small text-muted text-start">Range</div>
          <div class="fw-semibold d-flex align-items-center gap-2">
            <span>{{ rangeLabel() }}</span>
            <i class="bi bi-chevron-down"></i>
          </div>
        </button>

        <ng-template #rangeTpl>
          <div class="range-popover-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="fw-semibold">Select date range</div>
              <button class="btn btn-sm btn-light" type="button" (click)="rangePop.close()">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div class="text-muted small mb-2">
              Click start date, then end date. Popup closes after end date.
            </div>

            <ngb-datepicker
              [displayMonths]="2"
              [navigation]="'arrows'"
              [outsideDays]="'collapsed'"
              [startDate]="startDateStruct()"
              (select)="onDateSelection($any($event), rangePop)"
              [dayTemplate]="t">
            </ngb-datepicker>

            <ng-template #t let-date let-currentMonth="currentMonth">
              <div
                class="custom-day"
                (mouseenter)="onDayHover(date)"
                (mouseleave)="onDayHover(null)"
                (click)="onDateSelection(date, rangePop)"
                [class.faded]="date.month !== currentMonth"
                [class.range]="isRange(date)"
                [class.start]="fromDate() && date.year===fromDate()!.year && date.month===fromDate()!.month && date.day===fromDate()!.day"
                [class.end]="toDate() && date.year===toDate()!.year && date.month===toDate()!.month && date.day===toDate()!.day">
                {{ date.day }}
              </div>
            </ng-template>

            <div class="d-flex justify-content-between align-items-center mt-3">
              <button class="btn btn-sm btn-outline-secondary" type="button" (click)="clearRange()">
                <i class="bi bi-x-circle me-1"></i> Clear
              </button>

              <div class="small text-muted">{{ rangeLabel() }}</div>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="row g-4 section">
    <div class="col-12 col-sm-6 col-xl-3">
      <div class="card border-0 shadow-soft h-100">
        <div class="card-body d-flex align-items-center justify-content-between py-4">
          <div>
            <div class="text-muted small d-flex align-items-center gap-2">
              <span>Total Check-ins</span>
              <i class="bi bi-info-circle" ngbTooltip="Records captured in the selected date range." placement="top"></i>
            </div>
            <div class="display-6 fw-semibold">{{ stats().totalCheckins }}</div>
          </div>
          <div class="rounded-4 p-3 text-white"
               style="background: linear-gradient(135deg,#06b6d4,#3b82f6);">
            <i class="bi bi-people fs-3"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 col-sm-6 col-xl-3">
      <div class="card border-0 shadow-soft h-100">
        <div class="card-body d-flex align-items-center justify-content-between py-4">
          <div>
            <div class="text-muted small d-flex align-items-center gap-2">
              <span>Total Pax</span>
              <i class="bi bi-info-circle" ngbTooltip="Sum of pax in selected dates." placement="top"></i>
            </div>
            <div class="display-6 fw-semibold">{{ stats().totalPax }}</div>
          </div>
          <div class="rounded-4 p-3 text-white"
               style="background: linear-gradient(135deg,#22c55e,#16a34a);">
            <i class="bi bi-person-plus fs-3"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 col-sm-6 col-xl-3">
      <div class="card border-0 shadow-soft h-100">
        <div class="card-body d-flex align-items-center justify-content-between py-4">
          <div>
            <div class="text-muted small d-flex align-items-center gap-2">
              <span>Avg Pax / Check-in</span>
              <i class="bi bi-info-circle" ngbTooltip="Average pax per check-in within selected dates." placement="top"></i>
            </div>
            <div class="display-6 fw-semibold">{{ stats().avgPax }}</div>
          </div>
          <div class="rounded-4 p-3 text-white"
               style="background: linear-gradient(135deg,#f59e0b,#ef4444);">
            <i class="bi bi-activity fs-3"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 col-sm-6 col-xl-3">
      <div class="card border-0 shadow-soft h-100">
        <div class="card-body d-flex align-items-center justify-content-between py-4">
          <div>
            <div class="text-muted small d-flex align-items-center gap-2">
              <span>Male / Female / Other</span>
              <i class="bi bi-info-circle" ngbTooltip="Gender distribution within selected dates." placement="top"></i>
            </div>
            <div class="fs-3 fw-semibold">
              {{ stats().male }} / {{ stats().female }} / {{ stats().other }}
            </div>
          </div>
          <div class="rounded-4 p-3 text-white"
               style="background: linear-gradient(135deg,#8b5cf6,#ec4899);">
            <i class="bi bi-gender-ambiguous fs-3"></i>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts -->
  <div class="row g-4 section">
    <div class="col-12 col-xl-4">
      <div class="card border-0 shadow-soft h-100">
        <div class="card-body py-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h2 class="h6 mb-0">Gender distribution</h2>
            <span class="text-muted small" ngbTooltip="Breakdown by gender (selected dates)" placement="left">
              <i class="bi bi-info-circle"></i>
            </span>
          </div>

          <div class="chart-box chart-box--doughnut">
            <canvas baseChart
                    [type]="genderChart().type"
                    [data]="genderChart().data"
                    [options]="genderChart().options"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 col-xl-8">
      <div class="card border-0 shadow-soft h-100">
        <div class="card-body py-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h2 class="h6 mb-0">Recent pax trend</h2>
            <span class="text-muted small" ngbTooltip="Last 10 check-ins (selected dates)" placement="left">
              <i class="bi bi-info-circle"></i>
            </span>
          </div>

          <div class="chart-box chart-box--bar">
            <canvas baseChart
                    [type]="paxTrendChart().type"
                    [data]="paxTrendChart().data"
                    [options]="paxTrendChart().options"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="card border-0 shadow-soft section">
    <div class="card-body py-4">
      <div class="row g-3 align-items-start mb-3">
        <!-- Left: title + subtitle + export button BELOW subtitle -->
        <div class="col-12 col-lg-5">
          <h2 class="h6 mb-1">Check-ins</h2>
          <div class="text-muted small mb-3">
            Search, filter and review submissions for selected dates.
          </div>

          <button class="btn btn-sm btn-outline-primary" type="button" (click)="exportData()">
            <i class="bi bi-download me-1"></i> Export data
          </button>
        </div>

        <!-- Right: search + gender -->
        <div class="col-12 col-lg-7">
          <div class="d-flex flex-column flex-md-row gap-2 justify-content-lg-end">
            <div class="input-group input-group-sm flex-grow-1" style="min-width: 260px;">
              <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
              <input class="form-control"
                     [ngModel]="search()"
                     (ngModelChange)="onSearchChange($event)"
                     placeholder="Search name / phone / comments" />
            </div>

            <select class="form-select form-select-sm" style="min-width: 170px;"
                    [ngModel]="genderFilter()"
                    (ngModelChange)="onGenderChange($event)">
              <option value="">All genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover table-striped align-middle mb-0 text-nowrap" style="min-width: 1100px;">
          <thead class="table-light sticky-top">
            <tr>
              <th>Full Name</th>
              <th>Phone</th>
              <th>Gender</th>
              <th class="text-end">Pax</th>
              <th>Date/Time</th>
              <th>Comments</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let c of paged()">
              <td class="fw-semibold">{{ c.fullName }}</td>
              <td>{{ c.phoneNumber }}</td>
              <td>
                <span class="badge"
                      [class.badge-male]="c.gender === 'Male'"
                      [class.badge-female]="c.gender === 'Female'"
                      [class.badge-other]="c.gender === 'Other'">
                  {{ c.gender }}
                </span>
              </td>
              <td class="text-end fw-bold">{{ c.pax }}</td>
              <td>{{ c.createdAtIso | date:'medium' }}</td>
              <td>
                <span class="text-truncate d-inline-block"
                      style="max-width: 340px;"
                      [ngbTooltip]="c.comments || '—'"
                      placement="top">
                  {{ c.comments || '—' }}
                </span>
              </td>
            </tr>

            <tr *ngIf="collectionSize() === 0">
              <td colspan="6" class="text-center text-muted py-4">
                No results for the selected dates.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4">
        <div class="text-muted small">
          Showing <strong>{{ collectionSize() }}</strong> result(s)
        </div>

        <ngb-pagination
          [collectionSize]="collectionSize()"
          [page]="page()"
          (pageChange)="page.set($event)"
          [pageSize]="pageSize()"
          [maxSize]="5"
          [boundaryLinks]="true">
        </ngb-pagination>
      </div>
    </div>
  </div>
</div>
```

---

# 3) `dashboard-home.component.scss` (ENTIRE FILE)

```scss
/* src/app/pages/dashboard/dashboard-home/dashboard-home.component.scss */

:host { display: block; }

.dash-page {
  padding-bottom: 1.5rem;
}

/* More breathing room between major sections */
.section {
  margin-bottom: 1.75rem;
}

/* (If you use this helper globally already, keeping it here is fine too) */
.shadow-soft {
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08) !important;
}

.filter-title {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.range-trigger {
  border-radius: .9rem;
  padding: .55rem .75rem;
  text-align: left;
  min-width: 280px;
  background: #fff;
}

/* Popover appended to body => style it via ::ng-deep */
:host ::ng-deep .range-popover.popover {
  max-width: calc(100vw - 16px) !important;
  width: min(520px, calc(100vw - 16px)) !important;
}

:host ::ng-deep .range-popover .popover-body {
  padding: .75rem;
}

.range-popover-body {
  width: 100%;
  max-height: min(72vh, 620px);
  overflow: auto;
}

/* Day styling */
.custom-day {
  width: 2.1rem;
  height: 2.1rem;
  display: grid;
  place-items: center;
  border-radius: .6rem;
  cursor: pointer;
  user-select: none;
}
.custom-day:hover { background: rgba(59, 130, 246, 0.12); }
.custom-day.faded { opacity: 0.45; }
.custom-day.range { background: rgba(59, 130, 246, 0.18); }
.custom-day.start,
.custom-day.end {
  background: rgba(59, 130, 246, 0.92);
  color: #fff;
}

/* Charts */
.chart-box { width: 100%; position: relative; }
.chart-box canvas { width: 100% !important; height: 100% !important; display: block; }

.chart-box--doughnut {
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chart-box--bar { height: 340px; }

/* Badges */
.badge {
  padding: .45rem .65rem;
  border-radius: 999px;
  font-weight: 600;
}
.badge-male { background: #2f8de4; color: #fff; }
.badge-female { background: #ff4d8d; color: #fff; }
.badge-other { background: #6c757d; color: #fff; }

@media (max-width: 576px) {
  .chart-box--doughnut,
  .chart-box--bar { height: 240px; }

  .range-trigger { min-width: 100%; }
  .section { margin-bottom: 1.25rem; }

  :host ::ng-deep .range-popover.popover {
    width: calc(100vw - 16px) !important;
  }
}
```

---

If you want it to feel even less cramped, the next “big win” is increasing the **content padding** in `dashboard-layout.component.scss` (main content area) from `1.25rem` to `1.75rem` on desktop—tell me and I’ll provide that full file too.
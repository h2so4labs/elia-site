import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type ContactCard = {
  icon: string;
  title: string;
  lines: string[];
  cta?: { label: string; href: string };
};

@Component({
  selector: 'app-contact-us',
  standalone: true,                 // ✅ prevents NG2012 issue
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.scss']
})
export class ContactUsComponent {
  submitted = false;
  loading = false;
  form;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{8,}$/)]],
      email: ['', [Validators.email]],
      subject: ['Reservation / Query', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  cards: ContactCard[] = [
    {
      icon: 'bi-geo-alt',
      title: 'Visit Us',
      lines: ['D-4, Ring Rd, opposite pillar number 184, Rajouri Garden, Delhi, 110027'],
      cta: { label: 'Get Directions', href: 'https://maps.app.goo.gl/65i2Ad8nzois6SZu8' }
    },
    {
      icon: 'bi-telephone',
      title: 'Call Us',
      lines: ['+91 9083833434', '+91 9083833535'],
      cta: { label: 'Call Now', href: 'tel:+919083833434' }
    },
    {
      icon: 'bi-envelope',
      title: 'Email',
      lines: ['teameliadelhi@gmail.com'],
      cta: { label: 'Send Email', href: 'mailto:teameliadelhi@gmail.com' }
    }
  ];




  get f() { return this.form.controls; }

  async submit() {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;

    // Simulate API call (replace with your backend later)
    await new Promise(res => setTimeout(res, 900));

    this.loading = false;
    this.form.reset({
      name: '',
      phone: '',
      email: '',
      subject: 'Reservation / Query',
      message: ''
    });

    // show a small success toast area
    this.successToast = true;
    setTimeout(() => (this.successToast = false), 2500);
    this.submitted = false;
  }

  successToast = false;
}
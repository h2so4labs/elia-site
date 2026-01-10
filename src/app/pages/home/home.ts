import { Component } from '@angular/core';
import { StoryComponent } from '../../sections/story/story';
import { ExperienceComponent } from '../../sections/experience/experience';
import { AboutUsComponent } from '../../sections/about-us/about-us';
import { ContactUsComponent } from '../../sections/contact-us/contact-us';
import { HeroComponent } from '../../sections/hero/hero';

@Component({
  selector: 'app-home',
  imports: [StoryComponent, ExperienceComponent, AboutUsComponent, ContactUsComponent, HeroComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {

}

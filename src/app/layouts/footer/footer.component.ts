import {
	Component,
	computed,
	inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { UserService } from '@wawjs/ngx-bos';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { CompanyService } from '../../company/company.service';
import { ThemeState } from '../../theme/theme-state';
import { FooterLink } from './footer.types';

@Component({
	selector: 'layout-footer',
	templateUrl: './footer.component.html',
	imports: [RouterLink, TranslateDirective, ButtonModule],
})
export class FooterComponent {
	readonly userService = inject(UserService);
	readonly themeService = inject(ThemeState);
	readonly companyService = inject(CompanyService);

	readonly year = new Date().getFullYear();
	readonly metaTitle = this.companyService.company().title;
	readonly metaDescription = this.companyService.company().description;

	readonly mode = computed(() => this.themeService.mode() ?? 'light');
	readonly modes = computed(() => this.themeService.modes());

	readonly density = computed(
		() => this.themeService.density() ?? 'comfortable',
	);
	readonly densities = computed(() => this.themeService.densities());

	readonly radius = computed(() => this.themeService.radius() ?? 'rounded');
	readonly radiuses = computed(() => this.themeService.radiuses());

	setMode(mode: string): void {
		this.themeService.setMode(mode);
	}

	setDensity(density: string): void {
		this.themeService.setDensity(density);
	}

	setRadius(radius: string): void {
		this.themeService.setRadius(radius);
	}

	private readonly allLinks = computed<FooterLink[]>(() => [
		{ label: 'Головна', icon: 'home', to: '/' },
		{ label: 'Профіль', icon: 'user', to: '/profile' },
	]);

	readonly links = computed(() => {
		const isAdmin = this.userService.role('admin');
		return this.allLinks().filter((l) => !l.adminOnly || isAdmin);
	});
}

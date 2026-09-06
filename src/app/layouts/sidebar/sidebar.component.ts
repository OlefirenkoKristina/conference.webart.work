import {
	Component,
	computed,
	inject,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '@wawjs/ngx-bos';
import { TranslateDirective, TranslateService } from '@wawjs/ngx-translate';
import { NavIconComponent } from '../../shared/nav-icon/nav-icon.component';
import { SidebarService } from './sidebar.service';

/** Only this account sees the organizer tools — everyone else gets the plain attendee sidebar. */
const CEO_EMAIL = 'ceo@webart.work';

@Component({
	selector: 'layout-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss',
	imports: [RouterLink, TranslateDirective, NavIconComponent, NgClass],
})
export class SidebarComponent {
	readonly userService = inject(UserService);
	readonly translateService = inject(TranslateService);
	readonly sidebarService = inject(SidebarService);

	readonly showNames = this.sidebarService.showNames;
	readonly widthPx = this.sidebarService.widthPx;

	readonly isPreview = this.sidebarService.previewVisible;
	readonly isMobile = this.sidebarService.isMobile;

	readonly isOrganizer = computed(
		() => (this.userService.user()?.email || '').trim().toLowerCase() === CEO_EMAIL,
	);

	readonly isOverlay = computed(() => this.isMobile() || this.isPreview());
	readonly isMinimized = computed(
		() =>
			!this.isMobile() &&
			!this.isPreview() &&
			this.sidebarService.webMode() === 'minimized',
	);

	closeIfOverlay(): void {
		if (this.isOverlay()) this.sidebarService.closeAfterNavigation();
	}

	closeBackdrop(e: MouseEvent): void {
		e.preventDefault();
		e.stopPropagation();

		this.sidebarService.requestClose();
	}

	logout(): void {
		this.userService.logout();
		this.sidebarService.closeAfterNavigation();
	}
}

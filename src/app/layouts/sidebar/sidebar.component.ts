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
import { OrganizerService } from '../../conference/organizer.service';
import { SidebarService } from './sidebar.service';

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
	private readonly _organizerService = inject(OrganizerService);

	readonly showNames = this.sidebarService.showNames;
	readonly widthPx = this.sidebarService.widthPx;

	readonly isPreview = this.sidebarService.previewVisible;
	readonly isMobile = this.sidebarService.isMobile;

	readonly isOrganizer = this._organizerService.isOrganizer;

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

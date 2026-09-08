import {
	Component,
	computed,
	inject,
	input,
	output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { CoreService } from '@wawjs/ngx-core';
import { SpiderComponent } from '@wawjs/ngx-bos';
import { TranslateService } from '@wawjs/ngx-translate';
import { NavIconComponent } from '../../shared/nav-icon/nav-icon.component';
import { ConferenceService } from '../../conference/conference.service';
import { SidebarService } from '../sidebar/sidebar.service';

/** Mirrors the sidebar mode this burger icon represents. */
type BurgerState = 'three-lines' | 'two-lines' | 'one-line' | 'cross';

const BURGER_ICONS: Record<BurgerState, string> = {
	'three-lines': 'bars',
	'two-lines': 'list',
	'one-line': 'minus',
	cross: 'times',
};

@Component({
	selector: 'layout-topbar',
	templateUrl: './topbar.component.html',
	imports: [RouterLink, NavIconComponent, SpiderComponent],
})
export class TopbarComponent {
	private readonly _coreService = inject(CoreService);
	private readonly _sidebarService = inject(SidebarService);
	private readonly _router = inject(Router);
	private readonly _conferenceService = inject(ConferenceService);
	readonly translateService = inject(TranslateService);

	readonly isOpen = input(false);
	readonly sidebarToggler = input(false);
	readonly sidebarOpen = output<boolean>();
	readonly showProfile = input(false);
	readonly viewport = this._coreService.viewport;

	/** Deepest-matched `conferenceId` route param, kept in sync as navigation happens. */
	private readonly _selectedConferenceId = toSignal(
		this._router.events.pipe(
			filter((event) => event instanceof NavigationEnd),
			map(() => this._readConferenceId(this._router.routerState.snapshot.root)),
			startWith(this._readConferenceId(this._router.routerState.snapshot.root)),
		),
		{ initialValue: null },
	);

	/** Shows the selected conference's name once one is open; otherwise the generic label. */
	readonly conferencesLabel = computed(() => {
		const id = this._selectedConferenceId();
		const conference = id ? this._conferenceService.byId(id) : undefined;
		return conference?.title || this.translateService.translate('Конференції')();
	});

	readonly burgerState = computed<BurgerState>(() => {
		if (this._sidebarService.isMobile()) {
			return this._sidebarService.mobileOpen() ? 'cross' : 'three-lines';
		}

		switch (this._sidebarService.webMode()) {
			case 'shown':
				return 'three-lines';
			case 'minimized':
				return 'two-lines';
			case 'hidden':
			default:
				return 'one-line';
		}
	});

	readonly burgerIcon = computed(() => BURGER_ICONS[this.burgerState()]);

	onBurgerClick(): void {
		this._sidebarService.burgerClick();
	}

	private _onBurgerHover: ReturnType<typeof setTimeout> | null = null;
	onBurgerHover(hovered: boolean): void {
		if (this._onBurgerHover) {
			clearTimeout(this._onBurgerHover);
			this._onBurgerHover = null;
		}

		if (hovered) {
			this._sidebarService.onBurgerHover(hovered);
		} else {
			this._onBurgerHover = setTimeout(() => {
				this._sidebarService.onBurgerHover(hovered);
				this._onBurgerHover = null;
			}, 2000);
		}
	}

	/** Walks the whole route tree (not just the deepest leaf) looking for `conferenceId`. */
	private _readConferenceId(route: ActivatedRouteSnapshot): string | null {
		let node: ActivatedRouteSnapshot | null = route;
		while (node) {
			const id = node.paramMap.get('conferenceId');
			if (id) {
				return id;
			}
			node = node.firstChild;
		}
		return null;
	}
}

import { Service, computed, effect, inject, signal } from '@angular/core';
import { CoreService } from '@wawjs/ngx-core';

export type WebSidebarMode = 'shown' | 'minimized' | 'hidden';

@Service()
export class SidebarService {
	private readonly _core = inject(CoreService);

	private readonly _lsKeyWebMode = 'waw:sidebar:webMode';

	readonly isMobile = computed(() => this._core.viewport() === 'mobile');

	// Web/tablet persistent mode (pinned)
	readonly webMode = signal<WebSidebarMode>(this._loadWebMode());

	// Mobile drawer
	readonly mobileOpen = signal(false);

	// Hover preview (only meaningful when webMode === 'hidden' on web/tablet)
	readonly previewOpen = signal(false);

	// Layout decisions
	readonly pinnedVisible = computed(
		() => !this.isMobile() && this.webMode() !== 'hidden',
	);

	readonly previewVisible = computed(
		() =>
			!this.isMobile() &&
			this.webMode() === 'hidden' &&
			this.previewOpen(),
	);

	readonly anySidebarVisible = computed(
		() =>
			this.pinnedVisible() ||
			this.previewVisible() ||
			(this.isMobile() && this.mobileOpen()),
	);

	// UI decisions for sidebar content
	readonly showNames = computed(() => {
		// On mobile drawer we still show names; on web minimized we hide names
		if (this.isMobile()) return true;
		return this.webMode() !== 'minimized';
	});

	readonly widthPx = computed(() => {
		// minimized is a thin rail; tune if needed
		if (!this.isMobile() && this.webMode() === 'minimized') return 72;
		return 232;
	});

	constructor() {
		// persist only webMode
		effect(() => {
			const mode = this.webMode();
			if (this.isMobile()) return; // don't fight SSR / mobile drawer
			try {
				localStorage.setItem(this._lsKeyWebMode, mode);
			} catch {}
		});

		// safety: if we switch to mobile, close preview
		effect(() => {
			if (this.isMobile()) this.previewOpen.set(false);
		});
	}

	// Burger click behavior
	burgerClick(): void {
		if (this.isMobile()) {
			this.mobileOpen.update((v) => !v);
			return;
		}

		// web: hidden > shown > minimized > hidden
		const mode = this.webMode();
		if (mode === 'hidden') this.webMode.set('shown');
		else if (mode === 'shown') this.webMode.set('minimized');
		else this.webMode.set('hidden');

		// mode changes shouldn't auto-open preview
		this.previewOpen.set(false);
	}

	// Hover preview behavior
	disableBurgerHover = false;
	onBurgerHover(hovered: boolean): void {
		if (this.isMobile() || this.disableBurgerHover) return;

		// preview only when hidden
		if (this.webMode() !== 'hidden') {
			this.previewOpen.set(false);
			return;
		}

		this.previewOpen.set(hovered);
	}

	// Close rules for navigation/clicks
	closeAfterNavigation(): void {
		if (this.isMobile()) this.mobileOpen.set(false);
		// if it was previewed, close preview but keep hidden mode
		this.previewOpen.set(false);
	}

	// allow sidebar component to request close (mobile drawer)
	requestClose(): void {
		this.mobileOpen.set(false);
		this.previewOpen.set(false);
	}

	private _loadWebMode(): WebSidebarMode {
		try {
			const v = localStorage.getItem(
				this._lsKeyWebMode,
			) as WebSidebarMode | null;
			if (v === 'shown' || v === 'minimized' || v === 'hidden') return v;
		} catch {}
		return 'shown';
	}
}

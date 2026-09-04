import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { updatePreset } from '@wawjs/css-prime-styled';

export type ThemeMode = 'light' | 'dark';
export type ThemeDensity = 'comfortable' | 'compact';
export type ThemeRadius = 'rounded' | 'square';

const STORAGE_KEY = 'app-theme-state';
const MODES: ThemeMode[] = ['light', 'dark'];
const DENSITIES: ThemeDensity[] = ['comfortable', 'compact'];
const RADIUSES: ThemeRadius[] = ['rounded', 'square'];

const ROUNDED_SCALE = { none: '0', xs: '2px', sm: '4px', md: '6px', lg: '8px', xl: '12px' };
const SQUARE_SCALE = { none: '0', xs: '0', sm: '0', md: '0', lg: '0', xl: '0' };

interface PersistedTheme {
	mode?: ThemeMode;
	density?: ThemeDensity;
	radius?: ThemeRadius;
}

/**
 * App-owned replacement for `@wawjs/ngx-ui`'s `ThemeService`. Toggles the same
 * `data-mode`/`data-density`/`data-radius` attributes on `<html>` that
 * `src/styles/_theme.scss` already reacts to, so none of the app's existing
 * `--c-*`/`--sp-*`/`--radius-*` custom-property styling needs to change.
 *
 * `data-mode` doubles as ngx-prime's own dark-mode selector
 * (`darkModeSelector: "[data-mode='dark']"` in `app.config.ts`), so toggling
 * it here also flips ngx-prime's own dark tokens for free. Border radius is
 * additionally pushed into ngx-prime's own preset via `updatePreset` so
 * ngx-prime components (p-button, p-inputtext, etc.) stay visually
 * consistent with the app's square/rounded setting. Density has no ngx-prime
 * equivalent — it stays purely app-owned.
 */
@Injectable({ providedIn: 'root' })
export class ThemeState {
	private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	readonly mode = signal<ThemeMode>('dark');
	readonly density = signal<ThemeDensity>('comfortable');
	readonly radius = signal<ThemeRadius>('rounded');

	constructor() {
		if (this.isBrowser) {
			this.restore();
		}
	}

	modes(): ThemeMode[] {
		return MODES;
	}

	densities(): ThemeDensity[] {
		return DENSITIES;
	}

	radiuses(): ThemeRadius[] {
		return RADIUSES;
	}

	setMode(mode: ThemeMode): void {
		this.mode.set(mode);
		document.documentElement.setAttribute('data-mode', mode);
		this.persist();
	}

	nextTheme(): void {
		const index = MODES.indexOf(this.mode());
		this.setMode(MODES[(index + 1) % MODES.length]);
	}

	setDensity(density: ThemeDensity): void {
		this.density.set(density);
		document.documentElement.setAttribute('data-density', density);
		this.persist();
	}

	setRadius(radius: ThemeRadius): void {
		this.radius.set(radius);
		document.documentElement.setAttribute('data-radius', radius);
		updatePreset({ primitive: { borderRadius: radius === 'square' ? SQUARE_SCALE : ROUNDED_SCALE } });
		this.persist();
	}

	private restore(): void {
		let stored: PersistedTheme | null = null;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			stored = raw ? (JSON.parse(raw) as PersistedTheme) : null;
		} catch {
			stored = null;
		}

		const mode = stored?.mode ?? 'dark';
		const density = stored?.density ?? 'comfortable';
		const radius = stored?.radius ?? 'rounded';

		this.mode.set(mode);
		this.density.set(density);
		this.radius.set(radius);

		document.documentElement.setAttribute('data-mode', mode);
		document.documentElement.setAttribute('data-density', density);
		document.documentElement.setAttribute('data-radius', radius);
		if (radius === 'square') {
			updatePreset({ primitive: { borderRadius: SQUARE_SCALE } });
		}
	}

	private persist(): void {
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ mode: this.mode(), density: this.density(), radius: this.radius() }),
			);
		} catch {
			// ignore write failures (e.g. storage disabled/full)
		}
	}
}

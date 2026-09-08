import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';
import { TagModule } from '@wawjs/ngx-prime/tag';
import { TranslateDirective } from '@wawjs/ngx-translate';

interface TranslationRow {
	index: number;
	source: string;
}

/**
 * `/translations` — in-app replacement for the never-committed `projects/translator`
 * sub-app: browses `src/i18n/en.json` (the source/key list) against `ua.json`
 * (the Ukrainian translation), lets you edit values, and downloads an updated
 * `ua.json` to drop back over the real file. No backend, so it can't write the
 * file directly from the browser.
 */
@Component({
	selector: 'app-translations',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonModule, CardModule, InputTextModule, TagModule, FormsModule, TranslateDirective],
	templateUrl: './translations.component.html',
	styleUrl: './translations.component.scss',
})
export class TranslationsComponent {
	private readonly _http = inject(HttpClient);

	private readonly _files = toSignal(
		forkJoin({
			en: this._http.get<string[]>('/i18n/en.json').pipe(catchError(() => of([] as string[]))),
			ua: this._http.get<string[]>('/i18n/ua.json').pipe(catchError(() => of([] as string[]))),
		}).pipe(map(({ en, ua }) => ({ en, ua }))),
		{ initialValue: null },
	);

	/** Local edits keyed by row index; overlays the loaded `ua.json` values until downloaded. */
	private readonly _edits = signal<Record<number, string>>({});

	readonly loaded = computed(() => this._files() !== null);

	readonly rows = computed<TranslationRow[]>(() => {
		const files = this._files();
		return files ? files.en.map((source, index) => ({ index, source })) : [];
	});

	readonly filter = signal('');
	readonly onlyMissing = signal(false);

	readonly filteredRows = computed(() => {
		const query = this.filter().trim().toLowerCase();
		const onlyMissing = this.onlyMissing();
		return this.rows().filter((row) => {
			if (query && !row.source.toLowerCase().includes(query) && !this.translation(row.index).toLowerCase().includes(query)) {
				return false;
			}
			if (onlyMissing && !this.isMissing(row.index)) {
				return false;
			}
			return true;
		});
	});

	translation(index: number): string {
		const edits = this._edits();
		if (index in edits) {
			return edits[index];
		}
		return this._files()?.ua[index] ?? '';
	}

	isMissing(index: number): boolean {
		const value = this.translation(index).trim();
		return !value || value === this.rows()[index]?.source;
	}

	setTranslation(index: number, value: string): void {
		this._edits.update((edits) => ({ ...edits, [index]: value }));
	}

	downloadUaJson(): void {
		const values = this.rows().map((row) => this.translation(row.index));
		const blob = new Blob([JSON.stringify(values, null, '\t') + '\n'], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'ua.json';
		link.click();
		URL.revokeObjectURL(url);
	}
}

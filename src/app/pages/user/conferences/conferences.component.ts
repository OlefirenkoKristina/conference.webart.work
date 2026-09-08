import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { OrganizerService } from '../../../conference/organizer.service';
import { NEW_CONFERENCE } from '../../../conference/conference.const';
import { ConferenceService } from '../../../conference/conference.service';

/** `/conferences` — top-level listing of all conferences (e.g. `КПНУ 2026-2027`). */
@Component({
	selector: 'app-conferences',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonModule, CardModule, InputTextModule, FormsModule, TranslateDirective, RouterLink],
	templateUrl: './conferences.component.html',
	styleUrl: './conferences.component.scss',
})
export class ConferencesComponent {
	private readonly _conferenceService = inject(ConferenceService);
	private readonly _organizerService = inject(OrganizerService);

	readonly conferences = this._conferenceService.items;
	readonly isOrganizer = this._organizerService.isOrganizer;

	readonly newTitle = signal('');
	readonly showCreateForm = signal(false);

	toggleCreateForm(): void {
		this.showCreateForm.update((shown) => !shown);
	}

	createConference(): void {
		const title = this.newTitle().trim();
		if (!title) {
			return;
		}

		this._conferenceService.create({ ...NEW_CONFERENCE, title });
		this.newTitle.set('');
		this.showCreateForm.set(false);
	}

	deleteConference(id: string, title: string): void {
		if (!confirm(`Видалити конференцію "${title || 'Без назви'}"?`)) {
			return;
		}
		this._conferenceService.remove(id);
	}
}

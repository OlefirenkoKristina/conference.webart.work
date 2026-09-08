import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { MetaService } from '@wawjs/ngx-core';
import { CardModule } from '@wawjs/ngx-prime/card';
import { TagModule } from '@wawjs/ngx-prime/tag';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { ConferenceService } from '../../../conference/conference.service';
import { LectureService } from '../../../conference/lecture/lecture.service';

/**
 * Public conference page: `conf?id=:conferenceId`. Shared via QR code so
 * attendees can browse the lecture programme without an account.
 */
@Component({
	selector: 'app-conference-public',
	imports: [CardModule, TagModule, TranslateDirective],
	templateUrl: './conference-public.component.html',
	styleUrl: './conference-public.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConferencePublicComponent {
	private readonly _conferenceService = inject(ConferenceService);
	private readonly _lectureService = inject(LectureService);
	private readonly _metaService = inject(MetaService);

	readonly id = input<string>();

	readonly conference = computed(() => this._conferenceService.byId(this.id() ?? '') ?? null);
	readonly lectures = computed(() =>
		this._lectureService.all().filter((lecture) => lecture.conferenceId === this.id()),
	);

	readonly expandedLectureId = signal<string | null>(null);

	constructor() {
		effect(() => {
			const conference = this.conference();
			if (!conference) {
				return;
			}

			this._metaService.applyMeta({ title: conference.title });
		});
	}

	toggleLecture(lectureId: string): void {
		this.expandedLectureId.update((current) => (current === lectureId ? null : lectureId));
	}
}

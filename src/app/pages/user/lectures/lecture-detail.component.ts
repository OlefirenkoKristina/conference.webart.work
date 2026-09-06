import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { TagModule } from '@wawjs/ngx-prime/tag';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { map } from 'rxjs';
import { LectureService } from '../../../conference/lecture/lecture.service';

/** `/lectures/:id` — full view of a single lecture. Audience Q&A lives on the event's public join page. */
@Component({
	selector: 'app-lecture-detail',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonModule, CardModule, TagModule, TranslateDirective, RouterLink],
	templateUrl: './lecture-detail.component.html',
	styleUrl: './lecture-detail.component.scss',
})
export class LectureDetailComponent {
	private readonly _route = inject(ActivatedRoute);
	private readonly _lectureService = inject(LectureService);

	private readonly _id = toSignal(
		this._route.paramMap.pipe(map((params) => params.get('id'))),
		{ initialValue: null },
	);

	readonly lecture = computed(() => this._lectureService.all().find((lecture) => lecture._id === this._id()) ?? null);
	readonly lectureNumber = computed(
		() => this._lectureService.all().findIndex((lecture) => lecture._id === this._id()) + 1,
	);

	/** Collapsible on mobile so the lecture card doesn't dominate the screen. */
	readonly lectureExpanded = signal(true);

	toggleLectureExpanded(): void {
		this.lectureExpanded.update((expanded) => !expanded);
	}
}

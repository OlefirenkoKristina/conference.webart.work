import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '@wawjs/ngx-bos';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';
import { SelectModule } from '@wawjs/ngx-prime/select';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { NEW_EVENT } from '../../../conference/event/event.const';
import { EventService } from '../../../conference/event/event.service';
import { NEW_LECTURE } from '../../../conference/lecture/lecture.const';
import { LectureService } from '../../../conference/lecture/lecture.service';
import { TimeScrollInputComponent } from '../../../shared/time-scroll-input/time-scroll-input.component';

/**
 * `/event/:slug/mutate` — create-or-edit form. Reached from `/events`'s
 * "Create event" action (a fresh, not-yet-persisted slug) or from an edit
 * entry point on an existing event. Title/speaker/description are derived
 * from the scheduled lecture, so the form only asks for schedule + lecture.
 */
@Component({
	selector: 'app-event-mutate',
	imports: [
		ButtonModule,
		CardModule,
		InputTextModule,
		SelectModule,
		TimeScrollInputComponent,
		FormsModule,
		TranslateDirective,
	],
	templateUrl: './event-mutate.component.html',
	styleUrl: './event-mutate.component.scss',
})
export class EventMutateComponent implements OnInit {
	private readonly _router = inject(Router);
	private readonly _userService = inject(UserService);
	private readonly _eventService = inject(EventService);
	private readonly _lectureService = inject(LectureService);

	readonly slug = input.required<string>();

	readonly existingEvent = computed(() => this._eventService.bySlug(this.slug()) ?? null);
	readonly isNew = computed(() => !this.existingEvent());

	readonly date = signal('');
	readonly startTime = signal('');
	readonly endTime = signal('');

	readonly lectures = this._lectureService.items;
	readonly lectureId = signal('');
	readonly isAddingLecture = signal(false);
	readonly newLectureTitle = signal('');

	ngOnInit(): void {
		const existing = this.existingEvent();
		if (existing) {
			this.date.set(existing.date ?? '');
			this.startTime.set(existing.startTime ?? '');
			this.endTime.set(existing.endTime ?? '');
			this.lectureId.set(existing.lectureId ?? '');
		}
	}

	toggleAddLecture(): void {
		this.isAddingLecture.update((value) => !value);
	}

	createLecture(): void {
		const title = this.newLectureTitle().trim();
		if (!title) {
			return;
		}

		const lecture = this._lectureService.create({ ...NEW_LECTURE, title });
		this.lectureId.set(lecture._id);
		this.newLectureTitle.set('');
		this.isAddingLecture.set(false);
	}

	save(): void {
		const owner = this._userService.user();
		const existing = this.existingEvent();
		const lecture = this._lectureService.byId(this.lectureId());
		const speaker = owner?.name || lecture?.speaker || '';

		const eventDoc = existing
			? this._eventService.update(existing._id, {
					title: lecture?.title ?? '',
					speaker,
					description: lecture?.description ?? '',
					date: this.date(),
					startTime: this.startTime(),
					endTime: this.endTime(),
					lectureId: this.lectureId(),
				})!
			: this._eventService.create({
					...NEW_EVENT,
					slug: this.slug(),
					owner: owner?._id ?? '',
					title: lecture?.title ?? '',
					speaker,
					description: lecture?.description ?? '',
					date: this.date(),
					startTime: this.startTime(),
					endTime: this.endTime(),
					lectureId: this.lectureId(),
					createdAt: new Date().toISOString(),
				});

		this._router.navigate(['/event', eventDoc.slug, 'manage']);
	}
}

import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@wawjs/ngx-bos';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { TagModule } from '@wawjs/ngx-prime/tag';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { generateEventSlug } from '../../../conference/event/event.const';
import { EventState } from '../../../conference/event/event.interface';
import { EventService } from '../../../conference/event/event.service';
import { LectureService } from '../../../conference/lecture/lecture.service';

/** `/events` — the authenticated owner's own events, grouped by state. */
@Component({
	selector: 'app-events',
	imports: [ButtonModule, CardModule, TagModule, TranslateDirective],
	templateUrl: './events.component.html',
	styleUrl: './events.component.scss',
})
export class EventsComponent {
	private readonly _router = inject(Router);
	private readonly _userService = inject(UserService);
	private readonly _eventService = inject(EventService);
	private readonly _lectureService = inject(LectureService);

	readonly events = computed(() => {
		const ownerId = this._userService.user()?._id;
		return ownerId ? this._eventService.byOwner(ownerId) : [];
	});

	readonly draftEvents = computed(() => this._byState('draft'));
	readonly liveEvents = computed(() => this._byState('live'));
	readonly endedEvents = computed(() => this._byState('ended'));

	createEvent(): void {
		const slug = generateEventSlug();
		this._router.navigate(['/event', slug, 'mutate']);
	}

	openManage(slug: string): void {
		this._router.navigate(['/event', slug, 'manage']);
	}

	lectureTitle(lectureId: string | undefined): string | null {
		if (!lectureId) {
			return null;
		}
		return this._lectureService.byId(lectureId)?.title ?? null;
	}

	editEvent(slug: string): void {
		this._router.navigate(['/event', slug, 'mutate']);
	}

	private _byState(state: EventState) {
		return this.events().filter((event) => event.state === state);
	}
}

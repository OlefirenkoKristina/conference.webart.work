import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { NEW_LECTURE } from '../../../conference/lecture/lecture.const';
import { Lecture } from '../../../conference/lecture/lecture.interface';
import { LectureService } from '../../../conference/lecture/lecture.service';
import { LectureEditCardComponent } from './lecture-edit-card.component';

/** `/lectures-manage` — organizer CRUD over the shared lecture catalogue. */
@Component({
	selector: 'app-lectures-manage',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonModule, CardModule, LectureEditCardComponent, TranslateDirective],
	templateUrl: './lectures-manage.component.html',
	styleUrl: './lectures-manage.component.scss',
})
export class LecturesManageComponent {
	private readonly _lectureService = inject(LectureService);

	readonly lectures = this._lectureService.items;
	readonly expandedId = signal<string | null>(null);

	/** A not-yet-persisted lecture being composed; only added to the store on save. */
	readonly draftLecture = signal<Lecture | null>(null);

	isExpanded(lecture: Lecture): boolean {
		return this.expandedId() === lecture._id;
	}

	toggleExpanded(lecture: Lecture): void {
		this.expandedId.set(this.isExpanded(lecture) ? null : lecture._id);
	}

	addLecture(): void {
		this.draftLecture.set({ ...NEW_LECTURE });
	}

	cancelDraft(): void {
		this.draftLecture.set(null);
	}

	onDraftCreated(): void {
		this.draftLecture.set(null);
	}

	deleteLecture(lecture: Lecture): void {
		if (!confirm(`Видалити лекцію "${lecture.title || 'Без назви'}"?`)) {
			return;
		}
		this._lectureService.remove(lecture._id);
		if (this.expandedId() === lecture._id) {
			this.expandedId.set(null);
		}
	}
}

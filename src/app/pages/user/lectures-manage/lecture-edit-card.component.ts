import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';
import { SelectModule } from '@wawjs/ngx-prime/select';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { ConferenceService } from '../../../conference/conference.service';
import { Lecture } from '../../../conference/lecture/lecture.interface';
import { LectureService } from '../../../conference/lecture/lecture.service';

/**
 * One lecture's inline editor: title + attached file only. In `isNew` mode
 * nothing is written to the store until "Додати лекцію" is pressed —
 * `Додати лекцію` on the list only opens this card, it doesn't create a
 * lecture by itself.
 */
@Component({
	selector: 'app-lecture-edit-card',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonModule, CardModule, InputTextModule, SelectModule, NgClass, FormsModule, TranslateDirective],
	templateUrl: './lecture-edit-card.component.html',
	styleUrl: './lecture-edit-card.component.scss',
})
export class LectureEditCardComponent implements OnInit {
	private readonly _lectureService = inject(LectureService);
	private readonly _conferenceService = inject(ConferenceService);

	readonly conferences = this._conferenceService.items;

	readonly lecture = input.required<Lecture>();
	readonly expanded = input(false);
	readonly isNew = input(false);

	readonly toggle = output<void>();
	readonly deleted = output<void>();
	readonly created = output<Lecture>();

	readonly title = signal('');
	readonly link = signal('');
	readonly conferenceId = signal('');
	readonly fileName = signal('');
	readonly fileDataUrl = signal('');
	readonly fileError = signal('');

	private static readonly _MAX_FILE_BYTES = 4 * 1024 * 1024;

	readonly hasChanges = computed(() => {
		if (this.isNew()) {
			return this.title().trim().length > 0;
		}
		const lecture = this.lecture();
		return (
			this.title() !== lecture.title ||
			this.link() !== (lecture.link ?? '') ||
			this.conferenceId() !== (lecture.conferenceId ?? '') ||
			this.fileName() !== (lecture.fileName ?? '') ||
			this.fileDataUrl() !== (lecture.fileDataUrl ?? '')
		);
	});

	ngOnInit(): void {
		const lecture = this.lecture();
		this.title.set(lecture.title);
		this.link.set(lecture.link ?? '');
		this.conferenceId.set(lecture.conferenceId ?? '');
		this.fileName.set(lecture.fileName ?? '');
		this.fileDataUrl.set(lecture.fileDataUrl ?? '');
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) {
			return;
		}

		if (file.size > LectureEditCardComponent._MAX_FILE_BYTES) {
			this.fileError.set('Файл завеликий (максимум 4 МБ).');
			return;
		}

		this.fileError.set('');
		const reader = new FileReader();
		reader.onload = () => {
			this.fileName.set(file.name);
			this.fileDataUrl.set(reader.result as string);
			if (!this.isNew()) {
				this._lectureService.update(this.lecture()._id, {
					fileName: file.name,
					fileDataUrl: reader.result as string,
				});
			}
		};
		reader.readAsDataURL(file);
	}

	removeFile(): void {
		this.fileName.set('');
		this.fileDataUrl.set('');
		this.fileError.set('');
		if (!this.isNew()) {
			this._lectureService.update(this.lecture()._id, { fileName: '', fileDataUrl: '' });
		}
	}

	save(): void {
		const fields = {
			title: this.title().trim(),
			link: this.link().trim(),
			conferenceId: this.conferenceId(),
			fileName: this.fileName(),
			fileDataUrl: this.fileDataUrl(),
		};

		if (this.isNew()) {
			if (!fields.title) {
				return;
			}
			const created = this._lectureService.create({ ...this.lecture(), ...fields });
			this.created.emit(created);
			return;
		}

		this._lectureService.update(this.lecture()._id, fields);
	}

	remove(): void {
		this.deleted.emit();
	}
}

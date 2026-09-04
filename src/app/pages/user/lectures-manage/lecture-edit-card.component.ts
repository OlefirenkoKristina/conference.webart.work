import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';
import { TextareaModule } from '@wawjs/ngx-prime/textarea';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { Lecture } from '../../../conference/lecture/lecture.interface';
import { LectureService } from '../../../conference/lecture/lecture.service';

/** One lecture's inline editor: draft fields + explicit save, mirroring the event-manage pattern. */
@Component({
	selector: 'app-lecture-edit-card',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonModule, CardModule, InputTextModule, NgClass, TextareaModule, FormsModule, TranslateDirective],
	templateUrl: './lecture-edit-card.component.html',
	styleUrl: './lecture-edit-card.component.scss',
})
export class LectureEditCardComponent implements OnInit {
	private readonly _lectureService = inject(LectureService);

	readonly lecture = input.required<Lecture>();
	readonly expanded = input(false);

	readonly toggle = output<void>();
	readonly deleted = output<void>();

	readonly title = signal('');
	readonly speaker = signal('');
	readonly topic = signal('');
	readonly time = signal('');
	readonly description = signal('');
	readonly content = signal('');

	readonly hasChanges = computed(() => {
		const lecture = this.lecture();
		return (
			this.title() !== lecture.title ||
			this.speaker() !== lecture.speaker ||
			this.topic() !== lecture.topic ||
			this.time() !== lecture.time ||
			this.description() !== lecture.description ||
			this.content() !== lecture.content
		);
	});

	ngOnInit(): void {
		const lecture = this.lecture();
		this.title.set(lecture.title);
		this.speaker.set(lecture.speaker);
		this.topic.set(lecture.topic);
		this.time.set(lecture.time);
		this.description.set(lecture.description);
		this.content.set(lecture.content);
	}

	save(): void {
		this._lectureService.update(this.lecture()._id, {
			title: this.title().trim(),
			speaker: this.speaker().trim(),
			topic: this.topic().trim(),
			time: this.time().trim(),
			description: this.description().trim(),
			content: this.content().trim(),
		});
	}

	remove(): void {
		this.deleted.emit();
	}
}

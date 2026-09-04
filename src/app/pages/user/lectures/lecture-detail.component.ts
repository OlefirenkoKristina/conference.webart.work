import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { DialogModule } from '@wawjs/ngx-prime/dialog';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';
import { TagModule } from '@wawjs/ngx-prime/tag';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { map } from 'rxjs';
import { DeviceIdService } from '../../../conference/device-id.service';
import { Question } from '../../../conference/question/question.interface';
import { QuestionService } from '../../../conference/question/question.service';
import { LectureService } from '../../../conference/lecture/lecture.service';

/** `/lectures/:id` — full view of a single lecture, plus a live audience Q&A. */
@Component({
	selector: 'app-lecture-detail',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonModule, CardModule, DialogModule, InputTextModule, TagModule, FormsModule, TranslateDirective, RouterLink],
	templateUrl: './lecture-detail.component.html',
	styleUrl: './lecture-detail.component.scss',
})
export class LectureDetailComponent {
	private readonly _route = inject(ActivatedRoute);
	private readonly _lectureService = inject(LectureService);
	private readonly _questionService = inject(QuestionService);
	readonly deviceIdService = inject(DeviceIdService);

	private readonly _id = toSignal(
		this._route.paramMap.pipe(map((params) => params.get('id'))),
		{ initialValue: null },
	);

	readonly lecture = computed(() => this._lectureService.all().find((lecture) => lecture._id === this._id()) ?? null);
	readonly lectureNumber = computed(
		() => this._lectureService.all().findIndex((lecture) => lecture._id === this._id()) + 1,
	);

	/** Ordered by likes descending — the more people like a question, the higher it rises. */
	readonly questions = computed(() => this._questionService.byEvent(this._id() ?? ''));

	readonly newQuestionText = signal('');
	readonly showNamePrompt = signal(false);
	readonly nameDraft = signal(this.deviceIdService.visitorName());
	/** Collapsible on mobile so the Q&A chat can use the full screen height. */
	readonly lectureExpanded = signal(true);
	private _pendingInteraction: (() => void) | null = null;

	toggleLectureExpanded(): void {
		this.lectureExpanded.update((expanded) => !expanded);
	}

	submitQuestion(): void {
		this._withVisitorName(() => {
			const text = this.newQuestionText().trim();
			const lectureId = this._id();
			if (!text || !lectureId) {
				return;
			}

			this._questionService.ask(lectureId, text, this.deviceIdService.visitorName() || 'Анонім');
			this.newQuestionText.set('');
		});
	}

	likeQuestion(question: Question): void {
		this._withVisitorName(() => this._questionService.like(question));
	}

	hasLiked(question: Question): boolean {
		return question.likedBy.includes(this.deviceIdService.deviceId);
	}

	confirmName(): void {
		this.deviceIdService.setVisitorName(this.nameDraft().trim());
		this.showNamePrompt.set(false);

		const pending = this._pendingInteraction;
		this._pendingInteraction = null;
		pending?.();
	}

	/** Prompts for a visitor display name once, on first interaction, then runs the action. */
	private _withVisitorName(action: () => void): void {
		if (this.deviceIdService.visitorName()) {
			action();
			return;
		}

		this._pendingInteraction = action;
		this.showNamePrompt.set(true);
	}
}

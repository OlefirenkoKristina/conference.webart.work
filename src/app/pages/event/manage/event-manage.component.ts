import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '@wawjs/ngx-bos';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';
import { SelectButtonModule } from '@wawjs/ngx-prime/selectbutton';
import { TextareaModule } from '@wawjs/ngx-prime/textarea';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { environment } from '@env';
import { MessageService } from '@wawjs/ngx-prime/api';
import { EventState } from '../../../conference/event/event.interface';
import { EventService } from '../../../conference/event/event.service';
import { Poll } from '../../../conference/poll/poll.interface';
import { PollService, PollAnswerService } from '../../../conference/poll/poll.service';
import { NEW_POLL } from '../../../conference/poll/poll.const';
import { Question } from '../../../conference/question/question.interface';
import { QuestionService } from '../../../conference/question/question.service';
import { Quiz } from '../../../conference/quiz/quiz.interface';
import { QuizService, QuizAnswerService } from '../../../conference/quiz/quiz.service';
import { NEW_QUIZ } from '../../../conference/quiz/quiz.const';

/**
 * Owner dashboard: `event/:slug/manage`. Full control over the event plus
 * every piece of audience analytics that visitors never see (chapter
 * reaction summaries, poll/quiz results). All data lives in the static
 * local stores under `src/app/conference/` — reads happen inline via
 * signals/computed, so this page updates live within the tab without any
 * network or socket round-trip.
 */
@Component({
	selector: 'app-event-manage',
	imports: [
		ButtonModule,
		CardModule,
		InputTextModule,
		RouterLink,
		SelectButtonModule,
		TextareaModule,
		FormsModule,
		TranslateDirective,
	],
	templateUrl: './event-manage.component.html',
	styleUrl: './event-manage.component.scss',
})
export class EventManageComponent implements OnInit {
	private readonly _router = inject(Router);
	private readonly _messageService = inject(MessageService);
	private readonly _userService = inject(UserService);
	private readonly _eventService = inject(EventService);
	private readonly _questionService = inject(QuestionService);
	private readonly _pollService = inject(PollService);
	private readonly _pollAnswerService = inject(PollAnswerService);
	private readonly _quizService = inject(QuizService);
	private readonly _quizAnswerService = inject(QuizAnswerService);

	readonly slug = input.required<string>();

	readonly event = computed(() => this._eventService.bySlug(this.slug()) ?? null);

	/** Restricts this page to the event's actual owner, not just any logged-in user. */
	readonly isOwner = computed(() => {
		const eventDoc = this.event();
		const currentUserId = this._userService.user()?._id;
		return !!eventDoc && !!currentUserId && eventDoc.owner === currentUserId;
	});

	readonly joinUrl = computed(() => `${environment.url}/event/${this.slug()}`);

	/** Questions live on the scheduled lecture's chat, not the event itself. */
	readonly questions = computed(() => {
		const eventDoc = this.event();
		if (!eventDoc) {
			return [];
		}
		return this._questionService.byEvent(eventDoc.lectureId || eventDoc._id);
	});
	readonly polls = computed(() => {
		const eventDoc = this.event();
		return eventDoc ? this._pollService.byEvent(eventDoc._id) : [];
	});
	readonly quizzes = computed(() => {
		const eventDoc = this.event();
		return eventDoc ? this._quizService.byEvent(eventDoc._id) : [];
	});

	/** Live audience-participation counters for the dashboard summary. */
	readonly stats = computed(() => {
		return {
			questionCount: this.questions().length,
			totalLikes: this.questions().reduce((sum, question) => sum + question.likes, 0),
			pollAnswerCount: this.polls().reduce(
				(sum, poll) => sum + this._pollAnswerService.all().filter((a) => a.pollId === poll._id).length,
				0,
			),
			quizAnswerCount: this.quizzes().reduce(
				(sum, quiz) => sum + this._quizAnswerService.all().filter((a) => a.quizId === quiz._id).length,
				0,
			),
		};
	});

	readonly stateOptions: { label: string; value: EventState }[] = [
		{ label: 'draft', value: 'draft' },
		{ label: 'live', value: 'live' },
		{ label: 'ended', value: 'ended' },
	];

	readonly eventTitleDraft = signal('');
	readonly eventSpeakerDraft = signal('');
	readonly eventDescriptionDraft = signal('');

	readonly newPollQuestion = signal('');
	readonly newPollOptions = signal('');
	readonly newQuizQuestion = signal('');
	readonly newQuizOptions = signal('');
	readonly newQuizCorrectIndex = signal(0);

	ngOnInit(): void {
		const eventDoc = this.event();
		this.eventTitleDraft.set(eventDoc?.title ?? '');
		this.eventSpeakerDraft.set(eventDoc?.speaker || this._userService.user()?.name || '');
		this.eventDescriptionDraft.set(eventDoc?.description ?? '');

		queueMicrotask(() => {
			if (eventDoc && !this.isOwner()) {
				this._router.navigateByUrl('/profile');
			}
		});
	}

	copyJoinLink(): void {
		navigator.clipboard?.writeText(this.joinUrl()).then(() => {
			this._messageService.add({ severity: 'success', detail: 'Посилання скопійовано' });
		});
	}

	saveEventInfo(): void {
		const eventDoc = this.event();
		if (!eventDoc) {
			return;
		}

		this._eventService.update(eventDoc._id, {
			title: this.eventTitleDraft().trim(),
			speaker: this.eventSpeakerDraft().trim(),
			description: this.eventDescriptionDraft().trim(),
		});
	}

	setEventState(state: EventState): void {
		const eventDoc = this.event();
		if (!eventDoc) {
			return;
		}

		this._eventService.update(eventDoc._id, { state });
	}

	/**
	 * Saves the current draft info and returns to "My events". Only flips a
	 * still-`draft` event to `live` — an already `live`/`ended` state was set
	 * explicitly via the state switch above and must not be overridden.
	 */
	startSession(): void {
		this.saveEventInfo();
		if (this.event()?.state === 'draft') {
			this.setEventState('live');
		}
		this._messageService.add({ severity: 'success', detail: 'Збережено' });
		this._router.navigateByUrl('/events');
	}

	deleteQuestion(question: Question): void {
		this._questionService.removeQuestion(question);
	}

	createPoll(): void {
		const question = this.newPollQuestion().trim();
		const options = this._splitOptions(this.newPollOptions());
		const eventDoc = this.event();
		if (!question || options.length < 2 || !eventDoc) {
			return;
		}

		this._pollService.create({ ...NEW_POLL, eventId: eventDoc._id, question, options });
		this.newPollQuestion.set('');
		this.newPollOptions.set('');
	}

	togglePoll(poll: Poll): void {
		this._pollService.update(poll._id, { active: !poll.active });
	}

	pollResults(poll: Poll) {
		return this._pollAnswerService.results(poll);
	}

	createQuiz(): void {
		const question = this.newQuizQuestion().trim();
		const options = this._splitOptions(this.newQuizOptions());
		const eventDoc = this.event();
		if (!question || options.length < 2 || !eventDoc) {
			return;
		}

		this._quizService.create({
			...NEW_QUIZ,
			eventId: eventDoc._id,
			question,
			options,
			correctOptionIndex: this.newQuizCorrectIndex(),
		});
		this.newQuizQuestion.set('');
		this.newQuizOptions.set('');
		this.newQuizCorrectIndex.set(0);
	}

	toggleQuiz(quiz: Quiz): void {
		this._quizService.update(quiz._id, { active: !quiz.active });
	}

	quizResults(quiz: Quiz) {
		return this._quizAnswerService.results(quiz);
	}

	private _splitOptions(raw: string): string[] {
		return raw
			.split(',')
			.map((option) => option.trim())
			.filter((option) => option.length > 0);
	}
}

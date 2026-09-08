import { Chapter, ChapterReaction } from '../../app/conference/chapter/chapter.interface';
import { Conference } from '../../app/conference/conference.interface';
import { Event } from '../../app/conference/event/event.interface';
import { Lecture } from '../../app/conference/lecture/lecture.interface';
import { Poll, PollAnswer } from '../../app/conference/poll/poll.interface';
import { Question } from '../../app/conference/question/question.interface';
import { Quiz, QuizAnswer } from '../../app/conference/quiz/quiz.interface';

/**
 * Static demo fixtures for the Conference domain. There is no backend for
 * this domain: each entity service seeds its `localStorage`-backed store
 * from the matching array below the first time it runs in a browser.
 */

export const SEED_CONFERENCES: Conference[] = [
	{
		_id: 'conf-kpnu-2026-2027',
		title: 'КПНУ 2026-2027',
	},
];

export const SEED_EVENTS: Event[] = [
	{
		_id: 'evt-demo-1',
		slug: '1042-8837',
		owner: '',
		title: 'Building With Angular Signals',
		speaker: 'Olena Petrenko',
		description:
			'A deep dive into signals-first Angular apps, from reactive primitives to zoneless change detection.',
		state: 'live',
		createdAt: new Date().toISOString(),
	},
];

export const SEED_LECTURES: Lecture[] = [
	{
		_id: 'lec-ai-in-product-development',
		conferenceId: 'conf-kpnu-2026-2027',
		title: 'Штучний інтелект у продуктовій розробці',
		speaker: 'Олена Коваль',
		topic: 'Штучний інтелект',
		time: '10:00 — 10:45',
		description:
			'Огляд практичних кейсів впровадження AI-інструментів у процес розробки продукту: від ідеї до релізу.',
		content:
			'На цій лекції ми розглянемо, як команди інтегрують AI-інструменти на кожному етапі розробки продукту — ' +
			'від генерації ідей та досліджень до автоматизації тестування та підтримки. Розберемо реальні кейси, ' +
			'типові помилки та метрики, за якими можна оцінити ефект від впровадження.',
	},
	{
		_id: 'lec-scaling-angular-apps',
		conferenceId: 'conf-kpnu-2026-2027',
		title: 'Масштабування Angular-застосунків',
		speaker: 'Андрій Петренко',
		topic: 'Фронтенд',
		time: '11:00 — 11:45',
		description:
			'Архітектурні підходи та практики, які допомагають утримувати великі Angular-проєкти швидкими та підтримуваними.',
		content:
			'Поговоримо про архітектурні рішення для великих Angular-застосунків: lazy loading, standalone-компоненти, ' +
			'signals, оптимізацію білдів та стратегії поділу коду на модулі. Покажемо, як утримувати продуктивність ' +
			'команди на високому рівні при зростанні кодової бази.',
	},
	{
		_id: 'lec-resilient-microservices',
		conferenceId: 'conf-kpnu-2026-2027',
		title: 'Побудова відмовостійких мікросервісів',
		speaker: 'Марія Іванова',
		topic: 'Бекенд',
		time: '12:00 — 12:45',
		description:
			'Патерни надійності: circuit breaker, retry, ідемпотентність — і як обрати правильний підхід для вашої системи.',
		content:
			'Розглянемо ключові патерни відмовостійкості розподілених систем: circuit breaker, retry з backoff, ' +
			'ідемпотентність операцій та graceful degradation. Обговоримо, як обрати правильну комбінацію підходів ' +
			'залежно від навантаження та вимог до системи.',
	},
];

export const SEED_CHAPTERS: Chapter[] = [
	{ _id: 'chp-demo-1', eventId: 'evt-demo-1', title: 'Introduction', order: 0, isActive: false },
	{ _id: 'chp-demo-2', eventId: 'evt-demo-1', title: 'Problem', order: 1, isActive: false },
	{ _id: 'chp-demo-3', eventId: 'evt-demo-1', title: 'Signals in Practice', order: 2, isActive: true },
	{ _id: 'chp-demo-4', eventId: 'evt-demo-1', title: 'Demo', order: 3, isActive: false },
	{ _id: 'chp-demo-5', eventId: 'evt-demo-1', title: 'Q&A', order: 4, isActive: false },
];

export const SEED_CHAPTER_REACTIONS: ChapterReaction[] = [];

export const SEED_QUESTIONS: Question[] = [
	{
		_id: 'que-demo-1',
		eventId: 'evt-demo-1',
		text: 'How does this compare to RxJS-based state management?',
		authorName: 'Max',
		likes: 4,
		likedBy: [],
		createdAt: new Date().toISOString(),
	},
	{
		_id: 'que-demo-2',
		eventId: 'evt-demo-1',
		text: 'Any plans to support signal-based forms in production soon?',
		authorName: 'Ira',
		likes: 1,
		likedBy: [],
		createdAt: new Date().toISOString(),
	},
];

export const SEED_POLLS: Poll[] = [
	{
		_id: 'pol-demo-1',
		eventId: 'evt-demo-1',
		question: 'What should we cover next?',
		options: ['More signals internals', 'Testing strategies', 'Migration stories'],
		active: true,
	},
];

export const SEED_POLL_ANSWERS: PollAnswer[] = [];

export const SEED_QUIZZES: Quiz[] = [
	{
		_id: 'qui-demo-1',
		eventId: 'evt-demo-1',
		question: 'Which function creates a writable signal?',
		options: ['computed()', 'signal()', 'effect()'],
		correctOptionIndex: 1,
		active: true,
	},
];

export const SEED_QUIZ_ANSWERS: QuizAnswer[] = [];

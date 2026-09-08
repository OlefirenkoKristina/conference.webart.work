import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '@wawjs/ngx-bos';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { TranslateDirective, TranslateService } from '@wawjs/ngx-translate';
import {
	BugReportModel,
	ContactModel,
	FeedbackKind,
	FeedbackModel,
	WouldUse,
	emptyBugReportModel,
	emptyContactModel,
	emptyFeedbackModel,
} from './feedback.interface';
import { FeedbackService } from './feedback.service';

const CONTACT_STORAGE_KEY = 'feedback:contact';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const WOULD_USE_LABELS: Record<WouldUse, string> = {
	yes: 'Так',
	maybe: 'Можливо',
	no: 'Ні',
};

@Component({
	imports: [FormsModule, ButtonModule, TranslateDirective],
	templateUrl: './feedback.component.html',
	styleUrl: './feedback.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackComponent {
	readonly translateService = inject(TranslateService);
	private readonly _userService = inject(UserService);
	private readonly _feedbackService = inject(FeedbackService);

	readonly isAuthenticated = computed(() => !!this._userService.user()._id);

	readonly kind = signal<FeedbackKind | null>(null);
	readonly submitted = signal(false);
	readonly submitting = signal(false);
	readonly error = signal(false);

	readonly feedbackModel = signal<FeedbackModel>(emptyFeedbackModel());
	readonly bugReportModel = signal<BugReportModel>(emptyBugReportModel());
	readonly contactModel = signal<ContactModel>(this._restoreContact());
	readonly uploadingFiles = signal(0);
	readonly uploadError = signal(false);

	readonly wouldUseOptions: WouldUse[] = ['yes', 'maybe', 'no'];

	wouldUseLabel(option: WouldUse): string {
		return WOULD_USE_LABELS[option];
	}

	readonly isFeedbackValid = computed(() => this.feedbackModel().overallImpression.trim().length > 0);
	readonly isBugReportValid = computed(() => {
		const m = this.bugReportModel();
		return m.whatHappened.trim().length > 0 && m.whatExpected.trim().length > 0;
	});

	choose(kind: FeedbackKind): void {
		this.kind.set(kind);
		this.submitted.set(false);
		this.error.set(false);
		this.uploadError.set(false);
	}

	back(): void {
		this.kind.set(null);
		this.submitted.set(false);
		this.error.set(false);
		this.uploadError.set(false);
	}

	setWouldUse(value: WouldUse): void {
		this.feedbackModel.update((m) => ({ ...m, wouldUse: value }));
	}

	updateContact(field: keyof ContactModel, value: string): void {
		const next = { ...this.contactModel(), [field]: value };
		this.contactModel.set(next);
		this._persistContact(next);
	}

	addStep(): void {
		this.bugReportModel.update((m) => ({ ...m, steps: [...m.steps, ''] }));
	}

	removeStep(index: number): void {
		this.bugReportModel.update((m) => ({
			...m,
			steps: m.steps.length > 1 ? m.steps.filter((_, i) => i !== index) : m.steps,
		}));
	}

	updateStep(index: number, value: string): void {
		this.bugReportModel.update((m) => ({
			...m,
			steps: m.steps.map((step, i) => (i === index ? value : step)),
		}));
	}

	onFilesSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		const picked = input.files ? Array.from(input.files) : [];
		input.value = '';

		for (const file of picked) {
			if (!/^image\/|^video\//.test(file.type)) continue;
			if (file.size > MAX_FILE_SIZE_BYTES) {
				this.uploadError.set(true);
				continue;
			}

			this.uploadingFiles.update((n) => n + 1);
			this._feedbackService.uploadFile(file).subscribe({
				next: ({ url }) => {
					this.uploadingFiles.update((n) => n - 1);
					this.bugReportModel.update((m) => ({ ...m, files: [...m.files, url] }));
				},
				error: () => {
					this.uploadingFiles.update((n) => n - 1);
					this.uploadError.set(true);
				},
			});
		}
	}

	removeFile(index: number): void {
		this.bugReportModel.update((m) => ({
			...m,
			files: m.files.filter((_, i) => i !== index),
		}));
	}

	submitFeedback(): void {
		if (!this.isFeedbackValid() || this.submitting()) return;
		this._submit({ kind: 'feedback', ...this.feedbackModel() }, () =>
			this.feedbackModel.set(emptyFeedbackModel()),
		);
	}

	submitBugReport(): void {
		if (!this.isBugReportValid() || this.submitting() || this.uploadingFiles() > 0) return;
		this._submit({ kind: 'bug', ...this.bugReportModel() }, () =>
			this.bugReportModel.set(emptyBugReportModel()),
		);
	}

	private _submit(
		payload: { kind: FeedbackKind } & Record<string, unknown>,
		reset: () => void,
	): void {
		this.submitting.set(true);
		this.error.set(false);

		const withContact = this.isAuthenticated()
			? payload
			: { ...payload, ...this.contactModel() };

		this._feedbackService.submit(withContact as never).subscribe({
			next: () => {
				this.submitting.set(false);
				this.submitted.set(true);
				reset();
			},
			error: () => {
				this.submitting.set(false);
				this.error.set(true);
			},
		});
	}

	private _restoreContact(): ContactModel {
		try {
			const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
			return raw ? { ...emptyContactModel(), ...JSON.parse(raw) } : emptyContactModel();
		} catch {
			return emptyContactModel();
		}
	}

	private _persistContact(value: ContactModel): void {
		try {
			localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(value));
		} catch {
			// ignore storage failures (e.g. private browsing)
		}
	}
}

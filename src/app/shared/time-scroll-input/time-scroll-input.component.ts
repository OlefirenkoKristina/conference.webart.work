import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * 24-hour "HH:mm" time input where hours/minutes change on mouse-wheel
 * scroll over each segment (with click-through up/down buttons as a
 * fallback for touch/no-wheel input). Avoids native `<input type="time">`,
 * whose AM/PM-vs-24h display follows the browser/OS locale rather than the
 * page — unusable here since the app is Ukrainian-only and always 24h.
 */
@Component({
	selector: 'app-time-scroll-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [DecimalPipe],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => TimeScrollInputComponent),
			multi: true,
		},
	],
	templateUrl: './time-scroll-input.component.html',
	styleUrl: './time-scroll-input.component.scss',
})
export class TimeScrollInputComponent implements ControlValueAccessor {
	readonly hours = signal<number | null>(null);
	readonly minutes = signal<number | null>(null);

	private _onChange: (value: string) => void = () => {};
	private _onTouched: () => void = () => {};
	protected disabled = false;

	writeValue(value: string | null): void {
		if (!value) {
			this.hours.set(null);
			this.minutes.set(null);
			return;
		}
		const [h, m] = value.split(':').map(Number);
		this.hours.set(Number.isFinite(h) ? h : null);
		this.minutes.set(Number.isFinite(m) ? m : null);
	}

	registerOnChange(fn: (value: string) => void): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this._onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	onHourWheel(event: WheelEvent): void {
		event.preventDefault();
		this._shiftHour(event.deltaY < 0 ? 1 : -1);
	}

	onMinuteWheel(event: WheelEvent): void {
		event.preventDefault();
		this._shiftMinute(event.deltaY < 0 ? 1 : -1);
	}

	incrementHour(): void {
		this._shiftHour(1);
	}

	decrementHour(): void {
		this._shiftHour(-1);
	}

	incrementMinute(): void {
		this._shiftMinute(1);
	}

	decrementMinute(): void {
		this._shiftMinute(-1);
	}

	private _shiftHour(delta: number): void {
		if (this.disabled) {
			return;
		}
		const current = this.hours() ?? 0;
		this.hours.set((current + delta + 24) % 24);
		this._emit();
	}

	private _shiftMinute(delta: number): void {
		if (this.disabled) {
			return;
		}
		const current = this.minutes() ?? 0;
		this.minutes.set((current + delta + 60) % 60);
		this._emit();
	}

	private _emit(): void {
		const h = this.hours() ?? 0;
		const m = this.minutes() ?? 0;
		this._onTouched();
		this._onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
	}
}

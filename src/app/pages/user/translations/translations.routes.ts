import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./translations.component').then((m) => m.TranslationsComponent),
	},
];

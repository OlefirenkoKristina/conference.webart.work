import { Routes } from '@angular/router';
import { MetaGuard } from '@wawjs/ngx-core';
import { authenticatedGuard, guestGuard } from '@wawjs/ngx-bos';

export const routes: Routes = [
	{
		path: '',
		canActivate: [guestGuard],
		loadComponent: () =>
			import('./layouts/guest/guest.component').then(
				(m) => m.GuestComponent,
			),
		children: [
			{
				path: '',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Conference',
					},
				},
				loadComponent: () =>
					import('./pages/guest/landing/landing.component').then(
						(m) => m.LandingComponent,
					),
			},
			{
				path: 'sign',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Вхід',
					},
				},
				loadChildren: () =>
					import('./pages/guest/sign/sign.routes').then(
						(m) => m.routes,
					),
			},
		],
	},
	{
		path: '',
		canActivate: [authenticatedGuard],
		loadComponent: () =>
			import('./layouts/user/user.component').then(
				(m) => m.UserComponent,
			),
		children: [
			{
				path: 'profile',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Мій профіль',
					},
				},
				loadChildren: () =>
					import('./pages/user/profile/profile.routes').then(
						(m) => m.routes,
					),
			},
			{
				path: 'settings',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Мої налаштування',
					},
				},
				loadChildren: () =>
					import('./pages/user/settings/settings.routes').then(
						(m) => m.routes,
					),
			},
			{
				path: 'events',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Мої події',
					},
				},
				loadChildren: () =>
					import('./pages/user/events/events.routes').then(
						(m) => m.routes,
					),
			},
			{
				path: 'feedback',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Зворотний зв\'язок',
					},
				},
				loadChildren: () =>
					import('./pages/user/feedback/feedback.routes').then(
						(m) => m.routes,
					),
			},
			{
				path: 'conferences',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Конференції',
					},
				},
				loadChildren: () =>
					import('./pages/user/conferences/conferences.routes').then(
						(m) => m.routes,
					),
			},
			{
				path: 'lectures-manage',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Керування лекціями',
					},
				},
				loadChildren: () =>
					import('./pages/user/lectures-manage/lectures-manage.routes').then(
						(m) => m.routes,
					),
			},
			{
				path: 'for-attendees',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Для учасників',
					},
				},
				loadChildren: () =>
					import('./pages/user/for-attendees/for-attendees.routes').then(
						(m) => m.routes,
					),
			},
			{
				path: 'for-hosts',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Для організаторів',
					},
				},
				loadChildren: () =>
					import('./pages/user/for-hosts/for-hosts.routes').then(
						(m) => m.routes,
					),
			},
			{
				path: 'share-profile',
				canActivate: [MetaGuard],
				data: {
					shareKind: 'profile',
					meta: {
						title: 'Поділитися профілем',
						description: 'Відскануйте QR-код, щоб відкрити мій профіль Conference.',
						index: false,
					},
				},
				loadChildren: () =>
					import('./pages/user/share/share.routes').then(
						(m) => m.routes,
					),
			},
			{
				path: 'share',
				canActivate: [MetaGuard],
				data: {
					shareKind: 'app',
					meta: {
						title: 'Поділитися Conference',
						description: 'Відскануйте QR-код, щоб приєднатися до Conference за кілька секунд.',
					},
				},
				loadChildren: () =>
					import('./pages/user/share/share.routes').then(
						(m) => m.routes,
					),
			},
			{
				path: 'users',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Користувачі',
					},
				},
				loadChildren: () =>
					import('@wawjs/ngx-bos').then((m) => m.usersRoutes),
			},
			{
				path: 'forms',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Форми',
					},
				},
				loadChildren: () =>
					import('@wawjs/ngx-bos').then((m) => m.formsRoutes),
			},
			{
				path: 'form/:formId',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Форми',
					},
				},
				loadChildren: () =>
					import('@wawjs/ngx-bos').then((m) => m.formRoutes),
			},
			{
				path: 'translations',
				canActivate: [MetaGuard],
				data: {
					meta: {
						title: 'Переклади',
					},
				},
				loadChildren: () =>
					import('./pages/user/translations/translations.routes').then(
						(m) => m.routes,
					),
			},
		],
	},
	{
		path: 'conf',
		canActivate: [MetaGuard],
		data: {
			meta: {
				title: 'Конференція',
			},
		},
		loadComponent: () =>
			import('./pages/conference/public/conference-public.component').then(
				(m) => m.ConferencePublicComponent,
			),
	},
	{
		path: 'event/:slug',
		canActivate: [MetaGuard],
		data: {
			meta: {
				title: 'Подія',
			},
		},
		loadComponent: () =>
			import('./pages/event/public/event-public.component').then(
				(m) => m.EventPublicComponent,
			),
	},
	{
		path: 'event/:slug/manage',
		canActivate: [authenticatedGuard, MetaGuard],
		data: {
			meta: {
				title: 'Керування подією',
			},
		},
		loadComponent: () =>
			import('./pages/event/manage/event-manage.component').then(
				(m) => m.EventManageComponent,
			),
	},
	{
		path: 'event/:slug/mutate',
		canActivate: [authenticatedGuard, MetaGuard],
		data: {
			meta: {
				title: 'Подія',
			},
		},
		loadComponent: () =>
			import('./pages/event/mutate/event-mutate.component').then(
				(m) => m.EventMutateComponent,
			),
	},
	{
		path: '**',
		redirectTo: 'profile',
		pathMatch: 'full',
	},
];

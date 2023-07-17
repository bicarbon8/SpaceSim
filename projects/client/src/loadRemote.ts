import "zone.js";
import { enableProdMode, getPlatform } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

const platform = getPlatform() ?? platformBrowserDynamic();

platform.bootstrapModule(AppModule)
    .catch(err => console.error(err));
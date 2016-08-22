import { provide } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule}  from './app.module';

// function main() {
//   platformBrowserDynamic().bootstrapModule(AppModule);
//   // bootstrap(AppComponent, [
//   //   APP_ROUTER_PROVIDERS,
//   //   provide(LocationStrategy, {useClass: HashLocationStrategy})
//   // ]);
// }

// function bootstrapDomReady() {
//   document.addEventListener('DOMContentLoaded', main);
// }

// if (module['hot']) {
//   console.log('hot');
//   if (document.readyState === 'complete') {
//     console.log('main');
//     main();
//   } else {
//     console.log('boot');
//     bootstrapDomReady();
//   }
//   module['hot']['accept']();
// } else {
//   bootstrapDomReady();
// }
platformBrowserDynamic().bootstrapModule(AppModule);
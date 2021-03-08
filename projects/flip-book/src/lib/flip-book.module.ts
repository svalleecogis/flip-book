import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlipBookComponent } from './flip-book.component';
import { FlipBookConfiguration } from './flip-book-configuration';



(<any>window).PDFJS_LOCALE = {
  pdfJsWorker: 'assets/flip-book/js/pdf.worker.js',
  pdfJsCMapUrl: 'assets/flip-book/cmaps/'
};


@NgModule({
  declarations: [FlipBookComponent],
  imports: [
  ],
  exports: [FlipBookComponent]
})
export class FlipBookModule {
  static forRoot(
    libConfiguration?: FlipBookConfiguration
  ): ModuleWithProviders<FlipBookModule> {
    return {
      ngModule: FlipBookModule,
      providers: [
        {
          provide: FlipBookConfiguration,
          useValue: libConfiguration,
        },
      ],
    };
  }
 }

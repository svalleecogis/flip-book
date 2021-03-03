import { NgModule } from '@angular/core';
import { FlipBookComponent } from './flip-book.component';



(<any>window).PDFJS_LOCALE = {
  pdfJsWorker: 'assets/flip-book/js/pdf.worker.js',
  pdfJsCMapUrl: 'assets/flip-book/cmaps'
};


@NgModule({
  declarations: [FlipBookComponent],
  imports: [
  ],
  exports: [FlipBookComponent]
})
export class FlipBookModule { }

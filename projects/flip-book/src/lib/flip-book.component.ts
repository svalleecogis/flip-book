import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FlipBookService } from './flip-book.service';

declare var $:any;

export interface Book{
  dispose();
}
@Component({
  selector: 'cg-flip-book',
  template: `
    <div #container class="container"></div>
  `,
  styles: [`
  .container {
    height: 95vh;
    width: 95%;
    margin: 20px auto;
    border: 2px solid red;
    box-shadow: 0 0 5px red;
  }
`
  ]
})
export class FlipBookComponent implements OnInit,OnDestroy {

  @Input() pdfUrl:string;

  @Input() templateHtml:string

  @ViewChild('container') container:ElementRef;
  
  book:Book;

  constructor(
    @Inject(DOCUMENT) private readonly document: any,
    private readonly svc:FlipBookService
  ) { }
  

  ngOnInit(): void {
    this.svc.lazyLoad().subscribe(_ => {
      // console.log("lazyLoad=",_)
      if (!$) {
        $ = this.document.defaultView.$;
      }
      this.setupJQuery();

      //node_modules/@svalleecogis/
   
    });
  }

  ngOnDestroy(): void {
   if(this.book){
     this.book.dispose();
   }
  }

  setupJQuery() {
    if (!$) {
      return;
    }
    
    const pathBase = "./assets/flip-book";

    let templateHtml = `${pathBase}/templates/default-book-view.html`
    if(this.templateHtml){
      templateHtml = `${pathBase}/templates/${this.templateHtml}`;
    }

    this.book = $(this.container.nativeElement).FlipBook({
      // pdf: `${pathBase}/books/pdf/FoxitPdfSdk.pdf`,
      pdf : this.pdfUrl,
      template: {
        html: templateHtml,
        styles: [
          `.${pathBase}/css/short-black-book-view.css`
        ],
        links: [
          {
            rel: `stylesheet`,
            href: `${pathBase}/css/font-awesome.min.css`
          }
        ],
        script: `${pathBase}/js/default-book-view.js`
      }
    });

  }

}

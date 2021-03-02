import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FlipBookService } from './flip-book.service';

declare var $:any;

export interface BookController{
  cmdZoomIn();
  cmdZoomOut();
  cmdBackward();
  cmdForward();
  book:any;
}
export interface Book{
  dispose();
  ctrl:BookController
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
  
  page:number;
  pages:number;
  
  @Output('page') pageChange = new EventEmitter<number>();
  @Output('pages') pagesChange = new EventEmitter<number>();

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
      propertiesCallback: (props) => {
        console.log("::: propertiesCallback",props);

        props.cssLayersLoader = (n, clb) => {// n - page number
          clb([{
            // css: '.heading {margin-top: 200px;background-color: red;}',
            // html: '<h1 class="heading">Hello</h1>',
            js: (jContainer, props) =>{ // jContainer - jQuery element that contains HTML Layer content
              // console.log('init');
              // console.log('jContainer',jContainer);
              // console.log('props',props);
            
              return { // set of callbacks
                hide: function() {
                  // console.log('hide');
                },
                hidden: function() {
                  // console.log('hidden');
                },
                show: function() {
                  // console.log("page",n)

                 
                  // console.log('show');
                },
                shown: () => {
                    console.log('shown'+props.scene.ctrl.getPageForGUI());
                   this.page = props.scene.ctrl.getPageForGUI();
                   this.pageChange.next(this.page);
                },
                dispose: function() {
                  // console.log('dispose');
                }
              };
            }
          }]);
        };

        return props;
      },
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
      },
      ready: (scene) => { // optional function - this function executes when loading is complete

        this.pages = scene.ctrl.book.getPages();
        this.pagesChange.next(this.pages);
        // this.book.ctrl.book.addEventListener('loadedPage',(value)=>{
        //   console.log('loadPage....',value)
        // },true)
      },
    });


    
  }

  zoomIn(){
    this.book.ctrl.cmdZoomIn();
  }

  zoomOut(){
    this.book.ctrl.cmdZoomOut();
  }

  backward(){
    this.book.ctrl.cmdBackward();
  }
  
  forward(){
    this.book.ctrl.cmdForward();
  }

  
}

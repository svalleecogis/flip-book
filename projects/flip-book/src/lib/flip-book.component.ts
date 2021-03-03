import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FlipBookService } from './flip-book.service';

declare var $:any;

export interface BookController{
  cmdZoomIn();
  cmdZoomOut();
  cmdBackward();
  cmdForward();
  goToPage(page:number);

 
  // book:any;
}
export interface BookProps{
  height?:number;
  width?:number;
  gravity?:number;
  cachedPages?:number;

  pagesForPredicting?:number;
  preloadPages?:number;

  sheet?:{
    startVelocity?:number;
    wave?:number;
    shape?:number;
  },
  cover?:{
    padding?:number;
  }
}
export interface ControlsProps{
 
  lighting? : {
    default?:number;
    min?:number;
    max?:number;
    levels?:number;
  },
  pan? : {
    speed?:number;
  },
  scale? : {
    default?:number;
    min?:number;
    max?:number;
    levels?:number;
  }
  loadingAnimation?:{
    book?:boolean;
    skin?:boolean;
  },
  autoResolution?: {
    enabled?:boolean;
    coefficient?:number;
  }
}
export interface Book{
  dispose();
  ctrl:BookController;
}
@Component({
  selector: 'cg-flip-book',
  template: `
    <div #container class="container"></div>
  `,
  styles: [`
  .container {
    height: 100%;
    width: 100%;
  }
`
  ]
})
export class FlipBookComponent implements OnInit,OnDestroy {

  @Input() pdfUrl:string;

  @Input() templateHtml:string

  @ViewChild('container',{static : true}) container:ElementRef;
  
  @Input() page:number;

  @Input() controlsProps:ControlsProps;

  @Input() sound:boolean = false;

  pages:number;
  
  @Output('pageChange') pageChange = new EventEmitter<number>();
  @Output('pagesChange') pagesChange = new EventEmitter<number>();

  book:Book;

  constructor(
    private zone:NgZone,
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
    console.log("FLIPBOOK : ngOnDestroy")
   if(this.book){
    console.log("FLIPBOOK : dispose()")
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
      controlsProps : this.controlsProps,
      propertiesCallback: (props) => {
        // console.log("::: propertiesCallback",props);

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
                    // console.log('shown'+props.scene.ctrl.getPageForGUI());
                    this.zone.run(()=>{
                      this.page = props.scene.ctrl.getPageForGUI();
                      this.pageChange.next(this.page);
                    })
                  
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
        script: `${pathBase}/js/default-book-view.js`,
        sounds: this.sound?{
          startFlip: `${pathBase}/sounds/start-flip.mp3`,
          endFlip: `${pathBase}/sounds/end-flip.mp3`
        }:undefined
      },
      ready: (scene) => { // optional function - this function executes when loading is complete

        
        this.zone.run(()=>{
          this.pages = scene.ctrl.book.getPages();
          this.pagesChange.next(this.pages);

          if(this.page){
            scene.ctrl.goToPage(this.page-1);
          }

        })
        

       
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

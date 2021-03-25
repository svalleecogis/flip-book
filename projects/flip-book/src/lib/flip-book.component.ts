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

 
  book:any;
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
  },
  actions?: {
    cmdSinglePage ?: {
      active? : boolean,
    }
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

  @Input() src:string;

  @Input() templateHtml:string

  @ViewChild('container',{static : true}) container:ElementRef;
  
  @Input() page:number;

  @Input() controlsProps:ControlsProps =  {
    scale : {
      default : 0.9,
      min : 0.9,
      max : 2
    },
    actions: {
      cmdSinglePage: {
        active : false,
      },
     
     }
  }

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
    // console.log("FLIPBOOK : ngOnDestroy")
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
      // pages : 2,
      pdf : this.src,
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
                init : function(c,a){
                  c.find(".page .go-page").on("click", function(e) {
                    e.preventDefault();

                    var page = parseInt(a.$(e.target).attr("data-page-n"));
                    console.log(page);
                  });

                  
                },
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
                      //this.page = props.scene.ctrl.getPageForGUI();
                      this.page = props.scene.ctrl.getPage();
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

        props.sheet.color = 0x0080FF;
        props.cover.padding = 0.002;

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
      pdfLinks: {
        handler: function(type, destination) { // type: 'internal' (destination - page number), 'external' (destination - url)
        if(type == 'internal'){
          return false
        }else{
          return true; // true - prevent default handler, false - call default handler
        }
          
        }
      },
      ready: (scene) => { // optional function - this function executes when loading is complete
        // console.log("*** READY",scene)
        
        scene.ctrl.book.getPages = ()=>{
          return scene.pdfLinksHandler.pdf.handler.numPages;
        }

        this.zone.run(()=>{
          // this.pages = scene.ctrl.book.getPages();
          // let numPages =  scene.pdfLinksHandler.pdf.handler.numPages;

          // if(numPages>1){
          //   numPages = scene.ctrl.book.getPages();
          // }

          let numPages = scene.ctrl.book.getPages();

          this.pages = numPages;
          this.pagesChange.next(this.pages);

          if(numPages == 1){
            scene.ctrl.cmdBackward = ()=>{};
            scene.ctrl.cmdForward = ()=>{}
          }
          else if(this.page){
            scene.ctrl.goToPage(this.page);
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
    console.log("this.book.getPage()"+this.book.ctrl.book.getPage())
    this.book.ctrl.cmdBackward();
  }
  
  forward(){
    console.log("this.book.getPage()"+this.book.ctrl.book.getPage())
    console.log("this.book.p.sheets"+this.book.ctrl.book.p.sheets)
    this.book.ctrl.cmdForward();
  }

  
}

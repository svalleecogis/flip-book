import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { ReplaySubject, Observable, forkJoin, concat } from 'rxjs';
import { FlipBookConfiguration } from './flip-book-configuration';

@Injectable({
  providedIn: 'root'
})
export class FlipBookService {

  private _loadedLibraries: { [url: string]: ReplaySubject<any> } = {};

  constructor(
    @Inject(DOCUMENT) private readonly document: any,
    private readonly libConf:FlipBookConfiguration
    ) {}

  lazyLoad(): Observable<any> {

   

    let pathBase = "./assets";

    if(this.libConf?.pathLibDir){
      pathBase = this.libConf.pathLibDir;
    }

    console.log("LIB CONF PATH="+pathBase);
  

    return forkJoin([
      this.loadScript(`${pathBase}/js/jquery.min.js`),
      this.loadScript(`${pathBase}/js/html2canvas.min.js`),
      this.loadScript(`${pathBase}/js/three.min.js`),
      this.loadScript(`${pathBase}/js/pdf.min.js`),
      this.loadScript(`${pathBase}/js/3dflipbook.min.js`),

     // this.loadStyle('assets/quill/quill.snow.css')
    ]);
  }

  private loadScript(url: string): Observable<any> {
    console.log(`START : loadScript url=[${url}]`);

    if (this._loadedLibraries[url]) {
      return this._loadedLibraries[url].asObservable();
    }

    this._loadedLibraries[url] = new ReplaySubject();

    const script = this.document.createElement('script');
    script.type = 'text/javascript';
    script.async = false;
    script.src = url;
    script.onload = () => {
      this._loadedLibraries[url].next();
      this._loadedLibraries[url].complete();
      console.log(`END : loadScript url=[${url}]`);
    };

    this.document.body.appendChild(script);

    return this._loadedLibraries[url].asObservable();
  }

  private loadStyle(url: string): Observable<any> {
    console.log(`START : loadStyle url=[${url}]`);
    if (this._loadedLibraries[url]) {
      return this._loadedLibraries[url].asObservable();
    }

    this._loadedLibraries[url] = new ReplaySubject();

    const style = this.document.createElement('link');
    style.type = 'text/css';
    style.href = url;
    style.rel = 'stylesheet';
    style.onload = () => {
      this._loadedLibraries[url].next();
      this._loadedLibraries[url].complete();
      console.log(`END : loadStyle url=[${url}]`);
    };

    const head = document.getElementsByTagName('head')[0];
    head.appendChild(style);

    return this._loadedLibraries[url].asObservable();
  }

}

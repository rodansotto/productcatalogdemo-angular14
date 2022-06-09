import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs";

import { IFilteredSortedPagedList } from "../shared/filteredsortedpagedlist";
import { IProductListView } from "../product-list/productlistview";

@Injectable()
export class ProductService {
  //private _apiURL = 'http://localhost:53456/api/AWProducts';
  private _apiURL = 'http://rodansotto.com/mvc5/api/AWProducts';

  constructor(private _http: HttpClient) { }

  getProducts(page: number, pageSize: number, sort: string, sortDir: string, searchValue: string, includeImages: boolean)
    : Observable<IFilteredSortedPagedList<IProductListView[]>> {
    // tried passing parameters in the request body for a GET
    //  but seems like angular's HttpClient does not send it across
    //  so using URL parameters instead
    console.log(`apiURL: ${this._apiURL}`);
    return this._http.get<IFilteredSortedPagedList<IProductListView[]>>(
      this._apiURL,
      {
        params: {
          "page": page.toString(),
          "pageSize": pageSize.toString(),
          "sort": sort,
          "sortDir": sortDir,
          "search": "true",
          "searchValue": searchValue,
          "includeImages": includeImages ? "true" : "false"
        }
      }
    )
      //.do(data => console.log(JSON.stringify(data)))
      // .catchError(this.handleError);
  };

  private handleError(err: HttpErrorResponse) {
    console.log(err.message);
    // return Observable.throw(err.message);
  }
}

import { Component, OnInit } from '@angular/core';

import { IProductListView } from "./productlistview";
import { ProductService } from "../product-service/product.service";
import { MatTableDataSource } from "@angular/material/table";
import { PageEvent } from "@angular/material/paginator";
import { Sort } from "@angular/material/sort";

@Component({
  selector: 'awg-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: IProductListView[] = [];
  errorMessage!: string;

  // material table, paginator, and sort header component variables
  dataSource!: MatTableDataSource<IProductListView>;
  displayedColumns: string[] = [
    'productNumber',
    'name',
    'color',
    //'standardCost',
    'listPrice',
    'size',
    'weight',
    'productCategory',
    'productModel'
  ];
  pageSizeOptions: number[] = [5, 10, 20];

  totalRecords: number = 0;
  pageSize: number = 5;
  page: number = 1;
  sort: string = "productNumber";
  sortDir: string = "asc";
  searchValue: string = "";

  imageView: boolean = true;
  imagesLoaded: boolean = false;
  productsLoaded: boolean = false;

  constructor(private _productService: ProductService) { }

  ngOnInit(): void {
    this.getProducts(); // load products on load
  }

  getProducts(): void {
    this.productsLoaded = false;
    this._productService.getProducts(this.page, this.pageSize, this.sort, this.sortDir, this.searchValue, this.imageView)
      .then(fspproducts => {
          this.products = fspproducts.List;
          this.totalRecords = fspproducts.TotalRecords;
          this.dataSource = new MatTableDataSource(this.products.map(p => {
            p.LargePhoto = this.hexToBase64(p.LargePhoto);
            return p;
          }));
          this.imagesLoaded = this.imageView ? true : false;
          this.productsLoaded = true;
        },
        (error: string) => this.errorMessage = error
      );
  }

  // copied this from https://stackoverflow.com/a/23190164
  hexToBase64(str: any): string {
    return window.btoa(String.fromCharCode.apply(null,
      str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
  }

  pageEvent(event: PageEvent): void {
    console.log(`pageSize: ${event.pageSize}; page: ${event.pageIndex + 1}`);
    this.pageSize = event.pageSize;
    this.page = event.pageIndex + 1;
    this.getProducts();
  }

  sortEvent(event: Sort): void {
    console.log(`sort: ${event.active}; sortDir: ${event.direction}`);
    this.sort = event.active;
    this.sortDir = event.direction;
    this.page = 1; // reset to page 1 every time a sort is done
    this.getProducts();
  }

  searchIfEnter(event: KeyboardEvent, value: string): void {
    //console.log(event.key);
    if (event.key == "Enter") this.search(value);
  }

  search(value: string): void {
    console.log(`searchValue: ${value}`);
    this.searchValue = value;
    this.page = 1; // reset to page 1 every time a search is done
    this.getProducts();
  }

  viewImages(): void {
    this.imageView = true;
    if (!this.imagesLoaded) this.getProducts();
  }

  viewList(): void {
    this.imageView = false;
  }
}

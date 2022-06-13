import { Injectable } from '@angular/core';

import { IFilteredSortedPagedList } from "../shared/filteredsortedpagedlist";
import { IProductListView } from "../product-list/productlistview";

@Injectable()
export class ProductService {

  async getProducts(page: number, pageSize: number, sort: string, sortDir: string, searchValue: string, includeImages: boolean)
    : Promise<IFilteredSortedPagedList<IProductListView[]>> {
      const sqlPromise = window.initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.7.0/${file}`
      });
      const dataPromise = fetch("https://rodansotto.github.io/databasedemo/AWLT2008R2Sample.sqlite").then(res => res.arrayBuffer());
      const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
      const db = new SQL.Database(new Uint8Array(buf));
      const fromSQL = `
        from "SalesLT.Product" p
        inner join "SalesLT.ProductCategory" pc on pc.ProductCategoryID = p.ProductCategoryID
        inner join "SalesLT.ProductModel" pm on pm.ProductModelID = p.ProductModelID
        inner join "SalesLT.ProductProductPhoto" ppp on ppp.ProductID = p.ProductID
        inner join "SalesLT.ProductPhoto" pp on pp.ProductPhotoID = ppp.ProductPhotoID
        where ppp.ProductPhotoID <> "1"
        ${searchValue
          ? `and 
            (
              p.ProductNumber like '%${searchValue}%'
              or p.Name like '%${searchValue}%'
              or p.Color like '%${searchValue}%'
              or p.Size like '%${searchValue}%'
              or pc.Name like '%${searchValue}%'
              or pm.Name like '%${searchValue}%'
            )`
          : ''
        }
      `
      const stmt = db.prepare(`
        select
          p.ProductID,
          p.ProductNumber,
          p.Name,
          p.Color,
          p.StandardCost,
          p.ListPrice,
          p.Size,
          p.Weight,
          pc.Name as "ProductCategory",
          pm.Name as "ProductModel",
          ${includeImages ? 'pp.LargePhoto' : 'null'} as "LargePhoto"
        ${fromSQL}
        order by ${this.orderBy(sort)} ${sortDir}
        limit ${pageSize} offset ${pageSize*(page-1)}
      `);
      let productList: IProductListView[] = [];
      while(stmt.step()) {
        const row = stmt.getAsObject();
        productList.push(row);
      }
      const total = db.exec(`select count(*) as totals ${fromSQL}`)[0].values[0][0];
      // console.log(total);
      return {
        TotalRecords: total,
        List: productList,
      };
  };

  orderBy(sort: string): string {
    switch(sort) {
      case 'listPrice':
        return 'cast(p.ListPrice as numeric)';
      case 'weight':
        return 'cast(p.Weight as numeric)';
      case 'productCategory':
        return 'pc.Name';
      case 'productModel':
        return `pm.Name`;
      default:
        return `p.${sort}`;
    }
  }
}

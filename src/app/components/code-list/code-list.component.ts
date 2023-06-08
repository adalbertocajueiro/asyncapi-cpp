import { Component, Input, OnInit } from '@angular/core';
import { CodeListItemComponent } from '../code-list-item/code-list-item.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-code-list',
  templateUrl: './code-list.component.html',
  styleUrls: ['./code-list.component.scss']
})
export class CodeListComponent implements OnInit{
  items:any[] = []

  @Input()
  addItemSubject?:Subject<any>

  ngOnInit(): void {
    this.addItemSubject?.subscribe(
      {
        next: (res) => { 
          
          var index:number = this.items.findIndex( item => item.label == res.label)
          if(index == -1){
            this.items.push(res)
          } else {
            this.items.splice(index,1)
          }
        }
      }
    )
  }
}

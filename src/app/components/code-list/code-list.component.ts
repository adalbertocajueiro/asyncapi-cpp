import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CodeListItemComponent } from '../code-list-item/code-list-item.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-code-list',
  templateUrl: './code-list.component.html',
  styleUrls: ['./code-list.component.scss']
})
export class CodeListComponent implements OnInit{
  items:any[] = []

  zipItem:any = {
    label: 'all'
  }

  orderMap:Map<string,number> = new Map<string,number>(
    [
      ['definitions',0],
      ['conversion-functions',1],
      ['metainfo',2],
      ['topics',3],
      ['communication-layer',4],
      ['communication-layer-impl',5],
      ['simulated-server', 6],
      ['all',7]
    ]
  )

  @Input()
  addItemSubject?:Subject<any>

  @Input()
  clearSubject?: Subject<any>

  @Output()
  onDownloadClicked: EventEmitter<CodeListItemComponent> = new EventEmitter<CodeListItemComponent>()

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
          this.updateItemAll()
        }
      }
    )

    this.clearSubject?.subscribe(
      {
        next: (res) => {
          this.items = []
        }
      }
    )
  }

  updateItemAll(){
    var index = this.items.findIndex( item => item.label == 'all')
    if(index == -1 && this.items.length > 0){
      this.items.push(this.zipItem)
    } else if (index != -1 && this.items.length == 1){
      this.items.splice(index,1)
    }
    this.items.sort( (item1,item2) => this.orderMap.get(item1.label as string)! - this.orderMap.get(item2.label as string)!)
  }
}

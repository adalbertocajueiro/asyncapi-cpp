import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-code-list-item',
  templateUrl: './code-list-item.component.html',
  styleUrls: ['./code-list-item.component.scss']
})
export class CodeListItemComponent {
  
  @Input()
  item:any

  @Input()
  content:string = ''

  @Input()
  label?: 'definitions' | 'conversion-functions' | 'metainfo' | 'topics' | 'communication-layer' | 'communication-layer-impl'

  expanded:boolean = false

  @Output()
  click:EventEmitter<CodeListItemComponent> = new EventEmitter<CodeListItemComponent>()

  itemClicked(){
    console.log('this item',this)
    this.expanded = !this.expanded
    this.click.emit(this)
  }
}

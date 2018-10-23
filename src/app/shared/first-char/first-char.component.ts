import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-first-char',
  templateUrl: './first-char.component.html',
  styleUrls: ['./first-char.component.css']
})
export class FirstCharComponent implements OnInit {

  @Input() name:String;
  @Input() userBg:String;
  @Input() userColor:String;

  public firstChar:String;
  private _name:String = '';

  @Output()
  notify:EventEmitter<String> = new EventEmitter<String>();


  ngOnInit():void {
    this._name = this.name
    this.firstChar = this._name[0]
  }

  ngOnChanges(changes:SimpleChanges){
    let name = changes.name
    this._name = name.currentValue
    this.firstChar = this._name[0]
  }

  nameClicked(){
    this.notify.emit(this._name)
  }

}

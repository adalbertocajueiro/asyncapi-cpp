import { TestBed } from '@angular/core/testing';
import { formatEnum } from './CppCodeVisitor';
import { EnumItem, EnumType } from '../models/enum';

describe('CppVisitor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    declarations: []
  }));

  it('enum conversion', () => {
    const items:EnumItem[] = [
      { name: 'GET',value:1 },
      { name: 'SET',value:2 }
    ]
    const enumObj = new EnumType('Signal',items)
    var result =  formatEnum(enumObj)
    console.log('RESULT ENUM: ')
    console.log('\n'+ result)
  });

});

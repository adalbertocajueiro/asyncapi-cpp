import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeListItemComponent } from './code-list-item.component';

describe('CodeListItemComponent', () => {
  let component: CodeListItemComponent;
  let fixture: ComponentFixture<CodeListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodeListItemComponent]
    });
    fixture = TestBed.createComponent(CodeListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

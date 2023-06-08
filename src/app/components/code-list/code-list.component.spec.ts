import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeListComponent } from './code-list.component';

describe('CodeListComponent', () => {
  let component: CodeListComponent;
  let fixture: ComponentFixture<CodeListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodeListComponent]
    });
    fixture = TestBed.createComponent(CodeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

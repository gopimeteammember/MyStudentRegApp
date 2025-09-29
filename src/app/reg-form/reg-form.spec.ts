import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegForm } from './reg-form';

describe('RegForm', () => {
  let component: RegForm;
  let fixture: ComponentFixture<RegForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

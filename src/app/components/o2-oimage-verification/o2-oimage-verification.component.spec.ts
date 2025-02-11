import { ComponentFixture, TestBed } from '@angular/core/testing';

import { O2OImageVerificationComponent } from './o2-oimage-verification.component';

describe('O2OImageVerificationComponent', () => {
  let component: O2OImageVerificationComponent;
  let fixture: ComponentFixture<O2OImageVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [O2OImageVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(O2OImageVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

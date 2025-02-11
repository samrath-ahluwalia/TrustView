import { ComponentFixture, TestBed } from '@angular/core/testing';

import { O2NImageVerificationComponent } from './o2-nimage-verification.component';

describe('O2NImageVerificationComponent', () => {
  let component: O2NImageVerificationComponent;
  let fixture: ComponentFixture<O2NImageVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [O2NImageVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(O2NImageVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

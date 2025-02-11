import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeduplicationCheckComponent } from './deduplication-check.component';

describe('DeduplicationCheckComponent', () => {
  let component: DeduplicationCheckComponent;
  let fixture: ComponentFixture<DeduplicationCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeduplicationCheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeduplicationCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

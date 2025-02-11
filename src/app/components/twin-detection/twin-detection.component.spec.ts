import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwinDetectionComponent } from './twin-detection.component';

describe('TwinDetectionComponent', () => {
  let component: TwinDetectionComponent;
  let fixture: ComponentFixture<TwinDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwinDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwinDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

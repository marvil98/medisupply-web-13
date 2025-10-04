import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionalSettings } from './regional-settings';

describe('RegionalSettings', () => {
  let component: RegionalSettings;
  let fixture: ComponentFixture<RegionalSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegionalSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(RegionalSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

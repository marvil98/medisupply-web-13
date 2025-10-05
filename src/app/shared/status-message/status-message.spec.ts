import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusMessage } from './status-message';

describe('StatusMessage', () => {
  let component: StatusMessage;
  let fixture: ComponentFixture<StatusMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusMessage],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusMessage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

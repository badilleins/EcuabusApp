import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrequenciesPage } from './frequencies.page';

describe('FrequenciesPage', () => {
  let component: FrequenciesPage;
  let fixture: ComponentFixture<FrequenciesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FrequenciesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

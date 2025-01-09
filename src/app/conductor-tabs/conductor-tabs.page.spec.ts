import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConductorTabsPage } from './conductor-tabs.page';

describe('ConductorTabsPage', () => {
  let component: ConductorTabsPage;
  let fixture: ComponentFixture<ConductorTabsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConductorTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

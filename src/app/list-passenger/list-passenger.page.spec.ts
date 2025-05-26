import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListPassengerPage } from './list-passenger.page';

describe('ListPassengerPage', () => {
  let component: ListPassengerPage;
  let fixture: ComponentFixture<ListPassengerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPassengerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolCardComponent } from './pool-card.component';

describe('PoolCardComponent', () => {
  let component: PoolCardComponent;
  let fixture: ComponentFixture<PoolCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoolCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

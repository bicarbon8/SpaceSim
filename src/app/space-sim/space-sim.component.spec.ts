import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceSimComponent } from './space-sim.component';

describe('SpaceSimComponent', () => {
  let component: SpaceSimComponent;
  let fixture: ComponentFixture<SpaceSimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpaceSimComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceSimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

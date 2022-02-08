import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SpaceSim } from './space-sim';

@Component({
  selector: 'app-space-sim',
  templateUrl: './space-sim.component.html',
  styleUrls: ['./space-sim.component.css']
})
export class SpaceSimComponent implements OnInit, OnDestroy {
  constructor(private zone: NgZone) { }
  
  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      SpaceSim.start({debug: true});
    });
  }

  ngOnDestroy(): void {
    SpaceSim.stop();
  }
}

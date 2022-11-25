import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SpaceSim } from './game/space-sim';

@Component({
  selector: 'app-space-sim',
  templateUrl: './space-sim.component.html',
  styleUrls: ['./space-sim.component.css']
})
export class SpaceSimComponent implements OnInit, OnDestroy {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    SpaceSim.resize();
  }
  
  constructor(private zone: NgZone) { }
  
  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      SpaceSim.start({
        debug: true
      });
    });
  }

  ngOnDestroy(): void {
    SpaceSim.stop();
  }
}

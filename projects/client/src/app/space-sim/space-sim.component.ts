import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SpaceSimClient } from './game/space-sim-client';

@Component({
  selector: 'app-space-sim',
  templateUrl: './space-sim.component.html',
  styleUrls: ['./space-sim.component.css']
})
export class SpaceSimComponent implements OnInit, OnDestroy {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    SpaceSimClient.resize();
  }
  
  constructor(private zone: NgZone) { }
  
  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      SpaceSimClient.start({
        debug: false,
        loglevel: 'warn'
      });
    });
  }

  ngOnDestroy(): void {
    SpaceSimClient.stop();
  }
}

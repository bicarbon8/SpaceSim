import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SpaceSim } from './space-sim';
import { Globals } from './utilities/globals';

@Component({
  selector: 'app-space-sim',
  templateUrl: './space-sim.component.html',
  styleUrls: ['./space-sim.component.css']
})
export class SpaceSimComponent implements OnInit, OnDestroy {
  private _sim: SpaceSim;

  constructor(private zone: NgZone) { }
  
  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this._sim = new SpaceSim();
      Globals.debug = true;
    });
  }

  ngOnDestroy(): void {
    this._sim.game.destroy(true, true);
    this._sim = null;
  }
}

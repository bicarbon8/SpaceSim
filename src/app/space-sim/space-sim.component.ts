import { Component, OnInit } from '@angular/core';
import { SpaceSim } from './space-sim';
import { Globals } from './utilities/globals';

@Component({
  selector: 'app-space-sim',
  templateUrl: './space-sim.component.html',
  styleUrls: ['./space-sim.component.css']
})
export class SpaceSimComponent implements OnInit {
  private _sim: SpaceSim;

  constructor() { }

  ngOnInit(): void {
    this._sim = new SpaceSim();

    Globals.debug = true;
  }
}

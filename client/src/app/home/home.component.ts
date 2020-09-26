import { Component } from '@angular/core';
import { ClanHistory } from 'src/api/clan-history';
import { DateTime } from 'luxon';
import { environment } from 'src/environments/environment';

@Component({
    templateUrl: './home.component.html'
})
export class HomeComponent {
    histories: ClanHistory[] = [];
    baseUrl = environment.production ? '/' : 'http://localhost:7071/';

    points: { [playerName: string]: { current?: number, cumulative: number } } = {};
    pointsList: {
        playerName: string,
        cumulative: number
    }[] = [];

    constructor() {
        this.init();
    }

    async init() {
        const now = new Date();
        const after = DateTime.local().minus({ weeks: 2 }).toISO();
        this.histories = await (await fetch(`${this.baseUrl}api/histories?after=${after}`)).json();

        for(const h of this.histories){
            for(const p of h.players){
                const playerKey = `${p.name} (${p.tag})`;
                this.points[playerKey] = this.points[playerKey] || { current: null, cumulative: 0 };
                const entry = this.points[playerKey];


                if(entry.current){
                    entry.cumulative += p.achievements[0].value - entry.current;
                }
                entry.current = p.achievements[0].value;
            }
        }

        this.pointsList = [];
        for(const p in this.points){
            this.pointsList.push({ playerName: p, cumulative: this.points[p].cumulative });
        }
        this.pointsList.sort((a,b) => b.cumulative - a.cumulative);

    }
}
import { Component } from '@angular/core';
import { ClanHistory } from 'src/api/clan-history';
import { DateTime } from 'luxon';
import { environment } from 'src/environments/environment';

@Component({
    templateUrl: './home.component.html'
})
export class HomeComponent {
    histories: ClanHistory[] = [];
    leagueRecruits: string[] = [];
    baseUrl = environment.production ? '/' : 'http://localhost:7071/';

    points: { [playerName: string]: { current?: number, cumulative: number, inClan: boolean } } = {};
    pointsList: {
        playerName: string,
        cumulative: number,
        inClan: boolean,
        position?: string
    }[] = [];

    constructor() {
        this.init();
    }

    async init() {
        const after = DateTime.local().minus({ weeks: 2 }).toISO();

        this.leagueRecruits = (await (await fetch(`${this.baseUrl}api/league-recruitments/last`)).json()).recruits;
        this.histories = await (await fetch(`${this.baseUrl}api/histories?after=${after}`)).json();

        for(const h of this.histories){
            let isCurrent = this.histories[this.histories.length - 1] == h;
            for(const p of h.players){
                const playerKey = `${p.name} (${p.tag})`;
                this.points[playerKey] = this.points[playerKey] || { current: null, cumulative: 0, inClan: false };
                const entry = this.points[playerKey];


                if(entry.current){
                    entry.cumulative += p.achievements[0].value - entry.current;
                }
                entry.current = p.achievements[0].value;

                if(isCurrent){
                    entry.inClan = true;
                }
            }
        }

        this.pointsList = [];
        for(const p in this.points){
            const data = this.points[p];
            this.pointsList.push({ 
                playerName: p, 
                cumulative: 
                data.cumulative, 
                inClan: data.inClan
            });
        }
        this.pointsList.sort((a,b) => b.cumulative - a.cumulative);
        
        let number = 1;
        for(let pl of this.pointsList){
            if(pl.inClan){
                pl.position = (number++).toString().padStart(2, '0');
            }
        }
    }
}
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MaterialService {

    data: any = null;

    constructor(private http: HttpClient) {
        lastValueFrom(this.http.get('assets/index.json'))
            .then(json => {
                this.data = json;
            });
    }

    public ready(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.data === null) {
                lastValueFrom(this.http.get('assets/index.json'))
                    .then(json => {
                        this.data = json;
                        resolve(this.data);
                    }).catch(err => {
                    reject(err);
                });
            } else {
                resolve(this.data);
            }
        });
    }
}

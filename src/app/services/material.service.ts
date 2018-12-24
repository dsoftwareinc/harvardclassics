import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MaterialService {

    data: any = null;

    constructor(private http: HttpClient) {
        this.http.get('assets/index.json')
            .toPromise().then(json => {
            this.data = json;
        });
    }

    public ready(): Promise<any> {
        const promise = new Promise((resolve, reject) => {
            if (this.data === null) {
                this.http.get('assets/index.json').toPromise()
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
        return promise;
    }
}

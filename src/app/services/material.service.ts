import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MaterialService {

    private data: any = null;
    private loadPromise: Promise<any> | null = null;

    constructor(private http: HttpClient) {
        this.loadPromise = lastValueFrom(this.http.get('assets/index.json'))
            .then(json => {
                this.data = json;
                return json;
            });
    }

    public ready(): Promise<any> {
        if (this.data !== null) {
            return Promise.resolve(this.data);
        }
        return this.loadPromise!;
    }
}

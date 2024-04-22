import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";

@Injectable({ providedIn: 'root' })
export class FileService {
    private filePath: string = "/assets/data/holidays.txt";

    constructor(private http: HttpClient) {}

    public async readFile(): Promise<any> {
        return await this.http.get(this.filePath, { responseType: 'text' }).toPromise() as string;
    }
}

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {MaterialService} from './material.service';

describe('MaterialService', () => {
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                MaterialService,
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        // Fails the test if any unexpected or duplicate requests were issued.
        httpMock.verify();
    });

    it('requests assets/index.json once on construction', () => {
        TestBed.inject(MaterialService);

        const req = httpMock.expectOne('assets/index.json');
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('resolves ready() with the parsed content after the response arrives', async () => {
        const service = TestBed.inject(MaterialService);
        const payload = {'01-01': {title: 'Day 1'}};

        httpMock.expectOne('assets/index.json').flush(payload);

        await expect(service.ready()).resolves.toEqual(payload);
    });

    it('caches the content so a second ready() issues no further request', async () => {
        const service = TestBed.inject(MaterialService);
        httpMock.expectOne('assets/index.json').flush({a: 1});

        await service.ready();
        const second = await service.ready();

        // No second expectOne / outstanding request — afterEach verify() enforces it.
        expect(second).toEqual({a: 1});
    });
});

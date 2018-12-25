import {Injectable} from '@angular/core';

declare var ga: Function;

@Injectable()
export class AnalyticsProvider {
    constructor() {
    }

    startTrackerWithId(id) {
        ga('create', {
            storage: 'none',
            trackingId: id,
            clientId: localStorage.getItem('ga:clientId')
        });
        ga('set', 'appName', 'HarvardClassics');
        ga('set', 'checkProtocolTask', null);​
        ga('set', 'transportUrl', 'https://www.google-analytics.com/collect');
        ga(function (tracker) {
            if (!localStorage.getItem('ga:clientId')) {
                localStorage.setItem('ga:clientId', tracker.get('clientId'));
            }
        });
    }

    trackView(screenName) {
        ga('send', 'screenview', {
            'screenName': screenName,
        });
    }

    trackEvent(category, action, label?, value?) {
        ga('send', 'event', {
            eventCategory: category,
            eventLabel: label,
            eventAction: action,
            eventValue: value
        });
    }
}
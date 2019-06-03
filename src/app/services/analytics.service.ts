import {Injectable} from '@angular/core';
import {APPLICATION_NAME} from '../../environments/environment';

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
        ga('set', 'appName', APPLICATION_NAME);
        ga('set', 'checkProtocolTask', null);​
        ga('set', 'transportUrl', 'https://www.google-analytics.com/collect');
        ga(function (tracker) {
            if (!localStorage.getItem('ga:clientId')) {
                localStorage.setItem('ga:clientId', tracker.get('clientId'));
            }
        });
    }

    trackView(screenName) {
        if (ga) {
            ga('send', 'screenview', {
                'screenName': screenName,
            });
        }
    }

    trackEvent(category, action, label?, value?) {
        if (ga) {
            ga('send', 'event', {
                eventCategory: category,
                eventLabel: label,
                eventAction: action,
                eventValue: value
            });
        }
    }
}

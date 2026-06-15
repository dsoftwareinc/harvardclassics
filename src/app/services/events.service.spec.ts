import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {Events} from './events.service';

describe('Events', () => {
    let events: Events;

    beforeEach(() => {
        events = new Events();
    });

    describe('subscribe / publish', () => {
        it('invokes a subscribed handler with the published args', () => {
            const handler = vi.fn();
            events.subscribe('topic', handler);

            events.publish('topic', 'a', 1);

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith('a', 1);
        });

        it('invokes every handler subscribed to a topic', () => {
            const h1 = vi.fn();
            const h2 = vi.fn();
            events.subscribe('topic', h1, h2);

            events.publish('topic', 'x');

            expect(h1).toHaveBeenCalledWith('x');
            expect(h2).toHaveBeenCalledWith('x');
        });

        it('returns the array of handler return values', () => {
            events.subscribe('topic', () => 1, () => 2);

            expect(events.publish('topic', 'ignored')).toEqual([1, 2]);
        });

        it('returns null when publishing to a topic with no subscribers', () => {
            expect(events.publish('nobody')).toBeNull();
        });

        it('does not invoke handlers of other topics', () => {
            const other = vi.fn();
            events.subscribe('other', other);

            events.publish('topic');

            expect(other).not.toHaveBeenCalled();
        });
    });

    describe('error isolation', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('catches a throwing handler and still runs the others', () => {
            vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const after = vi.fn().mockReturnValue('ok');
            events.subscribe('topic', () => {
                throw new Error('boom');
            }, after);

            const result = events.publish('topic');

            // The thrown handler contributes a null result; the next handler still runs.
            expect(result).toEqual([null, 'ok']);
            expect(after).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('unsubscribe', () => {
        it('removes a specific handler and returns true', () => {
            const keep = vi.fn();
            const drop = vi.fn();
            events.subscribe('topic', keep, drop);

            expect(events.unsubscribe('topic', drop)).toBe(true);

            events.publish('topic');
            expect(keep).toHaveBeenCalledTimes(1);
            expect(drop).not.toHaveBeenCalled();
        });

        it('returns false when the handler was not subscribed', () => {
            events.subscribe('topic', vi.fn());

            expect(events.unsubscribe('topic', vi.fn())).toBe(false);
        });

        it('returns false when the topic does not exist', () => {
            expect(events.unsubscribe('ghost', vi.fn())).toBe(false);
        });

        it('removing the last handler deletes the topic, so publish returns null', () => {
            const handler = vi.fn();
            events.subscribe('topic', handler);

            events.unsubscribe('topic', handler);

            expect(events.publish('topic')).toBeNull();
        });

        it('without a handler argument deletes the whole topic and returns true', () => {
            events.subscribe('topic', vi.fn(), vi.fn());

            expect(events.unsubscribe('topic')).toBe(true);
            expect(events.publish('topic')).toBeNull();
        });

        it('without a handler returns false when the topic does not exist', () => {
            expect(events.unsubscribe('ghost')).toBe(false);
        });
    });
});

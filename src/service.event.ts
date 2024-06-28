import { Observer, Subject } from 'rxjs';

export class EventService<T = unknown> {
    private subject: Subject<T>;

    constructor() {
        this.subject = new Subject<T>();
    }

    emit(data: T) {
        this.subject.next(data);
    }

    subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void)) {
        return this.subject.asObservable().subscribe(observerOrNext);
    }
}
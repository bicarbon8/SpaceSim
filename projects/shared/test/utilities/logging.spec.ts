import { expect } from "chai";
import { spy, SinonSpy } from "sinon";
import { Logging } from "../../src/utilities/logging"

const consoleSpys = new Array<SinonSpy>();

describe('Logging', () => {
    beforeEach(() => {
        Logging.loglevel = 'warn';
        consoleSpys.splice(0, consoleSpys.length, ...[
            spy(window.console, 'trace'),
            spy(window.console, 'debug'),
            spy(window.console, 'info'),
            spy(window.console, 'warn'),
            spy(window.console, 'error')
        ]);
    })

    afterEach(() => {
        consoleSpys.forEach(spy => spy.restore());
    })

    it('correctly determines if messages should be logged', () => {
        expect(Logging.shouldLog('none')).to.be.false;
        expect(Logging.shouldLog('trace')).to.be.false;
        expect(Logging.shouldLog('debug')).to.be.false;
        expect(Logging.shouldLog('info')).to.be.false;
        expect(Logging.shouldLog('warn')).to.be.true;
        expect(Logging.shouldLog('error')).to.be.true;

        Logging.loglevel = 'debug';

        expect(Logging.shouldLog('none')).to.be.false;
        expect(Logging.shouldLog('trace')).to.be.false;
        expect(Logging.shouldLog('debug')).to.be.true;
        expect(Logging.shouldLog('info')).to.be.true;
        expect(Logging.shouldLog('warn')).to.be.true;
        expect(Logging.shouldLog('error')).to.be.true;
    })

    const logTestData = [
        {global: 'trace', level: 'debug', messages: ['foo'], index: 1, expected: true},
        {global: 'info', level: 'error', messages: ['foo'], index: 4, expected: true},
        {global: 'error', level: 'info', messages: ['foo'], index: 2, expected: false}
    ]

    for (const data of logTestData) {
        it('outputs to the expected console function', () => {
            Logging.loglevel = data.global as Logging.LogLevel;

            Logging.log(data.level as Logging.LogLevel, ...data.messages);

            expect(consoleSpys[data.index].called).to.eq(data.expected);
        })
    }
})
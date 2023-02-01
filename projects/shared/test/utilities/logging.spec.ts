import { expect } from "chai";
import { mock } from "sinon";
import { Logging } from "../../src/utilities/logging"

describe('Logging', () => {
    beforeEach(() => {
        Logging.loglevel = 'warn';
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
        {global: 'trace', level: 'debug', messages: ['foo'], expected: true},
        {global: 'info', level: 'error', messages: ['foo'], expected: true},
        {global: 'error', level: 'info', messages: ['foo'], expected: false}
    ]

    for (const data of logTestData) {
        it(`${data.expected}: outputs '${JSON.stringify(data.messages)}' to the expected console function: '${data.level}'`, () => {
            const consoleMock = mock(window.console);
            if (data.expected) {
                consoleMock.expects(data.level).calledOnce;
            } 
            
            Logging.loglevel = data.global as Logging.LogLevel;

            Logging.log(data.level as Logging.LogLevel, ...data.messages);

            consoleMock.verify();
        })
    }
})
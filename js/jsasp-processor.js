/* jsasp param */
const jsaspParam = {
    'ingain': 0.0,
    'outgain': 0.0,
    'inmode': 0.0,
    'outmode': 0.0,
    'freq': 100.0,

    // For Signal Processing
    'bypass': 0.0,
    'distortion' : 0.5,
};

/**
 * process_main
 * @brief function for your own signal processing 
 * @param ch0:Lch, ch1:Rch, info:info obj, param:param obj
 * @return
 */
function process_main(ch0, ch1, info, param)
{
    if(param.bypass === 1.0) {
        return;
    }

    // signal processing

    // distortion (example)
    let distortion = param.distortion;
    let invDistrtion = 0.5 / param.distortion;

    for (let i = 0; i < info.samplecount; ++i) {
        if(ch0[i] > distortion) {
            ch0[i] = distortion;
        }
        if(ch0[i] < -distortion) {
            ch0[i] = -distortion;
        }
        ch0[i] *= invDistrtion;

        if(ch1[i] > distortion) {
            ch1[i] = distortion;
        }
        if(ch1[i] < -distortion) {
            ch1[i] = -distortion;
        }
        ch1[i] *= invDistrtion;
    }
}

/* You must not change the following codes */

/**
 * JsaspProcessor
 * @brief signal processing class
 * @param
 * @return
 */
class JsaspProcessor extends AudioWorkletProcessor {
    jsaspIn = new Float32Array(2);
    jsaspOut = new Float32Array(2);
    jsaspBufIn0 = new Float32Array(100);
    jsaspBufIn1 = new Float32Array(100);
    jsaspBufOut0 = new Float32Array(100);
    jsaspBufOut1 = new Float32Array(100);
    jsaspBufTest = new Float32Array(32);
    processStart = false;

    constructor(options) {
        super();

        // params
        this.msgCount = 0;
        this.param = jsaspParam;
        this.param.messageCaption = 'param';
        this.port.postMessage(this.param);
        this.info = {
            messageCaption: 'info',
            fs: 0,
            chcount: 0,
            samplecount: 0,
            sineCount: 0,
            jsaspIn: this.jsaspIn,
            jsaspOut: this.jsaspOut,
            jsaspBufIn0: this.jsaspBufIn0,
            jsaspBufIn1: this.jsaspBufIn1,
            jsaspBufOut0: this.jsaspBufOut0,
            jsaspBufOut1: this.jsaspBufOut1,
            jsaspBufTest: this.jsaspBufTest
        };
        for(let i=0; i<this.info.jsaspIn.length; i++) {
            this.info.jsaspIn[i] = 0.0;
        }
        for(let i=0; i<this.info.jsaspOut.length; i++) {
            this.info.jsaspOut[i] = 0.0;
        }
        for(let i=0; i<this.info.jsaspBufIn0.length; i++) {
            this.info.jsaspBufIn0[i] = 0.0;
        }
        for(let i=0; i<this.info.jsaspBufIn1.length; i++) {
            this.info.jsaspBufIn1[i] = 0.0;
        }
        for(let i=0; i<this.info.jsaspBufOut0.length; i++) {
            this.info.jsaspBufOut0[i] = 0.0;
        }
        for(let i=0; i<this.info.jsaspBufOut1.length; i++) {
            this.info.jsaspBufOut1[i] = 0.0;
        }
        for(let i=0; i<this.info.jsaspBufTest.length; i++) {
            this.info.jsaspBufTest[i] = i;
        }

        // port message from main
        this.port.onmessage = ({data}) => {
            // Get message from main
            let params = data.split(' ');
            if(params[0] === 'PUT') {
                for (const property in this.param) {
                    if(params[1] === property) {
                        this.param[property] = parseFloat(params[2]);
                        if(this.param[property] === NaN) {
                            this.param[property] = 0.0;
                        }
                    }
                }
            }
            if(params[0] === 'GET') {
                for (const property in this.param) {
                    if(params[1] === property) {
                        this.senddata = new Object();
                        this.senddata.messageCaption = 'send';
                        this.senddata.name = property;
                        this.senddata.param = this.param[property];
                        this.port.postMessage(this.senddata);  // return to main
                    }
                }
            }
        };
    }
    static get parameterDescriptors () {
        return [
            {
                name: 'notdefined',
                defaultValue: 0,
            },
        ];
    }
    process(inputs, outputs, parameters) {
        let input = inputs[0];
        let output = outputs[0];

        // info
        this.info.fs = sampleRate;
        this.info.chcount = input.length;
        if(this.info.chcount === 0) {
            this.processStart = false;
            return true;
        }

        this.info.samplecount = input[0].length;
        if(this.processStart === false) {
            this.audioInfo = {};
            this.audioInfo.messageCaption = 'AudioInfo',
            this.audioInfo.fs = this.info.fs;
            this.audioInfo.chcount = this.info.chcount;
            this.audioInfo.samplecount = this.info.samplecount;
            this.port.postMessage(this.audioInfo);
            this.processStart = true;
        }

        if(this.param.mode == 2.0) {
            this.param.gain = 0.0;
        }

        let ch0 = new Float32Array(this.info.samplecount);
        let ch1 = new Float32Array(this.info.samplecount);

        // input data
        let inputChannel = input[0];
        for (let i = 0; i < this.info.samplecount; ++i) {
            ch0[i] = inputChannel[i];
        }

        if(this.info.chcount > 1) {
            inputChannel = input[1];
            for (let i = 0; i < this.info.samplecount; ++i) {
                ch1[i] = inputChannel[i];
            }
        }
        else {
            for (let i = 0; i < this.info.samplecount; ++i) {
                ch1[i] = 0.0;
            }
        }

        let inputdata0 = 0.0;
        let inputdata1 = 0.0;
        if(this.param.inmode == 0.0) {
            // Through
            for (let i = 0; i < this.info.samplecount; ++i) {
                ch0[i] *= this.param.ingain;
                ch1[i] *= this.param.ingain;
                inputdata0 = Math.max(inputdata0, Math.abs(ch0[i]));
                inputdata1 = Math.max(inputdata1, Math.abs(ch1[i]));
                if(this.info.jsaspBufIn0.length > i) {
                    this.info.jsaspBufIn0[i] = ch0[i];
                    this.info.jsaspBufIn1[i] = ch1[i];
                }
            }
        }
        else if(this.param.inmode == 1.0) {
            // OSC
            for (let i = 0; i < this.info.samplecount; ++i) {
                let audiodata = Math.sin(Math.PI * 2 * this.param.freq * (this.info.sineCount + i) / 48000) * this.param.ingain;
                ch0[i] = audiodata;
                ch1[i] = audiodata;
                inputdata0 = Math.max(inputdata0, Math.abs(ch0[i]));
                inputdata1 = Math.max(inputdata1, Math.abs(ch1[i]));
                if(this.info.jsaspBufIn0.length > i) {
                    this.info.jsaspBufIn0[i] = ch0[i];
                    this.info.jsaspBufIn1[i] = ch1[i];
                }
            }
        }
        else if(this.param.inmode == 2.0) {
            // Noise
            for (let i = 0; i < this.info.samplecount; ++i) {
                let audiodata = (Math.random() * 2 - 1)  * this.param.ingain;
                ch0[i] = audiodata;
                ch1[i] = audiodata;
                inputdata0 = Math.max(inputdata0, Math.abs(ch0[i]));
                inputdata1 = Math.max(inputdata1, Math.abs(ch1[i]));
                if(this.info.jsaspBufIn0.length > i) {
                    this.info.jsaspBufIn0[i] = ch0[i];
                    this.info.jsaspBufIn1[i] = ch1[i];
                }
            }
        }
        else {
            // Mute
            for (let i = 0; i < this.info.samplecount; ++i) {
                ch0[i] = 0.0;
                ch1[i] = 0.0;
                inputdata0 = Math.max(inputdata0, Math.abs(ch0[i]));
                inputdata1 = Math.max(inputdata1, Math.abs(ch1[i]));
                if(this.info.jsaspBufIn0.length > i) {
                    this.info.jsaspBufIn0[i] = ch0[i];
                    this.info.jsaspBufIn1[i] = ch1[i];
                }
            }
        }
        this.info.jsaspIn[0] = inputdata0;
        this.info.jsaspIn[1] = inputdata1;

        // signal processing
        process_main(ch0, ch1, this.info, this.param);

        // output data
        if(this.param.outmode == 0.0) {
            // Through
            for (let i = 0; i < this.info.samplecount; ++i) {
                ch0[i] *= this.param.outgain;
                ch1[i] *= this.param.outgain;
            }
        }
        else if(this.param.outmode == 1.0) {
            // OSC
            for (let i = 0; i < this.info.samplecount; ++i) {
                let audiodata = Math.sin(Math.PI * 2 * this.param.freq * (this.info.sineCount + i) / 48000) * this.param.outgain;
                ch0[i] = audiodata;
                ch1[i] = audiodata;
            }
        }
        else if(this.param.outmode == 2.0) {
            // Noise
            for (let i = 0; i < this.info.samplecount; ++i) {
                let audiodata = (Math.random() * 2 - 1)  * this.param.outgain;
                ch0[i] = audiodata;
                ch1[i] = audiodata;
            }
        }
        else {
            // Mute
            for (let i = 0; i < this.info.samplecount; ++i) {
                ch0[i] = 0.0;
                ch1[i] = 0.0;
            }
        }
        // audio data sample
        let outputChannel = output[0];
        let outputdata = 0.0;
        for (let i = 0; i < this.info.samplecount; ++i) {
            let tmpdata = ch0[i];
            outputChannel[i] = tmpdata;
            if(this.info.jsaspBufOut0.length > i) {
                this.info.jsaspBufOut0[i] = tmpdata;
            }
            outputdata = Math.max(outputdata, Math.abs(tmpdata));
        }
        this.info.jsaspOut[0] = outputdata;

        if(this.info.chcount > 1) {
            outputChannel = output[1];
            outputdata = 0.0;
            for (let i = 0; i < this.info.samplecount; ++i) {
                let tmpdata = ch1[i];
                outputChannel[i] = tmpdata;
                if(this.info.jsaspBufOut1.length > i) {
                    this.info.jsaspBufOut1[i] = tmpdata;
                }
                outputdata = Math.max(outputdata, Math.abs(tmpdata));
            }
            this.info.jsaspOut[1] = outputdata;
        }

        // post calc
        this.msgCount += this.info.samplecount;
        this.info.sineCount += this.info.samplecount;
        let countbase = parseInt(this.info.fs / 50);
        if(this.msgCount > countbase) {
            this.port.postMessage(this.info);
            this.msgCount -= countbase;
        }
        if(this.info.sineCount > this.info.fs) {
            this.info.sineCount -= this.info.fs;
        }

        return true;
    }
}

registerProcessor("jsasp-processor", JsaspProcessor);

navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var audioElt = null;
var audioSourceNode = null;
var audioProcessNode = null; 
var analyserNode = null;
var isAudioReady = false;
var isAudioSourceReady = false;
var isAudioProcessReady = false;

var dataArray = [];
var selfile;

var audioInfo = {
    caption: 'none',
    fs: 0,
    chcount: 0,
    samplecount: 0,
    jsaspIn: 0,
    jsaspOut: 0,
    jsaspBufIn0: 0,
    jsaspBufIn1: 0,
    jsaspBufOut0: 0,
    jsaspBufOut1: 0,
    jsaspBufTest: 0
};


var freqData = new Float32Array(100);
var formCount = 0;
var waitSize = 5;
/**
 * formView
 * @brief repeat callback function for redrawing
 * @param
 * @return
 */
function formView() {
    formCount++
    if(formCount >= waitSize) {
        if(isAudioReady === true) {
            analyserNode.getFloatFrequencyData(dataArray);
            for(let i=0;i<freqData.length;i++) {
                freqData[i] = dataArray[i];
            }
            for (let i = jsaspGuiObj.length - 1; i >= 0; i--) {
                if(jsaspGuiObj[i].type === 'disp') {
                    switch(jsaspGuiObj[i].valObj) {
                        case 'in1':
                            jsaspGuiObj[i].setValue(audioInfo.jsaspBufIn1);
                            break;
                        case 'out0':
                            jsaspGuiObj[i].setValue(audioInfo.jsaspBufOut0);
                            break;
                        case 'out1':
                            jsaspGuiObj[i].setValue(audioInfo.jsaspBufOut1);
                            break;
                        default:
                        case 'in0':
                            jsaspGuiObj[i].setValue(audioInfo.jsaspBufIn0);
                            break;
                    }
                    jsaspGuiObj[i].view();
                }
                if(jsaspGuiObj[i].type === 'fft') {
                    jsaspGuiObj[i].setValue(freqData);
                    jsaspGuiObj[i].view();
                }
                if(jsaspGuiObj[i].type === 'meter_h') {
                    switch(jsaspGuiObj[i].valObj) {
                        case 'in1':
                            jsaspGuiObj[i].setValue(20.0 * Math.log10(audioInfo.jsaspIn[1]));
                            break;
                        case 'out0':
                            jsaspGuiObj[i].setValue(20.0 * Math.log10(audioInfo.jsaspOut[0]));
                            break;
                        case 'out1':
                            jsaspGuiObj[i].setValue(20.0 * Math.log10(audioInfo.jsaspOut[1]));
                            break;
                        default:
                        case 'in0':
                            jsaspGuiObj[i].setValue(20.0 * Math.log10(audioInfo.jsaspIn[0]));
                            break;
                    }
                    jsaspGuiObj[i].view();
                }
            }
        }
        else {
            for (let i = jsaspGuiObj.length - 1; i >= 0; i--) {
                if(jsaspGuiObj[i].type === 'disp') {
                    for(let i=0; i<audioInfo.jsaspBufIn0.length; i++) {
                        audioInfo.jsaspBufIn0[i] = 0.0;
                    }
                    jsaspGuiObj[i].setValue(audioInfo.jsaspBufIn0);
                    jsaspGuiObj[i].view();
                }
                if(jsaspGuiObj[i].type === 'fft') {
                    for(let i=0; i<audioInfo.jsaspBufIn0.length; i++) {
                        audioInfo.jsaspBufIn0[i] = 0.0;
                    }
                    jsaspGuiObj[i].setValue(audioInfo.jsaspBufIn0);
                    jsaspGuiObj[i].view();
                }
                if(jsaspGuiObj[i].type === 'meter_h') {
                    jsaspGuiObj[i].setValue(-120);
                    jsaspGuiObj[i].view();
                }
            }
        }
        formCount = 0;
    }
    // Conditions with this callback functions
    // Call itself (callback function) using requestAnimationFrame() (repeatedly)
    requestAnimationFrame(formView);
}

/**
 * audioInputMicSetup
 * @brief audio input(Mic) setup
 * @param
 * @return
 */
async function audioInputMicSetup() {
    isAudioSourceReady = false;
    if(audioSourceNode){
        audioSourceNode.disconnect();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (navigator.getUserMedia) {
        await navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((stream) => {
           audioSourceNode = new MediaStreamAudioSourceNode(audioCtx, {
            mediaStream: stream,
          });
          isAudioSourceReady = true;
        })
        .catch((err) => {
            jsaspLog(`The following error occurred: ${err}`);
        });
    }
}

/**
 * audioInputFileSetup
 * @brief audio file playing setup
 * @param
 * @return
 */
async function audioInputFileSetup(file) {
    isAudioSourceReady = false;
    if(audioSourceNode){
        audioSourceNode.disconnect();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if(audioElt){
        audioElt.pause();
    }
    audioElt = new Audio();
    selfile = file;
    audioElt.src = selfile;
    const reader = new FileReader();
    reader.onload = () => {
        var arrayBuffer = reader.result;
        decode(arrayBuffer);
    };
    reader.readAsArrayBuffer(selfile);

    // decode process
    function decode(arrayBuffer) {
        audioCtx.decodeAudioData(arrayBuffer, function(audioBuffer) {
            audioSourceNode = audioCtx.createBufferSource();
            audioSourceNode.buffer = audioBuffer;
            !audioSourceNode?.start();  // it it needed fo decode
            isAudioSourceReady = true;
        });
    };
    while (true) {
        if(isAudioSourceReady != true) {
            await sleep(100);  // 100ms
        }
        else {
            break;
        }
    }
}

/**
 * sleep
 * @brief sleep (msec)
 * @param
 * @return
 */
function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

/**
 * audioOutputSetup
 * @brief audio output setup + processing
 * @param
 * @return
 */
async function audioOutputSetup() {
    isAudioProcessReady = null;
    if(audioProcessNode){
        audioProcessNode.disconnect();
    }

    // AudioWorklet
    await audioCtx.audioWorklet.addModule("js/jsasp-processor.js");

    if(audioProcessNode){
        audioProcessNode.disconnect();
    }
    audioProcessNode = new AudioWorkletNode(audioCtx, "jsasp-processor");
    audioProcessNode.port.onmessage = ({data}) => {
        // Get message from jsasp
        if(data.messageCaption === 'info') {
            audioInfo = data;
        }
        else {
            let txt = data.messageCaption
            txt += ' -> ';
            txt += JSON.stringify(data);
            jsaspLog(txt);
        }
    };
    isAudioProcessReady = true;
}

/**
 * audioPlayStart
 * @brief audio start (external control trigger may call this function)
 * @param
 * @return
 */
function audioPlayStart() {
    if((isAudioSourceReady === true) && (isAudioProcessReady === true)) {
        audioSetup();
    }
    else {
        jsaspLog("Audio is not ready");
    }
}

/**
 * audioPlayStop
 * @brief audio stop (external control trigger may call this function)
 * @param
 * @return
 */
function audioPlayStop() {
    if((isAudioSourceReady === true) && (isAudioProcessReady === true)) {
        isAudioProcessReady = null;
        if(audioSourceNode){
            audioSourceNode.disconnect();
        }
        if(audioProcessNode){
            audioProcessNode.disconnect();
        }
        if(analyserNode){
            analyserNode.disconnect();
        }
        if(audioCtx) {
            audioCtx.suspend();
        }
    }
    else {
        jsaspLog("Audio have been stopped");
    }
    isAudioReady = false;
}

/**
 * audioSetup
 * @brief audio setup + FFT setup
 * @param
 * @return
 */
function audioSetup() {
    // FFT
    if(analyserNode){
        analyserNode.disconnect();
    }
    analyserNode = audioCtx.createAnalyser();

    analyserNode.fftSize = 256;
    var bufferLength = analyserNode.frequencyBinCount;
    dataArray = new Float32Array(bufferLength);

    // audio node connest to the AnalyserNode
    audioSourceNode.connect(audioProcessNode);
    audioProcessNode.connect(audioCtx.destination);
    audioProcessNode.connect(analyserNode);
    isAudioReady = true;

    // get current value of UI control data
    for(let i=0; i<jsaspGuiObj.length; i++) {
        jsaspSetParam(i);
    }
}

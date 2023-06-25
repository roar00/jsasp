/**
 * addEventListener:DOMContentLoaded
 * @brief main function
 * @param
 * @return
 */
document.addEventListener('DOMContentLoaded', function(){
    init();
});

/**
 * init
 * @brief initialize
 * @param
 * @return
 */
async function init() {
    jsaspGuiObj = new Array(jsaspGuiParts);

    createCanvas();
    createCanvasGuis(jsaspGuiData);

    // function for display updates at regular intervals
    formView();
}

/**
 * addEventListener:change (file-btn)
 * @brief audio file open
 * @param
 * @return
 */
const openfile = document.querySelector('#file-btn');
openfile.addEventListener('change', function(e) {
    let input = e.target;
    if (input.files.length == 0) {
        return;
    }
    filePlay(input.files[0]);
});

/**
 * addEventListener:click (file-btn)
 * @brief delete audio file after change function
 * @param
 * @return
 */
openfile.addEventListener('click', function(e) {
    e.target.value = '';
});

/**
 * addEventListener:click (play-btn)
 * @brief audio I/F play
 * @param
 * @return
 */
document.getElementById('play-btn').addEventListener('click', () => {
     micPlay();
});

/**
 * addEventListener:click (stop-btn)
 * @brief audio stop
 * @param
 * @return
 */
document.getElementById('stop-btn').addEventListener('click', () => {
    audioPlayStop();
});

/**
 * addEventListener:click (save-btn)
 * @brief audio file setup and start
 * @param
 * @return
 */
document.getElementById('save-btn').addEventListener('click', () => {
    const fileName = "jsasp.json";
    const data = JSON.stringify(jsaspGuiObj);
    const blob = new Blob([data], { type: 'application/json' });

    let dummyLink = document.createElement('a');
    dummyLink.href = window.URL.createObjectURL(blob);
    dummyLink.download = fileName;

    dummyLink.click();
});

/**
 * addEventListener:click (load-btn)
 * @brief audio file setup and start
 * @param
 * @return
 */
const loadfile = document.querySelector('#load-btn');
loadfile.addEventListener( 'change', function(e) {
    var result = e.target.files[0];
    var reader = new FileReader();

    reader.readAsText(result);
    reader.addEventListener('load', function() {
      const jsaspGuiDataNew = JSON.parse(reader.result);
      createCanvasGuis(jsaspGuiDataNew);
    });
});

/**
 * micPlay
 * @brief audio I/F setup and start
 * @param
 * @return
 */
async function micPlay()
{
    await audioInputMicSetup();
    await audioOutputSetup();
    audioPlayStart();
}

/**
 * filePlay
 * @brief audio file setup and start
 * @param
 * @return
 */
async function filePlay(file)
{
    await audioInputFileSetup(file);
    await audioOutputSetup();
    audioPlayStart();
}

/**
 * jsaspMsg
 * @brief send message to AudioWorkletProcessor
 * @param
 * @return
 */
function jsaspMsg(...command)
{
    if((isAudioSourceReady !== true) | (isAudioProcessReady !== true)) {
        return;
    }
    let count = 0;
    let com = '';
    command.forEach(element => {
        count++;
        com = com + element + ' ';
    });
    if(count > 0) {
        audioProcessNode.port.postMessage(com);
    }
}

/**
 * jsaspLog
 * @brief log output to textarea(and console)
 * @param
 * @return
 */
function jsaspLog(txt)
{
    console.log(txt);
    log.value += '\n' + txt;
    // Scroll to latest log
    var textarea = document.getElementById('log');
    textarea.scrollTop = textarea.scrollHeight;
}

/**
 * jsaspSetParam
 * @brief send message to class when GUI controls are modified 
 * @param
 * @return
 */
function jsaspSetParam(num)
{
    // message to AudioWorkletProcessor, the value is translated from control data
    if(num === 0) {
        let data = jsaspGuiObj[num].getCalcValue();
        let params = data.split(' ');
        if(params[0] === 'RESET' || params[0] === 'reset') {
            createCanvasGuis(jsaspGuiData);
        }
        if(params[0] === 'GET') {
            jsaspMsg(data);
        }
        jsaspGuiObj[num].setValue('None');
    }
    if(num === 1) {
        let ingain = Math.pow(10, jsaspGuiObj[num].getCalcValue()/20);
        jsaspMsg('PUT ingain', ingain);
    }
    if(num === 2) {
        let outgain = Math.pow(10, jsaspGuiObj[num].getCalcValue()/20);
        jsaspMsg('PUT outgain', outgain);
    }
    if(num === 3) {
        let inmode = jsaspGuiObj[num].getCalcValue();
        jsaspMsg('PUT inmode', inmode);
        // Send to overwrite gain data
        let ingain = Math.pow(10, jsaspGuiObj[1].getCalcValue()/20);
        jsaspMsg('PUT ingain', ingain);
        let outgain = Math.pow(10, jsaspGuiObj[2].getCalcValue()/20);
        jsaspMsg('PUT outgain', outgain);
    }
    if(num === 4) {
        let outmode = jsaspGuiObj[num].getCalcValue();
        jsaspMsg('PUT outmode', outmode);
        // Send to overwrite gain data
        let ingain = Math.pow(10, jsaspGuiObj[1].getCalcValue()/20);
        jsaspMsg('PUT ingain', ingain);
        let outgain = Math.pow(10, jsaspGuiObj[2].getCalcValue()/20);
        jsaspMsg('PUT outgain', outgain);
    }
    if(num === 5) {
        let bypass = jsaspGuiObj[num].getCalcValue();
        jsaspMsg('PUT bypass', bypass);
    }
    if(num === 6) {
        let freq = jsaspGuiObj[num].getCalcValue();
        jsaspMsg('PUT freq', freq);
    }
    if(num === 7) {
        let distortion = jsaspGuiObj[num].getCalcValue();
        jsaspMsg('PUT distortion', distortion);
    }
}

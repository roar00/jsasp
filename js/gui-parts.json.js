/* toal count of GUI parts */
const jsaspGuiParts = 20;
/* Canvas size */
const jsaspGuiCanvasWidth  = 500;
const jsaspGuiCanvasHeight = 500;

/*
    TYPE:
        text
        switch
        slide_v
        slide_h
        nob
        meter_h
        disp
        fft
*/
const jsaspGuiData = [
    {  // num = 0
        'type' : 'text',
        'caption' : 'Command',
        'offsetX' : 0,
        'offsetY' : 0,
        'valLabel': ['None'],
        'valPrompt': ['Command? (reset/GET [param name])'],
    },
    {  // num = 1
        'type' : 'nob',
        'caption': 'Input Gain',
        'offsetX': 100,
        'offsetY': 0,
        'valMin' : -120,
        'valMax' : 0,
        'valInit' : 0,
    },
    {  // num = 2
        'type' : 'nob',
        'caption': 'Master Volume',
        'offsetX': 200,
        'offsetY': 0,
        'valMin' : -120,
        'valMax' : 0,
        'valInit' : -40,
    },
    {  // num = 3
        'type' : 'switch',
        'caption' : 'Input',
        'offsetX' : 100,
        'offsetY' : 100,
        'valMin'  : 0,
        'valMax'  : 3,
        'valLabel': ['Through', 'OSC', 'Noise', 'Mute'],
        'valInit' : 0,
    },
    {  // num = 4
        'type' : 'switch',
        'caption' : 'Output',
        'offsetX' : 200,
        'offsetY' : 100,
        'valMin'  : 0,
        'valMax'  : 3,
        'valLabel': ['Through', 'OSC', 'Noise', 'Mute'],
        'valInit' : 0,
    },
    {  // num = 5
        'type' : 'switch',
        'caption' : 'Bypass',
        'offsetX' : 300,
        'offsetY' : 100,
        'valMin'  : 0,
        'valMax'  : 1,
        'valLabel': ['Processing', 'Bypass'],
        'valInit' : 1,
    },
    {  // num = 6
        'type' : 'slide_h',
        'caption': 'Sine',
        'offsetX': 300,
        'offsetY': 0,
        'valMin' : 100,
        'valMax' : 10000,
        'valInit' : 1000,
    },
    {  // num = 7
        'type' : 'slide_v',
        'caption': 'Distortion',
        'offsetX': 400,
        'offsetY': 0,
        'valMin' : 0.01,
        'valMax' : 1.0,
        'valInit' : 0.1,
    },
    {
        'type' : 'disp',
        'caption': 'in0',
        'offsetX': 100,
        'offsetY': 300,
        'valObj' : 'in0',
    },
    {
        'type' : 'disp',
        'caption': 'in1',
        'offsetX': 100,
        'offsetY': 400,
        'valObj' : 'in1',
    },
    {
        'type' : 'meter_h',
        'caption': 'in0',
        'offsetX': 200,
        'offsetY': 300,
        'valMin' : -120,
        'valMax' : 20,
        'valObj' : 'in0',
        'valLabel': ['in0'],
    },
    {
        'type' : 'meter_h',
        'caption': 'in1',
        'offsetX': 200,
        'offsetY': 400,
        'valMin' : -120,
        'valMax' : 20,
        'valLabel': ['in1'],
    },
    {
        'type' : 'disp',
        'caption': 'out0',
        'offsetX': 300,
        'offsetY': 300,
        'valObj' : 'out0',
    },
    {
        'type' : 'disp',
        'caption': 'out1',
        'offsetX': 300,
        'offsetY': 400,
        'valObj' : 'out1',
    },
    {
        'type' : 'meter_h',
        'caption': 'out0',
        'offsetX': 400,
        'offsetY': 300,
        'valMin' : -120,
        'valMax' : 20,
        'valObj' : 'out0',
        'valLabel': ['out0'],
    },
    {
        'type' : 'meter_h',
        'caption': 'out1',
        'offsetX': 400,
        'offsetY': 400,
        'valMin' : -120,
        'valMax' : 20,
        'valObj' : 'out1',
        'valLabel': ['out1'],
    },
    {
        'type' : 'fft',
        'caption': 'Output FFT',
        'offsetX': 300,
        'offsetY': 200,
    },
];

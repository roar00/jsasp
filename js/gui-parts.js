var jsaspGui_preventEvent = false;
var jsaspGuiObj;

class canvasGui {
    type;
    offsetX;  // canvas position offset X
    offsetY;  // canvas position offset Y
    width;    // width of UI : default 100
    height;   // height of UI : default 100
    scale;    // not supported

    isDragging;
    isFreeze;
    percent;  // percrntage of this control

    caption;
    infomatinon;

    valMin;
    valMax;
    valCalc;  // exact value related to percentage/min/max
    valLabel;
    valObj;

    constructor(o) {
        // initialize
        this.type    = 'none';
        this.offsetX = 0;
        this.offsetY = 0;
        this.width  = 100; 
        this.height = 100;
        this.scale  = 1.0;

        this.isDragging = false;
        this.isFreeze = false;
        this.percent = 0.0;

        this.caption = 'none';
        this.infomatinon = 'none';

        this.valMin = 0.0;
        this.valMax = 1.0;
        this.valCalc = 0.0;

        this.valLabel  = ['None'];
        this.valObj = 0.0;

        // refer to json parameters
        if(typeof o['type'] !== "undefined") {
            this.type = o['type'];
        }
        if(typeof o['caption'] !== "undefined") {
            this.caption = o['caption'];
            jsaspLog('caption: '+this.caption);
        }
        if(typeof o['offsetX'] !== "undefined") {
            this.offsetX = parseFloat(o['offsetX']);
        }
        if(typeof o['offsetY'] !== "undefined") {
            this.offsetY = parseFloat(o['offsetY']);
        }
        //if(typeof o['scale'] !== "undefined") {
        //    this.scale = o['scale'];
        //}
        if(typeof o['valMin'] !== "undefined") {
            this.valMin = parseFloat(o['valMin']);
        }
        if(typeof o['valMax'] !== "undefined") {
            this.valMax = parseFloat(o['valMax']);
        }
        if(typeof o['valLabel'] !== "undefined") {
            this.valLabel = o['valLabel'];
        }
        if(typeof o['valObj'] !== "undefined") {
            this.valObj = o['valObj'];
        }
        if(typeof o['valInit'] !== "undefined") {
            this.valCalc = parseFloat(o['valInit']);
            this.percent = this.valToPercent(this.valCalc);
        }
        if(typeof o['valCalc'] !== "undefined") {
            this.valCalc = parseFloat(o['valCalc']);
            this.percent = this.valToPercent(this.valCalc);
        }
    }
    initView() {
        // Drawing initialization. common in parts
        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');
        ctx.clearRect(this.offsetX, this.offsetY, this.width, this.height);

        // frame display
        ctx.beginPath();
        ctx.lineWidth = 4.0;
        let lg = ctx.createLinearGradient(this.offsetX, this.offsetY, this.offsetX + this.width, this.offsetY + this.height);
        lg.addColorStop(0,'#C0C0C0');
        lg.addColorStop(1,'#A0A0A0');
        ctx.strokeStyle = lg;
        ctx.strokeRect(this.offsetX, this.offsetY, this.width, this.height);

        // freeze button
        ctx.beginPath();
        ctx.fillStyle = '#40A0FF';
        ctx.strokeStyle= '#C0C0C0';
        ctx.lineWidth = 2;
        ctx.fillRect(this.offsetX + this.width * 0.9, this.offsetY + this.height * 0.1, this.width * 0.1, this.height * 0.1);
        ctx.strokeRect(this.offsetX + this.width * 0.9, this.offsetY + this.height * 0.1, this.width * 0.1, this.height * 0.1);
        ctx.fill();
        ctx.stroke();

        // direct set button
        ctx.beginPath();
        ctx.fillStyle = '#FFFF00';
        ctx.strokeStyle= '#C0C0C0';
        ctx.lineWidth = 2;
        ctx.fillRect(this.offsetX + this.width * 0.9, this.offsetY + this.height * 0.8, this.width * 0.1, this.height * 0.1);
        ctx.strokeRect(this.offsetX + this.width * 0.9, this.offsetY + this.height * 0.8, this.width * 0.1, this.height * 0.1);
        ctx.fill();
        ctx.stroke();

        // caption
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace italic';
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle';
        ctx.fillText(this.caption, this.offsetX + this.width*0.5, this.offsetY + 10);
    }
    view() {
        // this function may override by each extends
        this.initView();
    }
    click(x, y) {
        // this function may override by each extends
    }
    move(x, y) {
        // this function may override by each extends
    }
    unclick(x, y) {
        // this function may override by each extends
    }
    setValue(...args) {
        // this function may override by each extends
    }
    getCalcValue() {
        // get current value
        return this.valCalc;
    }
    minmaxToVal(val_percent) {
        // calculation current value refer to min, max and percentage
        let calc = ((this.valMax - this.valMin) / 100.0) * val_percent + this.valMin;
        return calc;
    }
    valToPercent(val) {
        // calculation current percentage from current value
        let calc = 100.0 * (val - this.valMin) / (this.valMax - this.valMin);
        if(calc < 0.0) {
            calc = 0.0;
        }
        if(calc > 100.0) {
            calc = 100;
        }
        return calc;
    }
    clickFreeze(x, y) {
        // Do what happens when Freeze is clicked. Pause parameter changes
        // x,y : Coordinates clicked. From the center point of the part to the position
        let f_x = this.width * (0.9 - 0.5);
        let f_y = this.height * (0.1 - 0.5);
        let freezeClicked = false;
        if( (f_x < x) && (x < (f_x + this.width * 0.1)) && (f_y < y) && (y < (f_y + this.height * 0.1)) ) {
            // freeze button clicked
            let check = false;
            freezeClicked = true;
            if(this.isFreeze === true) {
                check = confirm('unFreeze ' + this.caption + ' ?');
            }
            else {
                check = confirm('Freeze ' + this.caption + ' ?');
            }
            if(check === true) {
                this.isFreeze = !this.isFreeze;
            }
            // Skip the event immediately after because it malfunctions
            this.isDragging = false;
            jsaspGui_preventEvent = true;
        }
        return freezeClicked;
    }
    clickDirect(x, y) {
        // Do what happens when you click Direct. You can enter the value directly
        // x,y : Coordinates clicked. From the center point of the part to the position
        let f_x = this.width * (0.9 - 0.5);
        let f_y = this.height * (0.8 - 0.5);
        let directClicked = false;
        if( (f_x < x) && (x < (f_x + this.width * 0.1)) && (f_y < y) && (y < (f_y + this.height * 0.1)) ) {
            // direct button clicked
            directClicked = true;
            let val = prompt('Direct value set?', this.valCalc);
            if(val !== null) {
                let f_val = parseFloat(val);
                if( (f_val < this.valMin) || (this.valMax < f_val) ) {
                    alert('value out of range');
                }
                else {
                    this.valCalc = f_val;
                    this.percent = this.valToPercent(f_val);
                }
                console.log(val);
            }
            // Skip the event immediately after because it malfunctions
            this.isDragging = false;
            jsaspGui_preventEvent = true;
        }
        return directClicked;
    }
}

/**
 * canvasGui_text
 * @brief Text display part
 * @brief Change view when clicked
 */
class canvasGui_text extends canvasGui {
    prompt;

    constructor(o) {
        super(o);
        if(typeof o['valPrompt'] !== "undefined") {
            this.prompt = o['valPrompt'];
        }
        else {
            this.prompt = 'None';
        }
        this.view();
    }
    view() {
        this.initView();

        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');

        ctx.beginPath();
        ctx.fillStyle = '#E0E0E0';
        ctx.strokeStyle= '#F0F0F0';
        ctx.lineWidth = 2;
        ctx.fillRect(this.offsetX + this.width * 0.25, this.offsetY + this.height * 0.25, this.width * 0.5, this.height * 0.5);
        ctx.strokeRect(this.offsetX + this.width * 0.25, this.offsetY + this.height * 0.25, this.width * 0.5, this.height * 0.5);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace italic';
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle';
        ctx.fillText (this.valLabel, this.offsetX + this.width * 0.5, this.offsetY + this.height * 0.5);
    }
    click(x, y) {
        if(this.clickFreeze(x, y)) {
            // Do nothing when freezeClicked
            return;
        }
        if(this.isFreeze) {
            return;
        }
        if(this.clickDirect(x, y)) {
            // Do nothing when directClicked
            return;
        }
        let text = prompt(this.prompt, this.valLabel);
        if(text === null) {
            text = this.valLabel;
        }
        this.valLabel = text;
        this.view();
    }
    setValue(data) {
        this.valLabel = data;
        this.view();
    }
    getCalcValue() {
        return this.valLabel + ' ';
    }
}

/**
 * canvasGui_switch
 * @brief switch parts
 * @brief When clicked, the setting number is incremented by 1. Returns to the initial value when the set number is exceeded
 */
class canvasGui_switch extends canvasGui {
    constructor(o) {
        super(o);
        this.view();
        this.unclick();  // unclick status is default
    }
    view() {
        this.initView();

        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');

        // information
        let num = this.valCalc.toFixed(0);
        if((this.valMax - this.valMin + 1) <=  this.valLabel.length) {
           this.infomatinon = this.valLabel[num - this.valMin] + '(' + num + ')';
        }
        else {
            this.infomatinon = '---' + '(' + num + ')';
        }
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace italic';
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle';
        ctx.fillText(this.infomatinon, this.offsetX + this.width * 0.5, this.offsetY + this.height - 10);
    }
    click(x, y) {
        if(this.clickFreeze(x, y)) {
            // Do nothing when freezeClicked
            return;
        }
        if(this.isFreeze) {
            return;
        }
        if(this.clickDirect(x, y)) {
            // When directClicked, change parameters and update drawing
            this.unclick(x, y);
            return;
        }

        // Update settings
        this.valCalc++;
        if(this.valCalc > this.valMax) {
            this.valCalc = this.valMin;
        }

        this.view();

        // selected button drawing
        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = '#C0C0C0';
        ctx.strokeStyle= 'black';
        ctx.lineWidth = 2;
        ctx.roundRect(this.offsetX + this.width * 0.2 + 2, this.offsetY + this.height * 0.5 + 2, this.width * 0.6, this.height * 0.2, [5]);
        ctx.fill();
        ctx.stroke();
    }
    unclick(x, y) {
        this.view();

        // unselected button drawing
        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = '#A0A0A0';
        ctx.strokeStyle= '#404040';
        ctx.lineWidth = 2;
        ctx.roundRect(this.offsetX + this.width * 0.2 + 2, this.offsetY + this.height * 0.5 + 2, this.width * 0.6, this.height * 0.2, [5]);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = '#C0C0C0';
        ctx.strokeStyle= 'black';
        ctx.lineWidth = 2;
        ctx.roundRect(this.offsetX + this.width * 0.2, this.offsetY + this.height * 0.5, this.width * 0.6, this.height * 0.2, [5]);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * canvasGui_slide_v
 * @brief vertical slide bar control parts
 * @brief
 */
class canvasGui_slide_v extends canvasGui {
    constructor(o) {
        super(o);
        this.valCalc = this.minmaxToVal(this.percent);
        this.view();
    }
    view() {
        this.initView();

        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');
        // Drawing a color scale
        ctx.beginPath();
        let lg = ctx.createLinearGradient(this.offsetX + this.width * 0.5, this.offsetY + this.height, this.offsetX + this.width * 0.5, this.offsetY);
        lg.addColorStop(0,'#40FF40');
        lg.addColorStop(1,'#FF0000');
        ctx.strokeStyle = lg;
        ctx.lineWidth = 20;
        ctx.lineCap = "butt";
        ctx.moveTo(this.offsetX + this.width * 0.2, this.offsetY  + this.height * 0.2);
        ctx.lineTo(this.offsetX + this.width * 0.2, this.offsetY  + this.height * 0.8);
        ctx.strokeStyle = lg; 
        ctx.stroke();
        // draw slide
        ctx.beginPath();
        ctx.fillStyle = '#808080';
        ctx.strokeStyle= '#202020';
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.moveTo(this.offsetX + this.width * 0.5, this.offsetY  + this.height * 0.2);
        ctx.lineTo(this.offsetX + this.width * 0.5, this.offsetY  + this.height * 0.8);
        ctx.fill();
        ctx.stroke();

        // Reflecting the current value
        let tmpcnt = this.percent * 0.6 / 100.0 + 0.2;
        if(tmpcnt < 0.2) {
            tmpcnt = 0.2;
        }
        if(tmpcnt > 0.8) {
            tmpcnt = 0.8;
        }
        ctx.beginPath();
        ctx.strokeStyle= '#A0A0A0';
        ctx.fillStyle = '#C08080';
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.moveTo(this.offsetX + this.width * 0.5 - 5, this.offsetY  + this.height * (1.0 - tmpcnt));
        ctx.lineTo(this.offsetX + this.width * 0.5 + 5, this.offsetY  + this.height * (1.0 - tmpcnt));
        ctx.fill();
        ctx.stroke();

        // information
        this.infomatinon = this.valCalc.toPrecision(5);
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace italic';
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle';
        ctx.fillText(this.infomatinon, this.offsetX + this.width * 0.5, this.offsetY + this.height - 10);
    }
    click(x, y) {
        if(this.clickFreeze(x, y)) {
            // Do nothing when freezeClicked
            return;
        }
        if(this.isFreeze) {
            return;
        }
        if(this.clickDirect(x, y)) {
            // When directClicked, change parameters and update drawing
            this.view();
            return;
        }
        this.move(x, y);
    }
    move(x,y) {
        if(this.isFreeze) {
            return;
        }
        let tmpcnt = (-1.0 * y + this.height * 0.5) / this.height;
        if(tmpcnt < 0.2) {
            tmpcnt = 0.2;
        }
        if(tmpcnt > 0.8) {
            tmpcnt = 0.8;
        }
        this.percent = 100.0 * (tmpcnt - 0.2) / 0.6;
        this.valCalc = this.minmaxToVal(this.percent);
        this.view();
    }
}

/**
 * canvasGui_slide_h
 * @brief Horizontal slide bar control parts
 * @brief
 */
class canvasGui_slide_h extends canvasGui {
    constructor(o) {
        super(o);
        this.valCalc = this.minmaxToVal(this.percent);
        this.view();
    }
    view() {
        this.initView();

        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');
        // Drawing a color scale
        ctx.beginPath();
        let lg = ctx.createLinearGradient(this.offsetX, this.offsetY + this.height * 0.5, this.offsetX + this.width, this.offsetY + this.height * 0.5);
        lg.addColorStop(0,'#40FF40');
        lg.addColorStop(1,'#FF0000');
        ctx.strokeStyle = lg;
        ctx.lineWidth = 20;
        ctx.lineCap = "butt";
        ctx.moveTo(this.offsetX + this.width * 0.2, this.offsetY  + this.height * 0.3);
        ctx.lineTo(this.offsetX + this.width * 0.8, this.offsetY  + this.height * 0.3);
        ctx.strokeStyle = lg; 
        ctx.stroke();
        // draw slide
        ctx.beginPath();
        ctx.fillStyle = '#808080';
        ctx.strokeStyle= '#202020';
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.moveTo(this.offsetX + this.width * 0.2, this.offsetY  + this.height * 0.6);
        ctx.lineTo(this.offsetX + this.width * 0.8, this.offsetY  + this.height * 0.6);
        ctx.fill();
        ctx.stroke();

        // Reflecting the current value
        let tmpcnt = this.percent * 0.6 / 100.0 + 0.2;
        if(tmpcnt < 0.2) {
            tmpcnt = 0.2;
        }
        if(tmpcnt > 0.8) {
            tmpcnt = 0.8;
        }
        ctx.beginPath();
        ctx.strokeStyle= '#A0A0A0';
        ctx.fillStyle = '#C08080';
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.moveTo(this.offsetX + this.width * (tmpcnt), this.offsetY  + this.height * 0.6 - 5);
        ctx.lineTo(this.offsetX + this.width * (tmpcnt), this.offsetY  + this.height * 0.6 + 5);
        ctx.fill();
        ctx.stroke();

        // information
        this.infomatinon = this.valCalc.toPrecision(5);
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace italic';
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle';
        ctx.fillText(this.infomatinon, this.offsetX + this.width * 0.5, this.offsetY + this.height - 10);
    }
    click(x, y) {
        if(this.clickFreeze(x, y)) {
            // Do nothing when freezeClicked
            return;
        }
        if(this.isFreeze) {
            return;
        }
        if(this.clickDirect(x, y)) {
            // When directClicked, change parameters and update drawing
            this.view();
            return;
        }
        this.move(x, y);
    }
    move(x,y) {
        if(this.isFreeze) {
            return;
        }
        let tmpcnt = (x + this.height * 0.5) / this.width;
        if(tmpcnt < 0.2) {
            tmpcnt = 0.2;
        }
        if(tmpcnt > 0.8) {
            tmpcnt = 0.8;
        }
        this.percent = 100.0 * (tmpcnt - 0.2) / 0.6;
        this.valCalc = this.minmaxToVal(this.percent);
        this.view();
    }
}

/**
 * canvasGui_nob
 * @brief knob control parts
 * @brief 
 */
class canvasGui_nob extends canvasGui {
    constructor(o) {
        super(o);
        this.valCalc = this.minmaxToVal(this.percent);
        this.view();
    }
    view() {
        this.initView();

        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');

        // Drawing a color scale
        ctx.beginPath();
        let lg = ctx.createLinearGradient(this.offsetX, this.offsetY + this.height, this.offsetX + this.width, this.offsetY + this.height);
        lg.addColorStop(0,'#40FF40');
        lg.addColorStop(1,'#FF0000');
        ctx.strokeStyle = lg;
        ctx.lineWidth = 20;
        ctx.arc(this.offsetX + this.width * 0.5, this.offsetY  + this.height * 0.5, this.width * 0.25, (135 * Math.PI) /180, (45 * Math.PI) /180 , false);
        ctx.strokeStyle = lg; 
        ctx.stroke();

        // drawing nobs
        ctx.beginPath();
        ctx.fillStyle = '#808080';
        ctx.strokeStyle= '#404040';
        ctx.lineWidth = 2;
        ctx.arc(this.offsetX + this.width * 0.5 + 2, this.offsetY  + this.height * 0.5 + 2, this.width * 0.30, 0, Math.PI*2 , false);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = '#C0C0C0';
        ctx.strokeStyle= '#606060';
        ctx.lineWidth = 2;
        ctx.arc(this.offsetX + this.width * 0.5, this.offsetY  + this.height * 0.5, this.width * 0.30, 0, Math.PI*2 , false);
        ctx.fill();
        ctx.stroke();

        // Reflecting the current value
        let tmpcnt = this.percent * 3.0 /4.0 / 100.0 + 0.125;;
        if(tmpcnt < 0.125) {
            tmpcnt = 0.125;
        }
        if(tmpcnt > 0.875) {
            tmpcnt = 0.875;
        }
        let p_x = this.width * 0.2 * Math.cos(2.0 * Math.PI * (tmpcnt + 0.25));
        let p_y = this.width * 0.2 * Math.sin(2.0 * Math.PI * (tmpcnt + 0.25));
        ctx.beginPath();
        ctx.strokeStyle= '#202020';
        ctx.fillStyle = '#808080';
        ctx.lineWidth = 2;
        ctx.arc(this.offsetX + this.width * 0.5 + p_x, this.offsetY  + this.height * 0.5 + p_y, 4, 0, Math.PI * 2 , false);
        ctx.fill();
        ctx.stroke();

        // information
        this.infomatinon = this.valCalc.toPrecision(5);
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace italic';
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle';
        ctx.fillText(this.infomatinon, this.offsetX + this.width * 0.5, this.offsetY + this.height - 10);
    }
    click(x, y) {
        if(this.clickFreeze(x, y)) {
            // Do nothing when freezeClicked
            return;
        }
        if(this.isFreeze) {
            return;
        }
        if(this.clickDirect(x, y)) {
            // When directClicked, change parameters and update drawing
            this.view();
            return;
        }
        this.move(x, y);
    }
    move(x,y) {
        if(this.isFreeze) {
            return;
        }

        let radian = Math.atan2(x, y)/Math.PI;
        // radian to percent conversion
        let tmpcnt = radian;
        if(tmpcnt < 0.0) {
            tmpcnt *= -0.5;
        }
        else {
            tmpcnt = -0.5 * tmpcnt + 1.0;
        }
        if(tmpcnt < 0.125) {
            tmpcnt = 0.125;
        }
        if(tmpcnt > 0.875) {
            tmpcnt = 0.875;
        }
        let tmppercent = 100.0 * (tmpcnt - 0.125) * 4.0 / 3.0;

        // Avoid sudden jumps
        if(tmppercent >= 75.0 && this.percent < 50.0) {
            console.log("jump up!"+ this.percent + "->" + tmppercent);
            tmppercent = this.percent;
        }
        this.percent = tmppercent;
        this.valCalc = this.minmaxToVal(this.percent);
        this.view();
    }

}

/**
 * canvasGui_meter_h
 * @brief horizontal meter
 * @brief
 */
class canvasGui_meter_h extends canvasGui {
    constructor(o) {
        super(o);
        this.valCalc = this.minmaxToVal(this.percent);
        this.view();
    }
    view() {
        this.initView();

        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');
        // Drawing a color scale
        ctx.beginPath();
        let lg = ctx.createLinearGradient(this.offsetX, this.offsetY + this.height * 0.5, this.offsetX + this.width, this.offsetY + this.height * 0.5);
        lg.addColorStop(0,'#40FF40');
        lg.addColorStop(1,'#FF0000');
        ctx.strokeStyle = lg;
        ctx.lineWidth = 20;
        ctx.lineCap = "butt";
        ctx.moveTo(this.offsetX + this.width * 0.2, this.offsetY + this.height * 0.3);
        ctx.lineTo(this.offsetX + this.width * 0.8, this.offsetY + this.height * 0.3);
        ctx.strokeStyle = lg; 
        ctx.stroke();
        // meter value text
        ctx.beginPath();
        ctx.fillStyle = '#E0E0E0';
        ctx.strokeStyle= '#F0F0F0';
        ctx.lineWidth = 2;
        ctx.fillRect(this.offsetX + this.width * 0.2, this.offsetY + this.height * 0.5, this.width * 0.6, this.height * 0.3);
        ctx.strokeRect(this.offsetX + this.width * 0.2, this.offsetY + this.height * 0.5, this.width * 0.6, this.height * 0.3);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace italic';
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle';
        ctx.fillText (this.valLabel, this.offsetX + this.width * 0.5, this.offsetY + this.height * 0.65);

        // Reflecting the current value
        let tmpcnt = this.percent * 0.01;
        ctx.beginPath();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle= '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.fillRect(this.offsetX + this.width * (0.2 + 0.6 * tmpcnt), this.offsetY + this.height * 0.2, this.width * 0.6 * (1.0 - tmpcnt), this.height * 0.2);
        ctx.strokeRect(this.offsetX + this.width * (0.2 + 0.6 * tmpcnt), this.offsetY + this.height * 0.2, this.width * 0.6 * (1.0 - tmpcnt), this.height * 0.2);
        ctx.fill();
        ctx.stroke();

        // information
        this.infomatinon = this.valCalc.toPrecision(5);
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace italic';
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle';
        ctx.fillText(this.infomatinon, this.offsetX + this.width * 0.5, this.offsetY + this.height - 10);
    }
    setValue(value) {
        this.valCalc = value;
        this.percent = this.valToPercent(value);
    }
}

/**
 * canvasGui_disp
 * @brief signal display
 * @brief 
 */
class canvasGui_disp extends canvasGui {
    buff = new Float32Array(100);

    constructor(o) {
        super(o);
        for(let i=0; i<this.buff.length; i++) {
            this.buff[i] = 0.0;
        }
        this.view();
    }
    view() {
        this.initView();

        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');

        let dispConut = 0;
        let tmpdata = [];
        let data = [];

        // data read
        for(let i=0; i<this.buff.length; i++) {
            tmpdata[i] = this.buff[i];
        }
        tmpdata.forEach((val, idx) => {
            tmpdata[idx] = (val * 128.0 + 128.0) / 256.0 * 60.0 + 20.0;
        })
        data = new Uint8Array(tmpdata);

        // background display
        ctx.beginPath();
        ctx.fillStyle = '#000000';
        ctx.strokeStyle= '#E0E0E0';
        ctx.lineWidth = 2;
        ctx.fillRect(this.offsetX + this.width * 0.0, this.offsetY + this.height * 0.15, this.width * 1.0, this.height * 0.7);
        ctx.strokeRect(this.offsetX + this.width * 0.0, this.offsetY + this.height * 0.15, this.width * 1.0, this.height * 0.7);
        ctx.fill();
        ctx.stroke();

        // display the data
        ctx.beginPath();
        ctx.fillStyle = '#000000';
        ctx.strokeStyle= '#40FF00';
        ctx.lineWidth = 2;
        ctx.moveTo(this.offsetX, this.offsetY + data[0]);
        for(var i = 0; i < data.length; i++) {
          ctx.lineTo(this.offsetX + i, this.offsetY + data[i]);
        }
        ctx.stroke();

        // information
        this.infomatinon = 'Wave Form';
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace italic';
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle';
        ctx.fillText(this.infomatinon, this.offsetX + this.width * 0.5, this.offsetY + this.height - 10);
    }
    setValue(values) {
        for(let i=0; i<values.length; i++) {
            this.buff[i] = values[i];
        }
    }
}

/**
 * canvasGui_fft
 * @brief FFT display
 * @brief 
 */
class canvasGui_fft extends canvasGui {
    buff = new Float32Array(100);

    constructor(o) {
        super(o);
        for(let i=0; i<this.buff.length; i++) {
            this.buff[i] = 0.0;
        }
        this.view();
    }
    view() {
        this.initView();

        let ctx = document.getElementById('jsaspGuiCanvas').getContext('2d');

        let dispConut = 0;
        let tmpdata = [];
        let data = [];

        // data read
        for(let i=0; i<this.buff.length; i++) {
            tmpdata[i] = this.buff[i];
        }
        tmpdata.forEach((val, idx) => {
            tmpdata[idx] = (-1.0 * val);
            if(tmpdata[idx] > 70.0) {
                tmpdata[idx] = 70.0;
            }
            if(tmpdata[idx] < 0.0) {
                tmpdata[idx] = 0.0;
            }
        })
        data = new Uint8Array(tmpdata);

        // background display
        ctx.beginPath();
        ctx.fillStyle = '#000000';
        ctx.strokeStyle= '#E0E0E0';
        ctx.lineWidth = 2;
        ctx.fillRect(this.offsetX + this.width * 0.0, this.offsetY + this.height * 0.15, this.width * 1.0, this.height * 0.7);
        ctx.strokeRect(this.offsetX + this.width * 0.0, this.offsetY + this.height * 0.15, this.width * 1.0, this.height * 0.7);
        ctx.fill();
        ctx.stroke();

        // display the data
        ctx.beginPath();
        ctx.fillStyle = '#000000';
        ctx.strokeStyle= '#40FF00';
        ctx.lineWidth = 1;
        for(var i = 0; i < data.length; i++) {
            ctx.moveTo(this.offsetX + i, this.offsetY + this.height * 0.85);
            ctx.lineTo(this.offsetX + i, this.offsetY + this.height * 0.15 + data[i]);
        }
        ctx.stroke();

        // information
        this.infomatinon = 'FFT';
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace italic';
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle';
        ctx.fillText(this.infomatinon, this.offsetX + this.width * 0.5, this.offsetY + this.height - 10);
    }
    setValue(values) {
        for(let i=0; i<values.length; i++) {
            this.buff[i] = values[i];
        }
    }
}

/**
 * canvasGui_test
 * @brief dummy part
 * @brief 
 */
class canvasGui_test extends canvasGui {
    constructor(o) {
        super(o);
        this.view();
    }
}

/**
 * createCanvas
 * @brief create canvas base
 * @param
 * @return
 */
function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = "jsaspGuiCanvas";
    canvas.width  = jsaspGuiCanvasWidth;
    canvas.height = jsaspGuiCanvasHeight;
    canvas.style.border = "2px solid black";

    let context = canvas.getContext('2d');
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0, 0, 0, 0);

    ctx = document.querySelector('.guicontent');  // add to guicontent class
    ctx.appendChild(canvas);
}

/**
 * createCanvasGuis
 * @brief create GUI objects
 * @param
 * @return
 */
function createCanvasGuis(guidata) {
    // initialize
    for (let i = 0; i < jsaspGuiObj.length; i++) {
        jsaspGuiObj[i] = new canvasGui_test({type : 'none', 'caption' : 'none'});
    }
    for (let i = 0; i < guidata.length; i++) {
        if(guidata[i] === null || typeof guidata[i]['type'] === "undefined") {
            jsaspGuiObj[i] = new canvasGui_test(guidata[i]);
        }
        if(guidata[i]['type'] === 'text') {
            jsaspGuiObj[i] = new canvasGui_text(guidata[i]);
        }
        else if(guidata[i]['type'] === 'nob') {
            jsaspGuiObj[i] = new canvasGui_nob(guidata[i]);
        }
        else if(guidata[i]['type'] === 'switch') {
            jsaspGuiObj[i] = new canvasGui_switch(guidata[i]);
        }
        else if(guidata[i]['type'] === 'slide_v') {
            jsaspGuiObj[i] = new canvasGui_slide_v(guidata[i]);
        }
        else if(guidata[i]['type'] === 'slide_h') {
            jsaspGuiObj[i] = new canvasGui_slide_h(guidata[i]);
        }
        else if(guidata[i]['type'] === 'meter_h') {
            jsaspGuiObj[i] = new canvasGui_meter_h(guidata[i]);
        }
        else if(guidata[i]['type'] === 'disp') {
            jsaspGuiObj[i] = new canvasGui_disp(guidata[i]);
        }
        else if(guidata[i]['type'] === 'fft') {
            jsaspGuiObj[i] = new canvasGui_fft(guidata[i]);
        }
        else {
            console.log('undefined GUI!');
            jsaspGuiObj[i] = new canvasGui_test(guidata[i]);
        }
    }
}

/**
 * addEventListener:mousemove
 * @brief Action when mouse is moved
 * @param
 * @return
 */
window.addEventListener('mousemove', function(ev) {
    let clickelm = ev.target.id;
    if(clickelm !== 'jsaspGuiCanvas') {
        // Do not handle events if they are not GUI items
        return;
    }
    // Which object is selected, prefer last drawn
    // Get the relative coordinates of the canvas (X is negative on the left, Y is negative on the top)
    if(jsaspGui_preventEvent === true) {
        // Do not operate events during other operations
        for (let i = jsaspGuiObj.length - 1; i >= 0; i--) {
            jsaspGuiObj[i].isDragging = false;
        }
        jsaspGui_preventEvent = false;
        return;
    }
    for (let i = jsaspGuiObj.length - 1; i >= 0; i--) {
        if(jsaspGuiObj[i].isDragging === false) {
            continue;
        }
        let rect = ev.target.getBoundingClientRect() ;
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;
        let o_x_left   = jsaspGuiObj[i].offsetX;
        let o_x_right  = jsaspGuiObj[i].offsetX + jsaspGuiObj[i].width;
        let o_y_top    = jsaspGuiObj[i].offsetY;
        let o_y_bottom = jsaspGuiObj[i].offsetY + jsaspGuiObj[i].height;
        if((o_x_left < x) && (x < o_x_right) && (o_y_top < y) && (y < o_y_bottom)) {
            let otx = x-(o_x_left+o_x_right)*0.5;
            let oty = y-(o_y_top+o_y_bottom)*0.5;
            jsaspGuiObj[i].move(otx, oty);  // Do move() processing of the object
            jsaspSetParam(i);  // param change notification
        }
    }
});

/**
 * addEventListener:mousedown
 * @brief Action on mouse click
 * @param
 * @return
 */
window.addEventListener('mousedown', function(ev) {
    let clickelm = ev.target.id;
    if(clickelm !== 'jsaspGuiCanvas') {
        // Do not handle events if they are not GUI items
        return;
    }
    // Which object is selected, prefer last drawn
    // Get the relative coordinates of the canvas (X is negative on the left, Y is negative on the top)
    if(jsaspGui_preventEvent === true) {
        // Do not operate events during other operations
        for (let i = jsaspGuiObj.length - 1; i >= 0; i--) {
            jsaspGuiObj[i].isDragging = false;
        }
        jsaspGui_preventEvent = false;
        return;
    }
    for (let i = jsaspGuiObj.length - 1; i >= 0; i--) {
        if(jsaspGuiObj[i].type === 'none') {
            continue;
        }
        let rect = ev.target.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;
        let o_x_left   = jsaspGuiObj[i].offsetX;
        let o_x_right  = jsaspGuiObj[i].offsetX + jsaspGuiObj[i].width;
        let o_y_top    = jsaspGuiObj[i].offsetY;
        let o_y_bottom = jsaspGuiObj[i].offsetY + jsaspGuiObj[i].height;
        if((o_x_left < x) && (x < o_x_right) && (o_y_top < y) && (y < o_y_bottom)) {
            let otx = x-(o_x_left+o_x_right)*0.5;
            let oty = y-(o_y_top+o_y_bottom)*0.5;
            jsaspGuiObj[i].click(otx, oty);  // Perform click() processing on the object and put it in the drag state
            jsaspGuiObj[i].isDragging = true;
            jsaspSetParam(i);  // param change notification
            break;
        }
    }
});

/**
 * addEventListener:mouseup
 * @brief Action when mouse click is released
 * @param
 * @return
 */
window.addEventListener('mouseup', function(ev) {
    let clickelm = ev.target.id;
    if(clickelm !== 'jsaspGuiCanvas') {
        // Do not handle events if they are not GUI items
        return;
    }
    // Which object is selected, prefer last drawn
    // Get the relative coordinates of the canvas (X is negative on the left, Y is negative on the top)
    if(jsaspGui_preventEvent === true) {
        // Do not operate events during other operations
        jsaspGui_preventEvent = false;
        for (let i = jsaspGuiObj.length - 1; i >= 0; i--) {
            jsaspGuiObj[i].isDragging = false;
        }
        return;
    }
    for (let i = jsaspGuiObj.length - 1; i >= 0; i--) {
        if(jsaspGuiObj[i].isDragging === false) {
            continue;
        }
        let rect = ev.target.getBoundingClientRect() ;
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;
        jsaspGuiObj[i].isDragging = false;
        let o_x_left   = jsaspGuiObj[i].offsetX;
        let o_x_right  = jsaspGuiObj[i].offsetX + jsaspGuiObj[i].width;
        let o_y_top    = jsaspGuiObj[i].offsetY;
        let o_y_bottom = jsaspGuiObj[i].offsetY + jsaspGuiObj[i].height;
        let otx = x-(o_x_left+o_x_right)*0.5;
        let oty = y-(o_y_top+o_y_bottom)*0.5;
        jsaspGuiObj[i].unclick( otx, oty);  // Do unclick() processing of the object
        jsaspSetParam(i);  // param change notification
    }
});

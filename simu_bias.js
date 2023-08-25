function run_simu_bias(form) {
    var allInputs = form.getElementsByClassName("ParameterInputBox");
    var para ={};
    for (var i=0; i < allInputs.length; i++) {
        let v = allInputs[i].value;
        para[allInputs[i].id] = Number(v);
    }
    let coh = new Array(-0.512, -0.256, -0.128, -0.064, -0.032, 0.032, 0.064, 0.128, 0.256, 0.512);
    let cohError = new Array(0.512, 0.256, 0.128, 0.064, 0.032, -0.032, -0.064, -0.128, -0.256, -0.512);
    let ncoh = 10;

    // compute pR and mean RT
    let pR = new Array();
    let meanRT = new Array();
    let meanRTerror = new Array();

    let s = Math.sqrt(1000.0);
    let A = (1 - para['para_z']) * para['para_a'] * s;
    let B = para['para_z'] * para['para_a'] * s;
    let k = para['para_k']/s;

    for (i=0; i<ncoh; i++) {
        // pR[i] = coh[i]*para['para_a'];
        // meanRT[i] = coh[i]*para['para_k'] + para['para_a'];
        let out = compute_pRRT(coh[i], A, B, k, para['para_t0'], para['para_t0'], para['para_me']);
        pR[i] = out.p;
        meanRT[i] = out.RTcorrect;
        meanRTerror[i] = out.RTerror;
    }

    // convert coh/pR into paired data points for Chart.js
    let pR2plot = funConvertData4Chart(coh, pR);
    let RT2plot = funConvertData4Chart(coh, meanRT);
    let RTerror2plot = funConvertData4Chart(cohError, meanRTerror);

    // Update charts
    chartPsych.data.datasets[0].data = pR2plot;
    chartPsych.update();
    chartRT.data.datasets[0].data = RTerror2plot;
    chartRT.data.datasets[1].data = RT2plot;
    let maxMeanRT = Math.max.apply(null, meanRT);
    if (maxMeanRT > 3) {
        chartRT.options.scales.yAxes[0].ticks.max = maxMeanRT;
    } else {
        chartRT.options.scales.yAxes[0].ticks.max = 3;
    }
    chartRT.update();

    // compute Accuracy, meanRT, reward/trial and reward rate

    let valAccuracy = 0;
    let valMeanRT = 0;
    let valRTrial = 0;
    let valRRate = 0;
    let totalRT = 0;
    let totalRew = 0;
    for (i=0; i<ncoh; i++) {
        let pCorrect = 0;
        if (coh[i]>0) {
            pCorrect = pR[i];
            totalRew += pCorrect * para['para_RewRight'];
        } else {
            pCorrect = 1-pR[i];
            totalRew += pCorrect * para['para_RewLeft'];
        }
        valAccuracy += pCorrect;
        let thisRT = pCorrect * meanRT[i] + (1-pCorrect) * meanRTerror[i];
        valMeanRT += thisRT;
        totalRT += para["para_ITICorrect"] + (1-pCorrect) * para["para_errorTimeout"] + thisRT;
    }
    valAccuracy /= ncoh;
    valMeanRT /= ncoh;
    valRTrial = totalRew/ncoh;
    valRRate = totalRew/totalRT;
    document.getElementById("txtAccuracy").textContent = valAccuracy.toFixed(3);
    document.getElementById("txtMeanRT").textContent = valMeanRT.toFixed(3);
    document.getElementById("txtRewTrial").textContent = valRTrial.toFixed(3);
    document.getElementById("txtRewRate").textContent = valRRate.toFixed(3);

    chartOutcome[0].data.datasets[1].data = [{x: 0, y: valAccuracy}];
    chartOutcome[0].update();
    chartOutcome[1].data.datasets[1].data = [{x: 0, y: valMeanRT}];
    chartOutcome[1].update();
    chartOutcome[2].data.datasets[1].data = [{x: 0, y: valRTrial}];
    chartOutcome[2].update();
    chartOutcome[3].data.datasets[1].data = [{x: 0, y: valRRate}];
    chartOutcome[3].update();
}

function updateTextInput(val, index) {
    let txtbox = document.getElementById("para_" + paraNames[index]);
    txtbox.value = val;
    run_simu_bias(document.getElementById("parameter_bias"));
}

function updateTextInputRunHeatmap(val, index) {
    let txtbox = document.getElementById("para_" + paraNames[index]);
    txtbox.value = val;
    heatmap_simu(document.getElementById("parameter_bias"), document.getElementsByName("parameters"));
}

function heatmap_simu(form, checkboxes) {
    var allInputs = form.getElementsByClassName("ParameterInputBox");
    var allRanges = form.getElementsByClassName("ParameterRange");
    var para ={};
    for (var i=0; i < allInputs.length; i++) {
        let v = allInputs[i].value;
        para[allInputs[i].id] = Number(v);
    }

    let ncheck = checkboxes.length;
    let indexChecked = [];
    for (i=0; i<ncheck; i++) {
        if (checkboxes[i].checked) indexChecked += i;
    }    
    let numChecked = indexChecked.length;
    let xmin = 0;
    let xmax = 0;
    let xstep = 0;
    let ymin = 0;
    let ymax = 0;
    let ystep = 0;
    let paraX = [];
    let paraY = [];
    let heatmap = initObject(nameOutcome); 
    let nOutcome = nameOutcome.length;
    let nSteps = Number((document.getElementById("cellInputNSteps")).value);
    let out = {};
    let paraXLabels = [];
    let paraYLabels = [];
    let paraXname = '';
    let paraYname = '';
    let count = 0;
    let x = 0;
    let y = 0;
    
    switch (numChecked) {
        case 0:
            alert("check at least one box");
            break;
        case 1:
            xmin = Number(allRanges[indexChecked].min);
            xmax = Number(allRanges[indexChecked].max);
            xstep = (xmax-xmin)/nSteps; 
            heatmap = clearObject(heatmap, nameOutcome);
            paraXname = allInputs[indexChecked].id;
            for (x=xmin; x<=xmax; x += xstep) {
                para[paraXname] = x;
                out = computeOutcome(para);
                paraX.push(x);
                for (i=0; i<nOutcome; i++) {
                    heatmap[nameOutcome[i]].push(out['val'+nameOutcome[i]]);
                }
            }
            for (i=0; i<paraX.length; i++) {
                paraXLabels[i] = paraX[i].toFixed(2);
            }

            for (i=0; i<nOutcome; i++) {
                let data2plot = funConvertData4Chart(paraX, heatmap[nameOutcome[i]] );
                chartOutcome[i].data.datasets = chartOutcome[i].data.datasets.slice(0,1);
                chartOutcome[i].data.datasets[0].data = data2plot;
                chartOutcome[i].data.datasets[0].pointRadius = Chart.defaults.pointRadius;
                chartOutcome[i].data.datasets[0].pointStyle = Chart.defaults.pointStyle;;
                chartOutcome[i].data.datasets[0].borderColor = chartOutcome[i].data.datasets[0].pointBackgroundColor;
                chartOutcome[i].data.labels = paraXLabels;
                chartOutcome[i].options.scales.xAxes[0].scaleLabel.labelString = paraXname.substr(5, paraXname.length);
                chartOutcome[i].options.scales.yAxes[0].scaleLabel.labelString = "";
                chartOutcome[i].options.scales.xAxes[0].ticks.suggestedMin = xmin; // - (paraX[1]-paraX[0])*0.05; // no clipping
                chartOutcome[i].options.scales.xAxes[0].ticks.suggestedMax = xmax; // + (paraX[1]-paraX[0])*0.05; 
                chartOutcome[i].options.scales.yAxes[0].ticks.suggestedMin = Math.min.apply(Math, heatmap[nameOutcome[i]]); //*0.9;
                chartOutcome[i].options.scales.yAxes[0].ticks.suggestedMax = Math.max.apply(Math, heatmap[nameOutcome[i]]); //*1.1;
                chartOutcome[i].options.animation.duration = 1000;
                chartOutcome[i].update();
            }
            break;
        case 2:
            xmin = Number(allRanges[indexChecked[1]].min);
            xmax = Number(allRanges[indexChecked[1]].max);
            xstep = (xmax-xmin)/nSteps;
            ymin = Number(allRanges[indexChecked[0]].min);
            ymax = Number(allRanges[indexChecked[0]].max);
            ystep = (ymax-ymin)/nSteps;
            heatmap = clearObject(heatmap, nameOutcome);
            paraXname = allInputs[indexChecked[1]].id;
            paraYname = allInputs[indexChecked[0]].id;
            paraX = [];
            paraY = [];
            for ( iy=0; iy<nSteps; iy++) {
                y = ymin + iy*ystep;
                para[paraYname] = y;
                for (ix=0; ix<nSteps; ix++) {
                    x = xmin + ix*xstep;
                    para[paraXname] = x;
                    out = computeOutcome(para);
                    paraX.push(Number(x));
                    paraY.push(Number(y));
                    for (i=0; i<nOutcome; i++) {
                        heatmap[nameOutcome[i]].push(out['val'+nameOutcome[i]]);
                    }
                }
            }
            for (i=0; i<nOutcome; i++) {
                drawHeatMap(paraX, paraY, heatmap[nameOutcome[i]], chartOutcome[i]);
                chartOutcome[i].options.scales.xAxes[0].scaleLabel.labelString = paraXname.substr(5, paraXname.length);
                chartOutcome[i].options.scales.yAxes[0].scaleLabel.labelString = paraYname.substr(5, paraYname.length);
                chartOutcome[i].options.scales.xAxes[0].ticks.suggestedMin = xmin; // - (paraX[1]-paraX[0])*0.05; // no clipping
                chartOutcome[i].options.scales.xAxes[0].ticks.suggestedMax = xmax; // + (paraX[1]-paraX[0])*0.05; 
                chartOutcome[i].options.scales.yAxes[0].ticks.suggestedMin = ymin; // - (paraY[1]-paraY[0])*0.05;
                chartOutcome[i].options.scales.yAxes[0].ticks.suggestedMax = ymax; // + (paraY[1]-paraY[0])*0.05;
                // chartOutcome[i].options.toolTip.enabled = false;
                chartOutcome[i].update();
            }
            break;
    }

}

function drawHeatMap(x, y, C, ax, cmin, cmax) {
    // simple grid-style heatmap
    if ( cmin==undefined || cmin == null ) cmin = Math.min.apply(Math, C);
    if ( cmax==undefined || cmax == null ) cmax = Math.max.apply(Math, C);
    let ncolors = 256;
    let n = C.length;
    let nSteps = Math.sqrt(n);
    let xshift = (x[1]-x[0])*0.5;
    let yshift = (y[nSteps]-y[nSteps-1])*0.5;
    let funGetColor = (x) => {return ('rgba('+ String(x) + ', ' + String(x) + ',' + String(255-x) + ',100)') };

    // find peak position; 
    let indPeakX = [];
    for (i=0; i<n; i++) {
        if (C[i]==cmax) indPeakX.push(i);
    }   

    if (cmax > cmin) {
        let scalor = (ncolors-1)/(cmax - cmin);
        let funTransformArray = (x) => {return transformArray(x, cmin, scalor)};
        C = C.map(funTransformArray);
    } else {
        C = C.map( (x)=>{return 120});
    }
    dataByColor = [];
    
    for (i=0; i<ncolors+1; i++) {
        dataByColor.push([]);
    }
    
    for (i=0; i<n; i++) {
        if (indPeakX.indexOf(i)==-1) {
            dataByColor[C[i]].push( {x:x[i]+xshift, y:y[i]+yshift} );
        } else {
            dataByColor[ncolors].push( {x:x[i]+xshift, y:y[i]+yshift} );
        }
    }
    ax.options.animation.duration = 1;
    ax.data.datasets = [];
    
    for (i=0; i<ncolors; i++) {
        if (dataByColor[i].length>0) {
            ax.data.datasets.push( {
                data: dataByColor[i],
                borderColor: "transparent",
                pointBackgroundColor: funGetColor(i), 
                pointRadius: 180/nSteps, 
                pointStyle: 'rect', 
                fill: false,
            })
        }
    }

    // add marker for heatmap peak
    ax.data.datasets.push( {
        data: dataByColor[ncolors],
        borderColor: "red",
        pointBackgroundColor: "transparent",
        pointRadius: 90/nSteps, 
        pointStyle: 'star', 
        fill: false,
    })

}

function transformArray(x, a, b) {
    // return new x = (x-intercept)*slope
    return(parseInt((x - a)*b));
}


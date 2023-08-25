function run_simu_nobias(form) {
    var allInputs = form.getElementsByClassName("ParameterInputBox");
    var para ={};
    for (var i=0; i < allInputs.length; i++) {
        let v = allInputs[i].value;
        para[allInputs[i].id] = Number(v);
    }
    let coh = new Array(-0.512, -0.256, -0.128, -0.064, -0.032, 0.032, 0.064, 0.128, 0.256, 0.512);
    let ncoh = 10;

    // compute pR and mean RT
    let pR = new Array();
    let meanRT = new Array();
    let meanRTerror = new Array();

    let s = Math.sqrt(1000.0);
    let A =  para['para_a'] * s/2;
    let k = para['para_k']/s;

    for (i=0; i<ncoh; i++) {
        // pR[i] = coh[i]*para['para_a'];
        // meanRT[i] = coh[i]*para['para_k'] + para['para_a'];
        let out = compute_pRRT(coh[i], A, A, k, para['para_t0'], para['para_t0'], 0);
        pR[i] = out.p;
        meanRT[i] = out.RTcorrect;
        meanRTerror[i] = out.RTerror;
    }

    // convert coh/pR into paired data points for Chart.js
    let pR2plot = funConvertData4Chart(coh, pR);
    let RT2plot = funConvertData4Chart(coh, meanRT);

    // Update charts
    chartPsych.data.datasets[0].data = pR2plot;
    chartPsych.update();
    chartRT.data.datasets[0].data = RT2plot;
    chartRT.update();

    // compute Accuracy, meanRT, reward/trial and reward rate

    let valAccuracy = 0;
    let valMeanRT = 0;
    let valRTrial = 0;
    let valRRate = 0;
    let totalRT = 0;
    for (i=0; i<ncoh; i++) {
        let pCorrect = 0;
        if (coh[i]>0) {
            pCorrect = pR[i];
        } else {
            pCorrect = 1-pR[i];
        }
        valAccuracy += pCorrect;
        let thisRT = pCorrect * meanRT[i] + (1-pCorrect) * meanRTerror[i];
        valMeanRT += thisRT;
        valRTrial += valAccuracy * para["para_Rew"];
        totalRT += para["para_ITICorrect"] + (1-pCorrect) * para["para_errorTimeout"] + thisRT;
    }
    valAccuracy /= ncoh;
    valMeanRT /= ncoh;
    valRTrial /= ncoh;
    valRRate = valRTrial/totalRT;
    document.getElementById("txtAccuracy").textContent = valAccuracy.toFixed(3);
    document.getElementById("txtMeanRT").textContent = valMeanRT.toFixed(3);
    document.getElementById("txtRewTrial").textContent = valRTrial.toFixed(3);
    document.getElementById("txtRewRate").textContent = valRRate.toFixed(3);
}

function funConvertData4Chart(x, y) {
    // convert two vectors of equal length into a data format used for chart
    let nx = x.length;
    let ny = y.length;
    if (nx!=ny) return;
    let data2plot = new Array();
    for (i=0; i<nx; i++) {
        data2plot.push( {x: x[i], y: y[i]});
    }
    return(data2plot);
}

function initCharts() {
    // set up charts 
    let coh = new Array(-0.512, -0.256, -0.128, -0.064, -0.032, 0.032, 0.064, 0.128, 0.256, 0.512);
    let labelFontSize = 12;
    let labelFontColor = 'black';
    let axisLineColor = 'rgba(0, 0, 0, 0.8)';
    let chartPsychSettings = {
        type: 'line',
        data: {
            labels:coh,
            datasets: [{
                label: "",
                data: {},
                fill: false,
                borderColor: axisLineColor,
                pointBackgroundColor: axisLineColor,
            }],
        },        
        options: {
            responsive: false,
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    ticks: {
                        min: -0.6,
                        max: 0.6,
                        stepSize: 0.2,
                        fontColor: labelFontColor,
                    },
               }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Probability of choosing Right",
                        fontColor: labelFontColor,
                        fontSize: 18,
                    },
                    ticks: {
                        fontColor: labelFontColor,
                    },
                }],
            },
        },
    }

    let ctxPsych = document.getElementById("canvasPsych");
    chartPsych = new Chart(ctxPsych, chartPsychSettings);

    let chartRTSettings = {
        type: 'line',
        data: {
            labels:coh,
            datasets: [{
                label: "",
                data: {},
                fill: false,
                borderColor: axisLineColor,
                pointBackgroundColor: axisLineColor,
            }],
        },        
        options: {
            responsive: false,
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    ticks: {
                        min: -0.6,
                        max: 0.6,
                        stepSize: 0.2,
                        fontColor: labelFontColor,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Signed coherence",
                        fontColor: labelFontColor,
                        fontSize: 18,
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Mean RT (s)",
                        scaleLineColor: axisLineColor,
                        fontColor: labelFontColor,
                        fontSize: 18,
                    },
                    ticks: {
                        fontColor: labelFontColor,
                    },
                }],
            },
        },
    };

    let ctxRT = document.getElementById("canvasRT");
    chartRT = new Chart(ctxRT, chartRTSettings);    
}

function updateTextInput(val, index) {
    let txtbox = document.getElementById(paraNames[index]);
    txtbox.value = val;
    run_simu_nobias(document.getElementById("parameter_nobias"));
}



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
    let correctRTColor = 'rgba(0, 0, 0, 0.8)';
    let errorRTColor = 'rgba(0, 150, 0, 0.5)';
    
    let chartPsychSettings = {
        type: 'line',
        data: {
            labels:coh,
            datasets: [{
                label: "",
                data: {},
                fill: false,
                borderColor: correctRTColor,
                pointBackgroundColor: correctRTColor,
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
                    scaleLabel: {
                        display: true,
                        labelString: "Left Motion       Coh     Right Motion",
                        fontColor: labelFontColor,
                        fontSize: 18,
                     },
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
                        min: 0,
                        max: 1,
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
                label: "error",
                data: {},
                fill: false,
                borderColor: errorRTColor,
                pointBackgroundColor: errorRTColor,
            },
            {
                label: "correct",
                data: {},
                fill: false,
                borderColor: correctRTColor,
                pointBackgroundColor: correctRTColor,
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
                        labelString: "Left Saccade      Coh     Right Saccade",
                        fontColor: labelFontColor,
                        fontSize: 18,
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Mean RT (s)",
                        scaleLineColor: correctRTColor,
                        fontColor: labelFontColor,
                        fontSize: 18,
                    },
                    ticks: {
                        min: 0.2,
                        max: 3,
                        fontColor: labelFontColor,
                    },
                }],
            },
        },
    };

    let ctxRT = document.getElementById("canvasRT");
    chartRT = new Chart(ctxRT, chartRTSettings);    
}

function initOutcomeCharts() {
    // set up charts 
    let chartRangeMax = [1, 3, 10, 5];
    let baseLineColor = 'rgba(0, 0, 0, 0.3)';
    let labelFontSize = 12;
    let labelFontColor = 'black';
    let axisLineColor = 'rgba(0, 0, 0, 0.8)';
    
    for (i=0; i<4; i++) {
        let chartSettings = {
            type: 'scatter',
            data: {
                labels:[0,0],
                datasets: [
                    {
                    label: "",
                    data: [ {x: 0, y: 0} , {x: 0, y: chartRangeMax[i]} ],
                    fill: false,
                    borderColor: baseLineColor,
                    pointRadius: 0
                    },                    
                    {
                    label: "",
                    data: [ {x: 0, y: 0.5} ],
                    fill: false,
                    pointBackgroundColor: "red",
                    pointRadius: 5
                    },                    
            ],
            },        
            options: {
                responsive: false,
                tooltips: {enabled: false},
                legend: {
                    display: false,
                },
                scales: {
                    xAxes: [{
                        display: false,
                    }],
                    yAxes: [{
                        display: false,
                    }],
                },
            },
        };
        let ctx = document.getElementById(chartNames[i]);
        chartOutcome[i] = new Chart(ctx, chartSettings);
    }
}

function initObject(names) {
    let obj = {};
    for (i=0; i<names.length; i++) {
        obj[names[i]] = [];
    }
    return(obj);
}
function clearObject(obj, names) {
    for (i=0; i<names.length; i++) {
        obj[names[i]] = [];
    }
    return(obj);
}

function initChart(canvasName) {
    let labelFontSize = 12;
    let labelFontColor = 'black';
    let axisLineColor = 'rgba(0, 0, 0, 0.8)';
    let correctRTColor = 'rgba(0, 0, 0, 0.8)';
    // let errorRTColor = 'rgba(0, 150, 0, 0.5)';
    
    let chartSettings = {
        type: 'scatter',
        data: {
            datasets: [{
                label: "",
                data: {},
                fill: false,
                borderColor: correctRTColor,
                pointBackgroundColor: correctRTColor,
            }],
        },        
        options: {
            responsive: false,
            animation: {
                duration: 1000,
            },
            legend: {
                display: false,
            },
            tooltips: {
                enabled: false,
            },
            hover: {
                enabled: false,
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: "para",
                        fontColor: labelFontColor,
                        fontSize: 18,
                     },
                    // ticks: {
                    //     min: -0.6,
                    //     max: 0.6,
                    //     stepSize: 0.2,
                    //     fontColor: labelFontColor,
                    // },
                }],
                yAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: "para",
                        fontColor: labelFontColor,
                        fontSize: 18,
                    },
            //         ticks: {
            //             min: 0,
            //             max: 1,
            //             fontColor: labelFontColor,
            //         },
                }],
            },
        },
    }

    let ctx = document.getElementById(canvasName);
    chartNew = new Chart(ctx, chartSettings);    
    return(chartNew);
}
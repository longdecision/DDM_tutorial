// This JavaScript file supplies the function to compute pR and mean RT for correct and error trials.
// Long Ding 2017-08-14
// For this implementation, ignore zero coherence

function compute_pRRT(coh, A, B, k, t00, t01, me_bias) {
    /*  INPUTS:
            coh: signed coherence value [0-1] excluding 0 to avoid undefined correct/error trials.
            A: upper bound
            B: lower bound
            k: proportionality factor
            t00: non-decision time for the lower-bound choice (sec)
            t01: non-decision time for the upper-bound choice (sec)
            me_bias: bias in momentary evidence, +: favoring the upper-bound choice
        OUTPUT:
            out.p: probability of making the upper-bound choice
            out.RTcorrect: mean RT for correct choices (sign of coh == upper/lower)
            out.RTerror: mean RT for error choices
    */
    if (coh == 0) return;
    let out = {};
    let u = (coh + me_bias) * k;
    let eA = Math.exp(2*A*u);
    let eB = Math.exp(2*B*u);

    if (u==0) {
        out.p = 0.5;
    } else {
        out.p = (eB*eA - eA)/(eB*eA - 1);
    }
    
    let tanABu = Math.tanh( (A+B)*u );
    let rt1 = 0;
    let rt0 = 0;
    if (u==0) {
        rt1 = (A*A + 2*A*B)/3*0.001 + t01;
        rt0 = (B*B + 2*A*B)/3*0.001 + t00;
    } else {
        rt1 = ( (A+B)/u/tanABu - B/u/Math.tanh(B*u) )* 0.001 + t01;
        rt0 = ( (A+B)/u/tanABu - A/u/Math.tanh(A*u) )* 0.001 + t00;
    }

    if (coh>0) {
        out.RTcorrect = rt1;
        out.RTerror = rt0;
    } else {
        out.RTcorrect = rt0;
        out.RTerror = rt1;
    }

    return(out);
}


function computeOutcome(para) {
    /* given parameters, compute accuracy, meanRT, reward/trial, reward rate
    use the same algorithms as run_simu_bias except not returning intermediary values */
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
        let out = compute_pRRT(coh[i], A, B, k, para['para_t0'], para['para_t0'], para['para_me']);
        pR[i] = out.p;
        meanRT[i] = out.RTcorrect;
        meanRTerror[i] = out.RTerror;
    }

    // compute Accuracy, meanRT, reward/trial and reward rate
    let out = {};
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
    out.valAccuracy = valAccuracy/ncoh;
    out.valMeanRT = valMeanRT/ncoh;
    out.valRTrial = totalRew/ncoh;
    out.valRRate = totalRew/totalRT;
    return(out);
}
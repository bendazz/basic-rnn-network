(function(){
  const hiddenSlider = document.getElementById('hiddenSize');
  const hiddenValue = document.getElementById('sizeValue');
  const inputSlider = document.getElementById('inputSize');
  const inputValue = document.getElementById('inputSizeValue');
  const containerHidden = document.getElementById('network-container');
  const containerInputHidden = document.getElementById('network-container-2');
  const containerTarget = document.getElementById('target-container');
  const animateBtn = document.getElementById('animateBtn');
  const resetAnimBtn = document.getElementById('resetAnimBtn');
  // RNN independent section elements
  const rnnHiddenSlider = document.getElementById('rnnHiddenSize');
  const rnnHiddenValue = document.getElementById('rnnHiddenValue');
  const rnnVectorContainer = document.getElementById('rnn-vector-container');
  const rnnAnimateBtn = document.getElementById('rnnAnimateBtn');
  const rnnResetBtn = document.getElementById('rnnResetBtn');
  let rnnVectorLayout = null;
  let rnnAnimated = false;
  let rnnTimeoutId = null;
  // Forget Gate elements
  const forgetHiddenSlider = document.getElementById('forgetHiddenSize');
  const forgetHiddenValue = document.getElementById('forgetHiddenValue');
  const forgetVectorContainer = document.getElementById('forget-vector-container');
  const forgetAnimateBtn = document.getElementById('forgetAnimateBtn');
  const forgetResetBtn = document.getElementById('forgetResetBtn');
  let forgetVectorLayout = null;
  let forgetAnimated = false;
  let forgetTimeoutId = null;
  let forgetSecondTimeoutId = null;
  // Input Gate elements
  const inputGateHiddenSlider = document.getElementById('inputGateHiddenSize');
  const inputGateHiddenValue = document.getElementById('inputGateHiddenValue');
  const inputGatePanel1 = document.getElementById('input-gate-panel-1');
  const inputGatePanel2 = document.getElementById('input-gate-panel-2');
  const inputGatePanel3 = document.getElementById('input-gate-panel-3');
  const inputGateAnimateBtn = document.getElementById('inputGateAnimateBtn');
  const inputGateResetBtn = document.getElementById('inputGateResetBtn');
  let inputGateLayout = null;
  let inputGateTanhLayout = null;
  let inputGateAnimated = false;
  let inputGateTimeoutId = null;
  let inputGateSecondTimeoutId = null;
  let inputGateOverlay = null;
  let inputGateCombinedAnimated = false;
  // Output Gate elements
  const outputGateHiddenSlider = document.getElementById('outputGateHiddenSize');
  const outputGateHiddenValue = document.getElementById('outputGateHiddenValue');
  const outputGatePanel1 = document.getElementById('output-gate-panel-1');
  const outputGatePanel2 = document.getElementById('output-gate-panel-2');
  const outputGatePanel3 = document.getElementById('output-gate-panel-3');
  const outputGateAnimateBtn = document.getElementById('outputGateAnimateBtn');
  const outputGateResetBtn = document.getElementById('outputGateResetBtn');
  let outputGateLayout = null;
  let outputGatePanel2Layout = null;
  let outputGateAnimated = false;
  let outputGateTimeoutId = null;
  let outputGateSecondTimeoutId = null;
  let outputGateThirdTimeoutId = null;
  let outputGateOverlay = null;
  let outputGateCombinedAnimated = false;
  // LSTM Composite elements
  const lstmCompositeAnimateBtn = document.getElementById('lstmCompositeAnimateBtn');
  const lstmCompositeAnimateAllBtn = document.getElementById('lstmCompositeAnimateAllBtn');
  const lstmCompositeResetBtn = document.getElementById('lstmCompositeResetBtn');
  const lstmCompositeContainer = document.getElementById('lstm-composite-container');
  let lstmCompositeLayout = null;
  let lstmCompositeFlowState = { phase: 0, running: false, dots: [] };
  function lstmAutoSpeedFactor(){
    return lstmCompositeFlowState.autoRun ? 0.5 : 1; // 50% duration when auto-running
  }

  // Overlay SVG for animation clones
  let overlaySvgHidden = null;
  let animated = false;
  let currentHiddenOutputs = [];
  let currentInputHiddenOutputs = [];

  const svgNS = 'http://www.w3.org/2000/svg';
  const padding = 70;
  const dims = { w: 800, h: 450 };
  // Indexed label helpers (Unicode subscripts)
  function toSubscript(n){
    const map = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉' };
    return String(n).split('').map(d=>map[d]||d).join('');
  }
  function indexedLabel(base, index, opts={ prime:false }){
    const primeChar = opts.prime ? '′' : '';
    return `${base}${primeChar}${toSubscript(index)}`;
  }

  function buildRnnVector(container, count){
    if(!container) return;
    container.innerHTML='';
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox', `0 0 ${dims.w} ${dims.h}`);
    container.appendChild(svg);

    const size = 40;
    const centerX = dims.w/2 - size/2;
    const rowY = (i) => count === 1 ? (dims.h/2 - size/2) : (padding + i * ((dims.h - 2*padding)/(count - 1)) - size/2);
    // Compute vertical midpoint of the vector to center the label
    const minY = rowY(0);
    const maxY = rowY(count - 1) + size;
    const midY = (minY + maxY) / 2;
    // Add 'base →' label to the left of the squares
    const label = document.createElementNS(svgNS,'text');
    label.textContent = 'base \u2192';
    label.setAttribute('x', centerX - 30);
    label.setAttribute('y', midY + 6);
    label.setAttribute('text-anchor','end');
    label.classList.add('rnn-label');
    svg.appendChild(label);
    const squares = [];
    for(let i=0;i<count;i++){
      const r = document.createElementNS(svgNS,'rect');
      r.setAttribute('x', centerX);
      r.setAttribute('y', rowY(i));
      r.setAttribute('width', size);
      r.setAttribute('height', size);
      r.setAttribute('rx', 6);
      r.classList.add('square-node');
      svg.appendChild(r);
      squares.push(r);
    }
    // Arrowhead marker for RNN arrows
    const defs = document.createElementNS(svgNS,'defs');
    const marker = document.createElementNS(svgNS,'marker');
    marker.setAttribute('id','rnnArrowHead');
    marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','10');
    marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','6');
    marker.setAttribute('markerHeight','6');
    marker.setAttribute('orient','auto-start-reverse');
    const markerPath = document.createElementNS(svgNS,'path');
    markerPath.setAttribute('d','M 0 0 L 10 5 L 0 10 z');
    markerPath.setAttribute('fill','#38bdf8');
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    return { svg, size, centerX, rows: Array.from({length:count}, (_,i)=>rowY(i)), squares };
  }

  function buildForgetVector(container, count){
    if(!container) return;
    container.innerHTML='';
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox', `0 0 ${dims.w} ${dims.h}`);
    container.appendChild(svg);
    const size = 40;
    const centerX = dims.w/2 - size/2;
    const rowY = (i) => count === 1 ? (dims.h/2 - size/2) : (padding + i * ((dims.h - 2*padding)/(count - 1)) - size/2);
    const minY = rowY(0);
    const maxY = rowY(count - 1) + size;
    const midY = (minY + maxY) / 2;
    const label = document.createElementNS(svgNS,'text');
    label.textContent = 'base \u2192';
    label.setAttribute('x', centerX - 30);
    label.setAttribute('y', midY + 6);
    label.setAttribute('text-anchor','end');
    label.classList.add('rnn-label');
    svg.appendChild(label);
    const squares = [];
    for(let i=0;i<count;i++){
      const r = document.createElementNS(svgNS,'rect');
      r.setAttribute('x', centerX);
      r.setAttribute('y', rowY(i));
      r.setAttribute('width', size);
      r.setAttribute('height', size);
      r.setAttribute('rx', 6);
      r.classList.add('square-node');
      svg.appendChild(r);
      squares.push(r);
    }
    const defs = document.createElementNS(svgNS,'defs');
    const marker = document.createElementNS(svgNS,'marker');
    marker.setAttribute('id','forgetArrowHead');
    marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','10');
    marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','6');
    marker.setAttribute('markerHeight','6');
    marker.setAttribute('orient','auto-start-reverse');
    const markerPath = document.createElementNS(svgNS,'path');
    markerPath.setAttribute('d','M 0 0 L 10 5 L 0 10 z');
    markerPath.setAttribute('fill','#9333ea');
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);
    return { svg, size, centerX, rows: Array.from({length:count}, (_,i)=>rowY(i)), squares };
  }

  function buildInputGateVector(container, count){
    if(!container) return;
    container.innerHTML='';
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox', `0 0 ${dims.w} ${dims.h}`);
    container.appendChild(svg);
    const size = 40;
    const centerX = dims.w/2 - size/2;
    const rowY = (i) => count === 1 ? (dims.h/2 - size/2) : (padding + i * ((dims.h - 2*padding)/(count - 1)) - size/2);
    const minY = rowY(0);
    const maxY = rowY(count - 1) + size;
    const midY = (minY + maxY) / 2;
    const label = document.createElementNS(svgNS,'text');
    label.textContent = 'base \u2192';
    label.setAttribute('x', centerX - 30);
    label.setAttribute('y', midY + 6);
    label.setAttribute('text-anchor','end');
    label.classList.add('rnn-label');
    svg.appendChild(label);
    const squares = [];
    for(let i=0;i<count;i++){
      const r = document.createElementNS(svgNS,'rect');
      r.setAttribute('x', centerX);
      r.setAttribute('y', rowY(i));
      r.setAttribute('width', size);
      r.setAttribute('height', size);
      r.setAttribute('rx', 6);
      r.classList.add('square-node');
      svg.appendChild(r);
      squares.push(r);
    }
    const defs = document.createElementNS(svgNS,'defs');
    const marker = document.createElementNS(svgNS,'marker');
    marker.setAttribute('id','inputGateArrowHead');
    marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','10');
    marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','6');
    marker.setAttribute('markerHeight','6');
    marker.setAttribute('orient','auto-start-reverse');
    const markerPath = document.createElementNS(svgNS,'path');
    markerPath.setAttribute('d','M 0 0 L 10 5 L 0 10 z');
    markerPath.setAttribute('fill','#9333ea');
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);
    return { svg, size, centerX, rows: Array.from({length:count}, (_,i)=>rowY(i)), squares };
  }

  function buildOutputGateTriangleVector(container, count){
    if(!container) return;
    container.innerHTML='';
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox', `0 0 ${dims.w} ${dims.h}`);
    container.appendChild(svg);
    // Vertical positioning for triangle vector (cell state candidates)
    const centerX = dims.w/2; // triangles horizontally centered
    const rowY = (i) => count === 1 ? (dims.h/2) : (padding + i * ((dims.h - 2*padding)/(count - 1)));
    const minY = rowY(0);
    const maxY = rowY(count - 1);
    const midY = (minY + maxY) / 2;
    // Left label
    const label = document.createElementNS(svgNS,'text');
    label.textContent = 'base →';
    label.setAttribute('x', centerX - 60);
    label.setAttribute('y', midY + 6);
    label.setAttribute('text-anchor','end');
    label.classList.add('rnn-label');
    svg.appendChild(label);
    const triangles = [];
    for(let i=0;i<count;i++){
      const yCenter = rowY(i);
      const topY = yCenter - 22;
      const blX = centerX - 22, blY = yCenter + 22;
      const brX = centerX + 22, brY = yCenter + 22;
      const tri = document.createElementNS(svgNS,'polygon');
      tri.setAttribute('points', `${centerX},${topY} ${blX},${blY} ${brX},${brY}`);
      tri.classList.add('forget-c-triangle');
      svg.appendChild(tri);
      const tLabel = document.createElementNS(svgNS,'text');
      tLabel.textContent = indexedLabel('C', i+1, { prime:true });
      tLabel.setAttribute('x', centerX);
      tLabel.setAttribute('y', yCenter + 6);
      tLabel.setAttribute('text-anchor','middle');
      tLabel.classList.add('triangle-label');
      svg.appendChild(tLabel);
      requestAnimationFrame(()=> { tri.classList.add('visible'); tLabel.classList.add('visible'); });
      triangles.push(tri);
    }
    // Arrowhead marker for output gate arrows
    const defs = document.createElementNS(svgNS,'defs');
    const marker = document.createElementNS(svgNS,'marker');
    marker.setAttribute('id','outputGateArrowHead');
    marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','10');
    marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','6');
    marker.setAttribute('markerHeight','6');
    marker.setAttribute('orient','auto-start-reverse');
    const markerPath = document.createElementNS(svgNS,'path');
    markerPath.setAttribute('d','M 0 0 L 10 5 L 0 10 z');
    markerPath.setAttribute('fill','#9333ea');
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);
    return { svg, centerX, rows: Array.from({length:count}, (_,i)=>rowY(i)), triangles };
  }

  function buildLayer(container, inputCount, outputCount, opts){
    container.innerHTML='';
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox', `0 0 ${dims.w} ${dims.h}`);
    container.appendChild(svg);

    const defs = document.createElementNS(svgNS,'defs');
    const marker = document.createElementNS(svgNS,'marker');
    marker.setAttribute('id','arrowHead');
    marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','10');
    marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','6');
    marker.setAttribute('markerHeight','6');
    marker.setAttribute('orient','auto-start-reverse');
    const markerPath = document.createElementNS(svgNS,'path');
    markerPath.setAttribute('d','M 0 0 L 10 5 L 0 10 z');
    markerPath.setAttribute('fill','#38bdf8');
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const colX = { input: padding, output: dims.w - padding };
    const rowYInput = (i) => inputCount === 1 ? dims.h/2 : padding + i * ((dims.h - 2*padding)/(inputCount - 1));
    const rowYOutput = (i) => outputCount === 1 ? dims.h/2 : padding + i * ((dims.h - 2*padding)/(outputCount - 1));

    const inputs = Array.from({length:inputCount}, (_,i)=>({ id: opts.inputPrefix + (i+1), x: colX.input, y: rowYInput(i) }));
    const outputs = Array.from({length:outputCount}, (_,i)=>({ id:'', x: colX.output, y: rowYOutput(i) }));

    // edges
    inputs.forEach(inp => outputs.forEach(out => {
      const line = document.createElementNS(svgNS,'line');
      line.setAttribute('x1', inp.x + 25);
      line.setAttribute('y1', inp.y);
      line.setAttribute('x2', out.x - 25);
      line.setAttribute('y2', out.y);
      line.classList.add('edge');
      svg.appendChild(line);
    }));

    function drawNode(n, isInput){
      const g = document.createElementNS(svgNS,'g');
      const c = document.createElementNS(svgNS,'circle');
      c.setAttribute('cx', n.x);
      c.setAttribute('cy', n.y);
      c.setAttribute('r', 25);
      c.classList.add('node');
      if(opts.nodeClass){
        c.classList.add(opts.nodeClass);
      }
      g.appendChild(c);
      if(isInput){
        const label = document.createElementNS(svgNS,'text');
        label.setAttribute('x', n.x);
        label.setAttribute('y', n.y + 4);
        label.setAttribute('text-anchor','middle');
        label.classList.add('label');
        label.textContent = n.id;
        g.appendChild(label);
      }
      svg.appendChild(g);
    }

    inputs.forEach(n => drawNode(n,true));
    outputs.forEach(n => drawNode(n,false));

    return { inputs, outputs };
  }

  function rebuild(){
    const hiddenSize = parseInt(hiddenSlider.value,10);
    const inputSize = parseInt(inputSlider.value,10);
    hiddenValue.textContent = hiddenSize;
    inputValue.textContent = inputSize;
    const layerHidden = buildLayer(containerHidden, hiddenSize, hiddenSize, { inputPrefix: 'h' });
    const layerInputHidden = buildLayer(containerInputHidden, inputSize, hiddenSize, { inputPrefix: 'x', nodeClass: 'secondary' });
    containerTarget.innerHTML = ''; // keep target panel blank initially
    currentHiddenOutputs = layerHidden.outputs;
    currentInputHiddenOutputs = layerInputHidden.outputs;
    const shapeWh = document.getElementById('shapeWh');
    const shapeWx = document.getElementById('shapeWx');
    if(shapeWh) shapeWh.textContent = `(${hiddenSize} × ${hiddenSize})`;
    if(shapeWx) shapeWx.textContent = `(${inputSize} × ${hiddenSize})`;
    const shapeOut = document.getElementById('shapeOut');
    if(shapeOut) shapeOut.textContent = '';
  }

  hiddenSlider.addEventListener('input', rebuild);
  inputSlider.addEventListener('input', rebuild);

  rebuild();

  // Initialize independent RNN section
  function rebuildRnn(){
    if(!rnnHiddenSlider || !rnnHiddenValue || !rnnVectorContainer) return;
    if(rnnTimeoutId){ clearTimeout(rnnTimeoutId); rnnTimeoutId = null; }
    const n = parseInt(rnnHiddenSlider.value,10);
    rnnHiddenValue.textContent = n;
    rnnVectorLayout = buildRnnVector(rnnVectorContainer, n);
    rnnAnimated = false;
  }
  if(rnnHiddenSlider){
    rnnHiddenSlider.addEventListener('input', rebuildRnn);
    rebuildRnn();
  }

  function rebuildForget(){
    if(!forgetHiddenSlider || !forgetHiddenValue || !forgetVectorContainer) return;
    if(forgetTimeoutId){ clearTimeout(forgetTimeoutId); forgetTimeoutId = null; }
    const n = parseInt(forgetHiddenSlider.value,10);
    forgetHiddenValue.textContent = n;
    forgetVectorLayout = buildForgetVector(forgetVectorContainer, n);
    forgetAnimated = false;
    // shape display removed with dynamic label; no static span anymore
  }
  if(forgetHiddenSlider){
    forgetHiddenSlider.addEventListener('input', rebuildForget);
    rebuildForget();
  }

  function animateRnn(){
    if(!rnnVectorLayout || rnnAnimated) return;
    const { svg, size, centerX, rows, squares } = rnnVectorLayout;
    // Flash squares red briefly
    squares.forEach(sq => {
      sq.classList.remove('flash');
      // force reflow to restart animation
      void sq.offsetWidth;
      sq.classList.add('flash');
    });
    // After flash, draw arrows and output circles with labels
    const delay = 700; // match CSS animation duration
    rnnTimeoutId = setTimeout(()=>{
      const outputX = centerX + size + 140;
      rows.forEach((ry, i)=>{
        const yCenter = ry + size/2;
        const line = document.createElementNS(svgNS,'line');
        line.setAttribute('x1', centerX + size);
        line.setAttribute('y1', yCenter);
        line.setAttribute('x2', outputX - 26);
        line.setAttribute('y2', yCenter);
        line.classList.add('rnn-arrow');
        line.setAttribute('marker-end','url(#rnnArrowHead)');
        svg.appendChild(line);

        const c = document.createElementNS(svgNS,'circle');
        c.setAttribute('cx', outputX);
        c.setAttribute('cy', yCenter);
        c.setAttribute('r', 24);
        c.classList.add('rnn-output-circle');
        svg.appendChild(c);

        const t = document.createElementNS(svgNS,'text');
        t.textContent = indexedLabel('h', i+1, { prime:true });
        t.setAttribute('x', outputX);
        t.setAttribute('y', yCenter + 1);
        t.classList.add('rnn-output-label');
        svg.appendChild(t);
      });
      rnnAnimated = true;
      rnnTimeoutId = null;
    }, delay);
  }
  if(rnnAnimateBtn){
    rnnAnimateBtn.addEventListener('click', animateRnn);
  }
  function resetRnn(){
    if(rnnTimeoutId){ clearTimeout(rnnTimeoutId); rnnTimeoutId = null; }
    rnnAnimated = false;
    rebuildRnn();
  }
  if(rnnResetBtn){
    rnnResetBtn.addEventListener('click', resetRnn);
  }

  function animateForget(){
    if(!forgetVectorLayout || forgetAnimated) return;
    const { svg, size, centerX, rows, squares } = forgetVectorLayout;
    // Previously flashed the squares; flash the output circles instead (handled below)
    const delay = 700;
    forgetTimeoutId = setTimeout(()=>{
      const outputX = centerX + size + 140;
      const circleCenters = rows.map(ry => ry + size/2);
      // Fully connected: each square to each circle
      const squareCenters = rows.map(ry => ry + size/2);
      squareCenters.forEach(sqY => {
        circleCenters.forEach(cY => {
          const line = document.createElementNS(svgNS,'line');
          line.setAttribute('x1', centerX + size);
          line.setAttribute('y1', sqY);
          line.setAttribute('x2', outputX - 26);
          line.setAttribute('y2', cY);
          line.setAttribute('stroke','#9333ea');
          line.setAttribute('stroke-width','2');
          line.setAttribute('marker-end','url(#forgetArrowHead)');
          svg.appendChild(line);
        });
      });
      // Circles on top
      circleCenters.forEach(cY => {
        const c = document.createElementNS(svgNS,'circle');
        c.setAttribute('cx', outputX);
        c.setAttribute('cy', cY);
        c.setAttribute('r', 24);
        c.classList.add('forget-output-circle');
        svg.appendChild(c);
        // trigger visibility and flash animation on the circle (makes circles flash instead of squares)
        requestAnimationFrame(()=> { c.classList.add('visible'); c.classList.add('forget-flash'); });
      });
      // Add dynamic inline Wf label centered between squares and circles
      const squareCenterX = centerX + size/2;
      const weightMidX = (squareCenterX + outputX) / 2;
      const weightLabel = document.createElementNS(svgNS,'text');
      // Build 'Wf' with subscript
      weightLabel.textContent='';
      const baseWf = document.createTextNode('W');
      const subF = document.createElementNS(svgNS,'tspan');
      subF.textContent='f';
      subF.classList.add('subscript');
      weightLabel.appendChild(baseWf);
      weightLabel.appendChild(subF);
      const dimsTextF = document.createTextNode(` (${rows.length}×${rows.length})`);
      weightLabel.appendChild(dimsTextF);
      weightLabel.setAttribute('x', weightMidX);
      // Place label above top connections
      const topConnectionY = circleCenters[0] - size/2 - 18;
      weightLabel.setAttribute('y', topConnectionY < 18 ? 18 : topConnectionY);
      weightLabel.setAttribute('text-anchor','middle');
      weightLabel.classList.add('inline-matrix-label');
      svg.appendChild(weightLabel);
      requestAnimationFrame(()=> weightLabel.classList.add('visible'));

      // Multiplication operator and C vector to right
      const lastY = rows[rows.length-1] + size/2;
      const firstY = rows[0] + size/2;
      const midY = (firstY + lastY)/2;
      const cColX = outputX + 140;
      const multX = outputX + 70;
      const mult = document.createElementNS(svgNS,'text');
      mult.textContent = '×';
      mult.setAttribute('x', multX);
      mult.setAttribute('y', midY + 4);
      mult.setAttribute('text-anchor','middle');
      mult.classList.add('forget-op');
      svg.appendChild(mult);
      // Delay showing the C triangles until after the circle flash completes
      if(forgetSecondTimeoutId){ clearTimeout(forgetSecondTimeoutId); forgetSecondTimeoutId = null; }
      forgetSecondTimeoutId = setTimeout(()=>{
        // Make multiplication operator visible at same time as triangles
        requestAnimationFrame(()=> mult.classList.add('visible'));
        rows.forEach((ry)=>{
          const yCenter = ry + size/2;
          const tri = document.createElementNS(svgNS,'polygon');
          // Upward triangle points
          const topY = yCenter - 22;
          const blX = cColX - 22, blY = yCenter + 22;
          const brX = cColX + 22, brY = yCenter + 22;
          tri.setAttribute('points', `${cColX},${topY} ${blX},${blY} ${brX},${brY}`);
          tri.classList.add('forget-c-triangle');
          svg.appendChild(tri);
          const label = document.createElementNS(svgNS,'text');
          label.textContent = indexedLabel('C', rows.indexOf(ry)+1);
          label.setAttribute('x', cColX);
          label.setAttribute('y', yCenter + 6);
          label.setAttribute('text-anchor','middle');
          label.classList.add('triangle-label');
          svg.appendChild(label);
          requestAnimationFrame(()=> { tri.classList.add('visible'); label.classList.add('visible'); });
        });
        forgetAnimated = true;
        forgetSecondTimeoutId = null;
      }, delay);
      forgetTimeoutId = null;
    }, delay);
  }
  function resetForget(){
    if(forgetTimeoutId){ clearTimeout(forgetTimeoutId); forgetTimeoutId = null; }
    if(forgetSecondTimeoutId){ clearTimeout(forgetSecondTimeoutId); forgetSecondTimeoutId = null; }
    forgetAnimated = false;
    rebuildForget();
  }
  if(forgetAnimateBtn){
    forgetAnimateBtn.addEventListener('click', animateForget);
  }
  if(forgetResetBtn){
    forgetResetBtn.addEventListener('click', resetForget);
  }

  function rebuildInputGate(){
    if(!inputGateHiddenSlider || !inputGateHiddenValue || !inputGatePanel1) return;
    if(inputGateTimeoutId){ clearTimeout(inputGateTimeoutId); inputGateTimeoutId = null; }
    if(inputGateOverlay){ inputGateOverlay.remove(); inputGateOverlay = null; }
    const n = parseInt(inputGateHiddenSlider.value,10);
    inputGateHiddenValue.textContent = n;
    inputGateLayout = buildInputGateVector(inputGatePanel1, n);
    if(inputGatePanel2){ inputGateTanhLayout = buildInputGateVector(inputGatePanel2, n); }
    if(inputGatePanel3){ inputGatePanel3.innerHTML=''; }
    inputGateAnimated = false;
    inputGateCombinedAnimated = false;
  }

  function rebuildOutputGate(){
    if(!outputGateHiddenSlider || !outputGateHiddenValue || !outputGatePanel1) return;
    if(outputGateTimeoutId){ clearTimeout(outputGateTimeoutId); outputGateTimeoutId = null; }
    if(outputGateOverlay){ outputGateOverlay.remove(); outputGateOverlay = null; }
    const n = parseInt(outputGateHiddenSlider.value,10);
    outputGateHiddenValue.textContent = n;
    outputGateLayout = buildOutputGateTriangleVector(outputGatePanel1, n);
    // Build second panel identical to input gate first panel (squares)
    if(outputGatePanel2){
      outputGatePanel2Layout = buildInputGateVector(outputGatePanel2, n);
    }
    if(outputGatePanel3){ outputGatePanel3.innerHTML=''; }
    outputGateAnimated = false;
    outputGateCombinedAnimated = false;
  }
  if(outputGateHiddenSlider){
    outputGateHiddenSlider.addEventListener('input', rebuildOutputGate);
    rebuildOutputGate();
  }
  if(inputGateHiddenSlider){
    inputGateHiddenSlider.addEventListener('input', rebuildInputGate);
    rebuildInputGate();
  }

  function animateInputGate(){
    if(!inputGateLayout || inputGateAnimated) return;
    const { svg, size, centerX, rows, squares } = inputGateLayout;
    // Flash will be applied to the output circles (not the input squares)
    const delay = 700;
    inputGateTimeoutId = setTimeout(()=>{
      const outputX = centerX + size + 140;
      const squareCenters = rows.map(r => r + size/2);
      const circleCenters = squareCenters.slice(); // same vertical layout
      // Fully connected edges: each square to each circle
      squareCenters.forEach(sqY => {
        circleCenters.forEach(cY => {
          const line = document.createElementNS(svgNS,'line');
          line.setAttribute('x1', centerX + size);
          line.setAttribute('y1', sqY);
          line.setAttribute('x2', outputX - 26);
          line.setAttribute('y2', cY);
          line.setAttribute('stroke','#9333ea');
          line.setAttribute('stroke-width','2');
          line.setAttribute('marker-end','url(#inputGateArrowHead)');
          svg.appendChild(line);
        });
      });
      // Circles rendered on top
      circleCenters.forEach(cY => {
        const c = document.createElementNS(svgNS,'circle');
        c.setAttribute('cx', outputX);
        c.setAttribute('cy', cY);
        c.setAttribute('r', 24);
        c.classList.add('input-output-circle');
        svg.appendChild(c);
        // make circles visible and flash (instead of flashing the input squares)
        requestAnimationFrame(()=> { c.classList.add('visible'); c.classList.add('input-flash'); });
      });
      // Dynamic inline Wi label (sigmoid weights) centered between squares and circles
      const squareCenterX = centerX + size/2;
      const weightMidX = (squareCenterX + outputX)/2;
      const weightLabelWi = document.createElementNS(svgNS,'text');
      // Build 'Wi' with subscript
      weightLabelWi.textContent='';
      const baseWi = document.createTextNode('W');
      const subI = document.createElementNS(svgNS,'tspan');
      subI.textContent='i';
      subI.classList.add('subscript');
      weightLabelWi.appendChild(baseWi);
      weightLabelWi.appendChild(subI);
      const dimsTextI = document.createTextNode(` (${rows.length}×${rows.length})`);
      weightLabelWi.appendChild(dimsTextI);
      const topConnY = rows[0] + size/2 - size/2 - 18;
      weightLabelWi.setAttribute('x', weightMidX);
      weightLabelWi.setAttribute('y', topConnY < 18 ? 18 : topConnY);
      weightLabelWi.setAttribute('text-anchor','middle');
      weightLabelWi.classList.add('inline-matrix-label');
      svg.appendChild(weightLabelWi);
      requestAnimationFrame(()=> weightLabelWi.classList.add('visible'));
      if(inputGateTanhLayout){
        const { svg: tanhSvg, size: tSize, centerX: tCenterX, rows: tRows } = inputGateTanhLayout;
        const tOutputX = tCenterX + tSize + 140;
        const tSquareCenters = tRows.map(r => r + tSize/2);
        const tCircleCenters = tSquareCenters.slice();
        tSquareCenters.forEach(sqY => {
          tCircleCenters.forEach(cY => {
            const line = document.createElementNS(svgNS,'line');
            line.setAttribute('x1', tCenterX + tSize);
            line.setAttribute('y1', sqY);
            line.setAttribute('x2', tOutputX - 26);
            line.setAttribute('y2', cY);
            line.setAttribute('stroke','#9333ea');
            line.setAttribute('stroke-width','2');
            line.setAttribute('marker-end','url(#inputGateArrowHead)');
            tanhSvg.appendChild(line);
          });
        });
        tCircleCenters.forEach(cY => {
          const c = document.createElementNS(svgNS,'circle');
          c.setAttribute('cx', tOutputX);
          c.setAttribute('cy', cY);
          c.setAttribute('r', 24);
          c.classList.add('input-output-circle');
          tanhSvg.appendChild(c);
          // visible + tanh-style flash (red)
          requestAnimationFrame(()=> { c.classList.add('visible'); c.classList.add('input-tanh-flash'); });
        });
        // Dynamic inline WC (candidate weights) label for tanh panel
        const tSquareCenterX = tCenterX + tSize/2;
        const tWeightMidX = (tSquareCenterX + tOutputX)/2;
        const weightLabelWc = document.createElementNS(svgNS,'text');
        // Build 'WC' with subscript C
        weightLabelWc.textContent='';
        const baseWc = document.createTextNode('W');
        const subC = document.createElementNS(svgNS,'tspan');
        subC.textContent='C';
        subC.classList.add('subscript');
        weightLabelWc.appendChild(baseWc);
        weightLabelWc.appendChild(subC);
        const dimsTextC = document.createTextNode(` (${tRows.length}×${tRows.length})`);
        weightLabelWc.appendChild(dimsTextC);
        const tTopConnY = tRows[0] + tSize/2 - tSize/2 - 18;
        weightLabelWc.setAttribute('x', tWeightMidX);
        weightLabelWc.setAttribute('y', tTopConnY < 18 ? 18 : tTopConnY);
        weightLabelWc.setAttribute('text-anchor','middle');
        weightLabelWc.classList.add('inline-matrix-label');
        tanhSvg.appendChild(weightLabelWc);
        requestAnimationFrame(()=> weightLabelWc.classList.add('visible'));
      }
      inputGateAnimated = true;
      inputGateTimeoutId = null;
      // After first phase, delay combined overlay spawn until circles finish flashing
      if(inputGateSecondTimeoutId){ clearTimeout(inputGateSecondTimeoutId); inputGateSecondTimeoutId = null; }
      inputGateSecondTimeoutId = setTimeout(()=>{ runInputGateCombined(); inputGateSecondTimeoutId = null; }, delay);
    }, delay);
  }

  function animateOutputGate(){
    if(!outputGateLayout || outputGateAnimated) return;
    const { svg, centerX, rows, triangles } = outputGateLayout;
    // Triangles will flash first; second-panel circle creation is staged later
    // Flash triangles red (tanh) then produce purple circles in second panel
    triangles.forEach(tri => { tri.classList.remove('output-tanh-flash'); void tri.offsetWidth; tri.classList.add('output-tanh-flash'); });
    const delay = 700;
    outputGateTimeoutId = setTimeout(()=>{
      // Build circles in SAME panel, positioned to the right of triangles
      const circleColX = centerX + 140;
      rows.forEach((yCenter)=>{
        // Arrow from triangle apex horizontally to circle
        const line = document.createElementNS(svgNS,'line');
        line.setAttribute('x1', centerX + 5);
        line.setAttribute('y1', yCenter);
        line.setAttribute('x2', circleColX - 26);
        line.setAttribute('y2', yCenter);
        line.setAttribute('stroke','#9333ea');
        line.setAttribute('stroke-width','2');
        line.setAttribute('marker-end','url(#outputGateArrowHead)');
        svg.appendChild(line);
        const circle = document.createElementNS(svgNS,'circle');
        circle.setAttribute('cx', circleColX);
        circle.setAttribute('cy', yCenter);
        circle.setAttribute('r', 24);
        circle.classList.add('output-gate-circle');
        svg.appendChild(circle);
        requestAnimationFrame(()=> circle.classList.add('visible'));
      });
      // Build arrows for second panel and create their circles (do not flash yet)
      if(outputGatePanel2Layout){
        const { svg: svg2, size: size2, centerX: centerX2, rows: rows2 } = outputGatePanel2Layout;
        const circleColX2 = centerX2 + size2 + 140;
        // Fully connected: each square to each circle
        const squareCenters2 = rows2.map(r => r + size2/2);
        const circleCenters2 = squareCenters2.slice();
        squareCenters2.forEach(sqY => {
          circleCenters2.forEach(cY => {
            const line = document.createElementNS(svgNS,'line');
            line.setAttribute('x1', centerX2 + size2);
            line.setAttribute('y1', sqY);
            line.setAttribute('x2', circleColX2 - 26);
            line.setAttribute('y2', cY);
            line.setAttribute('stroke','#9333ea');
            line.setAttribute('stroke-width','2');
            line.setAttribute('marker-end','url(#inputGateArrowHead)');
            svg2.appendChild(line);
          });
        });
        // Circles on top — create if not present, but postpone flashing until after they appear
        const existing2 = svg2.querySelectorAll('circle.output-gate-circle');
        if(existing2.length === 0){
          circleCenters2.forEach(cY => {
            const circle = document.createElementNS(svgNS,'circle');
            circle.setAttribute('cx', circleColX2);
            circle.setAttribute('cy', cY);
            circle.setAttribute('r', 24);
            circle.classList.add('output-gate-circle');
            svg2.appendChild(circle);
            requestAnimationFrame(()=> circle.classList.add('visible'));
          });
        } else {
          existing2.forEach(c => requestAnimationFrame(()=> c.classList.add('visible')));
        }
        // After a short pause, flash second-panel circles and then spawn the combined overlay
        if(outputGateSecondTimeoutId){ clearTimeout(outputGateSecondTimeoutId); outputGateSecondTimeoutId = null; }
        outputGateSecondTimeoutId = setTimeout(()=>{
          const toFlash = svg2.querySelectorAll('circle.output-gate-circle');
          toFlash.forEach(c => { c.classList.remove('output-flash'); void c.offsetWidth; c.classList.add('output-flash'); });
          // After the circle flash completes, run the combined overlay
          if(outputGateThirdTimeoutId){ clearTimeout(outputGateThirdTimeoutId); outputGateThirdTimeoutId = null; }
          outputGateThirdTimeoutId = setTimeout(()=>{ runOutputGateCombined(); outputGateThirdTimeoutId = null; }, delay);
          outputGateSecondTimeoutId = null;
        }, 80);
        // Dynamic Wo label (output gate weights) centered between squares and circles
        const squareCenterX2 = centerX2 + size2/2;
        const weightMidX2 = (squareCenterX2 + circleColX2)/2;
        const labelWo = document.createElementNS(svgNS,'text');
        labelWo.textContent='';
        const baseWo = document.createTextNode('W');
        const subO = document.createElementNS(svgNS,'tspan');
        subO.textContent='o';
        subO.classList.add('subscript');
        labelWo.appendChild(baseWo);
        labelWo.appendChild(subO);
        const dimsWo = document.createTextNode(` (${rows2.length}×${rows2.length})`);
        labelWo.appendChild(dimsWo);
        const topConnY2 = rows2[0] + size2/2 - size2/2 - 18;
        labelWo.setAttribute('x', weightMidX2);
        labelWo.setAttribute('y', topConnY2 < 18 ? 18 : topConnY2);
        labelWo.setAttribute('text-anchor','middle');
        labelWo.classList.add('inline-matrix-label');
        svg2.appendChild(labelWo);
        requestAnimationFrame(()=> labelWo.classList.add('visible'));
      }
      outputGateAnimated = true;
      outputGateTimeoutId = null;
      // Combined overlay spawn is scheduled after the second-panel circle flash (handled above).
    }, delay);
  }
  function resetOutputGate(){
    if(outputGateTimeoutId){ clearTimeout(outputGateTimeoutId); outputGateTimeoutId = null; }
    if(outputGateSecondTimeoutId){ clearTimeout(outputGateSecondTimeoutId); outputGateSecondTimeoutId = null; }
    if(outputGateThirdTimeoutId){ clearTimeout(outputGateThirdTimeoutId); outputGateThirdTimeoutId = null; }
    outputGateAnimated = false;
    outputGateCombinedAnimated = false;
    if(outputGateOverlay){ outputGateOverlay.remove(); outputGateOverlay = null; }
    rebuildOutputGate();
  }
  if(outputGateAnimateBtn){ outputGateAnimateBtn.addEventListener('click', animateOutputGate); }
  if(outputGateResetBtn){ outputGateResetBtn.addEventListener('click', resetOutputGate); }

  function runOutputGateCombined(){
    if(outputGateCombinedAnimated || !outputGatePanel3) return;
    // Collect circles from panel1 and panel2
    const circles1 = outputGatePanel1.querySelectorAll('circle.output-gate-circle');
    const circles2 = outputGatePanel2.querySelectorAll('circle.output-gate-circle');
    if(circles1.length === 0 || circles2.length === 0) return;
    const section = outputGatePanel1.closest('.panels-row');
    const rowRect = section.getBoundingClientRect();
    outputGateOverlay = document.createElementNS(svgNS,'svg');
    outputGateOverlay.classList.add('overlay-layer');
    outputGateOverlay.style.left = rowRect.left + window.scrollX + 'px';
    outputGateOverlay.style.top = rowRect.top + window.scrollY + 'px';
    outputGateOverlay.style.width = rowRect.width + 'px';
    outputGateOverlay.style.height = rowRect.height + 'px';
    outputGateOverlay.setAttribute('viewBox', `0 0 ${rowRect.width} ${rowRect.height}`);
    document.body.appendChild(outputGateOverlay);

    const panel3Rect = outputGatePanel3.getBoundingClientRect();
    const count = circles1.length; // assume same length
    function circleCenter(c){
      const r = c.getBoundingClientRect();
      return { x: r.left - rowRect.left + r.width/2, y: r.top - rowRect.top + r.height/2 };
    }
    function targetRowY(i){
      const h = panel3Rect.height;
      return count === 1 ? h/2 : 70 + i * ((h - 140)/(count - 1));
    }
    const col1X = panel3Rect.left - rowRect.left + 70;
    const colGap = 110;
    const col2X = col1X + colGap;
    const resultColX = col2X + colGap + colGap; // leave space for operator and equals
    const multX = (col1X + col2X)/2;
    const equalsX = (col2X + resultColX)/2;

    const clones = [];
    circles1.forEach((c,i)=>{
      const start = circleCenter(c);
      const clone = document.createElementNS(svgNS,'circle');
      clone.setAttribute('cx', start.x);
      clone.setAttribute('cy', start.y);
      clone.setAttribute('r', 24);
      clone.setAttribute('fill', '#12161c');
      clone.setAttribute('stroke', '#9333ea');
      clone.setAttribute('stroke-width','2');
      outputGateOverlay.appendChild(clone);
      clones.push({ el: clone, start, end: { x: col1X, y: panel3Rect.top - rowRect.top + targetRowY(i) } });
    });
    circles2.forEach((c,i)=>{
      const start = circleCenter(c);
      const clone = document.createElementNS(svgNS,'circle');
      clone.setAttribute('cx', start.x);
      clone.setAttribute('cy', start.y);
      clone.setAttribute('r', 24);
      clone.setAttribute('fill', '#12161c');
      clone.setAttribute('stroke', '#9333ea');
      clone.setAttribute('stroke-width','2');
      outputGateOverlay.appendChild(clone);
      clones.push({ el: clone, start, end: { x: col2X, y: panel3Rect.top - rowRect.top + targetRowY(i) } });
    });

    const duration = 1000;
    const startTs = performance.now();
    function frame(ts){
      const t = Math.min(1, (ts - startTs)/duration);
      const ease = t*t;
      clones.forEach(obj => {
        const nx = obj.start.x + (obj.end.x - obj.start.x)*ease;
        const ny = obj.start.y + (obj.end.y - obj.start.y)*ease;
        obj.el.setAttribute('cx', nx);
        obj.el.setAttribute('cy', ny);
      });
      if(t < 1){ requestAnimationFrame(frame); } else { finalize(); }
    }
    requestAnimationFrame(frame);

    function finalize(){
      const midY = panel3Rect.top - rowRect.top + targetRowY(Math.floor((count-1)/2));
      function addOp(x, char){
        const t = document.createElementNS(svgNS,'text');
        t.textContent = char;
        t.setAttribute('x', x);
        t.setAttribute('y', midY);
        t.setAttribute('text-anchor','middle');
        t.classList.add('combined-op');
        outputGateOverlay.appendChild(t);
        requestAnimationFrame(()=> t.classList.add('visible'));
      }
      addOp(multX, '×');
      addOp(equalsX, '=');
      // Result vector orange circles labeled h'1, h'2, ...
      for(let i=0;i<count;i++){
        const y = panel3Rect.top - rowRect.top + targetRowY(i);
        const circle = document.createElementNS(svgNS,'circle');
        circle.setAttribute('cx', resultColX);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 24);
        circle.setAttribute('fill', '#12161c');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width','3');
        outputGateOverlay.appendChild(circle);
        const label = document.createElementNS(svgNS,'text');
        label.textContent = indexedLabel('h', i+1, { prime:true });
        label.setAttribute('x', resultColX);
        label.setAttribute('y', y + 1);
        label.setAttribute('text-anchor','middle');
        label.classList.add('rnn-output-label');
        outputGateOverlay.appendChild(label);
        requestAnimationFrame(()=> { circle.classList.add('visible'); label.classList.add('visible'); });
      }
      outputGateCombinedAnimated = true;
    }
  }
  function resetInputGate(){
    if(inputGateTimeoutId){ clearTimeout(inputGateTimeoutId); inputGateTimeoutId = null; }
    if(inputGateSecondTimeoutId){ clearTimeout(inputGateSecondTimeoutId); inputGateSecondTimeoutId = null; }
    inputGateAnimated = false;
    inputGateCombinedAnimated = false;
    if(inputGateOverlay){ inputGateOverlay.remove(); inputGateOverlay = null; }
    rebuildInputGate();
  }
  if(inputGateAnimateBtn){ inputGateAnimateBtn.addEventListener('click', animateInputGate); }
  if(inputGateResetBtn){ inputGateResetBtn.addEventListener('click', resetInputGate); }

  function runInputGateCombined(){
    if(inputGateCombinedAnimated || !inputGatePanel3 || !inputGateLayout || !inputGateTanhLayout) return;
    // Collect output circles from first two panels
    const circles1 = inputGatePanel1.querySelectorAll('circle.input-output-circle');
    const circles2 = inputGatePanel2.querySelectorAll('circle.input-output-circle');
    if(circles1.length === 0 || circles2.length === 0) return; // ensure first phase done
    // Create overlay covering the panels-row within Input Gate section
    const section = inputGatePanel1.closest('.panels-row');
    const rowRect = section.getBoundingClientRect();
    inputGateOverlay = document.createElementNS(svgNS,'svg');
    inputGateOverlay.classList.add('overlay-layer');
    inputGateOverlay.style.left = rowRect.left + window.scrollX + 'px';
    inputGateOverlay.style.top = rowRect.top + window.scrollY + 'px';
    inputGateOverlay.style.width = rowRect.width + 'px';
    inputGateOverlay.style.height = rowRect.height + 'px';
    inputGateOverlay.setAttribute('viewBox', `0 0 ${rowRect.width} ${rowRect.height}`);
    document.body.appendChild(inputGateOverlay);

    const panel3Rect = inputGatePanel3.getBoundingClientRect();
    const count = circles1.length; // assume same length
    // vertical target positions inside panel3
    function targetRowY(i){
      const h = panel3Rect.height;
      return count === 1 ? h/2 : 70 + i * ((h - 140)/(count - 1));
    }
    const col1X = panel3Rect.left - rowRect.left + 70;
    const colGap = 110;
    const col2X = col1X + colGap;
    const col3X = col2X + colGap;

    // helper to get center of circle relative to rowRect
    function circleCenter(c){
      const r = c.getBoundingClientRect();
      return { x: r.left - rowRect.left + r.width/2, y: r.top - rowRect.top + r.height/2 };
    }

    const clones = [];
    circles1.forEach((c,i)=>{
      const start = circleCenter(c);
      const clone = document.createElementNS(svgNS,'circle');
      clone.setAttribute('cx', start.x);
      clone.setAttribute('cy', start.y);
      clone.setAttribute('r', 24);
      clone.setAttribute('fill', '#1e1b4b');
      clone.setAttribute('stroke', '#9333ea');
      clone.setAttribute('stroke-width','2');
      inputGateOverlay.appendChild(clone);
      clones.push({ el: clone, start, end: { x: col1X, y: panel3Rect.top - rowRect.top + targetRowY(i) } });
    });
    circles2.forEach((c,i)=>{
      const start = circleCenter(c);
      const clone = document.createElementNS(svgNS,'circle');
      clone.setAttribute('cx', start.x);
      clone.setAttribute('cy', start.y);
      clone.setAttribute('r', 24);
      clone.setAttribute('fill', '#1e1b4b');
      clone.setAttribute('stroke', '#9333ea');
      clone.setAttribute('stroke-width','2');
      inputGateOverlay.appendChild(clone);
      clones.push({ el: clone, start, end: { x: col2X, y: panel3Rect.top - rowRect.top + targetRowY(i) } });
    });

    const duration = 1000;
    const startTs = performance.now();
    function frame(ts){
      const t = Math.min(1, (ts - startTs)/duration);
      const ease = t*t;
      clones.forEach(cObj=>{
        const nx = cObj.start.x + (cObj.end.x - cObj.start.x)*ease;
        const ny = cObj.start.y + (cObj.end.y - cObj.start.y)*ease;
        cObj.el.setAttribute('cx', nx);
        cObj.el.setAttribute('cy', ny);
      });
      if(t < 1){ requestAnimationFrame(frame); } else { finalizeCombined(); }
    }
    requestAnimationFrame(frame);

    function finalizeCombined(){
      // Add plus signs
      const midY = panel3Rect.top - rowRect.top + targetRowY(Math.floor((count-1)/2));
      function addOp(x){
        const t = document.createElementNS(svgNS,'text');
        t.textContent = '+'; // default, may be overwritten by caller
        t.setAttribute('x', x);
        t.setAttribute('y', midY);
        t.setAttribute('text-anchor','middle');
        t.classList.add('combined-op');
        inputGateOverlay.appendChild(t);
        requestAnimationFrame(()=> t.classList.add('visible'));
      }
      // First operator should be multiplication sign between first two columns
      const multX = (col1X + col2X)/2;
      const plusX = (col2X + col3X)/2;
      const mult = document.createElementNS(svgNS,'text');
      mult.textContent = '×';
      mult.setAttribute('x', multX);
      mult.setAttribute('y', midY);
      mult.setAttribute('text-anchor','middle');
      mult.classList.add('combined-op');
      inputGateOverlay.appendChild(mult);
      requestAnimationFrame(()=> mult.classList.add('visible'));
      addOp(plusX);
      // Add red triangle column
      for(let i=0;i<count;i++){
        const y = panel3Rect.top - rowRect.top + targetRowY(i);
        const tri = document.createElementNS(svgNS,'polygon');
        const topY = y - 22;
        const blX = col3X - 22, blY = y + 22;
        const brX = col3X + 22, brY = y + 22;
        tri.setAttribute('points', `${col3X},${topY} ${blX},${blY} ${brX},${brY}`);
        tri.classList.add('forget-c-triangle');
        inputGateOverlay.appendChild(tri);
        requestAnimationFrame(()=> tri.classList.add('visible'));
      }
      // Equals sign and result triangle vector with labels C'1, C'2, ...
      const col4X = col3X + colGap;
      const equalsX = (col3X + col4X)/2;
      const eq = document.createElementNS(svgNS,'text');
      eq.textContent = '=';
      eq.setAttribute('x', equalsX);
      eq.setAttribute('y', midY);
      eq.setAttribute('text-anchor','middle');
      eq.classList.add('combined-op');
      inputGateOverlay.appendChild(eq);
      requestAnimationFrame(()=> eq.classList.add('visible'));
      for(let i=0;i<count;i++){
        const y = panel3Rect.top - rowRect.top + targetRowY(i);
        const tri = document.createElementNS(svgNS,'polygon');
        const topY = y - 22;
        const blX = col4X - 22, blY = y + 22;
        const brX = col4X + 22, brY = y + 22;
        tri.setAttribute('points', `${col4X},${topY} ${blX},${blY} ${brX},${brY}`);
        tri.classList.add('forget-c-triangle');
        inputGateOverlay.appendChild(tri);
        const label = document.createElementNS(svgNS,'text');
        label.textContent = indexedLabel('C', i+1, { prime:true });
        label.setAttribute('x', col4X);
        label.setAttribute('y', y + 6); // moved further down to avoid triangle sides overlap
        label.classList.add('triangle-label');
        inputGateOverlay.appendChild(label);
        requestAnimationFrame(()=> { tri.classList.add('visible'); label.classList.add('visible'); });
      }
      inputGateCombinedAnimated = true;
    }
  }

  function ensureOverlay(){
    // Remove old overlay
    if(overlaySvgHidden){ overlaySvgHidden.remove(); overlaySvgHidden = null; }
    // Unified overlay spanning the row
    const row = document.querySelector('.panels-row');
    const rect = row.getBoundingClientRect();
    overlaySvgHidden = document.createElementNS(svgNS,'svg');
    overlaySvgHidden.classList.add('overlay-layer');
    overlaySvgHidden.style.position='absolute';
    overlaySvgHidden.style.left = rect.left + window.scrollX + 'px';
    overlaySvgHidden.style.top = rect.top + window.scrollY + 'px';
    overlaySvgHidden.style.width = rect.width + 'px';
    overlaySvgHidden.style.height = rect.height + 'px';
    overlaySvgHidden.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    document.body.appendChild(overlaySvgHidden);
  }

  // Build static LSTM composite diagram (full version stored as buildLstmFull; step1 uses simplified builder below)
  // Full canonical diagram kept for later steps
  function buildLstmFull(container){
    const count = 1; // not used currently
    if(!container) return;
    container.innerHTML='';
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox', `0 0 ${dims.w} ${dims.h}`);
    container.appendChild(svg);
    const cellBox = document.createElementNS(svgNS,'rect');
    cellBox.setAttribute('x', 140);
    cellBox.setAttribute('y', 40);
    cellBox.setAttribute('width', 520);
    cellBox.setAttribute('height', 300);
    cellBox.setAttribute('rx', 18);
    cellBox.setAttribute('fill', 'none');
    cellBox.setAttribute('stroke', '#334155');
    cellBox.setAttribute('stroke-width','2');
    svg.appendChild(cellBox);
    function addInput(x,y,label,cls){
      const c = document.createElementNS(svgNS,'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 24); c.classList.add(cls); svg.appendChild(c);
      const t = document.createElementNS(svgNS,'text'); t.textContent = label; t.setAttribute('x', x); t.setAttribute('y', y+4); t.classList.add('lstm-label'); svg.appendChild(t); return {x,y};
    }
    const hPrev = addInput(70, 140, 'h_{t-1}', 'lstm-hidden-circle');
    const xT    = addInput(70, 220, 'x_t', 'lstm-input-circle');
    const concatX = 110, concatY = 180;
    const concatRect = document.createElementNS(svgNS,'rect');
    concatRect.setAttribute('x', concatX - 26); concatRect.setAttribute('y', concatY - 26); concatRect.setAttribute('width', 52); concatRect.setAttribute('height', 52); concatRect.setAttribute('rx', 10);
    concatRect.setAttribute('fill','#1e1b4b'); concatRect.setAttribute('stroke','#64748b'); concatRect.setAttribute('stroke-width','2'); svg.appendChild(concatRect);
    const concatLabel = document.createElementNS(svgNS,'text'); concatLabel.textContent='concat'; concatLabel.setAttribute('x', concatX); concatLabel.setAttribute('y', concatY+4); concatLabel.classList.add('lstm-label'); svg.appendChild(concatLabel);
    function link(a,b){ const line=document.createElementNS(svgNS,'line'); line.setAttribute('x1', a.x); line.setAttribute('y1', a.y); line.setAttribute('x2', b.x); line.setAttribute('y2', b.y); line.classList.add('lstm-connector'); svg.appendChild(line);}    
    link(hPrev,{x:concatX-26, y:concatY-10}); link(xT,{x:concatX-26, y:concatY+10});
    const gateBaseX = 200;
    const gateY = { f:100, i:170, g:240, o:310 };
    function addGate(x,y,type){
      const r = document.createElementNS(svgNS,'rect'); r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width',80); r.setAttribute('height',50); r.setAttribute('rx',8);
      r.setAttribute('fill','#1e1b4b'); r.setAttribute('stroke', type==='g' ? '#ef4444' : '#eab308'); r.setAttribute('stroke-width','2'); svg.appendChild(r);
      const lab = document.createElementNS(svgNS,'text'); lab.textContent = type==='g' ? 'tanh' : 'σ'; lab.setAttribute('x', x+40); lab.setAttribute('y', y+18); lab.classList.add('lstm-label'); svg.appendChild(lab);
      const out = document.createElementNS(svgNS,'text'); out.textContent = type==='g' ? 'C̃_t' : (type+'_t'); out.setAttribute('x', x+40); out.setAttribute('y', y+36); out.classList.add('lstm-label'); svg.appendChild(out);
      return { x: x+80, y: y+25, gate: type };
    }
    const fGate = addGate(gateBaseX, gateY.f, 'f');
    const iGate = addGate(gateBaseX, gateY.i, 'i');
    const gGate = addGate(gateBaseX, gateY.g, 'g');
    const oGate = addGate(gateBaseX, gateY.o, 'o');
    [fGate,iGate,gGate,oGate].forEach(g=>{
      const line=document.createElementNS(svgNS,'line'); line.setAttribute('x1', concatX+26); line.setAttribute('y1', concatY); line.setAttribute('x2', g.x-10); line.setAttribute('y2', g.y); line.classList.add('lstm-connector'); svg.appendChild(line);
    });
    const cPrevX = 300, cY = 75;
    function triangle(x,label){
      const tri=document.createElementNS(svgNS,'polygon'); const top=cY-18; const blX=x-18, blY=cY+18; const brX=x+18, brY=cY+18; tri.setAttribute('points',`${x},${top} ${blX},${blY} ${brX},${brY}`); tri.classList.add('lstm-cell-triangle'); svg.appendChild(tri); const t=document.createElementNS(svgNS,'text'); t.textContent=label; t.setAttribute('x', x); t.setAttribute('y', cY+36); t.classList.add('lstm-label'); svg.appendChild(t); return x; }
    triangle(cPrevX,'C_{t-1}');
    function opNode(x,char){ const g=document.createElementNS(svgNS,'circle'); g.setAttribute('cx', x); g.setAttribute('cy', cY); g.setAttribute('r', 16); g.setAttribute('fill','#1e293b'); g.setAttribute('stroke','#64748b'); g.setAttribute('stroke-width','2'); svg.appendChild(g); const txt=document.createElementNS(svgNS,'text'); txt.textContent=char; txt.setAttribute('x', x); txt.setAttribute('y', cY+4); txt.classList.add('lstm-op'); svg.appendChild(txt); return x; }
    const mult1X = cPrevX + 70; opNode(mult1X,'×');
    const fLine=document.createElementNS(svgNS,'line'); fLine.setAttribute('x1', fGate.x); fLine.setAttribute('y1', fGate.y); fLine.setAttribute('x2', mult1X); fLine.setAttribute('y2', cY); fLine.classList.add('lstm-connector','emph'); svg.appendChild(fLine);
    const mult2X = mult1X + 110; opNode(mult2X,'×');
    const iLine=document.createElementNS(svgNS,'line'); iLine.setAttribute('x1', iGate.x); iLine.setAttribute('y1', iGate.y); iLine.setAttribute('x2', mult2X); iLine.setAttribute('y2', cY - 20); iLine.classList.add('lstm-connector','emph'); svg.appendChild(iLine);
    const gLine=document.createElementNS(svgNS,'line'); gLine.setAttribute('x1', gGate.x); gLine.setAttribute('y1', gGate.y); gLine.setAttribute('x2', mult2X); gLine.setAttribute('y2', cY + 20); gLine.classList.add('lstm-connector','emph'); svg.appendChild(gLine);
    const plusX = mult2X + 70; opNode(plusX,'+');
    const cNowX = plusX + 70; triangle(cNowX,'C_t');
    const tanhX = cNowX + 90; const tanhRect=document.createElementNS(svgNS,'rect'); tanhRect.setAttribute('x', tanhX-30); tanhRect.setAttribute('y', cY-30); tanhRect.setAttribute('width',60); tanhRect.setAttribute('height',60); tanhRect.setAttribute('rx',10); tanhRect.setAttribute('fill','#1e1b4b'); tanhRect.setAttribute('stroke','#ef4444'); tanhRect.setAttribute('stroke-width','2'); svg.appendChild(tanhRect); const tanhTxt=document.createElementNS(svgNS,'text'); tanhTxt.textContent='tanh'; tanhTxt.setAttribute('x', tanhX); tanhTxt.setAttribute('y', cY+4); tanhTxt.classList.add('lstm-label'); svg.appendChild(tanhTxt);
    const mult3X = tanhX + 80; opNode(mult3X,'×'); const oLine=document.createElementNS(svgNS,'line'); oLine.setAttribute('x1', oGate.x); oLine.setAttribute('y1', oGate.y); oLine.setAttribute('x2', mult3X); oLine.setAttribute('y2', cY); oLine.classList.add('lstm-connector','emph'); svg.appendChild(oLine);
    const hOutY = cY + 140; const hOutCircle=document.createElementNS(svgNS,'circle'); hOutCircle.setAttribute('cx', mult3X); hOutCircle.setAttribute('cy', hOutY); hOutCircle.setAttribute('r',24); hOutCircle.classList.add('lstm-hidden-circle'); svg.appendChild(hOutCircle); const hOutLabel=document.createElementNS(svgNS,'text'); hOutLabel.textContent='h_t'; hOutLabel.setAttribute('x', mult3X); hOutLabel.setAttribute('y', hOutY+4); hOutLabel.classList.add('lstm-label'); svg.appendChild(hOutLabel); const downLine=document.createElementNS(svgNS,'line'); downLine.setAttribute('x1', mult3X); downLine.setAttribute('y1', cY + 16); downLine.setAttribute('x2', mult3X); downLine.setAttribute('y2', hOutY - 24); downLine.classList.add('lstm-connector'); svg.appendChild(downLine);
    function weightLabel(x,y,sub){ const w=document.createElementNS(svgNS,'text'); w.textContent=''; const base=document.createTextNode('W'); const tspan=document.createElementNS(svgNS,'tspan'); tspan.textContent=sub; tspan.classList.add('subscript'); w.appendChild(base); w.appendChild(tspan); w.setAttribute('x', x); w.setAttribute('y', y); w.classList.add('lstm-weight-label'); w.setAttribute('text-anchor','middle'); svg.appendChild(w);}    
    weightLabel(gateBaseX+40, gateY.f - 10, 'f');
    weightLabel(gateBaseX+40, gateY.i - 10, 'i');
    weightLabel(gateBaseX+40, gateY.g - 10, 'c');
    weightLabel(gateBaseX+40, gateY.o - 10, 'o');
    return { svg };
  }

  // Step 1: simple panel with two incoming arrows (top & bottom)
  function buildLstmComposite(container){
    if(!container) return;
    container.innerHTML='';
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox', `0 0 ${dims.w} ${dims.h}`);
    container.appendChild(svg);
    // Panel box centered
    const panelX = 160, panelY = 60, panelW = 480, panelH = 260;
    const box = document.createElementNS(svgNS,'rect');
    box.setAttribute('x', panelX);
    box.setAttribute('y', panelY);
    box.setAttribute('width', panelW);
    box.setAttribute('height', panelH);
    box.setAttribute('rx', 18);
    box.setAttribute('fill','none');
    box.setAttribute('stroke','#334155');
    box.setAttribute('stroke-width','2');
    svg.appendChild(box);
    // Arrow markers
    const defs = document.createElementNS(svgNS,'defs');
    const marker = document.createElementNS(svgNS,'marker');
    marker.setAttribute('id','lstmSimpleArrow');
    marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','9');
    marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','7');
    marker.setAttribute('markerHeight','7');
    marker.setAttribute('orient','auto');
    const mPath = document.createElementNS(svgNS,'path');
    mPath.setAttribute('d','M 0 0 L 10 5 L 0 10 z');
    mPath.setAttribute('fill','#9333ea');
    marker.appendChild(mPath);
    defs.appendChild(marker);
    svg.appendChild(defs);
    // Incoming arrows remain outside panel; only vertical arrows stay inside
    const topY = panelY + 40;
    const bottomY = panelY + panelH - 40;
    const incomingStartX = panelX - 100;
    const incomingEndX = panelX; // panel left edge
    const lineTop = document.createElementNS(svgNS,'line');
    lineTop.setAttribute('x1', incomingStartX);
    lineTop.setAttribute('y1', topY);
    lineTop.setAttribute('x2', incomingEndX);
    lineTop.setAttribute('y2', topY);
    lineTop.setAttribute('stroke','#9333ea');
    lineTop.setAttribute('stroke-width','3');
    lineTop.setAttribute('marker-end','url(#lstmSimpleArrow)');
    svg.appendChild(lineTop);
    const lineBottom = document.createElementNS(svgNS,'line');
    lineBottom.setAttribute('x1', incomingStartX);
    lineBottom.setAttribute('y1', bottomY);
    lineBottom.setAttribute('x2', incomingEndX);
    lineBottom.setAttribute('y2', bottomY);
    lineBottom.setAttribute('stroke','#9333ea');
    lineBottom.setAttribute('stroke-width','3');
    lineBottom.setAttribute('marker-end','url(#lstmSimpleArrow)');
    svg.appendChild(lineBottom);
    // Placeholder labels for user to refine later
    const topLabel = document.createElementNS(svgNS,'text');
    topLabel.textContent='C';
    topLabel.setAttribute('x', incomingStartX - 5);
    topLabel.setAttribute('y', topY - 10);
    topLabel.setAttribute('text-anchor','end');
    topLabel.classList.add('lstm-label');
    svg.appendChild(topLabel);
    const bottomLabel = document.createElementNS(svgNS,'text');
    bottomLabel.textContent='h';
    bottomLabel.setAttribute('x', incomingStartX - 5);
    bottomLabel.setAttribute('y', bottomY - 10);
    bottomLabel.setAttribute('text-anchor','end');
    bottomLabel.classList.add('lstm-label');
    svg.appendChild(bottomLabel);
    // Top horizontal line now starts at panelX (no visual gap to incoming arrow)
    const topLine = document.createElementNS(svgNS,'line');
    const verticalStartX = panelX + 140; // internal starting point for vertical connectors (vertical arrows originate here)
    topLine.setAttribute('x1', panelX);
    topLine.setAttribute('y1', topY);
    topLine.setAttribute('x2', panelX + panelW);
    topLine.setAttribute('y2', topY);
    topLine.classList.add('lstm-path-line');
    svg.appendChild(topLine);
    // Split bottom path: shorter segment, gap, then segment to right edge
    const bottomFirstEnd = panelX + panelW * 0.45; // shorten to 45% panel width
    const gapSize = 70; // visual gap
    const bottomSecondStart = bottomFirstEnd + gapSize;
    // First bottom segment starts at panelX (flush with incoming bottom arrow end)
    const bottomLine1 = document.createElementNS(svgNS,'line');
    bottomLine1.setAttribute('x1', panelX);
    bottomLine1.setAttribute('y1', bottomY);
    bottomLine1.setAttribute('x2', bottomFirstEnd);
    bottomLine1.setAttribute('y2', bottomY);
    bottomLine1.classList.add('lstm-path-line');
    svg.appendChild(bottomLine1);
    // Upward external x input line from below panel into bottom line (left of first vertical arrow)
    const feedX = panelX + 40; // ensure to left of first vertical arrow
    const feedStartY = bottomY + 110; // start well below panel
    const feedLine = document.createElementNS(svgNS,'line');
    feedLine.setAttribute('x1', feedX);
    feedLine.setAttribute('y1', feedStartY);
    feedLine.setAttribute('x2', feedX);
    feedLine.setAttribute('y2', bottomY);
    feedLine.setAttribute('stroke','#9333ea');
    feedLine.setAttribute('stroke-width','3');
    feedLine.setAttribute('marker-end','url(#lstmSimpleArrow)');
    svg.appendChild(feedLine);
    const xLabel = document.createElementNS(svgNS,'text');
    xLabel.textContent = 'x';
    xLabel.setAttribute('x', feedX - 6);
    xLabel.setAttribute('y', feedStartY + 5);
    xLabel.setAttribute('text-anchor','end');
    xLabel.classList.add('lstm-label');
    svg.appendChild(xLabel);
    // Four equally spaced upward arrows from first bottom segment to top line
    const upwardCount = 4;
    // Distribute across entire first bottom segment (from panelX to bottomFirstEnd)
    const startXBottom = panelX;
    const spanWidth = bottomFirstEnd - startXBottom;
    let firstVerticalArrow = null;
    for(let i=1;i<=upwardCount;i++){
      // Distribute so last arrow sits exactly at bottomFirstEnd
      const xPos = startXBottom + (i * spanWidth)/upwardCount;
      // Collect x positions for potential custom path adjustments
      if(!svg._verticalXs){ svg._verticalXs = []; }
      svg._verticalXs.push(xPos);
      // Second and fourth arrows will be drawn later as bent paths
      if(i === 2 || i === 4) continue;
      const upLine = document.createElementNS(svgNS,'line');
      upLine.setAttribute('x1', xPos);
      upLine.setAttribute('y1', bottomY);
      upLine.setAttribute('x2', xPos);
      upLine.setAttribute('y2', topY);
      upLine.setAttribute('stroke','#9333ea');
      upLine.setAttribute('stroke-width','3');
      upLine.setAttribute('marker-end','url(#lstmSimpleArrow)');
      svg.appendChild(upLine);
      if(i === 1){
        firstVerticalArrow = upLine;
      }
      if(i === 3){
        // Store reference to third vertical arrow for plus circle placement later
        svg._thirdVerticalArrow = upLine;
      }
    }
    // Add bent second arrow: curve from bottom at second x up and right to meet third vertical arrow mid-height
    if(svg._verticalXs && svg._verticalXs.length === upwardCount){
      const secondX = svg._verticalXs[1];
      const thirdX = svg._verticalXs[2];
      const midY = (bottomY + topY)/2;
      const path = document.createElementNS(svgNS,'path');
      // Right-angle bend: vertical then horizontal stopping before circle so arrowhead is visible
      const circleRadius = 18; // smaller circle at tip
      const arrowHeadAllowance = 10; // space for arrowhead marker
      const finalX = thirdX - (circleRadius + arrowHeadAllowance);
      const d = `M ${secondX} ${bottomY} L ${secondX} ${midY} L ${finalX} ${midY}`;
      path.setAttribute('d', d);
      path.setAttribute('fill','none');
      path.setAttribute('stroke','#9333ea');
      path.setAttribute('stroke-width','3');
      path.setAttribute('marker-end','url(#lstmSimpleArrow)');
      svg.appendChild(path);
      // Circle placed at true tip location (thirdX, midY)
      const tipCircle = document.createElementNS(svgNS,'circle');
      tipCircle.setAttribute('cx', thirdX);
      tipCircle.setAttribute('cy', midY);
      tipCircle.setAttribute('r', circleRadius);
      tipCircle.setAttribute('fill','#1e293b');
      tipCircle.setAttribute('stroke','#64748b');
      tipCircle.setAttribute('stroke-width','2');
      svg.appendChild(tipCircle);
      // Text '×' inside second circle (unified operator style)
      const tipText = document.createElementNS(svgNS,'text');
      tipText.textContent = '×';
      tipText.setAttribute('x', thirdX);
      tipText.setAttribute('y', midY);
      tipText.classList.add('lstm-op-circle');
      svg.appendChild(tipText);
      // Activation rectangle (σ) for second arrow centered along its vertical segment
      const secondRectCenterY = bottomY + (midY - bottomY)/2;
      const secondRect = document.createElementNS(svgNS,'rect');
      secondRect.setAttribute('x', secondX - 20);
      secondRect.setAttribute('y', secondRectCenterY - 13);
      secondRect.setAttribute('width', 40);
      secondRect.setAttribute('height', 26);
      secondRect.setAttribute('rx', 6);
      secondRect.classList.add('lstm-activation-rect');
      svg.appendChild(secondRect);
      const secondSigma = document.createElementNS(svgNS,'text');
      secondSigma.textContent = 'σ';
      secondSigma.setAttribute('x', secondX);
      secondSigma.setAttribute('y', secondRectCenterY + 1);
      secondSigma.classList.add('lstm-activation-symbol');
      svg.appendChild(secondSigma);
      // Fourth arrow bent: up then right, stopping before circle so arrowhead visible
      const fourthX = svg._verticalXs[3];
      const connectorX = bottomSecondStart; // intended circle center
      const midY4 = (bottomY + topY)/2; // midpoint height for bend
      const circleRadius4 = 18;
      const arrowHeadAllowance4 = 10; // distance so marker does not overlap circle
      const finalX4 = connectorX - (circleRadius4 + arrowHeadAllowance4);
      const path4 = document.createElementNS(svgNS,'path');
      const d4 = `M ${fourthX} ${bottomY} L ${fourthX} ${midY4} L ${finalX4} ${midY4}`;
      path4.setAttribute('d', d4);
      path4.setAttribute('fill','none');
      path4.setAttribute('stroke','#9333ea');
      path4.setAttribute('stroke-width','3');
      path4.setAttribute('marker-end','url(#lstmSimpleArrow)');
      svg.appendChild(path4);
      // Defer circle/text creation until after connector line for correct layering
      svg._fourthOpData = { connectorX, midY4, circleRadius4 };
      // Activation rectangle (σ) for fourth arrow centered along its vertical segment
      const fourthRectCenterY = bottomY + (midY4 - bottomY)/2;
      const fourthRect = document.createElementNS(svgNS,'rect');
      fourthRect.setAttribute('x', fourthX - 20);
      fourthRect.setAttribute('y', fourthRectCenterY - 13);
      fourthRect.setAttribute('width', 40);
      fourthRect.setAttribute('height', 26);
      fourthRect.setAttribute('rx', 6);
      fourthRect.classList.add('lstm-activation-rect');
      svg.appendChild(fourthRect);
      const fourthSigma = document.createElementNS(svgNS,'text');
      fourthSigma.textContent = 'σ';
      fourthSigma.setAttribute('x', fourthX);
      fourthSigma.setAttribute('y', fourthRectCenterY + 1);
      fourthSigma.classList.add('lstm-activation-symbol');
      svg.appendChild(fourthSigma);
    }
    // Relocate multiply node onto first vertical arrow if available
    if(firstVerticalArrow){
      const firstX = firstVerticalArrow.getAttribute('x1');
      const multRadius = 18; // reduce size for consistency with second arrow tip circle
      // Place arrow head below circle: end at circle bottom boundary minus small gap (2px)
      // Circle bottom boundary = topY + multRadius; arrow end y increases downward.
      const arrowEndY = topY + multRadius - 2; // visible just below circle
      firstVerticalArrow.setAttribute('y2', arrowEndY);
      const multCircle = document.createElementNS(svgNS,'circle');
      multCircle.setAttribute('cx', firstX);
      multCircle.setAttribute('cy', topY);
      multCircle.setAttribute('r', multRadius);
      multCircle.setAttribute('fill','#1e293b');
      multCircle.setAttribute('stroke','#64748b');
      multCircle.setAttribute('stroke-width','2');
      svg.appendChild(multCircle);
      const multText = document.createElementNS(svgNS,'text');
      multText.textContent = '×';
      multText.setAttribute('x', firstX);
      multText.setAttribute('y', topY);
      multText.classList.add('lstm-op-circle');
      svg.appendChild(multText);
      // Activation rectangle (σ) for first vertical arrow aligned with others (quarter from bottom)
      const activationAlignY = bottomY + (((bottomY + topY)/2) - bottomY)/2; // same formula used for 2nd/4th
      const firstRect = document.createElementNS(svgNS,'rect');
      firstRect.setAttribute('x', firstX - 20);
      firstRect.setAttribute('y', activationAlignY - 13);
      firstRect.setAttribute('width', 40);
      firstRect.setAttribute('height', 26);
      firstRect.setAttribute('rx', 6);
      firstRect.classList.add('lstm-activation-rect');
      svg.appendChild(firstRect);
      const firstSigma = document.createElementNS(svgNS,'text');
      firstSigma.textContent = 'σ';
      firstSigma.setAttribute('x', firstX);
      firstSigma.setAttribute('y', activationAlignY + 1);
      firstSigma.classList.add('lstm-activation-symbol');
      svg.appendChild(firstSigma);
    }
    // Add plus circle at tip of third vertical arrow (top intersection)
    if(svg._thirdVerticalArrow){
      const plusRadius = 18;
      // Restore arrowhead marker and shorten arrow so head sits just below circle
      svg._thirdVerticalArrow.setAttribute('marker-end','url(#lstmSimpleArrow)');
      const plusX = svg._thirdVerticalArrow.getAttribute('x1');
      const arrowHeadGap = 2; // small gap below circle
      // y2 increases downward; set to topY + plusRadius - arrowHeadGap for visibility
      svg._thirdVerticalArrow.setAttribute('y2', (topY + plusRadius - arrowHeadGap));
      const plusCircle = document.createElementNS(svgNS,'circle');
      plusCircle.setAttribute('cx', plusX);
      plusCircle.setAttribute('cy', topY);
      plusCircle.setAttribute('r', plusRadius);
      plusCircle.setAttribute('fill','#1e293b');
      plusCircle.setAttribute('stroke','#64748b');
      plusCircle.setAttribute('stroke-width','2');
      svg.appendChild(plusCircle);
      const plusText = document.createElementNS(svgNS,'text');
      plusText.textContent = '+';
      plusText.setAttribute('x', plusX);
      plusText.setAttribute('y', topY);
      plusText.classList.add('lstm-op-circle');
      svg.appendChild(plusText);
      // Align tanh rectangle vertically with sigma rectangles (quarter from bottom)
      const tanhAlignY = bottomY + (((bottomY + topY)/2) - bottomY)/2;
      // Tanh activation rectangle centered along third vertical arrow span
      const tanhRect = document.createElementNS(svgNS,'rect');
      const tanhWidth = 56; // wider for 'tanh'
      const tanhHeight = 26;
      tanhRect.setAttribute('x', plusX - tanhWidth/2);
      tanhRect.setAttribute('y', tanhAlignY - tanhHeight/2);
      tanhRect.setAttribute('width', tanhWidth);
      tanhRect.setAttribute('height', tanhHeight);
      tanhRect.setAttribute('rx', 6);
      tanhRect.classList.add('lstm-activation-rect-tanh');
      // Insert before plus circle so plus circle stays visually on top
      svg.insertBefore(tanhRect, plusCircle);
      const tanhText = document.createElementNS(svgNS,'text');
      tanhText.textContent = 'tanh';
      tanhText.setAttribute('x', plusX);
      tanhText.setAttribute('y', tanhAlignY + 1);
      tanhText.classList.add('lstm-activation-symbol-tanh');
      svg.insertBefore(tanhText, plusCircle);
    }
    // Second segment
    const bottomLine2 = document.createElementNS(svgNS,'line');
    bottomLine2.setAttribute('x1', bottomSecondStart);
    bottomLine2.setAttribute('y1', bottomY);
    bottomLine2.setAttribute('x2', panelX + panelW);
    bottomLine2.setAttribute('y2', bottomY);
    bottomLine2.classList.add('lstm-path-line');
    svg.appendChild(bottomLine2);
    // Vertical connector (no arrow) at start of second bottom segment up to top line
    const secondSegConnector = document.createElementNS(svgNS,'line');
    secondSegConnector.setAttribute('x1', bottomSecondStart);
    secondSegConnector.setAttribute('y1', bottomY);
    secondSegConnector.setAttribute('x2', bottomSecondStart);
    secondSegConnector.setAttribute('y2', topY);
    secondSegConnector.classList.add('lstm-path-line');
    svg.appendChild(secondSegConnector);
    // Now draw the deferred fourth multiply circle so it sits above lines
    if(svg._fourthOpData){
      const { connectorX, midY4, circleRadius4 } = svg._fourthOpData;
      // Place tanh activation rectangle on the vertical connector line (to the right of previous placement)
      // Position it above the multiply circle: center above by circle radius + spacing
      const tanhSpacing = 30; // vertical spacing above circle center
      const tanhWidth4 = 56, tanhHeight4 = 26;
      const tanhCenterY4 = midY4 - (circleRadius4 + tanhSpacing);
      const tanhRect4 = document.createElementNS(svgNS,'rect');
      tanhRect4.setAttribute('x', connectorX - tanhWidth4/2);
      tanhRect4.setAttribute('y', tanhCenterY4 - tanhHeight4/2);
      tanhRect4.setAttribute('width', tanhWidth4);
      tanhRect4.setAttribute('height', tanhHeight4);
      tanhRect4.setAttribute('rx', 6);
      tanhRect4.classList.add('lstm-activation-rect-tanh');
      svg.appendChild(tanhRect4);
      const tanhText4 = document.createElementNS(svgNS,'text');
      tanhText4.textContent = 'tanh';
      tanhText4.setAttribute('x', connectorX);
      tanhText4.setAttribute('y', tanhCenterY4 + 1);
      tanhText4.classList.add('lstm-activation-symbol-tanh');
      svg.appendChild(tanhText4);
      const fourthCircle = document.createElementNS(svgNS,'circle');
      fourthCircle.setAttribute('cx', connectorX);
      fourthCircle.setAttribute('cy', midY4);
      fourthCircle.setAttribute('r', circleRadius4);
      fourthCircle.setAttribute('fill','#1e293b');
      fourthCircle.setAttribute('stroke','#64748b');
      fourthCircle.setAttribute('stroke-width','2');
      svg.appendChild(fourthCircle);
      const fourthText = document.createElementNS(svgNS,'text');
      fourthText.textContent = '×';
      fourthText.setAttribute('x', connectorX);
      fourthText.setAttribute('y', midY4);
      fourthText.classList.add('lstm-op-circle');
      svg.appendChild(fourthText);
      delete svg._fourthOpData;
    }
    // Outgoing arrows (outputs) from right edge
    const outArrowLength = 120;
    // Top output C'
    const topOut = document.createElementNS(svgNS,'line');
    topOut.setAttribute('x1', panelX + panelW);
    topOut.setAttribute('y1', topY);
    topOut.setAttribute('x2', panelX + panelW + outArrowLength);
    topOut.setAttribute('y2', topY);
    topOut.setAttribute('stroke','#9333ea');
    topOut.setAttribute('stroke-width','3');
    topOut.setAttribute('marker-end','url(#lstmSimpleArrow)');
    svg.appendChild(topOut);
    const topOutLabel = document.createElementNS(svgNS,'text');
    topOutLabel.textContent = "C'";
    topOutLabel.setAttribute('x', panelX + panelW + outArrowLength + 10);
    topOutLabel.setAttribute('y', topY - 6);
    topOutLabel.classList.add('lstm-label');
    topOutLabel.setAttribute('text-anchor','start');
    svg.appendChild(topOutLabel);
    // Bottom output h'
    const bottomOut = document.createElementNS(svgNS,'line');
    bottomOut.setAttribute('x1', panelX + panelW);
    bottomOut.setAttribute('y1', bottomY);
    bottomOut.setAttribute('x2', panelX + panelW + outArrowLength);
    bottomOut.setAttribute('y2', bottomY);
    bottomOut.setAttribute('stroke','#9333ea');
    bottomOut.setAttribute('stroke-width','3');
    bottomOut.setAttribute('marker-end','url(#lstmSimpleArrow)');
    svg.appendChild(bottomOut);
    const bottomOutLabel = document.createElementNS(svgNS,'text');
    bottomOutLabel.textContent = "h'";
    bottomOutLabel.setAttribute('x', panelX + panelW + outArrowLength + 10);
    bottomOutLabel.setAttribute('y', bottomY - 6);
    bottomOutLabel.classList.add('lstm-label');
    bottomOutLabel.setAttribute('text-anchor','start');
    svg.appendChild(bottomOutLabel);
    return { svg, panelX, panelY, panelW, panelH, topY, bottomY, incomingStartX, incomingEndX, feedX, verticalXs: svg._verticalXs || [], bottomSecondStart };
  }

  function rebuildLstmComposite(){
    if(!lstmCompositeContainer) return;
    lstmCompositeLayout = buildLstmComposite(lstmCompositeContainer);
    lstmCompositeFlowState.phase = 0; lstmCompositeFlowState.running = false;
    lstmCompositeFlowState.autoRun = false;
    const btn = document.getElementById('lstmCompositeAnimateBtn');
    if(btn) btn.textContent = 'Step';
  }
  rebuildLstmComposite();

  function createDot(x,y, cls){
    const { svg } = lstmCompositeLayout || {}; if(!svg) return null;
    const c = document.createElementNS(svgNS,'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 10);
    c.classList.add('anim-flow-dot', cls);
    svg.appendChild(c); return c;
  }

  function animateLstmCompositeStep1(){
    if(!lstmCompositeLayout || lstmCompositeFlowState.running) return;
    const { svg, incomingStartX, bottomY, feedX } = lstmCompositeLayout;
    // Step1 refactor: ONLY animate orange and green merging into a single purple dot, then pause.
    // No red dot movement or creation yet.
    const meetX = feedX; const meetY = bottomY;
    const orangeStartX = incomingStartX; const orangeEndX = meetX;
    const greenStartY = bottomY + 110; const greenEndY = meetY;
    const duration = 1600 * lstmAutoSpeedFactor();
    const startTs = performance.now();
    lstmCompositeFlowState.running = true; lstmCompositeFlowState.phase = 1;
    // Clear any existing dots from previous runs
    lstmCompositeFlowState.dots.forEach(d=>d.remove());
    lstmCompositeFlowState.dots = [];
    // Create orange & green
    const orangeDot = createDot(orangeStartX, bottomY, 'anim-dot-orange');
    const greenDot = createDot(feedX, greenStartY, 'anim-dot-green');
    lstmCompositeFlowState.dots.push(orangeDot, greenDot);
    function frame(ts){
      const t = Math.min(1,(ts - startTs)/duration);
      const ease = t*t*(3 - 2*t); // smoothstep
      const orangeX = orangeStartX + (orangeEndX - orangeStartX)*ease;
      orangeDot.setAttribute('cx', orangeX);
      const greenY = greenStartY + (greenEndY - greenStartY)*ease;
      greenDot.setAttribute('cy', greenY);
      if(t < 1){ requestAnimationFrame(frame); } else { finalizeStep1(); }
    }
    requestAnimationFrame(frame);
    function finalizeStep1(){
      // Replace both with a single purple dot at merge point
      orangeDot.remove(); greenDot.remove();
      const purpleDot = createDot(meetX, meetY, 'anim-dot-purple');
      lstmCompositeFlowState.dots = [purpleDot];
      // Pause: mark not running so next step can be triggered manually
      lstmCompositeFlowState.running = false;
      lstmCompositeFlowState.phase = 1; // still phase1 complete
      const btn = document.getElementById('lstmCompositeAnimateBtn');
      if(btn) btn.textContent = 'Step';
      if(lstmCompositeFlowState.autoRun){ animateLstmCompositeStep2(); }
    }
  }

  // Step2: purple (result of merge) moves to base of first vertical arrow, stops; spawns green moving to base of second vertical arrow; stops; spawns another green moving to base of third vertical arrow; stops.
  function animateLstmCompositeStep2(){
    if(!lstmCompositeLayout) return;
    // Require completion of step1: phase==1 and exactly one purple dot present.
    if(lstmCompositeFlowState.running) return;
    if(lstmCompositeFlowState.phase !== 1) return;
    const purpleDot = lstmCompositeFlowState.dots.find(d=>d.classList.contains('anim-dot-purple'));
    if(!purpleDot) return; // nothing to propagate
    const { bottomY, verticalXs } = lstmCompositeLayout;
    if(!verticalXs || verticalXs.length < 4) return;
    const firstBaseX = verticalXs[0];
    const secondBaseX = verticalXs[1];
    const thirdBaseX = verticalXs[2];
    const fourthBaseX = verticalXs[3];

    const segmentDuration = 1000 * lstmAutoSpeedFactor(); // ms per movement segment (scaled)
    lstmCompositeFlowState.running = true;

    // Segment 1: purple moves horizontally to first vertical base.
    const startPurpleX = parseFloat(purpleDot.getAttribute('cx'));
    function movePurple(tsStart){
      function frame(ts){
        const t = Math.min(1,(ts - tsStart)/segmentDuration);
        const ease = t*t*(3 - 2*t);
        const nx = startPurpleX + (firstBaseX - startPurpleX)*ease;
        purpleDot.setAttribute('cx', nx);
        purpleDot.setAttribute('cy', bottomY);
        if(t < 1){ requestAnimationFrame(frame); } else { spawnFirstGreen(); }
      }
      requestAnimationFrame(frame);
    }

    function spawnFirstGreen(){
      // Spawn green at firstBaseX bottomY and move to secondBaseX
      const green1 = createDot(firstBaseX, bottomY, 'anim-dot-green');
      lstmCompositeFlowState.dots.push(green1);
      const startX = firstBaseX;
      function frame(tsStart){
        function seg(ts){
          const t = Math.min(1,(ts - tsStart)/segmentDuration);
          const ease = t*t*(3 - 2*t);
          const nx = startX + (secondBaseX - startX)*ease;
          green1.setAttribute('cx', nx);
          if(t < 1){ requestAnimationFrame(seg); } else { spawnSecondGreen(green1); }
        }
        requestAnimationFrame(seg);
      }
      frame(performance.now());
    }

    function spawnSecondGreen(green1){
      // Spawn second green at secondBaseX, move to thirdBaseX then spawn third
      const green2 = createDot(secondBaseX, bottomY, 'anim-dot-green');
      lstmCompositeFlowState.dots.push(green2);
      const startX = secondBaseX;
      function frame(tsStart){
        function seg(ts){
          const t = Math.min(1,(ts - tsStart)/segmentDuration);
          const ease = t*t*(3 - 2*t);
          const nx = startX + (thirdBaseX - startX)*ease;
          green2.setAttribute('cx', nx);
          if(t < 1){ requestAnimationFrame(seg); } else { spawnThirdGreen(green1, green2); }
        }
        requestAnimationFrame(seg);
      }
      frame(performance.now());
    }

    function spawnThirdGreen(green1, green2){
      const green3 = createDot(thirdBaseX, bottomY, 'anim-dot-green');
      lstmCompositeFlowState.dots.push(green3);
      const startX = thirdBaseX;
      function frame(tsStart){
        function seg(ts){
          const t = Math.min(1,(ts - tsStart)/segmentDuration);
          const ease = t*t*(3 - 2*t);
          const nx = startX + (fourthBaseX - startX)*ease;
          green3.setAttribute('cx', nx);
          if(t < 1){ requestAnimationFrame(seg); } else { finalizeStep2(green1, green2, green3); }
        }
        requestAnimationFrame(seg);
      }
      frame(performance.now());
    }

    function finalizeStep2(green1, green2, green3){
      // End state: purple firstBaseX, greens at second, third, fourth bases.
      purpleDot.setAttribute('cx', firstBaseX); purpleDot.setAttribute('cy', bottomY);
      green1.setAttribute('cx', secondBaseX); green1.setAttribute('cy', bottomY);
      green2.setAttribute('cx', thirdBaseX); green2.setAttribute('cy', bottomY);
      green3.setAttribute('cx', fourthBaseX); green3.setAttribute('cy', bottomY);
      lstmCompositeFlowState.phase = 2;
      lstmCompositeFlowState.running = false;
      const btn = document.getElementById('lstmCompositeAnimateBtn');
      if(btn) btn.textContent = 'Step';
      if(lstmCompositeFlowState.autoRun){ animateLstmCompositeStep3(); }
    }

    movePurple(performance.now());
  }

  // Step3: vertical merge. Purple (at first vertical base) ascends; simultaneously a red dot enters from top left input along top horizontal into the first vertical intersection. On meeting, purple removed; merged dot stays red.
  function animateLstmCompositeStep3(){
    if(!lstmCompositeLayout) return;
    if(lstmCompositeFlowState.running) return;
    if(lstmCompositeFlowState.phase !== 2) return; // require completion of step2
    const { incomingStartX, topY, bottomY, verticalXs } = lstmCompositeLayout;
    if(!verticalXs || verticalXs.length === 0) return;
    const firstVerticalX = verticalXs[0];
    // Find purple at base
    const purpleDot = lstmCompositeFlowState.dots.find(d=>d.classList.contains('anim-dot-purple'));
    if(!purpleDot) return; // safety
    const startPurpleY = bottomY;
    const redStartX = incomingStartX;
    const redEndX = firstVerticalX;
    const duration = 1400 * lstmAutoSpeedFactor(); // ms (scaled)
    const startTs = performance.now();
    lstmCompositeFlowState.running = true;
    // Create incoming red dot
    const redDot = createDot(redStartX, topY, 'anim-dot-red');
    lstmCompositeFlowState.dots.push(redDot);

    function frame(ts){
      const t = Math.min(1,(ts - startTs)/duration);
      // Use smoothstep easing
      const ease = t*t*(3 - 2*t);
      // Purple vertical ascent
      const pY = startPurpleY + (topY - startPurpleY)*ease;
      purpleDot.setAttribute('cx', firstVerticalX);
      purpleDot.setAttribute('cy', pY);
      // Red horizontal travel
      const rX = redStartX + (redEndX - redStartX)*ease;
      redDot.setAttribute('cx', rX);
      redDot.setAttribute('cy', topY);
      if(t < 1){
        requestAnimationFrame(frame);
      } else {
        finalizeStep3(redDot, purpleDot);
      }
    }
    requestAnimationFrame(frame);

    function finalizeStep3(redDot, purpleDot){
      // Ensure both at intersection; remove purple and keep red.
      purpleDot.remove();
      lstmCompositeFlowState.dots = lstmCompositeFlowState.dots.filter(d=>d!==purpleDot);
      redDot.setAttribute('cx', firstVerticalX);
      redDot.setAttribute('cy', topY);
      lstmCompositeFlowState.phase = 3;
      lstmCompositeFlowState.running = false;
      const btn = document.getElementById('lstmCompositeAnimateBtn');
      if(btn) btn.textContent = 'Step';
      if(lstmCompositeFlowState.autoRun){ animateLstmCompositeStep4(); }
    }
  }

  // Step4: first green (at second base) moves up then across bent second arrow path to intersection midY; second green (at third base) moves straight up third vertical to same midY; they merge into a purple dot.
  function animateLstmCompositeStep4(){
    if(!lstmCompositeLayout) return;
    if(lstmCompositeFlowState.running) return;
    if(lstmCompositeFlowState.phase !== 3) return; // after step3 merge
    const { bottomY, topY, verticalXs } = lstmCompositeLayout;
    if(!verticalXs || verticalXs.length < 3) return;
    const secondX = verticalXs[1];
    const thirdX = verticalXs[2];
    const midY = (bottomY + topY)/2; // intersection height used earlier for bent path
    // Identify two green dots by their x positions (closest to secondX & thirdX) and y==bottomY
    const greens = lstmCompositeFlowState.dots.filter(d=>d.classList.contains('anim-dot-green'));
    if(greens.length < 2) return;
    let greenSecondBase = null, greenThirdBase = null;
    greens.forEach(g=>{
      const gx = parseFloat(g.getAttribute('cx'));
      if(Math.abs(gx - secondX) < 2) greenSecondBase = g; else if(Math.abs(gx - thirdX) < 2) greenThirdBase = g;
    });
    if(!greenSecondBase || !greenThirdBase) return;
    lstmCompositeFlowState.running = true;
    const duration = 1300 * lstmAutoSpeedFactor();
    const startTs = performance.now();
    function frame(ts){
      const t = Math.min(1,(ts - startTs)/duration);
      const ease = t*t*(3 - 2*t);
      // Green1 path: vertical to midY (first half), then horizontal to thirdX (second half)
      let g1x, g1y;
      if(ease < 0.5){
        const p = ease/0.5;
        g1x = secondX;
        g1y = bottomY + (midY - bottomY)*p;
      } else {
        const p = (ease - 0.5)/0.5;
        g1x = secondX + (thirdX - secondX)*p;
        g1y = midY;
      }
      greenSecondBase.setAttribute('cx', g1x);
      greenSecondBase.setAttribute('cy', g1y);
      // Green2 path: vertical straight to midY over full ease
      const g2y = bottomY + (midY - bottomY)*ease;
      greenThirdBase.setAttribute('cx', thirdX);
      greenThirdBase.setAttribute('cy', g2y);
      if(t < 1){
        requestAnimationFrame(frame);
      } else {
        finalizeStep4(greenSecondBase, greenThirdBase);
      }
    }
    requestAnimationFrame(frame);
    function finalizeStep4(g1, g2){
      // Place both at intersection then merge into purple
      g1.setAttribute('cx', thirdX); g1.setAttribute('cy', midY);
      g2.setAttribute('cx', thirdX); g2.setAttribute('cy', midY);
      // Remove both and add purple
      g1.remove(); g2.remove();
      lstmCompositeFlowState.dots = lstmCompositeFlowState.dots.filter(d=>d!==g1 && d!==g2);
      const purple = createDot(thirdX, midY, 'anim-dot-purple');
      lstmCompositeFlowState.dots.push(purple);
      lstmCompositeFlowState.phase = 4;
      lstmCompositeFlowState.running = false;
      const btn = document.getElementById('lstmCompositeAnimateBtn');
      if(btn) btn.textContent = 'Step';
      if(lstmCompositeFlowState.autoRun){ animateLstmCompositeStep5(); }
    }
  }

  // Step5: purple (at third vertical midY) moves upward to top line; simultaneously red (at first vertical top) moves horizontally right; on meeting they merge (remain red).
  function animateLstmCompositeStep5(){
    if(!lstmCompositeLayout) return;
    if(lstmCompositeFlowState.running) return;
    if(lstmCompositeFlowState.phase !== 4) return; // require completion of step4
    const { topY, bottomY, verticalXs } = lstmCompositeLayout;
    if(!verticalXs || verticalXs.length < 3) return;
    const firstX = verticalXs[0];
    const thirdX = verticalXs[2];
    // Find purple at thirdX midY and red at firstX topY
    const purpleDot = lstmCompositeFlowState.dots.find(d=>d.classList.contains('anim-dot-purple'));
    const redDot = lstmCompositeFlowState.dots.find(d=>d.classList.contains('anim-dot-red'));
    if(!purpleDot || !redDot) return; // ensure required dots
    const startPurpleY = parseFloat(purpleDot.getAttribute('cy'));
    const startRedX = parseFloat(redDot.getAttribute('cx'));
    const duration = 1400 * lstmAutoSpeedFactor();
    const startTs = performance.now();
    lstmCompositeFlowState.running = true;
    function frame(ts){
      const t = Math.min(1, (ts - startTs)/duration);
      const ease = t*t*(3 - 2*t);
      // Purple vertical ascent
      const pY = startPurpleY + (topY - startPurpleY)*ease;
      purpleDot.setAttribute('cx', thirdX);
      purpleDot.setAttribute('cy', pY);
      // Red horizontal move
      const rX = startRedX + (thirdX - startRedX)*ease;
      redDot.setAttribute('cx', rX);
      redDot.setAttribute('cy', topY);
      if(t < 1){
        requestAnimationFrame(frame);
      } else {
        finalizeStep5(redDot, purpleDot);
      }
    }
    requestAnimationFrame(frame);
    function finalizeStep5(redDot, purpleDot){
      // Merge: remove purple, keep red at final intersection
      purpleDot.remove();
      lstmCompositeFlowState.dots = lstmCompositeFlowState.dots.filter(d=>d!==purpleDot);
      redDot.setAttribute('cx', thirdX);
      redDot.setAttribute('cy', topY);
      lstmCompositeFlowState.phase = 5;
      lstmCompositeFlowState.running = false;
      const btn = document.getElementById('lstmCompositeAnimateBtn');
      if(btn) btn.textContent = 'Step';
      if(lstmCompositeFlowState.autoRun){ animateLstmCompositeStep6(); }
    }
  }

  // Step6: green at fourth base traverses bent fourth arrow to multiply circle; red at third vertical top moves right to connector then spawns a descending red; descending red and green merge into orange at multiply circle.
  function animateLstmCompositeStep6(){
    if(!lstmCompositeLayout) return;
    if(lstmCompositeFlowState.running) return;
    if(lstmCompositeFlowState.phase !== 5) return; // require completion of step5
    const { topY, bottomY, verticalXs, bottomSecondStart } = lstmCompositeLayout;
    if(!verticalXs || verticalXs.length < 4) return;
    const fourthX = verticalXs[3];
    const thirdX = verticalXs[2];
    const connectorX = bottomSecondStart; // multiply circle center
    const midY4 = (bottomY + topY)/2;
    // Identify green at fourth base and red at third top
    const greenDot = lstmCompositeFlowState.dots.find(d=>d.classList.contains('anim-dot-green') && Math.abs(parseFloat(d.getAttribute('cx')) - fourthX) < 2);
    const redTop = lstmCompositeFlowState.dots.find(d=>d.classList.contains('anim-dot-red'));
    if(!greenDot || !redTop) return;
    lstmCompositeFlowState.running = true;
    const duration = 1800 * lstmAutoSpeedFactor(); // total time (scaled)
    const spawnProgress = 0.5; // point when red reaches connectorX and spawn occurs
    const startTs = performance.now();
    let spawnedDescendingRed = false;
    let redDownDot = null;
    function frame(ts){
      const t = Math.min(1, (ts - startTs)/duration);
      const ease = t*t*(3 - 2*t);
      // Green movement: same pattern (vertical then horizontal)
      let gX, gY;
      if(ease < 0.5){
        const p = ease/0.5;
        gX = fourthX;
        gY = bottomY + (midY4 - bottomY)*p;
      } else {
        const p = (ease - 0.5)/0.5;
        gX = fourthX + (connectorX - fourthX)*p;
        gY = midY4;
      }
      greenDot.setAttribute('cx', gX); greenDot.setAttribute('cy', gY);
      // Red horizontal movement capped at spawnProgress then stays.
      const redEase = Math.min(ease / spawnProgress, 1);
      const rX = thirdX + (connectorX - thirdX)*redEase;
      redTop.setAttribute('cx', rX); redTop.setAttribute('cy', topY);
      // Spawn descending red only once red has arrived (redEase==1)
      if(!spawnedDescendingRed && redEase >= 1){
        spawnedDescendingRed = true;
        redDownDot = createDot(connectorX, topY, 'anim-dot-red');
        lstmCompositeFlowState.dots.push(redDownDot);
      }
      // Descending red movement after spawn over remaining time (ease from spawnProgress to 1)
      if(redDownDot){
        const downPhase = (ease - spawnProgress) / (1 - spawnProgress); // 0..1 after spawn
        const downClamped = Math.max(0, Math.min(1, downPhase));
        const ddY = topY + (midY4 - topY)*downClamped;
        redDownDot.setAttribute('cx', connectorX);
        redDownDot.setAttribute('cy', ddY);
      }
      if(t < 1){
        requestAnimationFrame(frame);
      } else {
        finalizeStep6(redTop, redDownDot, greenDot, connectorX, midY4);
      }
    }
    requestAnimationFrame(frame);
    function finalizeStep6(redTop, redDownDot, greenDot, cx, cy){
      // Ensure final positions at multiply circle center for merging (descending red & green)
      if(redDownDot){ redDownDot.setAttribute('cx', cx); redDownDot.setAttribute('cy', cy); }
      greenDot.setAttribute('cx', cx); greenDot.setAttribute('cy', cy);
      // Remove merging participants (green + descending red) and create orange result
      if(redDownDot){
        redDownDot.remove(); lstmCompositeFlowState.dots = lstmCompositeFlowState.dots.filter(d=>d!==redDownDot);
      }
      greenDot.remove(); lstmCompositeFlowState.dots = lstmCompositeFlowState.dots.filter(d=>d!==greenDot);
      const orange = createDot(cx, cy, 'anim-dot-orange');
      lstmCompositeFlowState.dots.push(orange);
      // Keep original top red at connector top position (already moved right); ensure final horizontal position
      redTop.setAttribute('cx', connectorX); redTop.setAttribute('cy', topY);
      lstmCompositeFlowState.phase = 6; lstmCompositeFlowState.running = false;
      const btn = document.getElementById('lstmCompositeAnimateBtn');
      if(btn) btn.textContent = 'Step';
      if(lstmCompositeFlowState.autoRun){ animateLstmCompositeStep7(); }
    }
  }

  // Step7: propagate red (top) and blue (converted from orange at multiply circle) to outputs C' and h'.
  function animateLstmCompositeStep7(){
    if(!lstmCompositeLayout) return;
    if(lstmCompositeFlowState.running) return;
    if(lstmCompositeFlowState.phase !== 6) return; // after step6 merge
    const { panelX, panelW, topY, bottomY, bottomSecondStart } = lstmCompositeLayout;
    const outArrowLength = 120; // same length used when drawing output arrows
    const outputEndX = panelX + panelW + outArrowLength; // final target X for both dots
    // Identify current red (top) and orange (mid) dots
    const redTop = lstmCompositeFlowState.dots.find(d=>d.classList.contains('anim-dot-red') && Math.abs(parseFloat(d.getAttribute('cy')) - topY) < 2);
    const orangeMid = lstmCompositeFlowState.dots.find(d=>d.classList.contains('anim-dot-orange'));
    if(!redTop || !orangeMid) return;
    const startRedX = parseFloat(redTop.getAttribute('cx'));
    const startBlueX = parseFloat(orangeMid.getAttribute('cx'));
    const startBlueY = parseFloat(orangeMid.getAttribute('cy'));
    const midY4 = startBlueY; // current mid height
    const verticalFrac = 0.3; // fraction of duration for vertical descent
    const duration = 1600 * lstmAutoSpeedFactor();
    const startTs = performance.now();
    lstmCompositeFlowState.running = true;
    function frame(ts){
      const t = Math.min(1, (ts - startTs)/duration);
      const ease = t*t*(3 - 2*t);
      // Red purely horizontal
      const redX = startRedX + (outputEndX - startRedX) * ease;
      redTop.setAttribute('cx', redX);
      redTop.setAttribute('cy', topY);
      // Blue: vertical descent then horizontal travel along bottom line
      let blueX, blueY;
      if(ease < verticalFrac){
        const p = ease/verticalFrac;
        blueX = startBlueX; // stay in place horizontally during descent
        blueY = midY4 + (bottomY - midY4)*p;
      } else {
        blueY = bottomY;
        const hProgress = (ease - verticalFrac)/(1 - verticalFrac);
        // Horizontal path begins at bottomSecondStart (connector) regardless of starting x
        const beginX = bottomSecondStart;
        blueX = beginX + (outputEndX - beginX)*hProgress;
      }
      orangeMid.setAttribute('cx', blueX);
      orangeMid.setAttribute('cy', blueY);
      if(t < 1){
        requestAnimationFrame(frame);
      } else {
        finalizeStep7(redTop, orangeMid, outputEndX);
      }
    }
    requestAnimationFrame(frame);
    function finalizeStep7(redTop, orangeDot, endX){
      redTop.setAttribute('cx', endX); redTop.setAttribute('cy', topY);
      orangeDot.setAttribute('cx', endX); orangeDot.setAttribute('cy', bottomY);
      lstmCompositeFlowState.phase = 7; lstmCompositeFlowState.running = false;
      const btn = document.getElementById('lstmCompositeAnimateBtn');
      if(btn) btn.textContent = 'Step';
    }
  }

  function resetLstmCompositeFlow(){
    if(!lstmCompositeLayout) return;
    lstmCompositeFlowState.dots.forEach(d=>d.remove());
    lstmCompositeFlowState.dots = []; lstmCompositeFlowState.phase = 0; lstmCompositeFlowState.running = false;
  }
  if(lstmCompositeAnimateBtn){
    lstmCompositeAnimateBtn.addEventListener('click', ()=>{
      lstmCompositeFlowState.autoRun = false; // manual step cancels auto-run if set
      if(lstmCompositeFlowState.phase === 0) {
        animateLstmCompositeStep1();
      } else if(lstmCompositeFlowState.phase === 1) {
        animateLstmCompositeStep2();
      } else if(lstmCompositeFlowState.phase === 2) {
        animateLstmCompositeStep3();
      } else if(lstmCompositeFlowState.phase === 3) {
        animateLstmCompositeStep4();
      } else if(lstmCompositeFlowState.phase === 4) {
        animateLstmCompositeStep5();
      } else if(lstmCompositeFlowState.phase === 5) {
        animateLstmCompositeStep6();
      } else if(lstmCompositeFlowState.phase === 6) {
        animateLstmCompositeStep7();
      }
    });
  }
  if(lstmCompositeAnimateAllBtn){
    lstmCompositeAnimateAllBtn.addEventListener('click', ()=>{
      // Reset and start auto-run from step1
      resetLstmCompositeFlow();
      lstmCompositeFlowState.autoRun = true;
      animateLstmCompositeStep1();
    });
  }
  if(lstmCompositeResetBtn){ lstmCompositeResetBtn.addEventListener('click', resetLstmCompositeFlow); }

  function animateStep(){
    if(animated) return; // simple single-step
    ensureOverlay();
    const duration = 1200; // ms
    const start = performance.now();

    // Create clones
    // Compute global positions
    const hiddenRect = containerHidden.getBoundingClientRect();
    const inputRect = containerInputHidden.getBoundingClientRect();
    const targetRect = containerTarget.getBoundingClientRect();
    const rowRect = document.querySelector('.panels-row').getBoundingClientRect();

    function localToOverlay(x,y, containerRect){
      // x,y in SVG viewBox coordinates relative to dims.w/dims.h; scale to container client
      const sx = containerRect.width / dims.w;
      const sy = containerRect.height / dims.h;
      const cx = containerRect.left - rowRect.left + x * sx;
      const cy = containerRect.top - rowRect.top + y * sy;
      return { x: cx, y: cy };
    }
    // Compute desired end positions side-by-side inside target panel
    const outputCount = currentHiddenOutputs.length; // same number for both sets
    const targetScaleY = targetRect.height / dims.h;
    function rowY(i){
      return outputCount === 1 ? dims.h/2 : padding + i * ((dims.h - 2*padding)/(outputCount - 1));
    }
    const leftStart = targetRect.left - rowRect.left + 60; // starting X inside target panel
    const colGap = 110; // gap between vector columns
    const endHidden = Array.from({length:outputCount}, (_,i)=>({
      x: leftStart,
      y: targetRect.top - rowRect.top + rowY(i) * targetScaleY
    }));
    const endGreen = Array.from({length:outputCount}, (_,i)=>({
      x: leftStart + colGap,
      y: targetRect.top - rowRect.top + rowY(i) * targetScaleY
    }));

    const hiddenClones = currentHiddenOutputs.map((o,i)=>{
      const startP = localToOverlay(o.x, o.y, hiddenRect);
      const c = document.createElementNS(svgNS,'circle');
      c.setAttribute('cx', startP.x);
      c.setAttribute('cy', startP.y);
      c.setAttribute('r', 25);
      c.setAttribute('fill', '#12161c');
      c.setAttribute('stroke', '#f59e0b');
      c.classList.add('clone-node');
      overlaySvgHidden.appendChild(c);
      return c;
    });
    const inputClones = currentInputHiddenOutputs.map((o,i)=>{
      const startP = localToOverlay(o.x, o.y, inputRect);
      const c = document.createElementNS(svgNS,'circle');
      c.setAttribute('cx', startP.x);
      c.setAttribute('cy', startP.y);
      c.setAttribute('r', 25);
      c.setAttribute('fill', '#12161c');
      c.setAttribute('stroke', '#10b981');
      c.classList.add('clone-node');
      overlaySvgHidden.appendChild(c);
      return c;
    });

    function frame(ts){
      const t = Math.min(1, (ts - start)/duration);
      // Ease (quadratic)
      const ease = t*t;
      inputClones.forEach((c,i)=>{
        const startP = localToOverlay(currentInputHiddenOutputs[i].x, currentInputHiddenOutputs[i].y, inputRect);
        const endP = endGreen[i];
        const newX = startP.x + (endP.x - startP.x) * ease;
        const newY = startP.y + (endP.y - startP.y) * ease;
        c.setAttribute('cx', newX);
        c.setAttribute('cy', newY);
      });
      hiddenClones.forEach((c,i)=>{
        const startP = localToOverlay(currentHiddenOutputs[i].x, currentHiddenOutputs[i].y, hiddenRect);
        const endP = endHidden[i];
        const newX = startP.x + (endP.x - startP.x) * ease;
        const newY = startP.y + (endP.y - startP.y) * ease;
        c.setAttribute('cx', newX);
        c.setAttribute('cy', newY);
      });
      if(t < 1){
        requestAnimationFrame(frame);
      } else {
        animated = true;
        revealExpression(endHidden, endGreen);
      }
    }
    requestAnimationFrame(frame);
  }

  function revealExpression(endHidden, endGreen){
    if(!overlaySvgHidden) return;
    const count = endHidden.length;
    // Layout columns (no bias column for section one)
    const resultColX = endGreen[0].x + 110; // result vector column to right of green
    // Vertically center operators between top and bottom of the vector columns
    const minY = endHidden[0].y;
    const maxY = endHidden[count - 1].y;
    const operatorY = (minY + maxY) / 2;
    // Label baseline above top node
    const labelY = minY - 45;
    // Plus sign between hidden and green
    const plus1X = (endHidden[0].x + endGreen[0].x)/2;
    // Equals sign between green and result (no bias column)
    const equalsX = (endGreen[0].x + resultColX)/2;

    function addOp(x, char){
      const t = document.createElementNS(svgNS,'text');
      t.textContent = char;
      t.setAttribute('x', x);
      t.setAttribute('y', operatorY);
      t.setAttribute('text-anchor','middle');
      t.classList.add('op-label');
      overlaySvgHidden.appendChild(t);
      requestAnimationFrame(()=> t.classList.add('visible'));
    }
    addOp(plus1X,'+');
    addOp(equalsX,'=');

    function addVectorLabel(x, text){
      const t = document.createElementNS(svgNS,'text');
      t.textContent = text;
      t.setAttribute('x', x);
      t.setAttribute('y', labelY);
      t.setAttribute('text-anchor','middle');
      t.classList.add('vector-label');
      overlaySvgHidden.appendChild(t);
      requestAnimationFrame(()=> t.classList.add('visible'));
    }
    // Hidden (orange) and Input (green)
    addVectorLabel(endHidden[0].x, 'hidden');
    addVectorLabel(endGreen[0].x, 'input');

    // Result vector squares at resultColX
    for(let i=0;i<count;i++){
      const r = document.createElementNS(svgNS,'rect');
      const size = 40;
      r.setAttribute('x', resultColX - size/2);
      r.setAttribute('y', endHidden[i].y - size/2);
      r.setAttribute('width', size);
      r.setAttribute('height', size);
      r.setAttribute('rx', 6);
      r.classList.add('result-node');
      overlaySvgHidden.appendChild(r);
      requestAnimationFrame(()=> r.classList.add('visible'));
    }
  }

  function resetAnimation(){
    animated = false;
    if(overlaySvgHidden){ overlaySvgHidden.remove(); overlaySvgHidden = null; }
    // no secondary overlay anymore
  }

  animateBtn.addEventListener('click', animateStep);
  resetAnimBtn.addEventListener('click', resetAnimation);
  // Reset overlays when network rebuilt
  hiddenSlider.addEventListener('input', resetAnimation);
  inputSlider.addEventListener('input', resetAnimation);

  // Practice section copy buttons
  function initPracticeCopy(){
    const problems = document.querySelectorAll('.practice-problem');
    problems.forEach(prob => {
      const btn = prob.querySelector('.practice-copy-btn');
      const codeEl = prob.querySelector('code');
      if(!btn || !codeEl) return;
      btn.addEventListener('click', ()=>{
        const text = codeEl.textContent.trim();
        navigator.clipboard.writeText(text).then(()=>{
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(()=>{ btn.textContent = original; btn.classList.remove('copied'); }, 1200);
        }).catch(()=>{
          btn.textContent = 'Failed';
          setTimeout(()=>{ btn.textContent = 'Copy Arrays'; }, 1500);
        });
      });
    });
  }
  initPracticeCopy();
  // Practice answer reveal logic (compute & display h_next)
  const practiceData = {
    1: {
      x: [1.0,0.5,-1.0],
      h_prev: [0.2,-0.1,0.05,0.3],
      // no bias for base RNN practice (removed per request)
      Wx: [ [0.3,-0.2,0.1], [0.0,0.5,-0.4], [0.25,0.15,-0.3], [-0.1,0.2,0.4] ],
      Wh: [ [0.4,-0.3,0.0,0.2], [-0.2,0.1,0.5,-0.1], [0.3,0.2,-0.4,0.1], [0.0,-0.25,0.35,0.2] ]
    },
    2: {
      x: [1.0,-2.0],
      h_prev: [0.4,0.0,-0.3],
      // no bias for base RNN practice (removed per request)
      Wx: [ [0.6,-0.5],[0.2,0.1],[-0.3,0.4] ],
      Wh: [ [0.2,-0.1,0.0],[-0.4,0.3,0.5],[0.1,-0.2,0.25] ]
    },
    3: {
      x: [0.5,-1.0,1.5,0.0],
      h_prev: [0.1,0.2,-0.2,0.0,0.3],
      // no bias for base RNN practice (removed per request)
      Wx: [ [0.1,-0.2,0.3,0.0],[0.4,0.0,-0.1,0.2],[-0.3,0.25,0.15,-0.05],[0.0,0.3,-0.2,0.4],[0.2,-0.1,0.0,0.1] ],
      Wh: [ [0.2,-0.1,0.05,0.0,0.1],[0.0,0.3,-0.2,0.1,-0.05],[0.25,0.1,-0.4,0.0,0.2],[-0.1,0.2,0.3,-0.15,0.05],[0.05,-0.2,0.1,0.25,-0.3] ]
    },
    4: {
      x: [2.0,-1.0,0.5],
      h_prev: [1.0,-0.5,0.0],
      // no bias for base RNN practice (removed per request)
      Wx: [ [1.0,-2.0,1.0],[0.0,1.0,-1.0],[-1.0,2.0,0.0] ],
      Wh: [ [2.0,-1.0,0.0],[-1.0,1.0,1.0],[0.0,-2.0,2.0] ]
    },
    5: {
      x: [3.0,-2.0],
      h_prev: [0.5,1.0,-0.5,0.0],
      // no bias for base RNN practice (removed per request)
      Wx: [ [1.2,-0.8],[0.5,1.1],[-1.0,0.9],[0.7,-0.6] ],
      Wh: [ [0.9,-0.5,0.3,0.2],[0.4,0.8,-0.6,0.0],[-0.7,0.2,1.0,-0.4],[0.3,-0.9,0.5,0.6] ]
    }
  };
  function computeHidden(data){
    // Determine hidden size from Wh or h_prev fallback
    const hSize = (data.b && data.b.length) || (data.h_prev && data.h_prev.length) || (data.Wh && data.Wh.length) || 0;
    const inputSize = data.x.length;
    const z = new Array(hSize).fill(0);
    for(let i=0;i<hSize;i++){
      // Wx @ x
      for(let j=0;j<inputSize;j++){ z[i] += data.Wx[i][j] * data.x[j]; }
      // Wh @ h_prev
      for(let k=0;k<hSize && k < (data.h_prev ? data.h_prev.length : 0);k++){ z[i] += data.Wh[i][k] * data.h_prev[k]; }
      // + b if present
      if(data.b && data.b.length > i){ z[i] += data.b[i]; }
    }
    const h_next = z.map(v => Math.tanh(v));
    return { z, h_next };
  }
  function initAnswerReveal(){
    document.querySelectorAll('.practice-problem').forEach(prob => {
      const probId = parseInt(prob.getAttribute('data-problem'),10);
      const btn = prob.querySelector('.practice-show-btn');
      const sol = prob.querySelector('.practice-solution');
      if(!btn || !sol || !practiceData[probId]) return;
      btn.addEventListener('click', ()=>{
        if(sol.hasAttribute('hidden')){
          const { h_next, z } = computeHidden(practiceData[probId]);
          const zStr = z.map(v=>v.toFixed(6)).join(', ');
          const hStr = h_next.map(v=>v.toFixed(6)).join(', ');
          sol.textContent = `z: [${zStr}]\nh_next: [${hStr}]`;
          sol.removeAttribute('hidden');
          btn.textContent = 'Hide Answer';
        } else {
          sol.setAttribute('hidden','');
          btn.textContent = 'Show Answer';
        }
      });
    });
  }
  initAnswerReveal();
  // Sequence practice data (multi-timestep unrolling, h0 zeros)
  const sequencePracticeData = {
    S1: {
      Wx: [ [0.4,-0.3], [0.1,0.5], [-0.2,0.6] ],
      Wh: [ [0.3,-0.1,0.2], [-0.4,0.25,0.1], [0.5,-0.3,0.4] ],
      b:  [0.05,0.0,-0.1],
      x_seq: [ [1.0,0.5], [0.0,-1.0], [2.0,0.25] ]
    },
    S2: {
      Wx: [ [0.3,-0.2,0.4], [0.0,0.6,-0.5], [0.25,0.15,-0.3], [-0.2,0.1,0.35] ],
      Wh: [ [0.4,-0.3,0.0,0.2], [-0.2,0.1,0.5,-0.1], [0.3,0.2,-0.4,0.1], [0.0,-0.25,0.35,0.2] ],
      b:  [0.0,0.1,-0.05,0.2],
      x_seq: [ [1.0,0.0,-1.0], [0.5,2.0,0.0], [-1.5,1.0,0.75], [0.25,-0.5,0.5] ]
    },
    S3: {
      Wx: [ [0.6,-0.4,0.2], [-0.3,0.5,0.1] ],
      Wh: [ [0.2,-0.1], [-0.25,0.35] ],
      b:  [0.05,-0.15],
      x_seq: [ [-0.5,1.0,0.25], [1.5,-1.0,0.0] ]
    }
  };
  function computeSequence(data){
    const hiddenSize = data.b.length;
    const T = data.x_seq.length;
    let hPrev = new Array(hiddenSize).fill(0);
    const hs = []; // store h_t for t=1..T
    for(let t=0;t<T;t++){
      const x_t = data.x_seq[t]; // array length inputSize
      const z = new Array(hiddenSize).fill(0);
      for(let i=0;i<hiddenSize;i++){
        // Wx x_t
        for(let j=0;j<x_t.length;j++){ z[i] += data.Wx[i][j] * x_t[j]; }
        // Wh hPrev
        for(let k=0;k<hiddenSize;k++){ z[i] += data.Wh[i][k] * hPrev[k]; }
        z[i] += data.b[i];
      }
      const h_t = z.map(v=>Math.tanh(v));
      hs.push({ z, h: h_t });
      hPrev = h_t;
    }
    return { hs, h_T: hPrev };
  }
  function initSequenceReveal(){
    document.querySelectorAll('.sequence-problem').forEach(prob => {
      const id = prob.getAttribute('data-seq-problem');
      const btn = prob.querySelector('.practice-show-seq-btn');
      const sol = prob.querySelector('.practice-solution');
      if(!id || !btn || !sol || !sequencePracticeData[id]) return;
      btn.addEventListener('click', ()=>{
        if(sol.hasAttribute('hidden')){
          const { hs, h_T } = computeSequence(sequencePracticeData[id]);
          let out = '';
          hs.forEach((step, idx)=>{
            const zStr = step.z.map(v=>v.toFixed(6)).join(', ');
            const hStr = step.h.map(v=>v.toFixed(6)).join(', ');
            out += `t=${idx+1}\n  z: [${zStr}]\n  h: [${hStr}]\n`;
          });
            const hTStr = h_T.map(v=>v.toFixed(6)).join(', ');
          out += `\nFinal h_T: [${hTStr}]`;
          sol.textContent = out;
          sol.removeAttribute('hidden');
          btn.textContent = 'Hide Answer';
        } else {
          sol.setAttribute('hidden','');
          btn.textContent = 'Show Answer';
        }
      });
    });
  }
  initSequenceReveal();
  // Forget gate practice data & logic
  const forgetGatePracticeData = {
    FG1: {
      x: [1.0,-0.5],
      h: [0.2,-0.1,0.3],
      C: [0.5,-0.25,1.0],
      Wx: [ [0.4,-0.3], [0.1,0.5], [-0.2,0.6] ],
      Wh: [ [0.3,-0.1,0.2], [-0.4,0.25,0.1], [0.5,-0.3,0.4] ],
      Wf: [ [0.2,0.1,-0.3], [-0.5,0.4,0.25], [0.3,-0.2,0.6] ],
      b_f: [0.05,-0.02,0.10]
    },
    FG2: {
      x: [0.5,-1.0,2.0],
      h: [0.1,0.0,-0.2,0.3],
      C: [1.0,-0.5,0.25,0.75],
      Wx: [ [0.3,-0.2,0.4], [0.0,0.6,-0.5], [0.25,0.15,-0.3], [-0.2,0.1,0.35] ],
      Wh: [ [0.4,-0.3,0.0,0.2], [-0.2,0.1,0.5,-0.1], [0.3,0.2,-0.4,0.1], [0.0,-0.25,0.35,0.2] ],
      Wf: [ [0.2,-0.1,0.3,-0.4], [0.5,0.0,-0.25,0.2], [-0.3,0.4,0.1,0.35], [0.25,-0.5,0.2,0.1] ],
      b_f: [0.00,0.10,-0.05,0.20]
    },
    FG3: {
      x: [-1.0,0.25,0.5],
      h: [0.6,-0.4],
      C: [0.2,1.25],
      Wx: [ [0.6,-0.4,0.2], [-0.3,0.5,0.1] ],
      Wh: [ [0.2,-0.1], [-0.25,0.35] ],
      Wf: [ [0.4,-0.2], [-0.3,0.5] ],
      b_f: [0.02,-0.03]
    }
  };
  function sigmoid(x){ return 1/(1+Math.exp(-x)); }
  function computeForgetGate(data){
    const hiddenSize = data.h.length;
    // v = Wx x + Wh h
    const v = new Array(hiddenSize).fill(0);
    for(let i=0;i<hiddenSize;i++){
      for(let j=0;j<data.x.length;j++){ v[i] += data.Wx[i][j] * data.x[j]; }
      for(let k=0;k<hiddenSize;k++){ v[i] += data.Wh[i][k] * data.h[k]; }
    }
    // z_f = Wf v + b_f
    const z_f = new Array(hiddenSize).fill(0);
    for(let i=0;i<hiddenSize;i++){
      for(let k=0;k<hiddenSize;k++){ z_f[i] += data.Wf[i][k] * v[k]; }
      if(data.b_f){ z_f[i] += data.b_f[i]; }
    }
    const f = z_f.map(sigmoid);
    const C_out = f.map((fv,i)=> fv * data.C[i]);
    return { v, z_f, f, C_out };
  }
  function initForgetGateReveal(){
    document.querySelectorAll('.forget-gate-problem').forEach(prob => {
      const id = prob.getAttribute('data-fg-problem');
      const btn = prob.querySelector('.practice-show-fg-btn');
      const sol = prob.querySelector('.practice-solution');
      if(!id || !btn || !sol || !forgetGatePracticeData[id]) return;
      btn.addEventListener('click', ()=>{
        if(sol.hasAttribute('hidden')){
          const { v, z_f, f, C_out } = computeForgetGate(forgetGatePracticeData[id]);
          const vStr = v.map(v=>v.toFixed(6)).join(', ');
          const zStr = z_f.map(v=>v.toFixed(6)).join(', ');
          const fStr = f.map(v=>v.toFixed(6)).join(', ');
          const cOutStr = C_out.map(v=>v.toFixed(6)).join(', ');
          const bStr = forgetGatePracticeData[id].b_f ? forgetGatePracticeData[id].b_f.map(v=>v.toFixed(6)).join(', ') : '';
          const biasLine = bStr ? `b_f: [${bStr}]\n` : '';
          sol.textContent = `v: [${vStr}]\n${biasLine}z_f: [${zStr}]\nf: [${fStr}]\nC_out: [${cOutStr}]`;
          sol.removeAttribute('hidden');
          btn.textContent = 'Hide Answer';
        } else {
          sol.setAttribute('hidden','');
          btn.textContent = 'Show Answer';
        }
      });
    });
  }
  initForgetGateReveal();
  // Input gate practice data & logic
  const inputGatePracticeData = {
    IG1: {
      x: [1.0, -0.5],
      h: [0.2, -0.1, 0.3],
      C: [0.5, -0.25, 1.0],
      Wx: [ [0.4, -0.3], [0.1, 0.5], [-0.2, 0.6] ],
      Wh: [ [0.3, -0.1, 0.2], [-0.4, 0.25, 0.1], [0.5, -0.3, 0.4] ],
      Wi: [ [0.15, -0.05, 0.2], [-0.1, 0.3, 0.05], [0.25, -0.2, 0.1] ],
      WC: [ [0.2, 0.1, -0.1], [-0.15, 0.25, 0.05], [0.05, -0.2, 0.3] ],
      b_i: [0.02, -0.01, 0.03],
      b_C: [0.0, 0.04, -0.02]
    },
    IG2: {
      x: [0.5, -1.0, 2.0],
      h: [0.1, 0.0, -0.2, 0.3],
      C: [1.0, -0.5, 0.25, 0.75],
      Wx: [ [0.3, -0.2, 0.4], [0.0, 0.6, -0.5], [0.25, 0.15, -0.3], [-0.2, 0.1, 0.35] ],
      Wh: [ [0.4, -0.3, 0.0, 0.2], [-0.2, 0.1, 0.5, -0.1], [0.3, 0.2, -0.4, 0.1], [0.0, -0.25, 0.35, 0.2] ],
      Wi: [ [0.2, -0.1, 0.3, -0.2], [0.1, 0.0, -0.25, 0.2], [-0.3, 0.4, 0.1, 0.35], [0.25, -0.15, 0.2, 0.1] ],
      WC: [ [0.1, 0.05, -0.1, 0.2], [0.05, -0.02, 0.15, -0.05], [0.2, -0.1, 0.05, 0.1], [-0.1, 0.2, 0.05, 0.0] ],
      b_i: [0.00, 0.05, -0.03, 0.08],
      b_C: [0.02, -0.01, 0.04, 0.0]
    },
    IG3: {
      x: [-1.0, 0.25, 0.5],
      h: [0.6, -0.4],
      C: [0.2, 1.25],
      Wx: [ [0.6, -0.4, 0.2], [-0.3, 0.5, 0.1] ],
      Wh: [ [0.2, -0.1], [-0.25, 0.35] ],
      Wi: [ [0.4, -0.2], [-0.3, 0.5] ],
      WC: [ [0.3, -0.15], [-0.2, 0.25] ],
      b_i: [0.01, -0.02],
      b_C: [0.0, 0.03]
    }
  };
  function computeInputGate(data){
    const hiddenSize = data.h.length;
    // v = Wx x + Wh h
    const v = new Array(hiddenSize).fill(0);
    for(let i=0;i<hiddenSize;i++){
      for(let j=0;j<data.x.length;j++){ v[i] += data.Wx[i][j] * data.x[j]; }
      for(let k=0;k<hiddenSize;k++){ v[i] += data.Wh[i][k] * data.h[k]; }
    }
    // z_i = Wi v + b_i
    const z_i = new Array(hiddenSize).fill(0);
    for(let i=0;i<hiddenSize;i++){
      for(let k=0;k<hiddenSize;k++){ z_i[i] += data.Wi[i][k] * v[k]; }
      if(data.b_i){ z_i[i] += data.b_i[i]; }
    }
    const i_act = z_i.map(sigmoid);
    // z_c = WC v + b_C
    const z_c = new Array(hiddenSize).fill(0);
    for(let i=0;i<hiddenSize;i++){
      for(let k=0;k<hiddenSize;k++){ z_c[i] += data.WC[i][k] * v[k]; }
      if(data.b_C){ z_c[i] += data.b_C[i]; }
    }
    const c_tilde = z_c.map(Math.tanh);
    const c_add = c_tilde.map((ct,i)=> ct * i_act[i]);
    // final cell after adding the input-gate contribution
    const C_final = (data.C && data.C.length === c_add.length) ? data.C.map((c,i)=> c + c_add[i]) : null;
    return { v, z_i, i_act, z_c, c_tilde, c_add, C_final };
  }
  function initInputGateReveal(){
    document.querySelectorAll('.input-gate-problem').forEach(prob => {
      const id = prob.getAttribute('data-ig-problem');
      const btn = prob.querySelector('.practice-show-ig-btn');
      const sol = prob.querySelector('.practice-solution');
      if(!id || !btn || !sol || !inputGatePracticeData[id]) return;
      btn.addEventListener('click', ()=>{
        if(sol.hasAttribute('hidden')){
          const { v, z_i, i_act, z_c, c_tilde, c_add, C_final } = computeInputGate(inputGatePracticeData[id]);
          const vStr = v.map(v=>v.toFixed(6)).join(', ');
          const ziStr = z_i.map(v=>v.toFixed(6)).join(', ');
          const iStr = i_act.map(v=>v.toFixed(6)).join(', ');
          const zcStr = z_c.map(v=>v.toFixed(6)).join(', ');
          const ctStr = c_tilde.map(v=>v.toFixed(6)).join(', ');
          const addStr = c_add.map(v=>v.toFixed(6)).join(', ');
          const cStr = inputGatePracticeData[id].C ? inputGatePracticeData[id].C.map(v=>v.toFixed(6)).join(', ') : '';
          const finalCStr = C_final ? C_final.map(v=>v.toFixed(6)).join(', ') : '';
          const biStr = inputGatePracticeData[id].b_i ? inputGatePracticeData[id].b_i.map(v=>v.toFixed(6)).join(', ') : '';
          const bCStr = inputGatePracticeData[id].b_C ? inputGatePracticeData[id].b_C.map(v=>v.toFixed(6)).join(', ') : '';
          const biLine = biStr ? `b_i: [${biStr}]\n` : '';
          const bCLine = bCStr ? `b_C: [${bCStr}]\n` : '';
          sol.textContent = `v: [${vStr}]\n${biLine}z_i: [${ziStr}]\ni: [${iStr}]\n\nC: [${cStr}]\nz_C: [${zcStr}]\nC_tilde: [${ctStr}]\ni ⊙ C_tilde: [${addStr}]\n\nC' = C + (i ⊙ C_tilde): [${finalCStr}]`;
          sol.removeAttribute('hidden');
          btn.textContent = 'Hide Answer';
        } else {
          sol.setAttribute('hidden','');
          btn.textContent = 'Show Answer';
        }
      });
    });
  }
  initInputGateReveal();
  // Output gate practice data & logic
  const outputGatePracticeData = {
    OG1: {
      x: [1.0, -0.5],
      h: [0.2, -0.1, 0.3],
      C: [0.5, -0.25, 1.0],
      Wx: [ [0.4, -0.3], [0.1, 0.5], [-0.2, 0.6] ],
      Wh: [ [0.3, -0.1, 0.2], [-0.4, 0.25, 0.1], [0.5, -0.3, 0.4] ],
      Wo: [ [0.2, 0.1, -0.1], [-0.15, 0.25, 0.05], [0.05, -0.2, 0.3] ],
      b_o: [0.01, -0.02, 0.03]
    },
    OG2: {
      x: [0.5, -1.0, 2.0],
      h: [0.1, 0.0, -0.2, 0.3],
      C: [1.0, -0.5, 0.25, 0.75],
      Wx: [ [0.3, -0.2, 0.4], [0.0, 0.6, -0.5], [0.25, 0.15, -0.3], [-0.2, 0.1, 0.35] ],
      Wh: [ [0.4, -0.3, 0.0, 0.2], [-0.2, 0.1, 0.5, -0.1], [0.3, 0.2, -0.4, 0.1], [0.0, -0.25, 0.35, 0.2] ],
      Wo: [ [0.1, 0.05, -0.1, 0.2], [0.05, -0.02, 0.15, -0.05], [0.2, -0.1, 0.05, 0.1], [-0.1, 0.2, 0.05, 0.0] ],
      b_o: [0.00, 0.05, -0.03, 0.08]
    },
    OG3: {
      x: [-1.0, 0.25, 0.5],
      h: [0.6, -0.4],
      C: [0.2, 1.25],
      Wx: [ [0.6, -0.4, 0.2], [-0.3, 0.5, 0.1] ],
      Wh: [ [0.2, -0.1], [-0.25, 0.35] ],
      Wo: [ [0.4, -0.2], [-0.3, 0.5] ],
      b_o: [0.02, -0.03]
    }
  };
  function computeOutputGate(data){
    const hiddenSize = data.h.length;
    const v = new Array(hiddenSize).fill(0);
    for(let i=0;i<hiddenSize;i++){
      for(let j=0;j<data.x.length;j++){ v[i] += data.Wx[i][j] * data.x[j]; }
      for(let k=0;k<hiddenSize;k++){ v[i] += data.Wh[i][k] * data.h[k]; }
    }
    const z_o = new Array(hiddenSize).fill(0);
    for(let i=0;i<hiddenSize;i++){
      for(let k=0;k<hiddenSize;k++){ z_o[i] += data.Wo[i][k] * v[k]; }
      if(data.b_o){ z_o[i] += data.b_o[i]; }
    }
    const o_act = z_o.map(sigmoid);
    const tanhC = data.C ? data.C.map(Math.tanh) : null;
    const h_out = (tanhC && tanhC.length === o_act.length) ? o_act.map((ov,i)=> ov * tanhC[i]) : null;
    return { v, z_o, o_act, tanhC, h_out };
  }
  function initOutputGateReveal(){
    document.querySelectorAll('.output-gate-problem').forEach(prob => {
      const id = prob.getAttribute('data-og-problem');
      const btn = prob.querySelector('.practice-show-og-btn');
      const sol = prob.querySelector('.practice-solution');
      if(!id || !btn || !sol || !outputGatePracticeData[id]) return;
      btn.addEventListener('click', ()=>{
        if(sol.hasAttribute('hidden')){
          const { v, z_o, o_act, tanhC, h_out } = computeOutputGate(outputGatePracticeData[id]);
          const vStr = v.map(v=>v.toFixed(6)).join(', ');
          const zoStr = z_o.map(v=>v.toFixed(6)).join(', ');
          const oStr = o_act.map(v=>v.toFixed(6)).join(', ');
          const cStr = tanhC ? tanhC.map(v=>v.toFixed(6)).join(', ') : '';
          const houtStr = h_out ? h_out.map(v=>v.toFixed(6)).join(', ') : '';
          const boStr = outputGatePracticeData[id].b_o ? outputGatePracticeData[id].b_o.map(v=>v.toFixed(6)).join(', ') : '';
          const boLine = boStr ? `b_o: [${boStr}]\n` : '';
          sol.textContent = `v: [${vStr}]\n${boLine}z_o: [${zoStr}]\no: [${oStr}]\n\ntanh(C): [${cStr}]\nh_out = o ⊙ tanh(C): [${houtStr}]`;
          sol.removeAttribute('hidden');
          btn.textContent = 'Hide Answer';
        } else {
          sol.setAttribute('hidden','');
          btn.textContent = 'Show Answer';
        }
      });
    });
  }
  initOutputGateReveal();
})();

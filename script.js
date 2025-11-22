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
  let inputGateOverlay = null;
  let inputGateCombinedAnimated = false;
  // Output Gate elements
  const outputGateHiddenSlider = document.getElementById('outputGateHiddenSize');
  const outputGateHiddenValue = document.getElementById('outputGateHiddenValue');
  const outputGatePanel1 = document.getElementById('output-gate-panel-1');
  const outputGatePanel2 = document.getElementById('output-gate-panel-2');
  const outputGateAnimateBtn = document.getElementById('outputGateAnimateBtn');
  const outputGateResetBtn = document.getElementById('outputGateResetBtn');
  let outputGateLayout = null;
  let outputGatePanel2Layout = null;
  let outputGateAnimated = false;
  let outputGateTimeoutId = null;

  // Overlay SVG for animation clones
  let overlaySvgHidden = null;
  let animated = false;
  let currentHiddenOutputs = [];
  let currentInputHiddenOutputs = [];

  const svgNS = 'http://www.w3.org/2000/svg';
  const padding = 70;
  const dims = { w: 800, h: 450 };

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
    const size = 40; // vertical spacing reference (matching square size)
    const centerX = dims.w/2; // triangles centered horizontally
    const rowY = (i) => count === 1 ? (dims.h/2) : (padding + i * ((dims.h - 2*padding)/(count - 1)));
    const minY = rowY(0);
    const maxY = rowY(count - 1);
    const midY = (minY + maxY) / 2;
    const label = document.createElementNS(svgNS,'text');
    label.textContent = 'base \u2192';
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
      tLabel.textContent = `C'${i+1}`;
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
    // Update shape displays: (inputs × outputs)
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
        t.textContent = `h'${i+1}`;
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
    squares.forEach(sq => {
      sq.classList.remove('forget-flash');
      void sq.offsetWidth;
      sq.classList.add('forget-flash');
    });
    const delay = 700;
    forgetTimeoutId = setTimeout(()=>{
      const outputX = centerX + size + 140;
      rows.forEach((ry)=>{
        const yCenter = ry + size/2;
        const line = document.createElementNS(svgNS,'line');
        line.setAttribute('x1', centerX + size);
        line.setAttribute('y1', yCenter);
        line.setAttribute('x2', outputX - 26);
        line.setAttribute('y2', yCenter);
        line.setAttribute('stroke','#9333ea');
        line.setAttribute('stroke-width','2');
        line.setAttribute('marker-end','url(#forgetArrowHead)');
        svg.appendChild(line);
        const c = document.createElementNS(svgNS,'circle');
        c.setAttribute('cx', outputX);
        c.setAttribute('cy', yCenter);
        c.setAttribute('r', 24);
        c.classList.add('forget-output-circle');
        svg.appendChild(c);
        requestAnimationFrame(()=> c.classList.add('visible'));
      });
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
        label.textContent = `C${rows.indexOf(ry)+1}`;
        label.setAttribute('x', cColX);
        label.setAttribute('y', yCenter + 6);
        label.setAttribute('text-anchor','middle');
        label.classList.add('triangle-label');
        svg.appendChild(label);
        requestAnimationFrame(()=> { tri.classList.add('visible'); label.classList.add('visible'); });
      });
      forgetAnimated = true;
      forgetTimeoutId = null;
    }, delay);
  }
  function resetForget(){
    if(forgetTimeoutId){ clearTimeout(forgetTimeoutId); forgetTimeoutId = null; }
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
    const n = parseInt(outputGateHiddenSlider.value,10);
    outputGateHiddenValue.textContent = n;
    outputGateLayout = buildOutputGateTriangleVector(outputGatePanel1, n);
    // Build second panel identical to input gate first panel (squares)
    if(outputGatePanel2){
      outputGatePanel2Layout = buildInputGateVector(outputGatePanel2, n);
    }
    outputGateAnimated = false;
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
    squares.forEach(sq => { sq.classList.remove('input-flash'); void sq.offsetWidth; sq.classList.add('input-flash'); });
    if(inputGateTanhLayout){
      // Make second panel identical: use same flash class as first panel
      const { squares: panel2Squares } = inputGateTanhLayout;
      panel2Squares.forEach(sq => { sq.classList.remove('input-flash'); void sq.offsetWidth; sq.classList.add('input-flash'); });
    }
    const delay = 700;
    inputGateTimeoutId = setTimeout(()=>{
      const outputX = centerX + size + 140;
      rows.forEach((ry)=>{
        const yCenter = ry + size/2;
        const line = document.createElementNS(svgNS,'line');
        line.setAttribute('x1', centerX + size);
        line.setAttribute('y1', yCenter);
        line.setAttribute('x2', outputX - 26);
        line.setAttribute('y2', yCenter);
        line.setAttribute('stroke','#9333ea');
        line.setAttribute('stroke-width','2');
        line.setAttribute('marker-end','url(#inputGateArrowHead)');
        svg.appendChild(line);
        const c = document.createElementNS(svgNS,'circle');
        c.setAttribute('cx', outputX);
        c.setAttribute('cy', yCenter);
        c.setAttribute('r', 24);
        c.classList.add('input-output-circle');
        svg.appendChild(c);
        requestAnimationFrame(()=> c.classList.add('visible'));
      });
      if(inputGateTanhLayout){
        const { svg: tanhSvg, size: tSize, centerX: tCenterX, rows: tRows } = inputGateTanhLayout;
        const tOutputX = tCenterX + tSize + 140;
        tRows.forEach((ry)=>{
          const yCenter = ry + tSize/2;
            const line = document.createElementNS(svgNS,'line');
            line.setAttribute('x1', tCenterX + tSize);
            line.setAttribute('y1', yCenter);
            line.setAttribute('x2', tOutputX - 26);
            line.setAttribute('y2', yCenter);
            line.setAttribute('stroke','#9333ea');
            line.setAttribute('stroke-width','2');
            line.setAttribute('marker-end','url(#inputGateArrowHead)');
            tanhSvg.appendChild(line);
            const c = document.createElementNS(svgNS,'circle');
            c.setAttribute('cx', tOutputX);
            c.setAttribute('cy', yCenter);
            c.setAttribute('r', 24);
            c.classList.add('input-output-circle');
            tanhSvg.appendChild(c);
            requestAnimationFrame(()=> c.classList.add('visible'));
        });
      }
      inputGateAnimated = true;
      inputGateTimeoutId = null;
      // After first phase, run combined animation
      runInputGateCombined();
    }, delay);
  }

  function animateOutputGate(){
    if(!outputGateLayout || outputGateAnimated) return;
    const { svg, centerX, rows, triangles } = outputGateLayout;
    // Flash squares in second panel if present to mimic input gate first panel
    if(outputGatePanel2Layout){
      outputGatePanel2Layout.squares.forEach(sq => { sq.classList.remove('input-flash'); void sq.offsetWidth; sq.classList.add('input-flash'); });
    }
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
      // Build arrows and circles for second panel squares if present
      if(outputGatePanel2Layout){
        const { svg: svg2, size: size2, centerX: centerX2, rows: rows2 } = outputGatePanel2Layout;
        const circleColX2 = centerX2 + size2 + 140;
        rows2.forEach((rowY)=>{
          const yCenter = rowY + size2/2;
          const line = document.createElementNS(svgNS,'line');
          line.setAttribute('x1', centerX2 + size2);
          line.setAttribute('y1', yCenter);
            line.setAttribute('x2', circleColX2 - 26);
          line.setAttribute('y2', yCenter);
          line.setAttribute('stroke','#9333ea');
          line.setAttribute('stroke-width','2');
          line.setAttribute('marker-end','url(#inputGateArrowHead)');
          svg2.appendChild(line);
          const circle = document.createElementNS(svgNS,'circle');
          circle.setAttribute('cx', circleColX2);
          circle.setAttribute('cy', yCenter);
          circle.setAttribute('r', 24);
          circle.classList.add('output-gate-circle');
          svg2.appendChild(circle);
          requestAnimationFrame(()=> circle.classList.add('visible'));
        });
      }
      outputGateAnimated = true;
      outputGateTimeoutId = null;
    }, delay);
  }
  function resetOutputGate(){
    if(outputGateTimeoutId){ clearTimeout(outputGateTimeoutId); outputGateTimeoutId = null; }
    outputGateAnimated = false;
    rebuildOutputGate();
  }
  if(outputGateAnimateBtn){ outputGateAnimateBtn.addEventListener('click', animateOutputGate); }
  if(outputGateResetBtn){ outputGateResetBtn.addEventListener('click', resetOutputGate); }
  function resetInputGate(){
    if(inputGateTimeoutId){ clearTimeout(inputGateTimeoutId); inputGateTimeoutId = null; }
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
        label.textContent = `C'${i+1}`;
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
    // Layout columns
    const biasColX = endGreen[0].x + 110; // bias vector column to right of green
    const resultColX = biasColX + 110 + 55; // allow space for '=' then result
    // Vertically center operators between top and bottom of the vector columns
    const minY = endHidden[0].y;
    const maxY = endHidden[count - 1].y;
    const operatorY = (minY + maxY) / 2;
    // Label baseline above top node
    const labelY = minY - 45;
    // Plus sign between hidden and green
    const plus1X = (endHidden[0].x + endGreen[0].x)/2;
    // Plus sign between green and bias
    const plus2X = (endGreen[0].x + biasColX)/2;
    // Equals sign before result
    const equalsX = biasColX + 55;

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
    addOp(plus2X,'+');
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
    // Hidden (orange), Input (green), Bias (blue)
    addVectorLabel(endHidden[0].x, 'hidden');
    addVectorLabel(endGreen[0].x, 'input');
    addVectorLabel(biasColX, 'bias');

    // Bias vector nodes (blue) at biasColX
    for(let i=0;i<count;i++){
      const b = document.createElementNS(svgNS,'circle');
      b.setAttribute('cx', biasColX);
      b.setAttribute('cy', endHidden[i].y);
      b.setAttribute('r', 20);
      b.classList.add('bias-node');
      overlaySvgHidden.appendChild(b);
      requestAnimationFrame(()=> b.classList.add('visible'));
    }

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
})();

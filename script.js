(function(){
  const hiddenSlider = document.getElementById('hiddenSize');
  const hiddenValue = document.getElementById('sizeValue');
  const inputSlider = document.getElementById('inputSize');
  const inputValue = document.getElementById('inputSizeValue');
  const containerHidden = document.getElementById('network-container');
  const containerInputHidden = document.getElementById('network-container-2');

  const svgNS = 'http://www.w3.org/2000/svg';
  const padding = 70;
  const dims = { w: 800, h: 450 };

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
    buildLayer(containerHidden, hiddenSize, hiddenSize, { inputPrefix: 'h' });
    buildLayer(containerInputHidden, inputSize, hiddenSize, { inputPrefix: 'x', nodeClass: 'secondary' });
  }

  hiddenSlider.addEventListener('input', rebuild);
  inputSlider.addEventListener('input', rebuild);

  rebuild();
})();

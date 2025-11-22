(function(){
  const container = document.getElementById('network-container');
  const sizeSlider = document.getElementById('hiddenSize');
  const sizeValue = document.getElementById('sizeValue');

  const svgNS = 'http://www.w3.org/2000/svg';
  const padding = 70;
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 450;

  function buildNetwork(size){
    container.innerHTML = '';
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
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

    const colX = { input: padding, output: width - padding };
    const rowY = (i) => size === 1 ? height/2 : padding + i * ((height - 2*padding)/(size - 1));

    const inputs = Array.from({length:size}, (_,i)=>({ id:`h${i+1}`, x:colX.input, y:rowY(i) }));
    // Outputs: leave labels blank per request
    const outputs = Array.from({length:size}, (_,i)=>({ id:'', x:colX.output, y:rowY(i) }));

    const edges = [];
    inputs.forEach(inp => outputs.forEach(out => edges.push({ from: inp, to: out })));

    edges.forEach(e => {
      const line = document.createElementNS(svgNS,'line');
      line.setAttribute('x1', e.from.x + 25);
      line.setAttribute('y1', e.from.y);
      line.setAttribute('x2', e.to.x - 25);
      line.setAttribute('y2', e.to.y);
      line.classList.add('edge');
      svg.appendChild(line);
    });

    function drawNode(n, type){
      const g = document.createElementNS(svgNS,'g');
      const c = document.createElementNS(svgNS,'circle');
      c.setAttribute('cx', n.x);
      c.setAttribute('cy', n.y);
      c.setAttribute('r', 25);
      c.classList.add('node', type);
      g.appendChild(c);
      if(type === 'input'){ // only show input labels (h1..hN)
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

    inputs.forEach(n => drawNode(n,'input'));
    outputs.forEach(n => drawNode(n,'output'));

    window._network = { inputs, outputs, edges };
  }

  sizeSlider.addEventListener('input', () => {
    const val = parseInt(sizeSlider.value,10);
    sizeValue.textContent = val;
    buildNetwork(val);
  });

  buildNetwork(parseInt(sizeSlider.value,10));
})();

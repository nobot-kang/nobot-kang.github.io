const root = document.querySelector('[data-jeonse-map]');
if (root) {
  const asset = name => new URL(name, import.meta.url);
  const ns = 'http://www.w3.org/2000/svg';
  const node = (name, attrs = {}, text) => {
    const el = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const fmt = v => v === null || v === undefined ? '—' : v.toFixed(1);
  Promise.all(['jeonse-map.json', 'jeonse-map-locations.json'].map(name => fetch(asset(name)).then(r => {if(!r.ok) throw Error(r.status);return r.json();}))).then(([data, locations]) => {
    const rows = new Map(data.rows.map(r => [[r.region,r.area,r.period,r.mode].join('|'), r]));
    const region = root.querySelector('[data-region]'), area = root.querySelector('[data-area]');
    const get = (code, period, mode='normal') => rows.get([code,area.value,period,mode].join('|'));
    const color = r => !r || r.status !== 'supported' ? '#a1aab3' : r.ratio < 50 ? '#d2e5ed' : r.ratio < 60 ? '#83b9cf' : r.ratio < 70 ? '#3c87ad' : '#174666';
    function map(prefix, title) {
      const codes = Object.keys(data.regions).filter(c => c.startsWith(prefix));
      const coords = codes.map(c => locations.points[c]);
      const minX=Math.min(...coords.map(p=>p.longitude))-.04,maxX=Math.max(...coords.map(p=>p.longitude))+.04;
      const minY=Math.min(...coords.map(p=>p.latitude))-.04,maxY=Math.max(...coords.map(p=>p.latitude))+.04;
      const svg=node('svg',{viewBox:'0 0 360 360',role:'img','aria-label':title+' 지역별 전세가율 위치 안내. 정확한 값과 모형 범위는 아래 전체 표에 있습니다.'});
      svg.append(node('text',{x:18,y:27,'font-size':17,'font-weight':700,fill:'#173249'},title));
      svg.append(node('text',{x:318,y:27,'font-size':12,fill:'#465967'},'북 ↑'));
      const selected=[];
      codes.forEach(code=>{
        const p=locations.points[code],r=get(code,'2026Q2');
        const x=24+(p.longitude-minX)/(maxX-minX)*312,y=330-(p.latitude-minY)/(maxY-minY)*285;
        const group=node('g');group.append(node('title',{},data.regions[code]+': '+(r.status==='supported'?fmt(r.ratio)+'%':'표본 부족')));
        if(r.status==='supported')group.append(node('circle',{cx:x,cy:y,r:8,fill:color(r),stroke:'#456579','stroke-width':1.5}));
        else group.append(node('path',{d:`M${x-5} ${y-5}l10 10m0-10l-10 10`,stroke:'#67737d','stroke-width':2}));
        svg.append(group);
        if(code===region.value)selected.push({x,y,code,r});
      });
      selected.forEach(({x,y,code,r})=>{
        svg.append(node('circle',{cx:x,cy:y,r:13,fill:'none',stroke:'#bd5a08','stroke-width':3}));
        svg.append(node('text',{x:180,y:353,'text-anchor':'middle','font-size':16,'font-weight':700,fill:'#173249',stroke:'#f5f8fb','stroke-width':4,'paint-order':'stroke'},data.regions[code]+' '+(r.status==='supported'?fmt(r.ratio)+'%':'표본 부족')));
      });
      return svg;
    }
    function history() {
      const primary=data.periods.map(p=>get(region.value,p)),fixed=data.periods.map(p=>get(region.value,p,'normal_fixed'));
      const supported=primary.filter(r=>r.status==='supported');
      const nums=[...supported.flatMap(r=>[r.lower,r.upper,r.ratio]),...fixed.filter(r=>r.status==='supported').map(r=>r.ratio)].filter(v=>v!==null);
      const lo=nums.length?Math.floor(Math.min(...nums)/10)*10:30,hi=nums.length?Math.max(lo+10,Math.ceil(Math.max(...nums)/10)*10):90;
      const svg=node('svg',{viewBox:'0 0 360 300',role:'img','aria-label':data.regions[region.value]+' 18분기 전세가율. 같은 값은 바로 아래 표로 확인할 수 있습니다.'});
      const xx=i=>48+i*282/17,yy=v=>245-(v-lo)*208/(hi-lo);
      for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4;svg.append(node('line',{x1:48,x2:330,y1:yy(v),y2:yy(v),stroke:'#dce4eb'}));svg.append(node('text',{x:40,y:yy(v)+5,'text-anchor':'end','font-size':16,fill:'#465967'},fmt(v)));}
      function segments(list, valid) {const result=[];let current=[];list.forEach((r,i)=>{if(valid(r))current.push([r,i]);else if(current.length){result.push(current);current=[];}});if(current.length)result.push(current);return result;}
      segments(primary,r=>r.status==='supported'&&r.lower!==null&&r.upper!==null).forEach(s=>{if(s.length<2)return;const points=[...s.map(([r,i])=>[xx(i),yy(r.lower)]),...s.slice().reverse().map(([r,i])=>[xx(i),yy(r.upper)])];svg.append(node('polygon',{points:points.map(p=>p.join(',')).join(' '),fill:'#dcebf4'}));});
      [[primary,'#103d68',false],[fixed,'#14796e',true]].forEach(([list,col,dashed])=>segments(list,r=>r.status==='supported').forEach(s=>{
        const p=node('polyline',{points:s.map(([r,i])=>`${xx(i)},${yy(r.ratio)}`).join(' '),fill:'none',stroke:col,'stroke-width':3});if(dashed)p.setAttribute('stroke-dasharray','7 5');svg.append(p);
        s.forEach(([r,i])=>svg.append(node(dashed?'rect':'circle',dashed?{x:xx(i)-3,y:yy(r.ratio)-3,width:6,height:6,fill:col}:{cx:xx(i),cy:yy(r.ratio),r:3,fill:col})));
      }));
      [0,4,8,12,17].forEach(i=>svg.append(node('text',{x:xx(i),y:273,'text-anchor':'middle','font-size':16,fill:'#465967'},data.periods[i].slice(2))));
      svg.append(node('text',{x:48,y:23,'font-size':16,'font-weight':700,fill:'#173249'},data.regions[region.value]+' · 전세가율 (%)'));
      root.querySelector('[data-history-chart]').replaceChildren(svg);
      const tbody=root.querySelector('[data-history-rows]');tbody.replaceChildren();
      data.periods.forEach(period=>{
        const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=period;tr.append(th);
        ['normal','all','normal_fixed'].forEach(mode=>{const r=get(region.value,period,mode),td=document.createElement('td');td.textContent=r.status==='supported'?fmt(r.ratio)+'%'+(r.lower!==null?' ('+fmt(r.lower)+'~'+fmt(r.upper)+')':' (범위 없음)'):(r.status==='withheld_direct_contrast'?'비교 보호로 비공개':'표본 부족');tr.append(td);});tbody.append(tr);
      });
    }
    function render(){
      root.querySelector('[data-map-panels]').replaceChildren(map('11','서울 25구'),map('41','수집 경기 36지역'));
      const r=get(region.value,'2026Q2');
      const text=data.regions[region.value]+' · '+area.selectedOptions[0].textContent+' · 2026년 2분기 말: '+(r.status==='supported'?fmt(r.ratio)+'%, 모형 범위 '+fmt(r.lower)+'~'+fmt(r.upper)+'%.':'표본 부족.');
      root.querySelector('[data-selection]').textContent=text;history();
    }
    region.addEventListener('change',render);area.addEventListener('change',render);render();root.dataset.ready='true';
  }).catch(()=>{root.querySelector('[data-selection]').textContent='대화형 비교를 불러오지 못했습니다. 아래 전체 지역 표와 공개 근거 파일을 이용해 주세요.';});
}
